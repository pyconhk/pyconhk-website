import { expect, type Page, test } from '@playwright/test';

async function footerShell(pagePath: string, page: Page) {
  await page.goto(pagePath);

  const footer = page.getByRole('contentinfo');
  await expect(footer).toBeVisible();

  return footer;
}

test.describe('site footers', () => {
  test('renders the 2025 footer with the 2025 copyright year', async ({ page }) => {
    const footer = await footerShell('/2025', page);

    await expect(footer).toContainText('© 2025 PyCon Hong Kong. All rights reserved.');
    await expect(footer.getByRole('heading', { name: 'History' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/2025/privacy-policy'
    );
  });

  for (const path of ['/', '/2026/en']) {
    test(`renders the 2026 footer with the 2025 footer shell on ${path}`, async ({
      page,
    }) => {
      const footer = await footerShell(path, page);
      const footerClasses = await footer.getAttribute('class');

      expect(footerClasses).toContain('bg-slate-700');
      expect(footerClasses).toContain('text-white');
      await expect(footer).toContainText('© 2026 PyCon Hong Kong. All rights reserved.');
      await expect(footer.getByRole('heading', { name: 'History' })).toBeVisible();
      await expect(footer.getByRole('link', { name: '2026' })).toHaveAttribute(
        'href',
        '/2026'
      );
      await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
        'href',
        '/privacy-policy'
      );
    });

    test(`opens the latest privacy policy from the 2026 footer on ${path}`, async ({
      page,
    }) => {
      const footer = await footerShell(path, page);

      await footer.getByRole('link', { name: 'Privacy Policy' }).click();

      await expect(page).toHaveURL('/privacy-policy');
      await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
    });
  }
});
