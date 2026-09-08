import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function validateEditorialBoundary(environment, files) {
  const { CMS_PR_HEAD, CMS_PR_HEAD_REPO, CMS_PR_BASE_REPO } = environment;
  if (!CMS_PR_HEAD?.startsWith("cms/") || !CMS_PR_BASE_REPO || CMS_PR_HEAD_REPO !== CMS_PR_BASE_REPO) {
    throw new Error("Only same-repository Decap editorial branches may target cms.");
  }
  if (!files.length || files.some((file) => !/^(website\/outstatic\/(content|media)\/|website\/public\/outstatic\/images\/)/.test(file))) {
    throw new Error("CMS editorial PRs must change only owned content and media paths.");
  }
}

function main() {
  const { CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA } = process.env;
  if (![CMS_PR_BASE_SHA, CMS_PR_HEAD_SHA].every((sha) => /^[a-f0-9]{40}$/.test(sha || ""))) {
    throw new Error("CMS editorial validation requires immutable base/head commits.");
  }
  const files = execFileSync("git", ["diff", "--name-only", "-z", `${CMS_PR_BASE_SHA}...${CMS_PR_HEAD_SHA}`], { encoding: "utf8" })
    .split("\0").filter(Boolean);
  validateEditorialBoundary(process.env, files);
  console.log(`Validated ${files.length} CMS-owned editorial changes.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
