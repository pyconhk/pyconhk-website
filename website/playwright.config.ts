import { defineConfig, devices } from '@playwright/test';

const e2ePort = Number(process.env.E2E_PORT ?? 8790);
const hostedBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.E2E_BASE_URL;
const baseURL = hostedBaseURL ?? `http://127.0.0.1:${e2ePort}`;
const browserChannel = process.env.CI ? {} : { channel: 'chrome' as const };
const testYear = process.env.TEST_YEAR;
const yearFiles: Record<string, string[]> = {
  '2015': [], '2016': [], '2017': [], '2018': [],
  '2020': ['legacy-2020-layout.spec.ts'],
  '2021': ['legacy-2021-layout.spec.ts'],
  '2022': ['legacy-2022-layout.spec.ts'],
  '2023': ['legacy-2023-layout.spec.ts'],
  '2024': [],
  '2025': ['2025-*.spec.ts', 'primary-navigation.spec.ts'],
  '2026': ['2026-*.spec.ts', 'cfp-locale-switcher.spec.ts', 'programme*.spec.ts'],
  common: ['cms-news-routing.spec.ts'],
};
if (testYear && !yearFiles[testYear]) throw new Error(`Unknown test year: ${testYear}`);
const yearPattern = /2015|2016|2017|2018|2020|2021|2022|2023|2024|2025|2026/;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  workers: process.env.CI ? '100%' : undefined,
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
        command: `${process.env.PLAYWRIGHT_SKIP_BUILD === '1' ? '' : 'bun run build && '}bunx wrangler pages dev dist --ip 127.0.0.1 --port ${e2ePort}`,
        reuseExistingServer: false,
        timeout: 120_000,
        url: baseURL,
      },
  projects: testYear ? [
    ...(yearFiles[testYear].length ? [{
      name: `year-${testYear}`,
      testMatch: yearFiles[testYear],
      use: { ...devices['Desktop Chrome'], ...browserChannel },
    }] : []),
    {
      // Playwright includes the project name in grep matching; keep it year-neutral.
      name: 'routes',
      testMatch: 'blue-green.spec.ts',
      ...(testYear === 'common' ? { grepInvert: yearPattern } : { grep: new RegExp(testYear) }),
      use: { ...devices['Desktop Chrome'], ...browserChannel },
    },
  ] : [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        ...browserChannel,
      },
    },
  ],
});
