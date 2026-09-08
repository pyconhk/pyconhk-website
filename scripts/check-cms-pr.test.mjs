import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEditorialBoundary } from "./check-cms-pr.mjs";

const environment = {
  CMS_PR_HEAD: "cms/posts/article",
  CMS_PR_HEAD_REPO: "pyconhk/pyconhk-website",
  CMS_PR_BASE_REPO: "pyconhk/pyconhk-website",
};
const content = ["website/outstatic/content/2026-posts/article.en.mdx", "website/public/outstatic/images/cover.png"];

test("same-repository editorial content and uploads pass", () => {
  assert.doesNotThrow(() => validateEditorialBoundary(environment, content));
});
test("editorial content cannot carry a replacement checker, workflow or app code", () => {
  for (const file of ["scripts/check-cms-pr.mjs", ".github/workflows/branch-rules.yml", "cms/src/lib/oauth.ts"]) {
    assert.throws(() => validateEditorialBoundary(environment, [...content, file]), /only owned/);
  }
});
test("empty diffs, forks and developer branches cannot masquerade as editorial PRs", () => {
  assert.throws(() => validateEditorialBoundary(environment, []));
  assert.throws(() => validateEditorialBoundary({ ...environment, CMS_PR_HEAD_REPO: "someone/fork" }, content));
  assert.throws(() => validateEditorialBoundary({ ...environment, CMS_PR_HEAD: "alex-dev" }, content));
});
