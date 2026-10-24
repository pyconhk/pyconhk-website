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
    await expect(logos).toHaveCount(22);
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
  [320, 2],
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
      const images = section.locator('[data-home-supporter] img');
      await expect(images).toHaveCount(22);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element: HTMLImageElement) => element.decode());
        await expect(image).toHaveCSS('filter', 'none');
      }
      const logoBounds = await section
        .locator('[data-logo-frame]')
        .evaluateAll((frames) =>
          frames.map((frame) => {
            const plate = frame.closest('[data-home-supporter]');
            if (!plate) throw new Error('Logo plate missing');
            const imageBounds = frame.getBoundingClientRect();
            const plateBounds = plate.getBoundingClientRect();
            const plateStyle = getComputedStyle(plate);
            return {
              name: plate.getAttribute('aria-label'),
              contained:
                imageBounds.left >= plateBounds.left &&
                imageBounds.top >=
                  plateBounds.top + Number.parseFloat(plateStyle.paddingTop) &&
                imageBounds.right <= plateBounds.right &&
                imageBounds.bottom <=
                  plateBounds.bottom - Number.parseFloat(plateStyle.paddingBottom),
            };
          })
        );
      expect(logoBounds.filter((logo) => !logo.contained)).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
  });
}
