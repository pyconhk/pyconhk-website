import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { deployCms, ensureGatewayProject, readGatewayManifest, readGatewayWorkerManifest } from "./cms.ts";
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
    root, profile: "production", origin: "https://pyconhk-cms.pages.dev", ensureGateway: async () => {},
    readManifest: async (url: string) => { origins.push(url); return manifest; },
    readGatewayWorker: async (url: string) => { origins.push(url); return manifest; },
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

test("gateway readers tolerate propagation responses but reject authorization and configuration failures", async () => {
  const origin = "https://cms.pycon.hk";
  const readers = [
    { read: (request: typeof fetch) => readGatewayManifest(request), path: "/cms-gateway-manifest.json" },
    { read: (request: typeof fetch) => readGatewayWorkerManifest(origin, request), path: "/deployment-manifest.json" },
  ];
  for (const { read, path } of readers) {
    for (const status of [404, 500, 502, 503, 504, 520, 521, 522, 523, 524]) {
      const request = (async (url, options) => {
        assert.equal(new URL(String(url)).pathname, path);
        assert.ok(new URL(String(url)).searchParams.has("deployment-check"));
        assert.equal(options?.cache, "no-store");
        assert.ok(options?.signal);
        return new Response(null, { status });
      }) as typeof fetch;
      assert.equal(await read(request), null, `${path}: ${status} must remain pending`);
    }
    for (const status of [401, 403, 501, 525, 526]) {
      await assert.rejects(read((async () => new Response(null, { status })) as typeof fetch), new RegExp(`manifest: ${status}`));
    }
    const wrongTarget = { app: "cms", contentBranch: "test", sourceHash: "old" };
    assert.deepEqual(await read((async () => Response.json(wrongTarget)) as typeof fetch), wrongTarget);
  }
});

test("production verification retries temporary Pages and service-binding failures without reuploading", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: "production" });
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "main" };
  const marker = { ...manifest, app: "cms-gateway" };
  const markerResponses = [new Response(null, { status: 404 }), new Response(null, { status: 522 }), new Response(null, { status: 503 }), Response.json(marker)];
  const workerResponses = [new Response(null, { status: 522 }), new Response(null, { status: 504 }), Response.json(manifest)];
  let uploads = 0;
  const waits: number[] = [];
  await deployCms({
    root, profile: "production", origin: "https://cms.pycon.hk", ensureGateway: async () => {},
    readManifest: async () => manifest,
    readGateway: () => readGatewayManifest((async () => markerResponses.shift()!) as typeof fetch),
    readGatewayWorker: (url) => {
      assert.equal(url, "https://cms.pycon.hk");
      return readGatewayWorkerManifest(url, (async () => workerResponses.shift()!) as typeof fetch);
    },
    run: () => { uploads++; return Buffer.alloc(0); },
    wait: async (milliseconds) => { waits.push(milliseconds); },
  });
  assert.equal(uploads, 1);
  assert.equal(markerResponses.length, 0);
  assert.equal(workerResponses.length, 0);
  assert.deepEqual(waits, [5_000, 5_000, 5_000, 5_000]);
});

test("gateway verification stops after six checks for persistent outages or wrong targets", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: "production" });
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "main" };
  const marker = { ...manifest, app: "cms-gateway" };
  for (const stage of ["marker", "Worker"]) {
    for (const failure of ["outage", "wrong app", "wrong branch", "wrong hash"]) {
      let reads = 0;
      let waits = 0;
      const request = (async () => {
        reads++;
        if (failure === "outage") return new Response(null, { status: 522 });
        const result = { ...(stage === "marker" ? marker : manifest) };
        if (failure === "wrong app") result.app = "unrelated";
        if (failure === "wrong branch") result.contentBranch = "test";
        if (failure === "wrong hash") result.sourceHash = "stale";
        return Response.json(result);
      }) as typeof fetch;
      await assert.rejects(deployCms({
        root, profile: "production", origin: "https://cms.pycon.hk", ensureGateway: async () => {},
        readManifest: async () => manifest,
        readGateway: stage === "marker" ? () => readGatewayManifest(request) : async () => marker,
        readGatewayWorker: (url) => readGatewayWorkerManifest(url, request),
        run: () => Buffer.alloc(0),
        wait: async () => { waits++; },
      }), /after 6 readiness checks/, `${stage}: ${failure}`);
      assert.equal(reads, stage === "marker" ? 7 : 6, `${stage}: initial check plus bounded verification`);
      assert.equal(waits, 5, "do not sleep after the final failed check");
    }
  }
});

test("public CMS authorization failures stop verification immediately", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: "production" });
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "main" };
  let reads = 0;
  await assert.rejects(deployCms({
    root, profile: "production", origin: "https://cms.pycon.hk", ensureGateway: async () => {},
    readManifest: async () => manifest,
    readGateway: async () => ({ ...manifest, app: "cms-gateway" }),
    readGatewayWorker: (url) => readGatewayWorkerManifest(url, (async () => { reads++; return new Response(null, { status: 403 }); }) as typeof fetch),
    run: () => { throw new Error("must not upload"); },
    wait: async () => { throw new Error("must not retry authorization failures"); },
  }), /manifest: 403/);
  assert.equal(reads, 1);
});
