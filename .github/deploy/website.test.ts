import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { deploymentSourceHash } from "./source.ts";
import { needsDeployment, verifyDeployment } from "./website.ts";

const firstSha = "a".repeat(40);
const secondSha = "b".repeat(40);

test("changed content deploys while unchanged inputs skip", () => {
  const previous = { sourceHash: "c".repeat(64), programmeHash: "d".repeat(64),
    event: "pyconhk2025", environment: "test", sourceUrl: "https://example.invalid/programme.json", newsSource: "local" };
  assert.equal(needsDeployment(previous, { ...previous }), false);
  assert.equal(needsDeployment(previous, { ...previous, sourceHash: "e".repeat(64) }), true);
  assert.equal(needsDeployment(previous, { ...previous }, true), true);
  assert.equal(needsDeployment({ ...previous, newsSource: "external" }, previous), true);
});

test("article and uploaded-image changes independently invalidate the website build", () => {
  const root = mkdtempSync(path.join(tmpdir(), "pycon-news-hash-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    const news = path.join(root, "website/outstatic/content/2026-posts/example.en.mdx");
    const image = path.join(root, "website/public/outstatic/images/example.webp");
    for (const file of [news, image]) mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(news, "First announcement\n");
    writeFileSync(image, "first image");
    execFileSync("git", ["add", "."], { cwd: root });
    const initial = deploymentSourceHash("website", root);
    writeFileSync(news, "Updated announcement\n");
    const updatedNews = deploymentSourceHash("website", root);
    assert.notEqual(updatedNews, initial);
    writeFileSync(image, "updated image");
    assert.notEqual(deploymentSourceHash("website", root), updatedNews);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hosted verification rejects a different website and News commit", async () => {
  const expected = { sourceSha: firstSha, sourceHash: "c".repeat(64), programmeHash: "d".repeat(64),
    event: "pyconhk2025", environment: "test", sourceUrl: "https://example.invalid/programme.json", newsSource: "local" };
  await assert.rejects(verifyDeployment("test", expected, {
    readJson: async (_origin, filename) => filename === "/deployment-manifest.json"
      ? { ...expected, sourceSha: secondSha } : {},
    attempts: 1,
  }), /sourceSha/);
});
