import { test } from 'node:test';
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

function requireExcludes(relativePath, snippets) {
  const text = readText(relativePath);

  for (const snippet of snippets) {
    assert.ok(
      !text.includes(snippet),
      `${relativePath} must not include ${JSON.stringify(snippet)}`,
    );
  }
}

function validateRootMiseTasks() {
  requireIncludes("mise.toml", [
    "[tasks.validate-cms-ops]",
    "node scripts/check-cms-content-locales.ts",
    "[tasks.check-cms-release]",
    "node scripts/check-cms-release.ts",
    "node --test tests/*.test.ts",
    "[tasks.check-cms-content]",
    "[tasks.smoke-cms-config]",
    "node scripts/smoke-cms-config.ts",
    "mise run validate-cms-ops",
    "mise //...:check",
    "mise //website:build",
    "mise //cms:deploy-dry-run",
  ]);
}

function validatePrWorkflow() {
  requireIncludes(".github/workflows/pr-check.yml", [
    "branches: [main, test, cms]",
    "name: Branch Rules",
    'if [ "$BASE_BRANCH" == "main" ]; then',
    'if [ "$HEAD_BRANCH" != "test" ]; then',
    "mise run install",
    "mise run validate-cms-ops",
    "mise run check-cms-release",
    "mise run //website:typecheck",
    "mise run //website:lint",
    "bun --cwd website run test:unit",
    "mise run //website:build",
    "mise run //cms:check",
    "mise run //cms:deploy-dry-run",
    "needs: [build, unit, year]",
  ]);
  requireIncludes(".github/workflows/branch-rules.yml", [
    "pull_request_target:",
    "ref: ${{ github.event.pull_request.base.sha }}",
    "persist-credentials: false",
    "contents: read",
    "name: CMS Content Boundary",
    "branches: [cms]",
    "node scripts/check-cms-pr.ts",
    "CMS_PR_BASE_SHA: ${{ github.event.pull_request.base.sha }}",
    "CMS_PR_HEAD_SHA: ${{ github.event.pull_request.head.sha }}",
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
    'node scripts/check-cms-content-locales.ts "origin/${CMS_BRANCH}"',
    "mise run //website:check",
    "mise run //website:build",
    "mise run check-cms-content",
    'git push origin HEAD:"${PRODUCTION_BRANCH}"',
    "uses: ./.github/workflows/deploy-website-reusable.yml",
    "if: needs.promote.outputs.promoted == 'true'",
    "target: production",
  ]);
}

function validateDecapDefaults() {
  requireIncludes("cms/src/lib/env.ts", [
    'environment.CMS_GITHUB_BRANCH || "cms"',
    "supportedCmsLocales",
    'const cmsContentPrefixes = ["website/outstatic/content"];',
    '"website/public/outstatic/images"',
    '"website/outstatic/media"',
    "normalizeCmsOwnedPath(",
    "normalizeCmsPublicFolder(",
    "normalizeCmsLocales(",
    "normalizeCmsDefaultLocale(",
    'environment.CMS_CONTENT_ROOT || "website/outstatic/content"',
    'environment.CMS_MEDIA_FOLDER || "website/public/outstatic/images"',
    'environment.CMS_PUBLIC_FOLDER || "/outstatic/images"',
    "environment.CMS_LOCALES || defaultCmsLocales",
    "environment.CMS_DEFAULT_LOCALE",
    'environment.CMS_GITHUB_OAUTH_SCOPE || "public_repo"',
    'return "en";',
  ]);
  requireExcludes("cms/src/lib/env.ts", ["import.meta.env"]);

  requireIncludes("cms/src/lib/cms-config.ts", [
    'i18nStructure: "multiple_files"',
    'publishMode: options.publishMode || "editorial_workflow"',
    '{ name: "posts", label: "2026 Posts", year: 2026 }',
    '{ name: "posts_2025", label: "2025 Posts", year: 2025 }',
    'folder: `${contentRoot}/${year}-posts`',
    'summary: "{{title}}"',
    "i18n: true",
    'extension: "mdx"',
    'format: "frontmatter"',
    'name: "conference_2026"',
    'folder: `${contentRoot}/2026-conference`',
    'extension: "json"',
    "fields: createConferenceFields()",
  ]);
  requireExcludes("cms/src/lib/cms-config.ts", ["collectionYear"]);
  requireMatch("cms/src/lib/cms-config.ts", /name: "body",\s+widget: "markdown",\s+required: false,\s+i18n: true/u, "allow localized body drafts");

  requireIncludes("cms/src/pages/admin/config.yml.ts", [
    'name: "github"',
    "const environment = getRuntimeEnvironment();",
    "repo: getCmsRepo(environment)",
    "branch: getCmsBranch(environment)",
    'auth_endpoint: "api/decap/auth"',
    'backendMode === "test"',
    'backendMode === "local"',
  ]);
}

