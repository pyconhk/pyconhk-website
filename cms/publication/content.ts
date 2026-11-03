import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { normalizeNewsFrontmatter } from "../src/lib/news-frontmatter.ts";
import {
  parseSprintContent,
  sprintLocales,
  type SprintContent,
  type SprintLocale,
  validateSprintTranslations,
} from "../../website/src/lib/sprint-content.ts";

export const archiveCmsLocales = ["en", "zh-hk", "zh-hant", "zh-hans", "ja"];
export const cmsLocales = [...archiveCmsLocales, "ko"];
export const cmsRepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const contentRoot = "website/outstatic/content";
const newsContentFile = /^website\/outstatic\/content\/(?:2025|2026)-posts\/[^/]+\.mdx$/u;
const sprintContentRoot = `${contentRoot}/2026-sprint/`;
const sprintContentFile = /^website\/outstatic\/content\/2026-sprint\/settings\.(en|zh-hk|zh-hant|zh-hans|ja|ko)\.json$/u;
const rasterImagePath = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/iu;

function isCmsContentFile(file: string) {
  return newsContentFile.test(file) || file.startsWith(sprintContentRoot);
}

function validateNewsCoverImage(data) {
  if (data.coverImage && !rasterImagePath.test(data.coverImage)) {
    throw new Error("coverImage must use a raster image (AVIF, GIF, JPEG, PNG or WebP)");
  }
}

function listWorkingTreeFiles(directory, root = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listWorkingTreeFiles(entryPath, root);
    }

    return [path.relative(cmsRepoRoot, entryPath).split(path.sep).join("/")];
  });
}

export function listCmsContentFiles(ref) {
  if (ref) {
    return execFileSync(
      "git",
      ["ls-tree", "-r", "--name-only", ref, "--", contentRoot],
      { cwd: cmsRepoRoot, encoding: "utf8" },
    )
      .split("\n")
      .filter(isCmsContentFile);
  }

  return listWorkingTreeFiles(path.join(cmsRepoRoot, contentRoot)).filter(
    isCmsContentFile,
  );
}

export function collectSprintLocaleProblems(files, readContent) {
  const candidates = files.filter((file) => file.startsWith(sprintContentRoot));
  if (!candidates.length) return [];
  const variants: Partial<Record<SprintLocale, SprintContent>> = {};
  const present = new Set<string>();
  const problems = [];
  for (const file of candidates) {
    const match = sprintContentFile.exec(file);
    if (!match) {
      problems.push(`${file} is not a canonical localized Sprint settings file`);
      continue;
    }
    const locale = match[1] as SprintLocale;
    present.add(locale);
    try {
      variants[locale] = parseSprintContent(JSON.parse(readContent(file)), locale);
    } catch (error) {
      problems.push(`${file}: ${error.message}`);
    }
  }
  const missing = sprintLocales.filter((locale) => !present.has(locale));
  if (missing.length) {
    problems.push(`Sprint settings must contain all six locale files; missing: ${missing.join(", ")}`);
  }
  if (!problems.length) {
    try {
      validateSprintTranslations(variants);
    } catch (error) {
      problems.push(error.message);
    }
  }
  return problems;
}

export function collectCmsLocaleProblems(files, readContent) {
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));
  const localePattern = new RegExp(
    `^(.*)\\.(${cmsLocales.join("|")})\\.mdx$`,
    "u",
  );
  const entries = new Map();
  const problems = collectSprintLocaleProblems(files, readContent);

  if (mdxFiles.length === 0) {
    return files.some((file) => file.startsWith(sprintContentRoot))
      ? problems
      : ["CMS content must contain at least one localized MDX file"];
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
      let data = parse(frontmatter[1]);
      if (!data || !["draft", "published"].includes(data.status)) {
        throw new Error("status must be draft or published");
      }
      const group = entries.get(entry) || {
        requiredLocales,
        isArchive: year === "2025",
        variants: new Map(),
      };
      group.variants.set(locale, data);
      entries.set(entry, group);
      // A malformed field does not mean the saved translation is missing.
      data = normalizeNewsFrontmatter(data);
      validateNewsCoverImage(data);
      group.variants.set(locale, data);
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

  for (const [entry, { isArchive, requiredLocales, variants }] of entries) {
    if (
      ![...variants.values()].some((variant) => variant.status === "published")
    )
      continue;
    if (isArchive) {
      const missing = requiredLocales.filter(
        (locale) => variants.get(locale)?.status !== "published",
      );
      if (missing.length > 0) {
        problems.push(
          `${entry} is missing published locales: ${missing.join(", ")}`,
        );
      }
    }
    if (!isArchive && variants.has("en")) {
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

export function checkCmsContentLocales(ref) {
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

function main() {
  const ref = process.env.CMS_CONTENT_REF || process.argv[2];
  checkCmsContentLocales(ref);
  console.log(`CMS locale content validation passed: ${ref || "working tree"}`);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
