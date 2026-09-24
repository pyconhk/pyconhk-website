import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { deploymentSourceHash } from "./source.ts";
import { needsDeployment, resolveNewsRevision, verifyDeployment } from "./website.ts";

const firstSha = "a".repeat(40);
const secondSha = "b".repeat(40);

test("News preflight resolves the test and production refs to immutable commits", () => {
  const lookups = [];
  const lookup = (url, ref) => {
    lookups.push({ url, ref });
    return `${firstSha}\t${ref}\n`;
  };
  assert.deepEqual(resolveNewsRevision("test", { source: "external", lookup }), {
    newsSource: "external", newsRepository: "pyconhk/pyconhk-news",
    newsRef: "refs/heads/test", newsSha: firstSha,
  });
  assert.deepEqual(resolveNewsRevision("preview", { source: "external", lookup }), {
    newsSource: "external", newsRepository: "pyconhk/pyconhk-news",
    newsRef: "refs/heads/test", newsSha: firstSha,
  });
  assert.deepEqual(resolveNewsRevision("production", { source: "external", lookup }), {
    newsSource: "external", newsRepository: "pyconhk/pyconhk-news",
    newsRef: "refs/heads/main", newsSha: firstSha,
  });
  assert.equal(lookups.length, 3);
  assert.ok(lookups.every(({ url }) => url === "https://github.com/pyconhk/pyconhk-news.git"));
  assert.throws(() => resolveNewsRevision("test", { source: "external", lookup: () => { throw new Error("missing"); } }),
    /cannot resolve/);
  assert.throws(() => resolveNewsRevision("production", { source: "external", lookup: () => `${firstSha}\trefs\/heads\/test\n` }),
    /no valid refs\/heads\/main/);
});

test("a News SHA change deploys, while unchanged inputs skip", () => {
  const previous = { sourceHash: "c".repeat(64), programmeHash: "d".repeat(64),
    event: "pyconhk2025", environment: "test", sourceUrl: "https://example.invalid/programme.json",
    newsSource: "external", newsRepository: "pyconhk/pyconhk-news",
    newsRef: "refs/heads/test", newsSha: firstSha };
  assert.equal(needsDeployment(previous, { ...previous }), false);
  assert.equal(needsDeployment(previous, { ...previous, newsSha: secondSha }), true);
  assert.equal(needsDeployment(previous, { ...previous }, true), true);
  assert.equal(needsDeployment(previous, { ...previous, newsSource: "local", newsSha: "" }), true);
});

test("external News replaces checked-in News as the build input", () => {
  const root = mkdtempSync(path.join(tmpdir(), "pycon-news-hash-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    const code = path.join(root, "website/src/index.ts");
    const news = path.join(root, "website/outstatic/content/2026-posts/example.en.mdx");
    const image = path.join(root, "website/public/outstatic/images/example.webp");
    for (const file of [code, news, image]) mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(code, "export const page = 1;\n");
    writeFileSync(news, "First announcement\n");
    writeFileSync(image, "first image");
    execFileSync("git", ["add", "."], { cwd: root });
    const localBefore = deploymentSourceHash("website", root);
    const externalBefore = deploymentSourceHash("website", root, { externalNews: true });
    writeFileSync(news, "Another announcement\n");
    writeFileSync(image, "another image");
    assert.notEqual(deploymentSourceHash("website", root), localBefore);
    assert.equal(deploymentSourceHash("website", root, { externalNews: true }), externalBefore);
    writeFileSync(code, "export const page = 2;\n");
    assert.notEqual(deploymentSourceHash("website", root, { externalNews: true }), externalBefore);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hosted verification rejects a different News revision", async () => {
  const expected = { sourceSha: firstSha, sourceHash: "c".repeat(64), programmeHash: "d".repeat(64),
    event: "pyconhk2025", environment: "test", sourceUrl: "https://example.invalid/programme.json",
    newsSource: "external", newsRepository: "pyconhk/pyconhk-news",
    newsRef: "refs/heads/test", newsSha: firstSha };
  await assert.rejects(verifyDeployment("test", expected, {
    readJson: async (_origin, filename) => filename === "/deployment-manifest.json"
      ? { ...expected, newsSha: secondSha } : {},
    attempts: 1,
  }), /newsSha/);
});
