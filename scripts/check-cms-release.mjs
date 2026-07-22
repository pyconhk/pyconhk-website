import { execFileSync } from "node:child_process";
import {
  checkCmsContentLocales,
  cmsRepoRoot,
} from "./check-cms-content-locales.mjs";

const cmsRef = "origin/cms";

execFileSync(
  "git",
  ["fetch", "origin", "+refs/heads/cms:refs/remotes/origin/cms"],
  { cwd: cmsRepoRoot, stdio: "inherit" },
);
checkCmsContentLocales(cmsRef);
console.log(`CMS release content validation passed: ${cmsRef}`);
