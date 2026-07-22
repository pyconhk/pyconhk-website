import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const cmsLocales = ["en", "zh-hk", "zh-hant", "zh-hans", "ja"];
export const cmsRepoRoot = path.resolve(
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

export function listCmsContentFiles(ref) {
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

export function collectCmsLocaleProblems(files) {
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
    const locales = entries.get(entry) || new Set();
    locales.add(locale);
    entries.set(entry, locales);
  }

  for (const [entry, locales] of entries) {
    const missing = cmsLocales.filter((locale) => !locales.has(locale));

    if (missing.length > 0) {
      problems.push(`${entry} is missing locales: ${missing.join(", ")}`);
    }
  }

  return problems;
}

export function checkCmsContentLocales(ref) {
  const problems = collectCmsLocaleProblems(listCmsContentFiles(ref));

  if (problems.length > 0) {
    throw new Error(`CMS locale content validation failed:\n- ${problems.join("\n- ")}`);
  }
}

function main() {
  const ref = process.argv[2];
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
