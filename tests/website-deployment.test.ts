import assert from "node:assert/strict";
import test from "node:test";
import { deploymentTargets, needsDeployment, verifyDeployment } from "../scripts/website-deployment.ts";
import { snapshotHash, unpublishedSnapshot } from "../website/src/lib/programme/snapshot.ts";

const previous = { sourceHash: "a", programmeHash: "p", event: "pyconhk2025", environment: "test", sourceUrl: "https://pretalx.com/pyconhk2025/schedule/export/schedule.json" };
test("unchanged timetable and code skip deployment, including changing timestamps", () => {
  assert.equal(needsDeployment(previous, { ...previous, preparedAt: "later" }), false);
  assert.equal(needsDeployment({ ...previous, sourceSha: "old" }, { ...previous, sourceSha: "new" }), false);
});
test("code, programme, source or environment changes deploy independently", () => {
  for (const key of Object.keys(previous)) assert.equal(needsDeployment(previous, { ...previous, [key]: "changed" }), true);
  assert.equal(needsDeployment(previous, previous, true), true);
  assert.equal(needsDeployment(null, previous), true);
  assert.equal(needsDeployment({ sourceSha: "a" }, previous), true);
});
test("production cannot consume the 2025 preview source", () => {
  assert.equal(deploymentTargets.production.event, "pyconhk2026");
  assert.equal(deploymentTargets.production.branch, "main");
  assert.equal(deploymentTargets.test.event, "pyconhk2025");
  assert.notEqual(deploymentTargets.production.project, deploymentTargets.test.project);
});

function verificationFixture() {
  const target = deploymentTargets.test;
  const snapshot = unpublishedSnapshot({
    event: target.event, environment: "test", sourceUrl: target.source,
  });
  const manifest = {
    sourceSha: "a".repeat(40), sourceHash: "c".repeat(64), programmeHash: snapshot.hash,
    event: target.event, environment: "test",
  };
  return { snapshot, manifest };
}

const homePage = async () => new Response("<h1>PyCon HK</h1>", { status: 200 });

test("verification rejects the previous timetable when its source commit is unchanged", async () => {
  const { snapshot, manifest } = verificationFixture();
  await assert.rejects(verifyDeployment("test", manifest, {
    attempts: 1, fetchImpl: homePage,
    readJson: async (_origin, filename) => filename === "/deployment-manifest.json"
      ? { ...manifest, programmeHash: "b".repeat(64) } : snapshot,
  }), /programmeHash has not reached/);
});

test("verification rejects an old snapshot even when the manifest already matches", async () => {
  const { snapshot, manifest } = verificationFixture();
  const previousSnapshot = { ...snapshot, title: "Previous public programme" };
  previousSnapshot.hash = snapshotHash(previousSnapshot);
  await assert.rejects(verifyDeployment("test", manifest, {
    attempts: 1, fetchImpl: homePage,
    readJson: async (_origin, filename) => filename === "/deployment-manifest.json"
      ? manifest : previousSnapshot,
  }), /snapshot has not reached the expected content/);
});

test("verification requires consistent environment and event identities", async () => {
  const { snapshot, manifest } = verificationFixture();
  for (const invalidSnapshot of [
    { ...snapshot, environment: "preview" }, { ...snapshot, event: "pyconhk2026" },
    { ...snapshot, hash: "b".repeat(64) },
  ]) {
    await assert.rejects(verifyDeployment("test", manifest, {
      attempts: 1, fetchImpl: homePage,
      readJson: async (_origin, filename) => filename === "/deployment-manifest.json"
        ? manifest : invalidSnapshot,
    }), /Snapshot identity or content hash is invalid/);
  }
});

test("verification retries propagation and succeeds only once manifest and snapshot match", async () => {
  const { snapshot, manifest } = verificationFixture();
  let reads = 0;
  let waits = 0;
  let homeChecks = 0;
  await verifyDeployment("test", manifest, {
    attempts: 2,
    wait: async () => { waits += 1; },
    fetchImpl: async () => { homeChecks += 1; return homePage(); },
    readJson: async (_origin, filename) => {
      if (filename === "/programme-snapshot.json") return snapshot;
      reads += 1;
      return reads === 1 ? { ...manifest, programmeHash: "b".repeat(64) } : manifest;
    },
  });
  assert.equal(waits, 1);
  assert.equal(homeChecks, 1);
});
