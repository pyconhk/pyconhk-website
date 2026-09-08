import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: '*.spec.ts', fullyParallel: true,
  forbidOnly: Boolean(process.env.CI), timeout:30_000, reporter:'list',
  outputDir: '../test-results/publishing',
});
