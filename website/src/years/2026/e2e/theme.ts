import { expect, type Page } from '@playwright/test';

export async function setTheme(page: Page, theme: string) {
  const button = page.locator('[data-theme-toggle]');
  for (let attempt = 0; attempt < 3; attempt++) {
    if ((await button.getAttribute('data-theme-mode')) === theme) return;
    await button.click();
  }
  await expect(button).toHaveAttribute('data-theme-mode', theme);
}
