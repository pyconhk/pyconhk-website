import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { deployCms, ensureGatewayProject } from "./cms.ts";
import { deploymentSourceHash } from "./source.ts";

function setEnvironment(t: { after: (fn: () => void) => void }, name: string, value: string) {
  const previous = process.env[name];
  process.env[name] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

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

test("production refuses the DNS-owning OSHK account as a deployment target", async () => {
  const previousAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = "364d9bd5080fe5ed0c756c60627a4420";
  try {
    await assert.rejects(
      deployCms({ root, profile: "production", origin: "https://cms.pycon.hk" }),
      /Website PyCon HK Cloudflare account/,
    );
  } finally {
    if (previousAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = previousAccount;
  }
});

test("unchanged production Worker still deploys a missing gateway and retries a failed upload", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  setEnvironment(t, "CLOUDFLARE_API_TOKEN", "worker-token");
  setEnvironment(t, "CLOUDFLARE_PAGES_API_TOKEN", "pages-token");
  setEnvironment(t, "CMS_GITHUB_CLIENT_SECRET", "must-not-reach-pages");
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: "production" });
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "main" };
  const marker = { ...manifest, app: "cms-gateway" };
  let uploaded = false;
  let fail = true;
  let staging = "";
  const origins: string[] = [];
  const options = {
    root, profile: "production", ensureGateway: async () => {},
    readManifest: async (url: string) => { origins.push(url); return manifest; },
    readGateway: async () => uploaded ? marker : null,
    run: (_command: string, args: readonly string[], opts: any) => {
      assert.ok(args.includes("pages"));
      assert.equal(opts.env.CLOUDFLARE_API_TOKEN, "pages-token");
      assert.equal(opts.env.CMS_GITHUB_CLIENT_SECRET, undefined);
      staging = opts.cwd;
      assert.ok(!staging.startsWith(root));
      assert.equal(JSON.parse(readFileSync(`${staging}/dist/cms-gateway-manifest.json`, "utf8")).sourceHash, sourceHash);
      assert.ok(existsSync(`${staging}/dist/_worker.js`));
      assert.ok(!existsSync(`${staging}/dist/wrangler.jsonc`));
      if (fail) throw new Error("upload failed");
      uploaded = true;
      return Buffer.alloc(0);
    },
  };
  await assert.rejects(deployCms(options), /upload failed/);
  assert.ok(!existsSync(staging));
  fail = false;
  await deployCms(options);
  assert.ok(!existsSync(staging));
  await deployCms({ ...options, run: () => { throw new Error("unchanged upload must be skipped"); } });
  assert.ok(origins.includes("https://pyconhk-cms.website-pyconhk.workers.dev"));
  assert.ok(origins.includes("https://pyconhk-cms.pages.dev"));
});

test("Pages project creation only follows a confirmed 404", async (t) => {
  setEnvironment(t, "CLOUDFLARE_PAGES_API_TOKEN", "pages-token");
  const calls: RequestInit[] = [];
  const request = async (_url: unknown, options: RequestInit) => {
    calls.push(options);
    return new Response("{}", { status: calls.length === 1 ? 404 : 200 });
  };
  await ensureGatewayProject(request as typeof fetch);
  assert.equal(calls[1].method, "POST");
  assert.deepEqual(JSON.parse(String(calls[1].body)), { name: "pyconhk-cms", production_branch: "main" });
  assert.equal(calls[1].headers?.["Authorization"], "Bearer pages-token");
  let attempts = 0;
  await assert.rejects(ensureGatewayProject((async () => { attempts++; return new Response(null, { status: 403 }); }) as typeof fetch), /Cannot inspect/);
  assert.equal(attempts, 1);
});
