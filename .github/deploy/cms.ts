import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
    gateway: null,
  },
  test: {
    origin: "https://pyconhk-cms-test.website-pyconhk.workers.dev",
    contentRepo: "pyconhk/pyconhk-website",
    contentBranch: "cms-test",
    gateway: {
      project: "pyconhk-cms-test",
      origin: "https://pyconhk-cms-test.pages.dev",
      config: "cms/gateway/wrangler.test.jsonc",
    },
  },
  production: {
    origin: "https://pyconhk-cms.website-pyconhk.workers.dev",
    contentRepo: "pyconhk/pyconhk-website",
    contentBranch: "cms",
    gateway: {
      project: "pyconhk-cms",
      origin: "https://pyconhk-cms.pages.dev",
      config: "cms/gateway/wrangler.jsonc",
    },
  },
} as const;

const websiteAccount = "043801e2f5b9cf2685593bd9098e98b1";
export async function ensureGatewayProject(project: string, request = fetch) {
  assert.ok(["pyconhk-cms", "pyconhk-cms-test"].includes(project), "Unsupported CMS Pages project");
  const token = process.env.CLOUDFLARE_PAGES_API_TOKEN;
  assert.ok(token, "CLOUDFLARE_PAGES_API_TOKEN is required for the CMS gateway");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${websiteAccount}/pages/projects`;
  const options = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(20_000) };
  const existing = await request(`${endpoint}/${project}`, options);
  if (existing.ok) return;
  assert.equal(existing.status, 404, `Cannot inspect CMS Pages project: ${existing.status}`);
  const created = await request(endpoint, { ...options, method: "POST", body: JSON.stringify({ name: project, production_branch: "main" }) });
  assert.ok(created.ok, `Cannot create CMS Pages project: ${created.status}`);
}

async function readGatewayJson(url: URL, request = fetch) {
  url.searchParams.set("deployment-check", Date.now().toString());
  try {
    const response = await request(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
    // New Pages aliases and their service bindings can be temporarily unavailable
    // after upload. Authentication and TLS configuration errors remain fatal.
    if ([404, 500, 502, 503, 504, 520, 521, 522, 523, 524].includes(response.status)) return null;
    assert.ok(response.ok, `Cannot read CMS gateway manifest: ${response.status}`);
    return response.headers.get("content-type")?.includes("application/json") ? response.json() : null;
  } catch (error) {
    // A newly created Pages project may not have a resolving hostname yet.
    if (error instanceof TypeError && (error.cause as NodeJS.ErrnoException)?.code === "ENOTFOUND") return null;
    throw error;
  }
}

export async function readGatewayManifest(origin: string, request = fetch) {
  return readGatewayJson(new URL("/cms-gateway-manifest.json", origin), request);
}

export async function readGatewayWorkerManifest(origin: string, request = fetch) {
  return readGatewayJson(new URL("/deployment-manifest.json", origin), request);
}

async function verifyGateway(
  read: () => Promise<Record<string, unknown> | null>,
  matches: (manifest: Record<string, unknown> | null) => boolean,
  message: string,
  wait: (milliseconds: number) => Promise<void>,
) {
  const attempts = 6;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (matches(await read())) return;
    if (attempt + 1 < attempts) await wait(5_000);
  }
  assert.fail(`${message} after ${attempts} readiness checks`);
}

export async function deployCms({
  root = fileURLToPath(new URL("../..", import.meta.url)),
  profile = process.env.CMS_BUILD_PROFILE || "legacy",
  origin = process.env.CMS_DEPLOY_ORIGIN,
  force = false,
  readManifest = readDeploymentManifest,
  readGateway = readGatewayManifest,
  readGatewayWorker = readGatewayWorkerManifest,
  ensureGateway = ensureGatewayProject,
  wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)),
  run = execFileSync,
} = {}) {
  assert.ok(profile in profiles, "CMS_BUILD_PROFILE must be legacy, test or production");
  const target = profiles[profile as keyof typeof profiles];
  const gateway = target.gateway;
  origin ||= gateway?.origin ?? target.origin;
  assert.ok(origin, `CMS_DEPLOY_ORIGIN is required for ${profile}`);
  assert.equal(new URL(origin).protocol, "https:");
  if (profile === "production") {
    assert.equal(
      process.env.CLOUDFLARE_ACCOUNT_ID,
      websiteAccount,
      "Production CMS must deploy to the Website PyCon HK Cloudflare account",
    );
  } else if (profile === "test") {
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
  const workerOrigin = gateway ? target.origin : origin;
  const previous = await readManifest(workerOrigin);
  if (!force && matchesTarget(previous)) {
    console.log("CMS inputs are unchanged; build and deployment skipped.");
  } else {
    if (profile === "legacy") {
      run("mise", ["run", "check-cms-content"], {
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
      const manifest = await readManifest(workerOrigin);
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
    console.log(`Verified CMS Worker at ${workerOrigin}.`);
  }
  if (gateway) {
    await ensureGateway(gateway.project);
    const matchesGateway = (manifest: Record<string, unknown> | null) =>
      manifest?.app === "cms-gateway" && manifest.sourceHash === sourceHash &&
      manifest.environment === profile &&
      manifest.contentRepo === target.contentRepo && manifest.contentBranch === target.contentBranch;
    const readSelectedGateway = () => readGateway(gateway.origin);
    if (!force && matchesGateway(await readSelectedGateway())) {
      console.log("CMS gateway inputs are unchanged; upload skipped.");
    } else {
      const staging = mkdtempSync(path.join(tmpdir(), "pyconhk-cms-gateway-"));
      try {
        cpSync(path.join(root, gateway.config), path.join(staging, "wrangler.jsonc"));
        cpSync(path.join(root, "cms/gateway/public"), path.join(staging, "dist"), { recursive: true });
        writeFileSync(path.join(staging, "dist/cms-gateway-manifest.json"), JSON.stringify({ app: "cms-gateway", sourceHash, environment: profile, contentRepo: target.contentRepo, contentBranch: target.contentBranch }));
        const env = { ...process.env, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_PAGES_API_TOKEN };
        delete env.CMS_GITHUB_CLIENT_ID;
        delete env.CMS_GITHUB_CLIENT_SECRET;
        run(process.execPath, [path.join(root, "cms/node_modules/wrangler/bin/wrangler.js"), "pages", "deploy", "dist", "--project-name", gateway.project, "--branch", "main"], { cwd: staging, stdio: "inherit", env });
      } finally {
        rmSync(staging, { recursive: true, force: true });
      }
      await verifyGateway(readSelectedGateway, matchesGateway, "CMS gateway did not publish the expected source hash", wait);
    }
    await verifyGateway(() => readGatewayWorker(origin), matchesTarget, `CMS gateway must forward to the expected ${profile} Worker`, wait);
    console.log(`Verified ${profile} CMS through ${origin}.`);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await deployCms({ force: process.argv.includes("--force") });
}
