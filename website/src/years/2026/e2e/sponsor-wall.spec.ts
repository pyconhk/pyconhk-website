import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const sponsorships = [
  ['Silver', 'Navicat', 'https://www.navicat.com/'],
  ['Bronze', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['Prize Sponsor', 'JetBrains', 'https://www.jetbrains.com/'],
  ['Prize Sponsor', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['Media Sponsor', 'LIHKG', 'https://lihkg.com/'],
];

for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
  test(`sponsor tiers and original logos remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of ['/2026/zh-hk/#sponsors', '/2026/zh-hk/sponsorships/']) {
      await page.goto(path);
      const wall = page.locator('[data-sponsor-wall]');
      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        await expect(wall).toBeVisible();
        await expect(wall.locator('a')).toHaveCount(5);
        for (const [tier, name, url] of sponsorships) {
          const link = wall
            .locator(`[data-sponsor-tier="${tier}"]`)
            .getByRole('link', { name, exact: true });
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', url);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveCSS('cursor', 'pointer');
          const image = link.locator('img');
          await expect(image).toHaveAttribute('src', /^\/2026\/sponsors\/.+\.svg$/);
          await expect
            .poll(() =>
              image.evaluate(
                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
              )
            )
            .toBe(true);
          await expect(image).toHaveCSS('filter', 'none');
          const box = await link.boundingBox();
          expect(box?.x).toBeGreaterThanOrEqual(0);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('a sponsor logo opens its website with the keyboard while the conference stays open', async ({
  page,
  context,
}) => {
  // Isolate the outbound navigation from the vendor's network availability.
  await context.route('https://www.navicat.com/**', (route) =>
    route.fulfill({ body: '<title>Navicat</title>' })
  );
  await page.goto('/2026/en/#sponsors');
  const link = page
    .locator('[data-sponsor-wall]')
    .getByRole('link', { name: 'Navicat', exact: true });
  await link.focus();
  await expect(link).toBeFocused();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://www.navicat.com/');
  await expect(page).toHaveURL(/\/2026\/en\/#sponsors$/);
  await popup.close();
});
