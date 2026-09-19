import path from "node:path";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sessionDrivers } from "astro/config";
import { deploymentSourceHash } from "../.github/deploy/source.ts";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  // The CMS uses its own short-lived OAuth cookies, not Astro sessions.
  session: { driver: sessionDrivers.lruCache() },
  vite: {
    define: {
      "import.meta.env.CMS_DEPLOYMENT_SOURCE_HASH": JSON.stringify(
        deploymentSourceHash("cms", path.resolve(process.cwd(), "..")),
      ),
    },
    plugins: [tailwindcss()],
  },
});
