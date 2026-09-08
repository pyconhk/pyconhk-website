import { expect, test } from '@playwright/test';

for (const width of [320, 768, 1440]) {
  test(`sponsorship packages remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/2026/en/sponsorships/opportunities/');
    const track = page.locator('[data-sponsorship-track]');
    const previous = page.getByRole('button', { name: 'Previous sponsorship plan' });
    const next = page.getByRole('button', { name: 'Next sponsorship plan' });
    const cards = track.locator('article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(3);
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    const visibleCount = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
    for (let index = 0; index < count - visibleCount; index++) {
      const before = await track.evaluate((element) => element.scrollLeft);
      await next.click();
      await expect
        .poll(() => track.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(before);
      await expect(page.locator('[data-sponsorship-position]')).toContainText(
        `${index + visibleCount + 1} / ${count}`
      );
    }
    await expect(next).toBeDisabled();
    await expect(page.locator('[data-sponsorship-position]')).toContainText(
      `${count} / ${count}`
    );
    // Keyboard users can return through the same controls.
    await previous.focus();
    await page.keyboard.press('Enter');
    await expect(next).toBeEnabled();
    await page.setViewportSize({ width: width === 320 ? 1440 : 320, height: 900 });
    await expect(previous).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      )
      .toBe(true);
  });
}

test('homepage story heading stays legible on its blue background', async ({
  page,
}) => {
  await page.goto('/2026/en/');
  await expect(page.locator('#venue h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
});
