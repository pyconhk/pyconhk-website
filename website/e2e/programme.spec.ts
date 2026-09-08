import { expect, test } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sample = process.env.PROGRAMME_SOURCE_EVENT === 'pyconhk2025';
const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ko', 'ja'];

for (const locale of locales) {
  test(`programme publication state is explicit in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`/2026/${locale}/schedule`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-programme-status]')).toHaveAttribute('data-programme-status', sample ? 'published' : 'unpublished');
    if (sample) {
      await expect(page.locator('[data-sample-notice]')).toBeVisible();
      await expect(page.locator('[data-day="2025-10-11"]')).toBeVisible();
      await expect(page.locator('[data-session-card]')).toHaveCount(35);
    } else {
      await expect(page.locator('[data-programme-coming-soon]')).toBeVisible();
      await expect(page.locator('[data-session-card]')).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}

test('sample supports real dates, search, filters, bookmarks, keyboard modal and calendar', async ({ page }) => {
  test.skip(!sample, 'Requires the public 2025 sample build.');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/2026/en/schedule');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page).toHaveTitle(/Schedule/);
  await page.locator('[data-day="2025-10-12"]').click();
  await expect(page.locator('[data-programme-empty]')).toHaveText('No sessions have been published for this day.');
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(0);
  await page.locator('[data-day="2025-10-11"]').click();
  await page.locator('[data-programme-search]').fill('Georgi Ker');
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(1);
  await page.locator('[data-room-filter]').selectOption('4654-track-b-lt-14');
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(0);
  await page.locator('[data-clear-filters]').click();
  await page.locator('[data-programme-search]').fill('pip install community');
  const details = page.locator('[data-session-card]:visible [data-session-details]');
  await details.click();
  await expect(page.locator('#session-modal')).toBeVisible();
  await expect(page.locator('#modal-details [data-session-description]')).toContainText('Python isn’t just a language');
  await expect(page.locator('#modal-details [data-speaker-profile]')).toHaveCount(1);
  await expect(page.locator('#modal-details [data-speaker-biography]')).toContainText('Python Software Foundation');
  const avatar = page.locator('#modal-details [data-speaker-avatar]');
  await avatar.scrollIntoViewIfNeeded();
  await expect(avatar).toBeVisible();
  await expect.poll(() => avatar.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#modal-details [data-speaker-profile] a').first()).toHaveAttribute('href', 'https://pretalx.com/pyconhk2025/speaker/7GSH3P/');
  const calendar = new URL(await page.locator('[data-modal-calendar]').getAttribute('href') ?? '');
  expect(calendar.searchParams.get('dates')).toBe('20251011T022500Z/20251011T025500Z');
  expect(calendar.searchParams.get('ctz')).toBe('Asia/Hong_Kong');
  await page.locator('[data-modal-save]').click();
  await expect(page.locator('[data-modal-save]')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#session-modal')).not.toBeVisible();
  await expect(details).toBeFocused();
  await page.locator('[data-clear-filters]').click();
  await page.locator('[data-saved-filter]').click();
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-saved-count]')).toHaveText('1');
  await page.screenshot({ path: join(tmpdir(), 'pyconhk-programme-desktop.png'), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: join(tmpdir(), 'pyconhk-programme-mobile.png'), fullPage: false });
  expect(errors).toEqual([]);
});

test('session details replace speaker profiles when changing talks and show every co-speaker', async ({ page }) => {
  test.skip(!sample, 'Requires the public 2025 sample build.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/schedule');
  await page.locator('[data-programme-search]').fill('pip install community');
  await page.locator('[data-session-details]:visible').click();
  await expect(page.locator('#modal-details [data-speaker-profile]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.locator('[data-programme-search]').fill('Mercari LLM');
  await page.locator('[data-session-details]:visible').click();
  await expect(page.locator('#modal-details [data-speaker-profile]')).toHaveCount(2);
  await expect(page.locator('#modal-details')).not.toContainText('Georgi Ker');
  await expect(page.locator('#modal-details')).toContainText('Prashant Anand');
  await expect(page.locator('#modal-details')).toContainText('Kanta Suga');
  expect(await page.locator('[data-modal-body]').evaluate((element) => element.scrollTop)).toBe(0);
});

test('blocked local storage does not disable programme controls', async ({ page }) => {
  test.skip(!sample, 'Requires the public 2025 sample build.');
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await page.goto('/2026/en/schedule');
  await page.locator('[data-save-session]').first().click();
  await expect(page.locator('[data-saved-count]')).toHaveText('1');
  await page.locator('[data-saved-filter]').click();
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(1);
});
