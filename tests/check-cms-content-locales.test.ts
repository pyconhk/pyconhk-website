import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const archiveCmsLocales = ["en", "zh-hk", "zh-hant", "zh-hans", "ja"];
const cmsLocales = [...archiveCmsLocales, "ko"];
const cmsRepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const contentRoot = "website/outstatic/content";

function listWorkingTreeFiles(directory, root = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listWorkingTreeFiles(entryPath, root);
    }

    return [path.relative(cmsRepoRoot, entryPath).split(path.sep).join("/")];
  });
}

function listCmsContentFiles(ref) {
  if (ref) {
    return execFileSync(
      "git",
      ["ls-tree", "-r", "--name-only", ref, "--", contentRoot],
      { cwd: cmsRepoRoot, encoding: "utf8" },
    )
      .split("\n")
      .filter(Boolean);
  }

  return listWorkingTreeFiles(path.join(cmsRepoRoot, contentRoot));
}

function collectCmsLocaleProblems(files, readContent) {
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));
  const localePattern = new RegExp(
    `^(.*)\\.(${cmsLocales.join("|")})\\.mdx$`,
    "u",
  );
  const entries = new Map();
  const problems = [];

  if (mdxFiles.length === 0) {
    return ["CMS content must contain at least one localized MDX file"];
  }

  for (const file of mdxFiles) {
    const match = file.match(localePattern);

    if (!match) {
      problems.push(`${file} must include a supported locale before .mdx`);
      continue;
    }

    const [, entry, locale] = match;
    const year = /\/(\d{4})-posts\//u.exec(file)?.[1];
    const requiredLocales = year === "2025" ? archiveCmsLocales : cmsLocales;
    if (!requiredLocales.includes(locale)) {
      problems.push(`${file} uses an unsupported locale for ${year}`);
      continue;
    }
    try {
      const raw = readContent(file);
      const frontmatter =
        /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u.exec(raw);
      if (!frontmatter) throw new Error("missing YAML frontmatter");
      const data = parse(frontmatter[1]);
      if (!data || !["draft", "published"].includes(data.status)) {
        throw new Error("status must be draft or published");
      }
      const group = entries.get(entry) || {
        requiredLocales,
        variants: new Map(),
      };
      group.variants.set(locale, data);
      entries.set(entry, group);
      if (data.status === "published") {
        if (typeof data.title !== "string" || !data.title.trim()) {
          problems.push(`${file} needs a title before publishing`);
        }
        if (!frontmatter[2].trim()) {
          problems.push(`${file} needs a body before publishing`);
        }
      }
    } catch (error) {
      problems.push(`${file}: ${error.message}`);
    }
  }

  for (const [entry, { requiredLocales, variants }] of entries) {
    if (
      ![...variants.values()].some((variant) => variant.status === "published")
    )
      continue;
    const missing = requiredLocales.filter(
      (locale) => variants.get(locale)?.status !== "published",
    );

    if (missing.length > 0) {
      problems.push(
        `${entry} is missing published locales: ${missing.join(", ")}`,
      );
    }
    if (
      requiredLocales.includes("ko") &&
      variants.get("en")?.status === "published"
    ) {
      const english = variants.get("en");
      for (const [locale, variant] of variants) {
        if (variant.status !== "published") continue;
        for (const field of ["slug", "publishedAt", "coverImage"]) {
          if (variant[field] !== english[field]) {
            problems.push(`${entry} ${field} must match English in ${locale}`);
          }
        }
      }
    }
  }

  return problems;
}

function checkCmsContentLocales(ref) {
  const readContent = (file) =>
    ref
      ? execFileSync("git", ["show", `${ref}:${file}`], {
          cwd: cmsRepoRoot,
          encoding: "utf8",
        })
      : fs.readFileSync(path.join(cmsRepoRoot, file), "utf8");
  const problems = collectCmsLocaleProblems(
    listCmsContentFiles(ref),
    readContent,
  );

  if (problems.length > 0) {
    throw new Error(
      `CMS locale content validation failed:\n- ${problems.join("\n- ")}`,
    );
  }
}

const published =
  "---\ntitle: Announcement\nstatus: published\n---\nApproved article.\n";
const draft = "---\nstatus: draft\n---\n";
const filesFor = (year, locales) =>
  locales.map(
    (locale) =>
      `website/outstatic/content/${year}-posts/announcement.${locale}.mdx`,
  );

describe("CMS locale publication validation", () => {
  test("keeps 2025 at five languages while 2026 needs all six", () => {
    assert.deepEqual(
      collectCmsLocaleProblems(
        filesFor(2025, archiveCmsLocales),
        () => published,
      ),
      [],
    );
    assert.deepEqual(
      collectCmsLocaleProblems(filesFor(2026, cmsLocales), () => published),
      [],
    );
    assert.deepEqual(
      collectCmsLocaleProblems(
        filesFor(2026, archiveCmsLocales),
        () => published,
      ),
      [
        "website/outstatic/content/2026-posts/announcement is missing published locales: ko",
      ],
    );
  });
  test("allows incomplete draft translations without exposing partial publications", () => {
    assert.deepEqual(
      collectCmsLocaleProblems(filesFor(2026, ["en"]), () => draft),
      [],
    );
    const problems = collectCmsLocaleProblems(
      filesFor(2026, cmsLocales),
      (file) => (file.endsWith(".ko.mdx") ? draft : published),
    );
    assert.deepEqual(problems, [
      "website/outstatic/content/2026-posts/announcement is missing published locales: ko",
    ]);
  });
  test("rejects legacy filenames, invalid metadata and blank published text", () => {
    const legacy = "website/outstatic/content/2025-posts/legacy.mdx";
    assert.deepEqual(
      collectCmsLocaleProblems([legacy], () => published),
      [`${legacy} must include a supported locale before .mdx`],
    );
    assert.match(
      collectCmsLocaleProblems(filesFor(2026, ["en"]), () => "invalid")[0],
      /missing YAML frontmatter/u,
    );
    const blank = "---\nstatus: published\n---\n";
    const problems = collectCmsLocaleProblems(
      filesFor(2026, cmsLocales),
      () => blank,
    );
    assert.equal(
      problems.filter((problem) => problem.includes("needs a title")).length,
      6,
    );
    assert.equal(
      problems.filter((problem) => problem.includes("needs a body")).length,
      6,
    );
  });
  test("rejects Korean files in the 2025 archive", () => {
    assert.deepEqual(
      collectCmsLocaleProblems(filesFor(2025, ["ko"]), () => published),
      [
        "website/outstatic/content/2025-posts/announcement.ko.mdx uses an unsupported locale for 2025",
      ],
    );
  });
  test("rejects conflicting published dates or images across six translations", () => {
    const problems = collectCmsLocaleProblems(
      filesFor(2026, cmsLocales),
      (file) =>
        published.replace(
          "status: published",
          `status: published\npublishedAt: ${file.endsWith(".ko.mdx") ? "2026-09-09" : "2026-09-08"}\ncoverImage: ${file.endsWith(".ja.mdx") ? "/other.webp" : "/cover.webp"}`,
        ),
    );
    assert.equal(problems.length, 2);
    assert.ok(
      problems.some((problem) =>
        /publishedAt must match English in ko/u.test(problem),
      ),
    );
    assert.ok(
      problems.some((problem) =>
        /coverImage must match English in ja/u.test(problem),
      ),
    );
  });
  test("published repository content has every required locale", () => {
    checkCmsContentLocales(process.env.CMS_CONTENT_REF);
  });
});
