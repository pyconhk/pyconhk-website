import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEditorialBoundary } from "./helpers/editorial-boundary.ts";

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
  for (const file of ["tests/check-cms-pr.test.ts", ".github/workflows/branch-rules.yml", "cms/src/lib/oauth.ts"]) {
    assert.throws(() => validateEditorialBoundary(environment, [...content, file]), /only owned/);
  }
});
test("empty diffs, forks and developer branches cannot masquerade as editorial PRs", () => {
  assert.throws(() => validateEditorialBoundary(environment, []));
  assert.throws(() => validateEditorialBoundary({ ...environment, CMS_PR_HEAD_REPO: "someone/fork" }, content));
  assert.throws(() => validateEditorialBoundary({ ...environment, CMS_PR_HEAD: "alex-dev" }, content));
});

 test("CMS editorial PR changes only owned content", { skip: !process.env.CMS_PR_BASE_SHA }, () => {
  const { CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA } = process.env;
  assert.ok([CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA].every(sha => /^[a-f0-9]{40}$/.test(sha || "")));
  const files = execFileSync("git", ["diff", "--name-only", "-z", CMS_PR_BASE_SHA + "..." + CMS_PR_HEAD_SHA], { encoding: "utf8" }).split("\0").filter(Boolean);
  validateEditorialBoundary(process.env, files);
});