function validateCloudflareDeployment() {
  const packageJson = JSON.parse(readText("cms/package.json"));
  const wrangler = JSON.parse(readText("cms/wrangler.jsonc"));

  assert.ok(packageJson.dependencies["@astrojs/cloudflare"]);
  assert.equal(packageJson.dependencies["@astrojs/vercel"], undefined);
  assert.match(
    packageJson.scripts.deploy,
    /^node \.\.\/scripts\/check-cms-release\.ts && /u,
  );
  assert.equal(fs.existsSync(path.join(repoRoot, "cms/vercel.json")), false);
  assert.equal(
    wrangler.main,
    "@astrojs/cloudflare/entrypoints/server",
  );
  assert.equal(
    wrangler.$schema,
    "./node_modules/wrangler/config-schema.json",
  );
  assert.equal(
    wrangler.account_id,
    "043801e2f5b9cf2685593bd9098e98b1",
  );
  assert.ok(wrangler.compatibility_flags.includes("nodejs_compat"));
  assert.equal(wrangler.assets.binding, "ASSETS");
  assert.equal(wrangler.observability.enabled, true);
  assert.equal(wrangler.vars.CMS_GITHUB_OAUTH_SCOPE, "public_repo");
  assert.deepEqual(wrangler.secrets.required, [
    "CMS_GITHUB_CLIENT_ID",
    "CMS_GITHUB_CLIENT_SECRET",
  ]);
  assert.equal(wrangler.vars.CMS_GITHUB_CLIENT_ID, undefined);
  assert.equal(wrangler.vars.CMS_GITHUB_CLIENT_SECRET, undefined);

  requireIncludes("cms/src/lib/runtime-env.ts", [
    'import { env } from "cloudflare:workers";',
    "return readCmsEnvironment(env);",
  ]);
  requireIncludes("cms/src/pages/api/decap/callback.ts", [
    "requireGithubWriteAccess(await accessRepoResponse.json(), accessRepo);",
    '"Cache-Control": "no-store"',
    '"Content-Security-Policy"',
  ]);
  requireIncludes("cms/src/lib/oauth.ts", [
    "event.source !== window.opener",
    "event.origin !== trustedOrigin",
  ]);
  requireExcludes("cms/src/lib/oauth.ts", ['postMessage("authorizing:github", "*")']);
  requireIncludes("cms/public/.assetsignore", ["sandbox-images/**"]);
}

function validateBranchingSpec() {
  requireIncludes("specs/cms-decap-branching.md", [
    "`cms` is the marketing-owned content branch",
    "CMS_GITHUB_BRANCH=cms",
    "CMS_GITHUB_OAUTH_SCOPE=public_repo",
    "CMS_CONTENT_ROOT=website/outstatic/content",
    "CMS_MEDIA_FOLDER=website/public/outstatic/images",
    "CMS_PUBLIC_FOLDER=/outstatic/images",
    "CMS_LOCALES=en,zh-hk,zh-hant,zh-hans,ja,ko",
    "`cms.pycon.hk` deploys the CMS app from `main`",
    "mise run //cms:deploy-dry-run",
    "locale-coded files",
    "one folder collection per conference year",
    "mise run smoke-cms-config -- https://cms.pycon.hk",
  ]);
}

function validateWebsiteDeployment() {
  requireIncludes(".github/workflows/deploy-website.yml", [
    "branches: [main, test, alex-dev]",
    'cron: "2-59/5 * * * *"',
    "workflow_dispatch:",
    "uses: ./.github/workflows/deploy-website-reusable.yml",
  ]);
  requireIncludes(".github/workflows/deploy-website-reusable.yml", [
    "runs-on: ubuntu-latest",
    "group: website-deploy-${{ inputs.target }}",
    "cancel-in-progress: false",
    "steps.prepare.outputs.changed == 'true'",
    "node scripts/check-cms-content-locales.ts",
    "PROGRAMME_OUTPUT_PATH:",
    "PROGRAMME_BASELINE_PATH:",
    "PROGRAMME_SOURCE_EVENT:",
    "mise run //website:typecheck",
    "mise run //website:build",
    "git ls-remote origin",
    'bun x wrangler pages deploy dist --project-name "$PROJECT" --branch "$BRANCH"',
    'website-deployment.ts verify "$TARGET" "$MANIFEST_PATH"',
  ]);
  assert.equal(fs.existsSync(path.join(repoRoot, "website/src/years/2026/data/sessions.json")), false,
    "Internal submission exports must not be included in website sources");
}

test('CMS ownership and deployment policy', () => {

validateRootMiseTasks();
validatePrWorkflow();
validatePromotionWorkflow();
validateDecapDefaults();
validateCloudflareDeployment();
validateBranchingSpec();
validateWebsiteDeployment();
requireMatch(
  ".github/workflows/cms-promote.yml",
  /changed_files="\$\(git diff --name-only "origin\/\$\{PRODUCTION_BRANCH\}\.\.\.origin\/\$\{CMS_BRANCH\}"\)"/u,
  "compare production and CMS branches before promotion",
);

console.log("CMS operations validation passed.");

});
