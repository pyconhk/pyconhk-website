import path from "node:path";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sessionDrivers } from "astro/config";
import { deploymentSourceHash } from "../.github/deploy/source.ts";

const buildProfile = process.env.CMS_BUILD_PROFILE ?? "legacy";
const wranglerConfigPath = {
  legacy: "./wrangler.jsonc",
  test: "./wrangler.test.jsonc",
  production: "./wrangler.production.jsonc",
}[buildProfile];

if (!wranglerConfigPath) {
  throw new Error("CMS_BUILD_PROFILE must be legacy, test or production");
}

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
    configPath: wranglerConfigPath,
  }),
  // The CMS uses its own short-lived OAuth cookies, not Astro sessions.
  session: { driver: sessionDrivers.lruCache() },
  vite: {
    define: {
      "import.meta.env.CMS_DEPLOYMENT_SOURCE_HASH": JSON.stringify(
        deploymentSourceHash("cms", path.resolve(process.cwd(), ".."), {
          cmsProfile: buildProfile,
        }),
      ),
    },
    plugins: [tailwindcss()],
  },
});
