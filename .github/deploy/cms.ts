import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deploymentSourceHash,
  readDeploymentManifest,
} from "./source.ts";

const profiles = {
  legacy: {
    origin: "https://pyconhk-cms.website-pyconhk.workers.dev",
    contentRepo: "pyconhk/pyconhk-website",
    contentBranch: "cms",
  },
  test: {
    origin: "https://pyconhk-cms-test.website-pyconhk.workers.dev",
    contentRepo: "pyconhk/pyconhk-news",
    contentBranch: "test",
  },
  production: {
    origin: "",
    contentRepo: "pyconhk/pyconhk-news",
    contentBranch: "main",
  },
} as const;

export async function deployCms({
  root = fileURLToPath(new URL("../..", import.meta.url)),
  profile = process.env.CMS_BUILD_PROFILE || "legacy",
  origin = process.env.CMS_DEPLOY_ORIGIN,
  force = false,
  readManifest = readDeploymentManifest,
  run = execFileSync,
} = {}) {
  assert.ok(profile in profiles, "CMS_BUILD_PROFILE must be legacy, test or production");
  const target = profiles[profile as keyof typeof profiles];
  origin ||= target.origin;
  assert.ok(origin, `CMS_DEPLOY_ORIGIN is required for ${profile}`);
  assert.equal(new URL(origin).protocol, "https:");
  if (profile === "production") {
    assert.equal(
      process.env.CLOUDFLARE_ACCOUNT_ID,
      "364d9bd5080fe5ed0c756c60627a4420",
      "Production CMS must deploy to the Cloudflare account that owns cms.pycon.hk",
    );
  } else if (profile === "test" && process.env.CLOUDFLARE_ACCOUNT_ID) {
    assert.equal(
      process.env.CLOUDFLARE_ACCOUNT_ID,
      "043801e2f5b9cf2685593bd9098e98b1",
      "Test CMS must deploy to the Website PyCon HK Cloudflare account",
    );
  }
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: profile });
  const matchesTarget = (manifest: Record<string, unknown> | null) =>
    manifest?.app === "cms" && manifest.sourceHash === sourceHash &&
    manifest.environment === profile && manifest.contentRepo === target.contentRepo &&
    manifest.contentBranch === target.contentBranch;
  const previous = await readManifest(origin);
  if (!force && matchesTarget(previous)) {
    console.log("CMS inputs are unchanged; build and deployment skipped.");
  } else {
    if (profile === "legacy") {
      run("mise", ["run", "check-cms-release"], {
        cwd: root,
        stdio: "inherit",
      });
    }
    run("bun", ["run", "build"], { cwd: `${root}/cms`, stdio: "inherit" });
    if (profile === "legacy") {
      run("bun", ["x", "wrangler", "deploy"], {
        cwd: `${root}/cms`,
        stdio: "inherit",
      });
    } else {
      const clientId = process.env.CMS_GITHUB_CLIENT_ID;
      const clientSecret = process.env.CMS_GITHUB_CLIENT_SECRET;
      assert.ok(clientId && clientSecret, "Both CMS OAuth credentials are required for a new Worker deployment");
      const secretDirectory = mkdtempSync(path.join(tmpdir(), "pyconhk-cms-secrets-"));
      const secretFile = path.join(secretDirectory, "worker-secrets.json");
      try {
        writeFileSync(secretFile, JSON.stringify({
          CMS_GITHUB_CLIENT_ID: clientId,
          CMS_GITHUB_CLIENT_SECRET: clientSecret,
        }), { mode: 0o600 });
        run("bun", ["x", "wrangler", "deploy", "--secrets-file", secretFile], {
          cwd: `${root}/cms`,
          stdio: "inherit",
        });
      } finally {
        rmSync(secretDirectory, { recursive: true, force: true });
      }
    }
    let verified = false;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const manifest = await readManifest(origin);
      if (matchesTarget(manifest)) {
        verified = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
    assert.ok(
      verified,
      "CMS deployment did not publish the expected source hash",
    );
    console.log(`Verified CMS deployment at ${origin}.`);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await deployCms({ force: process.argv.includes("--force") });
}
