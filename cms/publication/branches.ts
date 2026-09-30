import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isNewsFile } from "./promotion.ts";

type BranchChange = {
  base: string;
  head: string;
  baseRepo: string;
  headRepo: string;
  baseSha?: string;
  headSha?: string;
  called?: boolean;
};

const promotionHeads = {
  main: "automation/cms-to-main",
  test: "automation/cms-test-to-test",
} as const;

export function validateBranchRules(change: BranchChange, directory = process.cwd()) {
  const { base, head, baseRepo, headRepo, baseSha, headSha, called } = change;
  assert.ok(base && head && baseRepo && headRepo, "Branch Rules requires source and target repository/branch names");
  const promotion = head.startsWith("automation/cms") || called;
  const editorial = base === "cms" && head.startsWith("cms-editorial/");

  if (!promotion && !editorial) {
    assert.ok(
      base === "test" || (base === "main" && head === "test" && headRepo === baseRepo),
      "Code changes must target test; only the same repository's test branch may promote code to main",
    );
    return;
  }

  assert.equal(headRepo, baseRepo, "CMS publication must use the same repository, not a fork");
  if (promotion) {
    assert.equal(head, promotionHeads[base as keyof typeof promotionHeads], "CMS publication branch must match its target environment");
  }
  assert.ok(
    [baseSha, headSha].every((sha) => /^[a-f0-9]{40}$/.test(sha || "")),
    "CMS publication requires immutable base and head commit SHAs",
  );
  const git = (...args: string[]) => execFileSync("git", args, { cwd: directory, encoding: "utf8" });
  git("cat-file", "-e", `${baseSha}^{commit}`);
  git("cat-file", "-e", `${headSha}^{commit}`);
  git("merge-base", "--is-ancestor", baseSha!, headSha!);
  const records = git("diff", "--raw", "--no-renames", "-z", baseSha!, headSha!).split("\0");
  let changes = 0;
  for (let index = 0; index < records.length - 1; index += 2) {
    const metadata = /^:(\d{6}) (\d{6}) [a-f0-9]+ [a-f0-9]+ ([AMD])$/.exec(records[index]);
    const filename = records[index + 1];
    assert.ok(metadata && filename, "Unsupported CMS diff entry");
    assert.ok(isNewsFile(filename), `CMS publication cannot change developer-owned file: ${filename}`);
    assert.ok(
      [metadata[1], metadata[2]].every((mode) => mode === "000000" || mode === "100644"),
      `CMS publication requires regular non-executable files: ${filename}`,
    );
    changes += 1;
  }
  assert.ok(changes > 0, "CMS publication must contain a News or media change");
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateBranchRules({
    base: process.env.CMS_PR_BASE || "",
    head: process.env.CMS_PR_HEAD || "",
    baseRepo: process.env.CMS_PR_BASE_REPO || "",
    headRepo: process.env.CMS_PR_HEAD_REPO || "",
    baseSha: process.env.CMS_PR_BASE_SHA,
    headSha: process.env.CMS_PR_HEAD_SHA,
    called: process.env.CMS_CI_MODE === "true",
  });
  console.log("Branch Rules passed.");
}
