import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  site: process.env.CMS_PUBLIC_URL || "http://localhost:4321",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
