import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";
import {
  archiveCmsLocales,
  cmsLocales,
  cmsRepoRoot,
  collectCmsLocaleProblems,
} from "../scripts/check-cms-content-locales.ts";

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
  test("resolves repository content when invoked from the CMS directory", () => {
    const output = execFileSync(
      process.execPath,
      [path.join(cmsRepoRoot, "scripts/check-cms-content-locales.ts")],
      {
        cwd: path.join(cmsRepoRoot, "cms"),
        encoding: "utf8",
      },
    );
    assert.match(output, /CMS locale content validation passed: working tree/u);
  });
});
