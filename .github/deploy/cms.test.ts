import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { deployCms } from "./cms.ts";
import { deploymentSourceHash } from "./source.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));
const origin = "https://pyconhk-cms-test.website-pyconhk.workers.dev";
const expected = {
  app: "cms",
  sourceHash: deploymentSourceHash("cms", root, { cmsProfile: "test" }),
  environment: "test",
  contentRepo: "pyconhk/pyconhk-news",
  contentBranch: "test",
};

test("matching test CMS code and target skip build and deployment", async () => {
  const calls: string[] = [];
  await deployCms({
    root,
    profile: "test",
    origin,
    readManifest: async () => expected,
    run: (command) => { calls.push(command); return Buffer.alloc(0); },
  });
  assert.deepEqual(calls, []);
});

test("a target mismatch rebuilds and verifies the test Worker", async () => {
  const calls: string[] = [];
  let reads = 0;
  let secretsPath = "";
  const previousId = process.env.CMS_GITHUB_CLIENT_ID;
  const previousSecret = process.env.CMS_GITHUB_CLIENT_SECRET;
  process.env.CMS_GITHUB_CLIENT_ID = "test-client";
  process.env.CMS_GITHUB_CLIENT_SECRET = "test-secret";
  try {
    await deployCms({
      root,
      profile: "test",
      origin,
      readManifest: async () => ++reads === 1 ? { ...expected, contentBranch: "main" } : expected,
      run: (command, args) => {
        calls.push(`${command} ${args.slice(0, 3).join(" ")}`);
        if (args.includes("--secrets-file")) {
          secretsPath = args.at(-1) || "";
          assert.deepEqual(JSON.parse(readFileSync(secretsPath, "utf8")), {
            CMS_GITHUB_CLIENT_ID: "test-client",
            CMS_GITHUB_CLIENT_SECRET: "test-secret",
          });
        }
        return Buffer.alloc(0);
      },
    });
  } finally {
    if (previousId === undefined) delete process.env.CMS_GITHUB_CLIENT_ID;
    else process.env.CMS_GITHUB_CLIENT_ID = previousId;
    if (previousSecret === undefined) delete process.env.CMS_GITHUB_CLIENT_SECRET;
    else process.env.CMS_GITHUB_CLIENT_SECRET = previousSecret;
  }
  assert.deepEqual(calls, ["bun run build", "bun x wrangler deploy"]);
  assert.ok(secretsPath && !existsSync(secretsPath), "temporary OAuth secrets must be removed");
  assert.equal(reads, 2);
});

test("production refuses a Cloudflare account that cannot own cms.pycon.hk", async () => {
  const previousAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = "043801e2f5b9cf2685593bd9098e98b1";
  try {
    await assert.rejects(
      deployCms({ root, profile: "production", origin: "https://cms.pycon.hk" }),
      /Cloudflare account that owns cms.pycon.hk/,
    );
  } finally {
    if (previousAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = previousAccount;
  }
});
