import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];

for (const locale of locales) {
  test(`homepage uses the published supporter logos and links in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`/2026/${locale}/`);
    const section = page.locator('[data-home-supporters]');
    await expect(section).toBeVisible();
    const logos = section.locator('[data-home-supporter]');
    await expect(logos).toHaveCount(20);
    const homeItems = await logos.evaluateAll((elements) =>
      elements.map((element) => ({
        href: element.getAttribute('href'),
        name: element.getAttribute('aria-label'),
        src: element.querySelector('img')?.getAttribute('src'),
      }))
    );
    expect(
      homeItems.every(
        (item) => item.href?.startsWith('https://') && item.name && item.src
      )
    ).toBe(true);
    await section
      .locator(`a[href="/2026/${locale}/supporting-organizations/"]`)
      .click();
    await expect(page).toHaveURL(`/2026/${locale}/supporting-organizations/`);
    const pageItems = await page
      .locator('[data-conference-content="supporters"] .organization-logo-plate')
      .evaluateAll((elements) =>
        elements.map((element) => ({
          href: element.getAttribute('href'),
          name: element.getAttribute('aria-label'),
          src: element.querySelector('img')?.getAttribute('src'),
        }))
      );
    expect(homeItems).toEqual(pageItems);
  });
}

for (const [width, columns] of [
  [390, 2],
  [768, 3],
  [1440, 5],
]) {
  test(`supporter grid has ${columns} columns at ${width}px in both themes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/');
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      const section = page.locator('[data-home-supporters]');
      const grid = section.locator('ul');
      const columnCount = await grid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length
      );
      expect(columnCount).toBe(columns);
      const logoBounds = await section
        .locator('[data-logo-frame]')
        .evaluateAll((frames) =>
          frames.map((frame) => {
            const plate = frame.closest('[data-home-supporter]');
            if (!plate) throw new Error('Logo plate missing');
            const imageBounds = frame.getBoundingClientRect();
            const plateBounds = plate.getBoundingClientRect();
            return {
              name: plate.getAttribute('aria-label'),
              contained:
                imageBounds.left >= plateBounds.left &&
                imageBounds.top >= plateBounds.top &&
                imageBounds.right <= plateBounds.right &&
                imageBounds.bottom <= plateBounds.bottom,
            };
          })
        );
      expect(logoBounds.filter((logo) => !logo.contained)).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
      const first = section.locator('[data-home-supporter]').first();
      await first.locator('img').scrollIntoViewIfNeeded();
      await first.locator('img').evaluate((image: HTMLImageElement) => image.decode());
      await expect(first.locator('img')).toHaveCSS('filter', 'none');
      expect(
        await first
          .locator('img')
          .evaluate((image: HTMLImageElement) => image.naturalWidth)
      ).toBeGreaterThan(0);
    }
  });
}
