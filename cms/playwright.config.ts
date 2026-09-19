import { defineConfig, devices } from "@playwright/test";

const origin = process.env.CMS_BASE_URL;
const port = Number(process.env.CMS_E2E_PORT ?? 8791);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? "100%" : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: origin ?? `http://127.0.0.1:${port}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: origin
    ? undefined
    : {
        command: `${process.env.PLAYWRIGHT_SKIP_BUILD === "1" ? "" : "bun run build && "}bunx wrangler dev --port ${port} --ip 127.0.0.1 --var CMS_GITHUB_CLIENT_ID:e2e-local-client --var CMS_GITHUB_CLIENT_SECRET:e2e-local-secret`,
        url: `http://127.0.0.1:${port}/admin/`,
        env: {
          CMS_GITHUB_CLIENT_ID: "e2e-local-client",
          CMS_GITHUB_CLIENT_SECRET: "e2e-local-secret",
        },
        timeout: 120_000,
        reuseExistingServer: false,
      },
});
