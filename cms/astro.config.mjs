import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sessionDrivers } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  // The CMS uses its own short-lived OAuth cookies, not Astro sessions.
  session: { driver: sessionDrivers.lruCache() },
  vite: {
    plugins: [tailwindcss()],
  },
});
