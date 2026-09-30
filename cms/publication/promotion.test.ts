import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { assertBoundary, assertCurrentTarget, assertValidation, isNewsFile, prepareCandidate, routes } from "./promotion.ts";

const article = "website/outstatic/content/2026-posts/example.en.mdx";
const image = "website/public/outstatic/images/example.webp";
const websiteFile = "website/src/pages/index.astro";

function git(directory, ...args) {
  return execFileSync("git", args, {
    cwd: directory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function write(directory, file, content) {
  const destination = path.join(directory, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function commit(directory, message) {
  git(directory, "add", "--all");
  git(directory, "commit", "--quiet", "-m", message);
  return git(directory, "rev-parse", "HEAD");
}

function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), "pycon-cms-promotion-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  git(directory, "init", "--quiet", "--initial-branch=main");
  git(directory, "config", "user.name", "CMS test");
  git(directory, "config", "user.email", "cms-test@example.invalid");
  git(directory, "config", "commit.gpgsign", "false");
  git(directory, "config", "core.hooksPath", "/dev/null");
  git(directory, "config", "core.fileMode", "true");
  write(directory, article, "Original article\n");
  write(directory, websiteFile, "<h1>Existing website</h1>\n");
  write(directory, ".github/workflows/site.yml", "name: Existing website workflow\n");
  write(directory, "website/bin/existing-tool", "#!/bin/sh\nexit 0\n");
  chmodSync(path.join(directory, "website/bin/existing-tool"), 0o755);
  const initial = commit(directory, "Existing website and News");
  git(directory, "branch", "cms");
  git(directory, "switch", "--quiet", "cms");
  return { directory, initial };
}

function savedArticle(directory, text = "Saved through CMS\n") {
  git(directory, "switch", "--quiet", "cms");
  write(directory, article, text);
  return commit(directory, "Save News through CMS");
}

test("publication routes isolate production and test", () => {
  assert.deepEqual(routes, { cms: "main", "cms-test": "test" });
});

test("News boundary accepts only the supported years, locales and raster uploads", () => {
  for (const year of [2025, 2026]) {
    const locales = year === 2025
      ? ["en", "zh-hk", "zh-hant", "zh-hans", "ja"]
      : ["en", "zh-hk", "zh-hant", "zh-hans", "ja", "ko"];
    for (const locale of locales) {
      assert.equal(isNewsFile(`website/outstatic/content/${year}-posts/story.${locale}.mdx`), true);
    }
  }
  for (const extension of ["png", "jpg", "jpeg", "webp", "gif", "avif"]) {
    assert.equal(isNewsFile(`website/public/outstatic/images/photo.${extension}`), true);
  }
  for (const file of [
    "website/outstatic/content/2025-posts/story.ko.mdx",
    "website/outstatic/content/2027-posts/story.en.mdx",
    "website/outstatic/content/2026-posts/story.fr.mdx",
    "website/outstatic/content/2026-posts/story.mdx",
    "website/outstatic/content/2026-posts/nested/story.en.mdx",
    "website/outstatic/content/2026-conference/settings.json",
    "website/public/outstatic/images/logo.svg",
    "website/public/outstatic/images/payload.html",
    "website/public/outstatic/images/nested/photo.png",
    ".github/workflows/site.yml",
    websiteFile,
  ]) {
    assert.equal(isNewsFile(file), false, file);
  }
});

test("candidate preserves CMS commits and concurrent website history without moving either branch", (t) => {
  const { directory } = fixture(t);
  const firstSave = savedArticle(directory, "First saved revision\n");
  const sourceSha = savedArticle(directory, "Latest saved revision\n");
  git(directory, "switch", "--quiet", "main");
  write(directory, websiteFile, "<h1>New developer change</h1>\n");
  const targetSha = commit(directory, "Independent website update");

  const candidate = prepareCandidate(directory, "cms", "main");

  assert.ok(candidate);
  assert.deepEqual(candidate, {
    source: "cms", target: "main", sourceSha, targetSha,
    candidateSha: git(directory, "rev-parse", "HEAD"),
  });
  assert.equal(git(directory, "show", "-s", "--format=%P", candidate.candidateSha), `${targetSha} ${sourceSha}`);
  assert.doesNotThrow(() => git(directory, "merge-base", "--is-ancestor", firstSave, candidate.candidateSha));
  assert.equal(readFileSync(path.join(directory, article), "utf8"), "Latest saved revision\n");
  assert.equal(readFileSync(path.join(directory, websiteFile), "utf8"), "<h1>New developer change</h1>\n");
  assert.equal(git(directory, "rev-parse", "main"), targetSha);
  assert.equal(git(directory, "rev-parse", "cms"), sourceSha);
  assert.equal(git(directory, "status", "--porcelain"), "");
  assert.doesNotThrow(() => assertBoundary(directory, targetSha, candidate.candidateSha));
});

test("already published CMS commits are a no-op", (t) => {
  const { directory, initial } = fixture(t);
  assert.equal(prepareCandidate(directory, "cms", "main"), null);
  assert.equal(git(directory, "rev-parse", "main"), initial);
});

test("equivalent content on both branches does not produce a redundant candidate", (t) => {
  const { directory } = fixture(t);
  savedArticle(directory, "Same published content\n");
  git(directory, "switch", "--quiet", "main");
  write(directory, article, "Same published content\n");
  const targetSha = commit(directory, "Independently publish the same content");
  assert.equal(prepareCandidate(directory, "cms", "main"), null);
  assert.equal(git(directory, "rev-parse", "main"), targetSha);
  assert.equal(git(directory, "status", "--porcelain"), "");
});

test("production and test CMS branches cannot be promoted across environments", (t) => {
  const { directory } = fixture(t);
  savedArticle(directory);
  assert.throws(() => prepareCandidate(directory, "cms", "test"));
  assert.throws(() => prepareCandidate(directory, "cms-test", "main"));
  assert.throws(() => prepareCandidate(directory, "untrusted", "main"));
});

test("test promotion uses the same validated merge without modifying production", (t) => {
  const { directory, initial } = fixture(t);
  git(directory, "branch", "test", initial);
  git(directory, "switch", "--quiet", "-c", "cms-test", initial);
  write(directory, article, "Test-only News\n");
  const sourceSha = commit(directory, "Save test News");
  const candidate = prepareCandidate(directory, "cms-test", "test");
  assert.ok(candidate);
  assert.equal(candidate.sourceSha, sourceSha);
  assert.equal(candidate.targetSha, initial);
  assert.equal(candidate.target, "test");
  assert.equal(git(directory, "rev-parse", "main"), initial);
  assert.equal(git(directory, "show", "main:" + article), "Original article");
});

for (const file of [websiteFile, ".github/workflows/site.yml"]) {
  test(`source changes to ${file} fail instead of entering production`, (t) => {
    const { directory, initial } = fixture(t);
    write(directory, article, "Valid News change\n");
    write(directory, file, "Unauthorized source change\n");
    const sourceSha = commit(directory, "Mixed content and code change");
    assert.throws(() => assertBoundary(directory, initial, sourceSha));
    assert.throws(() => prepareCandidate(directory, "cms", "main"));
    assert.equal(git(directory, "rev-parse", "main"), initial);
    assert.equal(git(directory, "rev-parse", "cms"), sourceSha);
  });
}

test("a CMS merge conflict fails without overwriting either saved or published content", (t) => {
  const { directory } = fixture(t);
  const sourceSha = savedArticle(directory, "Marketing revision\n");
  git(directory, "switch", "--quiet", "main");
  write(directory, article, "Already published correction\n");
  const targetSha = commit(directory, "Correct published article");

  assert.throws(() => prepareCandidate(directory, "cms", "main"));

  assert.equal(git(directory, "rev-parse", "main"), targetSha);
  assert.equal(git(directory, "rev-parse", "cms"), sourceSha);
  assert.equal(git(directory, "show", "main:" + article), "Already published correction");
  assert.equal(git(directory, "show", "cms:" + article), "Marketing revision");
  assert.equal(git(directory, "status", "--porcelain"), "");
  assert.throws(() => git(directory, "rev-parse", "--verify", "MERGE_HEAD"));
});

test("a target changed during validation cannot be published using an old candidate", (t) => {
  const { directory } = fixture(t);
  savedArticle(directory);
  const candidate = prepareCandidate(directory, "cms", "main");
  assert.ok(candidate);
  assert.doesNotThrow(() => assertCurrentTarget(candidate, candidate.targetSha));
  git(directory, "switch", "--quiet", "main");
  write(directory, websiteFile, "<h1>Another production update</h1>\n");
  const currentTarget = commit(directory, "Update during validation");
  assert.throws(() => assertCurrentTarget(candidate, currentTarget));
  assert.equal(git(directory, "rev-parse", "main"), currentTarget);
});

test("publication requires successful full CI on the exact prepared candidate", () => {
  const candidate = { candidateSha: "1".repeat(40) };
  assert.doesNotThrow(() => assertValidation(candidate, "success", candidate.candidateSha));
  for (const result of ["failure", "cancelled", "skipped", "pending", "", undefined]) {
    assert.throws(() => assertValidation(candidate, result, candidate.candidateSha), String(result));
  }
  for (const validatedSha of ["2".repeat(40), "", undefined]) {
    assert.throws(() => assertValidation(candidate, "success", validatedSha));
  }
});

test("a new CMS save during validation remains available for the next promotion", (t) => {
  const { directory } = fixture(t);
  const validatedSource = savedArticle(directory, "Validated revision\n");
  const candidate = prepareCandidate(directory, "cms", "main");
  assert.ok(candidate);
  const laterSource = savedArticle(directory, "Next saved revision\n");
  assert.equal(git(directory, "show", candidate.candidateSha + ":" + article), "Validated revision");
  assert.equal(candidate.sourceSha, validatedSource);
  assert.equal(git(directory, "rev-parse", "cms"), laterSource);
  assert.doesNotThrow(() => assertCurrentTarget(candidate, git(directory, "rev-parse", "main")));

  git(directory, "update-ref", "refs/heads/main", candidate.candidateSha, candidate.targetSha);
  const nextCandidate = prepareCandidate(directory, "cms", "main");
  assert.ok(nextCandidate);
  assert.equal(nextCandidate.sourceSha, laterSource);
  assert.equal(nextCandidate.targetSha, candidate.candidateSha);
  assert.equal(git(directory, "show", nextCandidate.candidateSha + ":" + article), "Next saved revision");
});

test("News deletions and raster uploads are permitted without deleting website files", (t) => {
  const { directory, initial } = fixture(t);
  rmSync(path.join(directory, article));
  write(directory, image, "Raster fixture\n");
  const sourceSha = commit(directory, "Remove article and upload image");
  assert.doesNotThrow(() => assertBoundary(directory, initial, sourceSha));
  const candidate = prepareCandidate(directory, "cms", "main");
  assert.ok(candidate);
  assert.equal(git(directory, "ls-tree", "--name-only", candidate.candidateSha, article), "");
  assert.equal(git(directory, "show", candidate.candidateSha + ":" + image), "Raster fixture");
  assert.equal(git(directory, "show", candidate.candidateSha + ":" + websiteFile), "<h1>Existing website</h1>");
});

test("a News symlink cannot be promoted even when its name matches an allowed upload", (t) => {
  const { directory, initial } = fixture(t);
  mkdirSync(path.dirname(path.join(directory, image)), { recursive: true });
  symlinkSync("../../../src/pages/index.astro", path.join(directory, image));
  const sourceSha = commit(directory, "Add symlink disguised as an upload");
  assert.throws(() => assertBoundary(directory, initial, sourceSha));
  assert.throws(() => prepareCandidate(directory, "cms", "main"));
  assert.equal(git(directory, "rev-parse", "main"), initial);
});

test("executable News files are rejected while existing website executables remain valid", (t) => {
  const { directory, initial } = fixture(t);
  assert.doesNotThrow(() => assertBoundary(directory, initial, initial));
  chmodSync(path.join(directory, article), 0o755);
  const sourceSha = commit(directory, "Make an article executable");
  assert.throws(() => assertBoundary(directory, initial, sourceSha));
  assert.throws(() => prepareCandidate(directory, "cms", "main"));
  assert.equal(git(directory, "rev-parse", "main"), initial);
});
