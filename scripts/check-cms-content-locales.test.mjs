import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";

import {
  cmsLocales,
  cmsRepoRoot,
  collectCmsLocaleProblems,
} from "./check-cms-content-locales.mjs";

function localizedFiles(slug) {
  return cmsLocales.map(
    (locale) =>
      `website/outstatic/content/2025-posts/${slug}.${locale}.mdx`,
  );
}

describe("CMS locale content validation", () => {
  test("accepts complete multiple_files entries", () => {
    assert.deepEqual(
      collectCmsLocaleProblems([
        ...localizedFiles("announcement"),
        "website/outstatic/content/metadata.json",
      ]),
      [],
    );
  });

  test("rejects legacy and incomplete entries", () => {
    assert.deepEqual(
      collectCmsLocaleProblems([
        "website/outstatic/content/2025-posts/legacy.mdx",
        "website/outstatic/content/2025-posts/incomplete.en.mdx",
      ]),
      [
        "website/outstatic/content/2025-posts/legacy.mdx must include a supported locale before .mdx",
        "website/outstatic/content/2025-posts/incomplete is missing locales: zh-hk, zh-hant, zh-hans, ja",
      ],
    );
  });

  test("resolves repository content when invoked from the CMS directory", () => {
    const output = execFileSync(
      process.execPath,
      [path.join(cmsRepoRoot, "scripts/check-cms-content-locales.mjs")],
      {
        cwd: path.join(cmsRepoRoot, "cms"),
        encoding: "utf8",
      },
    );

    assert.match(output, /CMS locale content validation passed: working tree/u);
  });
});
