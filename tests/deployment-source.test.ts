import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { deploymentSourceHash, isDeploymentInput } from "../.github/deploy/source.ts";
import { deployCms } from "../.github/deploy/cms.ts";

test("app source hashes ignore tests, CI, docs and the other app but include build inputs", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "pycon-deployment-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  const write = (name: string, body: string) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), body);
  };
  write("website/src/pages/index.astro", "home");
  write("cms/src/pages/index.astro", "cms");
  const website = deploymentSourceHash("website", root);
  const cms = deploymentSourceHash("cms", root);
  for (const file of ["README.md", ".github/workflows/ci.yml", "website/e2e/home.spec.ts", "cms/src/lib/foo.test.ts", "website/playwright.config.ts"]) write(file, "changed");
  assert.equal(deploymentSourceHash("website", root), website);
  assert.equal(deploymentSourceHash("cms", root), cms);
  write("cms/src/pages/index.astro", "changed CMS");
  assert.equal(deploymentSourceHash("website", root), website);
  assert.notEqual(deploymentSourceHash("cms", root), cms);
  write("website/src/pages/index.astro", "changed home");
  const modified = deploymentSourceHash("website", root);
  assert.notEqual(modified, website);
  renameSync(path.join(root, "website/src/pages/index.astro"), path.join(root, "website/src/pages/about.astro"));
  const renamed = deploymentSourceHash("website", root);
  assert.notEqual(renamed, modified);
  rmSync(path.join(root, "website/src/pages/about.astro"));
  assert.notEqual(deploymentSourceHash("website", root), renamed);
});

test("CMS content, portraits, Functions and dependencies invalidate the website", () => {
  for (const file of ["website/outstatic/content/news/en.md", "website/public/photo.webp", "website/functions/auth.ts", "website/integrations/conference-build.ts", "website/bun.lock", "bun.lock", "mise.toml"]) {
    assert.equal(isDeploymentInput("website", file), true, file);
  }
  assert.equal(isDeploymentInput("cms", "website/outstatic/content/news/en.md"), false);
  assert.equal(isDeploymentInput("cms", "cms/wrangler.jsonc"), true);
});

test("unchanged CMS skips every command; force or a missing baseline validates, builds and uploads", async () => {
  const root = process.cwd();
  const manifest = { app: "cms", sourceHash: deploymentSourceHash("cms", root) };
  const commands: string[] = [];
  const run = ((command: string, args: string[]) => { commands.push([command, ...args].join(" ")); }) as typeof execFileSync;
  await deployCms({ root, readManifest: async () => manifest, run });
  assert.deepEqual(commands, []);
  await deployCms({ root, force: true, readManifest: async () => manifest, run });
  assert.deepEqual(commands, ["mise run check-cms-release", "bun run build", "bun x wrangler deploy"]);
  commands.length = 0;
  let reads = 0;
  await deployCms({ root, readManifest: async () => ++reads === 1 ? null : manifest, run });
  assert.equal(commands.length, 3);
  commands.length = 0;
  await assert.rejects(deployCms({ root, force: true, readManifest: async () => manifest,
    run: (() => { throw new Error("Release validation failed"); }) as typeof execFileSync,
  }), /Release validation failed/);
  assert.deepEqual(commands, []);
});
