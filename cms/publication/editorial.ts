import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sprintFile = /^website\/outstatic\/content\/2026-sprint\/settings\.(?:en|zh-hk|zh-hant|zh-hans|ja|ko)\.json$/u;

export function validateEditorialBoundary(environment, files) {
  const { CMS_PR_HEAD, CMS_PR_HEAD_REPO, CMS_PR_BASE_REPO } = environment;
  if (!CMS_PR_HEAD?.startsWith("cms-editorial/") || !CMS_PR_BASE_REPO || CMS_PR_HEAD_REPO !== CMS_PR_BASE_REPO) {
    throw new Error("Only same-repository Decap editorial branches may target cms.");
  }
  const newsFile = /^website\/outstatic\/content\/(?:2025-posts\/[^/]+\.(?:en|zh-hk|zh-hant|zh-hans|ja)\.mdx|2026-posts\/[^/]+\.(?:en|zh-hk|zh-hant|zh-hans|ja|ko)\.mdx)$/u;
  if (!files.length || files.some((file) => !newsFile.test(file) && !sprintFile.test(file) && !/^(?:website\/outstatic\/media\/|website\/public\/outstatic\/images\/)/u.test(file))) {
    throw new Error("CMS editorial PRs must change only news, localized Sprint settings and media paths.");
  }
}

export function validateSprintSingletonDeletions(files) {
  const deleted = files.filter((file) => sprintFile.test(file));
  if (deleted.length) {
    throw new Error(`Canonical Sprint settings cannot be deleted; use draft status to unpublish: ${deleted.join(", ")}`);
  }
}

function main() {
  const { CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA } = process.env;
  if (![CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA].every((sha) => /^[a-f0-9]{40}$/.test(sha || ""))) {
    throw new Error("CMS editorial validation requires immutable base/head commits.");
  }
  const files = execFileSync("git", ["diff", "--no-renames", "--name-only", "-z", `${CMS_PR_BASE_SHA}...${CMS_PR_HEAD_SHA}`], { encoding: "utf8" })
    .split("\0").filter(Boolean);
  const deleted = execFileSync("git", ["diff", "--no-renames", "--diff-filter=D", "--name-only", "-z", `${CMS_PR_BASE_SHA}...${CMS_PR_HEAD_SHA}`], { encoding: "utf8" })
    .split("\0").filter(Boolean);
  validateSprintSingletonDeletions(deleted);
  if (process.argv[2] !== "--check-sprint-deletions") validateEditorialBoundary(process.env, files);
  console.log(`Validated ${files.length} CMS-owned editorial changes.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
