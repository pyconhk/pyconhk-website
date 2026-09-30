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
const origin = "https://cms-test.pycon.hk";
const productionGatewayOrigin = "https://pyconhk-cms.pages.dev";
const expected = {
  app: "cms",
  sourceHash: deploymentSourceHash("cms", root, { cmsProfile: "test" }),
  environment: "test",
  contentRepo: "pyconhk/pyconhk-news",
  contentBranch: "cms-test",
};

test("matching test CMS code and both gateway targets skip build and deployment", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  const calls: string[] = [];
  await deployCms({
    root,
    profile: "test",
    origin,
    readManifest: async () => expected,
    readGateway: async (url) => {
      assert.equal(url, "https://pyconhk-cms-test.pages.dev");
      return { ...expected, app: "cms-gateway" };
    },
    readGatewayWorker: async (url) => { assert.equal(url, origin); return expected; },
    ensureGateway: async (project) => { assert.equal(project, "pyconhk-cms-test"); },
    run: (command) => { calls.push(command); return Buffer.alloc(0); },
  });
  assert.deepEqual(calls, []);
});

test("a target mismatch rebuilds and verifies the test Worker", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
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
      readGateway: async () => ({ ...expected, app: "cms-gateway" }),
      readGatewayWorker: async () => expected,
      ensureGateway: async () => {},
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

test("both CMS profiles refuse the DNS-owning OSHK account as a deployment target", async () => {
  const previousAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = "364d9bd5080fe5ed0c756c60627a4420";
  try {
    for (const profile of ["test", "production"]) {
      await assert.rejects(
        deployCms({ root, profile }),
        /Website PyCon HK Cloudflare account/,
      );
    }
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
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "cms" };
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

test("test gateway deploys only its own project and Worker binding, then skips an unchanged upload", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  setEnvironment(t, "CLOUDFLARE_PAGES_API_TOKEN", "test-pages-token");
  setEnvironment(t, "CMS_GITHUB_CLIENT_ID", "must-not-reach-pages");
  setEnvironment(t, "CMS_GITHUB_CLIENT_SECRET", "must-not-reach-pages");
  const marker = { ...expected, app: "cms-gateway" };
  let uploaded = false;
  let markerReads = 0;
  let uploads = 0;
  let staging = "";
  const waits: number[] = [];
  const options = {
    root, profile: "test", origin,
    ensureGateway: async (project: string) => { assert.equal(project, "pyconhk-cms-test"); },
    readManifest: async (url: string) => {
      assert.equal(url, "https://pyconhk-cms-test.website-pyconhk.workers.dev");
      return expected;
    },
    readGateway: async (url: string) => {
      assert.equal(url, "https://pyconhk-cms-test.pages.dev");
      if (!uploaded) return { ...marker, environment: "production", contentBranch: "cms" };
      return ++markerReads === 1 ? null : marker;
    },
    readGatewayWorker: async (url: string) => { assert.equal(url, origin); return expected; },
    run: (_command: string, args: readonly string[], opts: any) => {
      uploads++;
      assert.equal(args[args.indexOf("--project-name") + 1], "pyconhk-cms-test");
      assert.equal(args[args.indexOf("--branch") + 1], "main");
      assert.equal(opts.env.CLOUDFLARE_API_TOKEN, "test-pages-token");
      assert.equal(opts.env.CMS_GITHUB_CLIENT_ID, undefined);
      assert.equal(opts.env.CMS_GITHUB_CLIENT_SECRET, undefined);
      staging = opts.cwd;
      const config = JSON.parse(readFileSync(`${staging}/wrangler.jsonc`, "utf8"));
      assert.equal(config.name, "pyconhk-cms-test");
      assert.deepEqual(config.services, [{ binding: "CMS", service: "pyconhk-cms-test" }]);
      assert.deepEqual(config.env.preview.services, []);
      assert.deepEqual(JSON.parse(readFileSync(`${staging}/dist/cms-gateway-manifest.json`, "utf8")), marker);
      uploaded = true;
      return Buffer.alloc(0);
    },
    wait: async (milliseconds: number) => { waits.push(milliseconds); },
  };
  await deployCms(options);
  assert.equal(uploads, 1);
  assert.deepEqual(waits, [5_000]);
  assert.ok(!existsSync(staging));
  await deployCms(options);
  assert.equal(uploads, 1, "matching Worker and gateway must not rebuild or upload");
});

test("a matching test gateway marker cannot hide a production upstream Worker", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  let reads = 0;
  let waits = 0;
  await assert.rejects(deployCms({
    root, profile: "test", origin,
    ensureGateway: async () => {},
    readManifest: async () => expected,
    readGateway: async () => ({ ...expected, app: "cms-gateway" }),
    readGatewayWorker: async () => { reads++; return { ...expected, environment: "production", contentBranch: "cms" }; },
    run: () => { throw new Error("must not upload unchanged inputs"); },
    wait: async () => { waits++; },
  }), /expected test Worker after 6 readiness checks/);
  assert.equal(reads, 6);
  assert.equal(waits, 5);
});

test("Pages project creation only follows a confirmed 404", async (t) => {
  setEnvironment(t, "CLOUDFLARE_PAGES_API_TOKEN", "pages-token");
  const calls: RequestInit[] = [];
  const request = async (_url: unknown, options: RequestInit) => {
    calls.push(options);
    return new Response("{}", { status: calls.length === 1 ? 404 : 200 });
  };
  await ensureGatewayProject("pyconhk-cms", request as typeof fetch);
  assert.equal(calls[1].method, "POST");
  assert.deepEqual(JSON.parse(String(calls[1].body)), { name: "pyconhk-cms", production_branch: "main" });
  assert.equal(calls[1].headers?.["Authorization"], "Bearer pages-token");
  let attempts = 0;
  await assert.rejects(ensureGatewayProject("pyconhk-cms", (async () => { attempts++; return new Response(null, { status: 403 }); }) as typeof fetch), /Cannot inspect/);
  assert.equal(attempts, 1);
});

test("test Pages project creation never inspects or creates the production gateway", async (t) => {
  setEnvironment(t, "CLOUDFLARE_PAGES_API_TOKEN", "pages-token");
  const calls: Array<{ url: string; options: RequestInit }> = [];
  await ensureGatewayProject("pyconhk-cms-test", (async (url, options) => {
    calls.push({ url: String(url), options: options! });
    return new Response("{}", { status: calls.length === 1 ? 404 : 200 });
  }) as typeof fetch);
  assert.ok(calls[0].url.endsWith("/pages/projects/pyconhk-cms-test"));
  assert.deepEqual(JSON.parse(String(calls[1].options.body)), { name: "pyconhk-cms-test", production_branch: "main" });
  await assert.rejects(ensureGatewayProject("unrelated", (() => assert.fail("must not contact Cloudflare")) as typeof fetch), /Unsupported CMS Pages project/);
});

test("gateway readers tolerate propagation responses but reject authorization and configuration failures", async () => {
  const origin = "https://cms.pycon.hk";
  const readers = [
    { read: (request: typeof fetch) => readGatewayManifest(productionGatewayOrigin, request), path: "/cms-gateway-manifest.json" },
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
    const wrongTarget = { app: "cms", contentBranch: "cms-test", sourceHash: "old" };
    assert.deepEqual(await read((async () => Response.json(wrongTarget)) as typeof fetch), wrongTarget);
  }
});

test("production verification retries temporary Pages and service-binding failures without reuploading", async (t) => {
  setEnvironment(t, "CLOUDFLARE_ACCOUNT_ID", "043801e2f5b9cf2685593bd9098e98b1");
  const sourceHash = deploymentSourceHash("cms", root, { cmsProfile: "production" });
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "cms" };
  const marker = { ...manifest, app: "cms-gateway" };
  const markerResponses = [new Response(null, { status: 404 }), new Response(null, { status: 522 }), new Response(null, { status: 503 }), Response.json(marker)];
  const workerResponses = [new Response(null, { status: 522 }), new Response(null, { status: 504 }), Response.json(manifest)];
  let uploads = 0;
  const waits: number[] = [];
  await deployCms({
    root, profile: "production", origin: "https://cms.pycon.hk", ensureGateway: async () => {},
    readManifest: async () => manifest,
    readGateway: () => readGatewayManifest(productionGatewayOrigin, (async () => markerResponses.shift()!) as typeof fetch),
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
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "cms" };
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
        readGateway: stage === "marker" ? () => readGatewayManifest(productionGatewayOrigin, request) : async () => marker,
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
  const manifest = { ...expected, sourceHash, environment: "production", contentBranch: "cms" };
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
