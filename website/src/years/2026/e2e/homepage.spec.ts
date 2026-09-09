import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const names = ['Paul Everitt', 'Jacky Chan', 'Hon Kwan Shun Quinson', 'Indy Ho'];

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  test(`${locale} homepage shows the selected 2026 speakers with bundled portraits`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/2026/${locale}/`);
    const featured = page.locator('[data-featured-speakers]');
    await featured.scrollIntoViewIfNeeded();
    await expect(featured.locator('h3')).toHaveText(names);
    await expect(featured.locator('[data-keynote="true"] h3')).toHaveText(
      'Paul Everitt'
    );
    await expect(featured.locator('[data-keynote="false"]')).toHaveCount(3);
    await expect(
      featured.getByText('AI 聽到聲音時，會聯想到乜嘢？', { exact: true })
    ).toBeVisible();
    await expect(featured.locator('a[href*="2025"], a[href*="pretalx"]')).toHaveCount(
      0
    );
    for (const name of names) {
      const portrait = featured.getByRole('img', { name, exact: true });
      await portrait.scrollIntoViewIfNeeded();
      await expect(portrait).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
      await expect
        .poll(() =>
          portrait.evaluate(
            (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
          )
        )
        .toBe(true);
    }
    const sections = await page
      .locator('main > section[id]')
      .evaluateAll((elements) => elements.map((element) => element.id));
    expect(sections.filter((id) => !['news', 'sponsors'].includes(id))).toEqual([
      'home',
      'featured-speakers',
      'participate',
    ]);
    if (sections.includes('news')) expect(sections.indexOf('news')).toBe(1);
    if (sections.includes('sponsors'))
      expect(sections.indexOf('sponsors')).toBeLessThan(
        sections.indexOf('featured-speakers')
      );
    await expect(page.locator('#home .brand-plate img')).toHaveAttribute(
      'src',
      '/2026/logos/pyconlogo.svg'
    );
    await expect(page.locator('#participate a')).toHaveCount(2);
    await expect(
      page.locator('#participate p, #participate details, [data-home-dates]')
    ).toHaveCount(0);
    await page.locator(`#participate a[href="/2026/${locale}/sprint/"]`).click();
    await expect(page).toHaveURL(new RegExp(`/2026/${locale}/sprint/?$`));
    await expect(page.locator('main h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 390, 640, 768, 1024, 1280, 1920]) {
  test(`homepage remains usable at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/');
    await page.locator('[data-featured-speakers]').scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await expect(page.locator('#home h1')).toHaveText('Ride and Leverage with AI');
      for (const card of await page.locator('[data-featured-speaker]').all()) {
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible();
        const box = await card.boundingBox();
        expect(box).not.toBeNull();
        if (!box) throw new Error('Featured speaker card has no visible bounds');
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(
          await card.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1
          )
        ).toBe(true);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
    await page
      .locator('#participate a[href="/2026/en/sponsorships/opportunities/"]')
      .click();
    await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/opportunities\/?$/);
    await expect(page.locator('main h1')).toBeVisible();
  });
}
