import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`preserves each year's typography through archive navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/');
    await expect(page.locator('body')).toHaveCSS('font-family', /^Roboto,/);

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: '2025', exact: true })
      .click();
    await expect(page).toHaveTitle('PyCon HK 2025');
    await expect(page.locator('body')).toHaveCSS('font-family', /^Montserrat,/);
    await expect(page.locator('main h1')).toHaveCSS('font-family', /^Lexend,/);
    const fonts = page.locator('link[href^="https://fonts.googleapis.com/css2"]');
    await expect(fonts).toHaveCount(1);
    await expect(fonts).toHaveAttribute('href', /family=Montserrat/);
    await expect(fonts).not.toHaveAttribute('href', /family=Roboto/);

    await page.goto('/2025/volunteers');
    await expect(page.locator('main h1')).toHaveCSS('font-family', /^Montserrat,/);
    await expect(page.locator('main p').first()).toHaveCSS(
      'font-family',
      /^Montserrat,/
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: '2026', exact: true })
      .click();
    await expect(page.locator('body')).toHaveCSS('font-family', /^Roboto,/);
    await expect(fonts).toHaveAttribute('href', /family=Roboto/);
    await expect(fonts).not.toHaveAttribute('href', /family=Montserrat/);
  });
}
