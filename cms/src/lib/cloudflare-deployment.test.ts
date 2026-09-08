import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));

describe("Cloudflare deployment contract", () => {
  test("builds the Astro server for Cloudflare Workers only", () => {
    assert.ok(packageJson.dependencies["@astrojs/cloudflare"]);
    assert.equal(packageJson.dependencies["@astrojs/vercel"], undefined);
    assert.equal(existsSync("vercel.json"), false);
  });

  test("blocks deployment until the remote CMS branch is localized", () => {
    assert.equal(packageJson.scripts.deploy, "node scripts/deploy.ts");
    const deploy = readFileSync("scripts/deploy.ts", "utf8");
    assert.ok(
      deploy.indexOf("scripts/check-cms-release.ts") <
        deploy.indexOf('["run", "build"]'),
    );
    assert.match(deploy, /scripts\/check-cms-release\.ts/);
  });

  test("enables the required Worker runtime and observability", () => {
    assert.equal(
      wrangler.$schema,
      "./node_modules/wrangler/config-schema.json",
    );
    assert.equal(wrangler.account_id, "043801e2f5b9cf2685593bd9098e98b1");
    assert.equal(wrangler.main, "@astrojs/cloudflare/entrypoints/server");
    assert.ok(wrangler.compatibility_flags.includes("nodejs_compat"));
    assert.equal(wrangler.assets.binding, "ASSETS");
    assert.equal(wrangler.assets.directory, "./dist");
    assert.equal(wrangler.observability.enabled, true);
    assert.equal(wrangler.kv_namespaces, undefined);
  });

  test("keeps OAuth credentials out of versioned Worker variables", () => {
    assert.deepEqual(wrangler.secrets.required, [
      "CMS_GITHUB_CLIENT_ID",
      "CMS_GITHUB_CLIENT_SECRET",
    ]);
    assert.equal(wrangler.vars.CMS_GITHUB_CLIENT_ID, undefined);
    assert.equal(wrangler.vars.CMS_GITHUB_CLIENT_SECRET, undefined);
    assert.equal(wrangler.vars.CMS_GITHUB_OAUTH_SCOPE, "public_repo");
  });

  test("does not upload local sandbox media", () => {
    const assetsIgnore = readFileSync("public/.assetsignore", "utf8");

    assert.match(assetsIgnore, /^sandbox-images\/\*\*$/mu);
  });
});
