import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`2025 volunteer credits include the full team at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2025/volunteers');
    for (const id of ['programme-volunteers', 'designers', 'emcees', 'on-site-volunteers']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Jared Yeung', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cathy Hui', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tsui Hui Yin', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'LinkedIn profile of Jim Ngoo' })).toHaveAttribute('href', 'https://hk.linkedin.com/in/jim-ngoo');
    const images = page.locator('main img[src^="/2025/organizers-volunteers/volunteers/"]');
    await expect(images).toHaveCount(61);
    await images.evaluateAll(async (elements) => {
      await Promise.all(elements.map(async (element) => {
        const image = element as HTMLImageElement;
        image.loading = 'eager';
        await image.decode();
      }));
    });
    await expect(page.locator('main img[src$="/placeholder.webp"]')).toHaveCount(28);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
