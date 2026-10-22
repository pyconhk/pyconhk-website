import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { deploymentSourceHash, isDeploymentInput } from "./source.ts";

test("shared News normalization invalidates both consuming apps", () => {
  assert.equal(isDeploymentInput("website", "cms/src/lib/news-frontmatter.ts"), true);
  assert.equal(isDeploymentInput("cms", "cms/src/lib/news-frontmatter.ts"), true);
  assert.equal(isDeploymentInput("website", "cms/src/lib/news-format.ts"), false);
});

test("shared article presentations and styles invalidate CMS previews", (t) => {
  const { write, hash } = cmsFixture(t);
  const initial = hash("test");
  write("website/src/years/2027/components/NewsArticle.astro", "<article>New design</article>");
  assert.notEqual(hash("test"), initial);
  const presentationHash = hash("test");
  write("website/src/styles/global.css", "article { color: red; }");
  assert.notEqual(hash("test"), presentationHash);
  const styleHash = hash("test");
  write("website/src/years/2027/e2e/article.spec.ts", "// Browser fixture");
  assert.equal(hash("test"), styleHash);
});

function cmsFixture(t: { after: (fn: () => void) => void }) {
  const root = mkdtempSync(path.join(tmpdir(), "pycon-cms-hash-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q"], { cwd: root });
  const write = (filename: string, contents: string) => {
    const absolute = path.join(root, filename);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents);
  };
  write("cms/src/index.ts", "export const page = 1;\n");
  write("cms/wrangler.jsonc", '{"name":"legacy"}');
  write("cms/wrangler.test.jsonc", '{"name":"test"}');
  write("cms/wrangler.production.jsonc", '{"name":"production"}');
  write("cms/gateway/wrangler.jsonc", '{"name":"pyconhk-cms"}');
  write("cms/gateway/wrangler.test.jsonc", '{"name":"pyconhk-cms-test"}');
  write("cms/gateway/public/_worker.js", "export default { fetch() {} };\n");
  const hash = (cmsProfile: string) => deploymentSourceHash("cms", root, { cmsProfile });
  return { root, write, hash };
}

test("gateway configuration only invalidates its own CMS environment", (t) => {
  const { write, hash } = cmsFixture(t);
  const initial = { test: hash("test"), production: hash("production"), legacy: hash("legacy") };

  write("cms/gateway/wrangler.test.jsonc", '{"name":"pyconhk-cms-test","services":["test"]}');
  assert.notEqual(hash("test"), initial.test);
  assert.equal(hash("production"), initial.production);
  assert.equal(hash("legacy"), initial.legacy);
  const updatedTest = hash("test");

  write("cms/gateway/wrangler.jsonc", '{"name":"pyconhk-cms","services":["production"]}');
  assert.notEqual(hash("production"), initial.production);
  assert.equal(hash("test"), updatedTest);
  assert.equal(hash("legacy"), initial.legacy);
});

test("shared gateway code invalidates test and production without affecting legacy", (t) => {
  const { write, hash } = cmsFixture(t);
  const initial = { test: hash("test"), production: hash("production"), legacy: hash("legacy") };

  write("cms/gateway/public/_worker.js", "export default { fetch(request, env) { return env.CMS.fetch(request); } };\n");
  assert.notEqual(hash("test"), initial.test);
  assert.notEqual(hash("production"), initial.production);
  assert.equal(hash("legacy"), initial.legacy);
});

test("gateway tests and docs do not invalidate any CMS deployment", (t) => {
  const { write, hash } = cmsFixture(t);
  const profiles = ["test", "production", "legacy"];
  const initial = profiles.map(hash);

  write("cms/gateway/gateway.test.ts", "// Gateway regression tests\n");
  write("cms/gateway/README.md", "Gateway instructions\n");
  assert.deepEqual(profiles.map(hash), initial);
});
