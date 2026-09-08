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
  await expect(page.locator('#modal-details [data-speaker-link]').first()).toHaveAttribute('href', '/2026/en/speakers/georgi-ker/');
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

for (const locale of locales) {
  test(`speaker stays on site and links back to the session in ${locale}`, async ({ page, context }) => {
    test.skip(!sample, 'Requires the public 2025 sample build.');
    const pretalxRequests: string[] = [];
    await page.route(/^https:\/\/(pretalx\.com|cfp\.pycon\.hk)\//, (route) => {
      pretalxRequests.push(route.request().url());
      return route.abort();
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const suffix of ['', '/']) {
      const legacy = await context.request.get(`/2026/${locale}/speakers/a520d5ae8a6503a04d37${suffix}`, { maxRedirects: 0 });
      expect(legacy.status()).toBe(301);
      expect(new URL(legacy.headers().location, legacy.url()).pathname).toBe(`/2026/${locale}/speakers/peter-ho/`);
    }
    for (const suffix of ['', '/index.html']) {
      const alternative = await context.request.get(`/2026/${locale}/speakers/peter-ho${suffix}?from=schedule`, { maxRedirects: 0 });
      expect(alternative.status()).toBe(308);
      const canonical = new URL(alternative.headers().location, alternative.url());
      expect(canonical.pathname).toBe(`/2026/${locale}/speakers/peter-ho/`);
      expect(canonical.search).toBe('?from=schedule');
      expect((await context.request.get(canonical.href, { maxRedirects: 0 })).status()).toBe(200);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/2026/${locale}/schedule/`);
    const origin = new URL(page.url()).origin;
    await page.locator('[data-programme-search]').fill('Peter Ho');
    await page.locator('[data-session-details]:visible').first().click();
    const title = await page.locator('#modal-session-title').textContent();
    const link = page.locator('#modal-details [data-speaker-link]').first();
    await expect(link).toHaveCSS('cursor', 'pointer');
    await expect(link).not.toHaveAttribute('target', '_blank');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/2026/${locale}/speakers/peter-ho/$`));
    expect(new URL(page.url()).origin).toBe(origin);
    expect(context.pages()).toHaveLength(1);
    await expect(page).toHaveTitle(/Peter Ho/);
    await expect(page.locator('h1')).toHaveText('Peter Ho');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/2026/${locale}/speakers/peter-ho/$`));
    await expect(page.locator('[data-speaker-biography]')).toContainText('Red Hat');
    const portrait = page.locator('[data-speaker-page] img');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
    await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator('[data-sample-notice]')).toBeVisible();
    const profilePath = new URL(page.url()).pathname;
    await expect(page.locator('[data-locale-switch="ja"]').first()).toHaveAttribute('href', new RegExp(profilePath.replace(`/${locale}/`, '/ja/')));
    for (const width of [320, 640, 768, 1024, 1536]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('[data-speaker-biography]').evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      if (locale === 'en' && [320, 1536].includes(width)) await page.screenshot({ path: join(tmpdir(), `pyconhk-speaker-page-${width}.png`), fullPage: true });
    }
    await expect(page.locator('[data-speaker-session]').first()).toHaveCSS('cursor', 'pointer');
    await page.locator('[data-speaker-session]').first().click();
    await expect(page.locator('#session-modal')).toBeVisible();
    await expect(page.locator('#modal-session-title')).toHaveText(title ?? '');
    expect(new URL(page.url()).origin).toBe(origin);
    if (locale === 'en') {
      await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {}))));
      await page.screenshot({ path: join(tmpdir(), 'pyconhk-branded-session.png'), fullPage: false });
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#session-modal')).not.toBeVisible();
    await expect(page.locator('[data-session-details]:focus')).toHaveCount(1);
    expect(pretalxRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
