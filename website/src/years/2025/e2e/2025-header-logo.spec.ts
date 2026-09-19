import { expect, test } from '@playwright/test';

const routesWithHeaderLogo = ['/2025', '/2025/sprint/qna/en'] as const;

test.describe('2025 header logo routing', () => {
  for (const path of routesWithHeaderLogo) {
    test(`routes the header logo to the archived event home from ${path}`, async ({
      page,
    }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);

      const logoLink = page.getByRole('link', { name: 'PyCon HK 2025 Logo' }).first();

      expect.soft(await logoLink.getAttribute('href')).toBe('/2025');

      await logoLink.click();

      await expect
        .poll(() => new URL(page.url()).pathname, { timeout: 5_000 })
        .toBe('/2025');
    });
  }
});
