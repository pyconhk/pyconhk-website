import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const e2ePort = Number(process.env.E2E_PORT ?? 8790);
const hostedBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.E2E_BASE_URL;
const baseURL = hostedBaseURL ?? `http://127.0.0.1:${e2ePort}`;
const yearsRoot = new URL('./src/years/', import.meta.url);
const years = readdirSync(yearsRoot).filter((year) =>
  existsSync(new URL(`${year}/e2e/mise.toml`, yearsRoot))
);
if (process.env.E2E_SUITE && ![...years, 'common'].includes(process.env.E2E_SUITE))
  throw new Error(`Unknown E2E suite: ${process.env.E2E_SUITE}`);

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  workers: process.env.CI ? '100%' : undefined,
  outputDir: 'test-results',
  reporter: [['list']],
  timeout: 30_000,
  use: {
    ...devices['Desktop Chrome'],
    ...(process.env.CI ? {} : { channel: 'chrome' as const }),
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: hostedBaseURL
    ? undefined
    : {
        command: `${process.env.PLAYWRIGHT_SKIP_BUILD === '1' ? '' : 'bun run build && '}bunx wrangler pages dev dist --ip 127.0.0.1 --port ${e2ePort}`,
        env: {
          PROGRAMME_ENVIRONMENT: process.env.PROGRAMME_ENVIRONMENT ?? 'test',
          PROGRAMME_SOURCE_EVENT: process.env.PROGRAMME_SOURCE_EVENT ?? 'pyconhk2025',
          PROGRAMME_SNAPSHOT_PATH:
            process.env.PROGRAMME_SNAPSHOT_PATH ??
            'src/years/2026/data/programme/pyconhk2025.public.json',
        },
        reuseExistingServer: false,
        timeout: 120_000,
        url: baseURL,
      },
  projects: [
    ...years.map((year) => ({
      name: year,
      testDir: fileURLToPath(new URL(`${year}/e2e/`, yearsRoot)),
    })),
    { name: 'common', testDir: './e2e/common' },
  ].filter(
    (project) => !process.env.E2E_SUITE || project.name === process.env.E2E_SUITE
  ),
});
