import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

export type App = "website" | "cms";

export function isDeploymentInput(app: App, filename: string) {
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(filename)) return false;
  if (/(^|\/)(tests|e2e|sandbox-content|sandbox-images)(\/|$)/.test(filename)) return false;
  if (/\.(md|mdx)$/.test(filename) && !filename.startsWith(`${app}/src/`) && !filename.startsWith(`${app}/outstatic/`)) return false;
  if (["package.json", "bun.lock", "mise.toml", "scripts/deployment-source.ts"].includes(filename)) return true;
  if (filename.startsWith("patches/")) return true;
  if (app === "website" && filename === "scripts/website-deployment.ts") return true;
  return filename.startsWith(`${app}/`) && !/^.+\/(biome\.json|playwright\.config\.ts|worker-configuration\.d\.ts)$/.test(filename);
}

// Hash actual build inputs, not commits: merges, docs and another app's edits
// must not invalidate a successful deployment. Include working files for local releases.
export function deploymentSourceHash(app: App, root: string) {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, encoding: "utf8" });
  const hash = createHash("sha256").update(`deployment-inputs-v1:${app}\0`);
  for (const filename of [...new Set(files.split("\0").filter(Boolean))].sort()) {
    if (!isDeploymentInput(app, filename)) continue;
    const absolute = path.join(root, filename);
    let contents: Buffer;
    let executable: number;
    try {
      contents = readFileSync(absolute);
      executable = statSync(absolute).mode & 0o111;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    hash.update(filename).update("\0").update(String(executable)).update("\0");
    hash.update(createHash("sha256").update(contents).digest());
  }
  return hash.digest("hex");
}

export async function readDeploymentManifest(origin: string) {
  const url = new URL("/deployment-manifest.json", origin);
  url.searchParams.set("deployment-check", Date.now().toString());
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cannot read deployment manifest: ${response.status}`);
  if (!response.headers.get("content-type")?.includes("application/json")) return null;
  return response.json();
}
