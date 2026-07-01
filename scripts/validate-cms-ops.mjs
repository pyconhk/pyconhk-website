import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireIncludes(relativePath, snippets) {
  const text = readText(relativePath);

  for (const snippet of snippets) {
    assert.ok(
      text.includes(snippet),
      `${relativePath} must include ${JSON.stringify(snippet)}`,
    );
  }
}

function requireMatch(relativePath, pattern, description) {
  assert.match(
    readText(relativePath),
    pattern,
    `${relativePath} must ${description}`,
  );
}

function validateRootMiseTasks() {
  requireIncludes("mise.toml", [
    "[tasks.validate-cms-ops]",
    "node scripts/validate-cms-ops.mjs",
    "mise run validate-cms-ops",
    "mise //...:check",
    "mise //...:build",
  ]);
}

function validatePrWorkflow() {
  requireIncludes(".github/workflows/pr-check.yml", [
    "branches: [main, test, cms]",
    'if [ "${{ github.base_ref }}" == "main" ]; then',
    'if [ "${{ github.head_ref }}" != "test" ]; then',
    'elif [ "${{ github.base_ref }}" == "cms" ]; then',
    "mise run install",
    "mise run validate-cms-ops",
    "mise run '//...:check'",
    "mise run '//...:build'",
  ]);
}

function validatePromotionWorkflow() {
  requireIncludes(".github/workflows/cms-promote.yml", [
    'cron: "*/10 * * * *"',
    "CMS_BRANCH: cms",
    "PRODUCTION_BRANCH: main",
    "grep -Ev '^(website/outstatic/content/|website/outstatic/media/|website/public/outstatic/images/)'",
    'git merge --no-ff --no-edit "origin/${CMS_BRANCH}"',
    "mise run //website:install",
    "mise run //website:check",
    "mise run //website:build",
    'git push origin HEAD:"${PRODUCTION_BRANCH}"',
  ]);
}

function validateDecapDefaults() {
  requireIncludes("cms/src/lib/env.ts", [
    'return import.meta.env.CMS_GITHUB_BRANCH || "cms";',
    "supportedCmsLocales",
    'const cmsContentPrefixes = ["website/outstatic/content"];',
    '"website/public/outstatic/images"',
    '"website/outstatic/media"',
    "normalizeCmsOwnedPath(",
    "normalizeCmsPublicFolder(",
    "normalizeCmsLocales(",
    "normalizeCmsDefaultLocale(",
    'import.meta.env.CMS_CONTENT_ROOT || "website/outstatic/content"',
    'import.meta.env.CMS_MEDIA_FOLDER || "website/public/outstatic/images"',
    'import.meta.env.CMS_PUBLIC_FOLDER || "/outstatic/images"',
    "import.meta.env.CMS_LOCALES || defaultCmsLocales",
    "import.meta.env.CMS_DEFAULT_LOCALE",
    'return "en";',
  ]);

  requireIncludes("cms/src/lib/cms-config.ts", [
    'i18nStructure: "multiple_files"',
    'publishMode: options.publishMode || "editorial_workflow"',
    'folder: contentRoot',
    'path: "{{collectionYear}}-posts/{{slug}}"',
    "i18n: true",
    'extension: "mdx"',
    'format: "frontmatter"',
    '{ label: "Body", name: "body", widget: "markdown", i18n: true }',
  ]);

  requireIncludes("cms/src/pages/admin/config.yml.ts", [
    'name: "github"',
    "repo: getCmsRepo()",
    "branch: getCmsBranch()",
    'auth_endpoint: "api/decap/auth"',
    'backendMode === "test"',
    'backendMode === "local"',
  ]);
}

function validateBranchingSpec() {
  requireIncludes("specs/cms-decap-branching.md", [
    "`cms` is the marketing-owned content branch",
    "CMS_GITHUB_BRANCH=cms",
    "CMS_CONTENT_ROOT=website/outstatic/content",
    "CMS_MEDIA_FOLDER=website/public/outstatic/images",
    "CMS_PUBLIC_FOLDER=/outstatic/images",
    "CMS_LOCALES=en,zh-hk,zh-hant,zh-hans,ja",
    "`cms.pycon.hk` deploys the CMS app from `main`",
  ]);
}

validateRootMiseTasks();
validatePrWorkflow();
validatePromotionWorkflow();
validateDecapDefaults();
validateBranchingSpec();
requireMatch(
  ".github/workflows/cms-promote.yml",
  /changed_files="\$\(git diff --name-only "origin\/\$\{PRODUCTION_BRANCH\}\.\.\.origin\/\$\{CMS_BRANCH\}"\)"/u,
  "compare production and CMS branches before promotion",
);

console.log("CMS operations validation passed.");
