import { expect, test } from '@playwright/test';

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  for (const width of [320, 390, 640, 768, 1024, 1366]) {
    test(`compact sponsorship comparison in ${locale} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 768 });
      await page.goto(`/2026/${locale}/sponsorships/opportunities/`);
      const carousel = page.locator('[data-sponsorship-carousel]');
      await expect(carousel).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      // Leave room for the sticky site navigation as well as carousel controls.
      const carouselBounds = await carousel.boundingBox();
      expect(carouselBounds?.height).toBeLessThanOrEqual(650);
      const cards = carousel.locator('[data-plan-card]');
      await expect(cards).toHaveCount(5);
      // Published HKD rates in the 2026 CFS v1.2, pages 12 and 17.
      const fees = [
        'HKD 68,640+',
        'HKD 46,800',
        'HKD 27,300',
        'HKD 13,650',
        'HKD 6,240',
      ];
      for (const [index, fee] of fees.entries()) {
        await expect(cards.nth(index).locator('header')).toContainText(fee);
      }
      if (locale.startsWith('zh-')) {
        await expect(cards.nth(3).getByRole('heading')).toHaveText(
          locale === 'zh-hans' ? '白银级赞助' : '白銀級贊助'
        );
        await expect(cards.last()).toContainText('不限');
      }
      await expect(cards.first().locator('[data-availability="included"]')).toHaveCount(
        7
      );
      await expect(cards.last().locator('[data-availability="excluded"]')).toHaveCount(
        7
      );
      await expect(cards.last()).toContainText('+ HKD 3,100');
      for (const card of await cards.all()) {
        await expect(card.locator('dt')).toHaveCount(12);
      }
      for (const icon of await carousel.locator('[data-availability]').all()) {
        await expect(icon.locator('svg')).toBeAttached();
        await expect(icon.locator('.sr-only')).not.toBeEmpty();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    });
  }
}

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
    const dots = page.locator('[data-sponsorship-dot]:visible');
    await expect(dots).toHaveCount(count - visibleCount + 1);
    await expect(dots.first()).toHaveAttribute('aria-current', 'true');
    for (let index = 0; index < count - visibleCount; index++) {
      const before = await track.evaluate((element) => element.scrollLeft);
      await next.click();
      await expect
        .poll(() => track.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(before);
      await expect(dots.nth(index + 1)).toHaveAttribute('aria-current', 'true');
    }
    await expect(next).toBeDisabled();
    await expect(dots.last()).toHaveAttribute('aria-current', 'true');
    await dots.first().click();
    await expect(previous).toBeDisabled();
    await expect(dots.first()).toHaveAttribute('aria-current', 'true');
    await dots.last().focus();
    await page.keyboard.press('Enter');
    await expect(next).toBeDisabled();
    // Keyboard users can return through the same controls.
    await previous.focus();
    await page.keyboard.press('Enter');
    await expect(next).toBeEnabled();
    await page.setViewportSize({ width: width === 320 ? 1440 : 320, height: 900 });
    await expect(dots).toHaveCount(width === 320 ? 3 : 5);
    await expect(
      page.locator('[data-sponsorship-dot][aria-current="true"]:visible')
    ).toHaveCount(1);
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
