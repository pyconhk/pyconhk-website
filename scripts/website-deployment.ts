import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deploymentSourceHash } from "./deployment-source.ts";
import { fetchProgramme, validateSnapshot } from "../website/src/lib/programme/snapshot.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const deploymentTargets = {
  production: {
    branch: "main",
    project: "pyconhk-website-prod",
    origin: "https://pyconhk-website-prod.pages.dev",
    event: "pyconhk2026",
    source: "https://cfp.pycon.hk/pyconhk2026/schedule/export/schedule.json",
  },
  test: {
    branch: "test",
    project: "pyconhk-website-test",
    origin: "https://pyconhk-website-test.pages.dev",
    event: "pyconhk2025",
    source: "https://pretalx.com/pyconhk2025/schedule/export/schedule.json",
  },
  preview: {
    branch: "alex-dev",
    project: "pyconhk-website-test",
    origin: "https://alex-dev.pyconhk-website-test.pages.dev",
    event: "pyconhk2025",
    source: "https://pretalx.com/pyconhk2025/schedule/export/schedule.json",
  },
};

export function needsDeployment(previous, next, force = false) {
  return force || !previous || !next.sourceHash || ["sourceHash", "programmeHash", "event", "environment", "sourceUrl"]
    .some((key) => previous[key] !== next[key]);
}

async function readDeployedJson(origin, filename) {
  const url = new URL(filename, origin);
  url.searchParams.set("deployment-check", Date.now().toString());
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cannot read deployed ${filename}: ${response.status}`);
  // Pre-migration Pages sites may return their HTML 404 page with status 200.
  if (!(response.headers.get("content-type") || "").includes("application/json")) return null;
  return response.json();
}

async function prepare(environment, force) {
  const target = deploymentTargets[environment];
  assert.ok(target, `Unsupported deployment target: ${environment}`);
  const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const directory = path.join(root, "website/.cache/deployment", environment, target.event);
  await fs.mkdir(directory, { recursive: true });
  const [previous, baseline] = await Promise.all([
    readDeployedJson(target.origin, "/deployment-manifest.json"),
    readDeployedJson(target.origin, "/programme-snapshot.json"),
  ]);
  const snapshotPath = path.join(directory, "programme.json");
  let baselinePath = "";
  let previousSnapshot;
  if (baseline?.event === target.event && baseline?.environment === environment) {
    previousSnapshot = validateSnapshot(baseline, target.event, environment);
    baselinePath = path.join(directory, "baseline.json");
    await fs.writeFile(baselinePath, JSON.stringify(baseline));
  }
  // Preflight decides whether a build is needed; Astro owns build data generation.
  const current = await fetchProgramme({ event: target.event, sourceUrl: target.source,
    environment, baseline: previousSnapshot, allowUnpublished: true });
  const manifest = {
    sourceSha,
    sourceHash: deploymentSourceHash("website", root),
    programmeHash: current.hash,
    event: target.event,
    environment,
    sourceUrl: target.source,
    preparedAt: new Date().toISOString(),
  };
  const changed = needsDeployment(previous, manifest, force);
  await fs.writeFile(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const outputs = { changed: String(changed), snapshot_path: snapshotPath,
    manifest_path: path.join(directory, "manifest.json"), source_sha: sourceSha,
    project: target.project, branch: target.branch, origin: target.origin, event: target.event,
    source_url: target.source, baseline_path: baselinePath };
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT,
    Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`).join(""));
  console.log(JSON.stringify(outputs));
}

async function finalize(snapshotPath, manifestPath) {
  assert.ok(snapshotPath && manifestPath, "Both snapshot and manifest paths are required");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const snapshot = validateSnapshot(JSON.parse(await fs.readFile(snapshotPath, "utf8")), manifest.event, manifest.environment);
  manifest.programmeHash = snapshot.hash;
  manifest.builtAt = new Date().toISOString();
  await fs.copyFile(snapshotPath, path.join(root, "website/dist/programme-snapshot.json"));
  await fs.writeFile(path.join(root, "website/dist/deployment-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const headersPath = path.join(root, "website/dist/_headers");
  await fs.appendFile(headersPath,
    "\n/programme-snapshot.json\n  Cache-Control: no-store\n/deployment-manifest.json\n  Cache-Control: no-store\n");
}

export async function verifyDeployment(environment, expected, {
  readJson = readDeployedJson,
  fetchImpl = fetch,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  attempts = 6,
} = {}) {
  const target = deploymentTargets[environment];
  assert.ok(target && expected, "Target and expected deployment manifest are required");
  assert.equal(expected.environment, environment, "Expected manifest belongs to another environment");
  assert.equal(expected.event, target.event, "Expected manifest belongs to another event");
  assert.match(expected.sourceSha, /^[a-f0-9]{40}$/, "Expected source SHA is invalid");
  assert.match(expected.sourceHash, /^[a-f0-9]{64}$/, "Expected source hash is invalid");
  assert.match(expected.programmeHash, /^[a-f0-9]{64}$/, "Expected programme hash is invalid");
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const [manifest, snapshot] = await Promise.all([
        readJson(target.origin, "/deployment-manifest.json"),
        readJson(target.origin, "/programme-snapshot.json"),
      ]);
      for (const key of ["sourceSha", "sourceHash", "programmeHash", "event", "environment"]) {
        assert.equal(manifest?.[key], expected[key], `Hosted deployment ${key} has not reached the expected value`);
      }
      validateSnapshot(snapshot, target.event, environment);
      assert.equal(snapshot.hash, expected.programmeHash, "Hosted programme snapshot has not reached the expected content");
      const response = await fetchImpl(`${target.origin}/2026/en/`, { signal: AbortSignal.timeout(20_000) });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(html.includes("PyCon"), "Hosted home page is missing");
      console.log(`Verified ${environment}: ${expected.sourceSha}, programme ${expected.programmeHash} at ${target.origin}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await wait(5_000);
    }
  }
  throw lastError;
}

async function verify(environment, manifestPath) {
  assert.ok(manifestPath, "Expected deployment manifest path is required");
  const expected = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  await verifyDeployment(environment, expected);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "prepare") await prepare(args[0], args.includes("--force"));
  else if (command === "finalize") await finalize(args[0], args[1]);
  else if (command === "verify") await verify(args[0], args[1]);
  else throw new Error("Usage: website-deployment.ts prepare <target> [--force] | finalize <snapshot> <manifest> | verify <target> <manifest>");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
