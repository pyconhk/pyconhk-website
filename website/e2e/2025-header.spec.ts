import { expect, test } from '@playwright/test';

test.describe('2025 site header', () => {
  test('keeps desktop navigation on a wide single-row container', async ({ page }) => {
    await page.setViewportSize({ width: 2048, height: 768 });
    await page.goto('/2025');

    const header = page.locator('[data-site-header]');
    await expect(header).toBeVisible();

    const innerBox = await header.locator(':scope > div').boundingBox();
    const logoBox = await header
      .locator('img[alt="PyCon HK 2025 Logo"]')
      .first()
      .boundingBox();
    const codeOfConductBox = await header
      .getByRole('button', { name: /Code of Conduct/u })
      .boundingBox();
    const contactUsBox = await header.getByRole('link', { name: 'Contact Us' }).boundingBox();
    const albumBox = await header.getByRole('link', { name: 'Album' }).boundingBox();

    expect(innerBox).not.toBeNull();
    expect(logoBox).not.toBeNull();
    expect(codeOfConductBox).not.toBeNull();
    expect(contactUsBox).not.toBeNull();
    expect(albumBox).not.toBeNull();

    expect(Math.round(innerBox?.width ?? 0)).toBeGreaterThanOrEqual(1530);
    expect(Math.round(logoBox?.x ?? 0)).toBeLessThanOrEqual(305);
    expect(Math.round(albumBox?.x + albumBox?.width)).toBeGreaterThanOrEqual(1740);
    expect(Math.round(codeOfConductBox?.height ?? 0)).toBeLessThanOrEqual(45);
    expect(Math.round(contactUsBox?.height ?? 0)).toBeLessThanOrEqual(45);
  });
});
