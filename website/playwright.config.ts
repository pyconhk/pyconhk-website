import { defineConfig, devices } from '@playwright/test';

const e2ePort = Number(process.env.E2E_PORT ?? 8790);
const hostedBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.E2E_BASE_URL;
const baseURL = hostedBaseURL ?? `http://127.0.0.1:${e2ePort}`;
const browserChannel = process.env.CI ? {} : { channel: 'chrome' as const };

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: 'test-results',
  reporter: [['list']],
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: hostedBaseURL
    ? undefined
    : {
        command: `bun run build && bunx wrangler pages dev dist --local --ip 127.0.0.1 --port ${e2ePort}`,
        reuseExistingServer: false,
        timeout: 120_000,
        url: baseURL,
      },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        ...browserChannel,
      },
    },
  ],
});
