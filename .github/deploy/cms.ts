import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deploymentSourceHash,
  readDeploymentManifest,
} from "./source.ts";

export async function deployCms({
  root = fileURLToPath(new URL("../..", import.meta.url)),
  origin = process.env.CMS_DEPLOY_ORIGIN ||
    "https://pyconhk-cms.website-pyconhk.workers.dev",
  force = false,
  readManifest = readDeploymentManifest,
  run = execFileSync,
} = {}) {
  assert.equal(new URL(origin).protocol, "https:");
  const sourceHash = deploymentSourceHash("cms", root);
  const previous = await readManifest(origin);
  if (!force && previous?.app === "cms" && previous.sourceHash === sourceHash) {
    console.log("CMS inputs are unchanged; build and deployment skipped.");
  } else {
    run("mise", ["run", "check-cms-release"], {
      cwd: root,
      stdio: "inherit",
    });
    run("bun", ["run", "build"], { cwd: `${root}/cms`, stdio: "inherit" });
    run("bun", ["x", "wrangler", "deploy"], {
      cwd: `${root}/cms`,
      stdio: "inherit",
    });
    let verified = false;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const manifest = await readManifest(origin);
      if (manifest?.app === "cms" && manifest.sourceHash === sourceHash) {
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
