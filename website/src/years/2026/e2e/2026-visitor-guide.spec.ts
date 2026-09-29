import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`visitor guides fit ${width}px in light and dark mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['access-guide', 'catering-guide']) {
      await page.goto(`/2026/zh-hk/${route}/`);
      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        await expect(page.locator('main h1')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
        const links = page.locator('[data-bus-route] a, [data-dining-place]');
        expect(await links.count()).toBeGreaterThan(0);
        for (const link of await links.all()) {
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeInViewport();
          const box = await link.boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
}
