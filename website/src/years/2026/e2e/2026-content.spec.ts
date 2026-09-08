import { expect, test } from '@playwright/test';

const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];
const pendingRoutes = [
  'access-guide',
  'catering-guide',
  'sprint',
  'sprint/qna',
  'sponsorships',
  'sponsorships/patrons',
];

const publishedRoutes = [
  'about',
  'organizers',
  'supporting-organizations',
  'volunteers',
];

test('unpublished conference details show pending content in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of pendingRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[data-content-pending]')).toBeVisible();
      await expect(page.locator('[data-conference-content]')).toHaveCount(0);
    }
  }
});

test('complete migrated conference content remains public in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of publishedRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-content-pending]')).toHaveCount(0);
      await expect(page.locator('[data-conference-content]')).toBeVisible();
    }

    const response = await page.goto(`/2026/${locale}/sponsorships/opportunities/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-content-pending]')).toHaveCount(0);
    await expect(page.locator('[data-published-sponsorship]')).toBeVisible();
  }
});

test('registration is pending and calendar uses the actual 2026 event dates', async ({
  page,
}) => {
  await page.goto('/2026/en/');
  await expect(page.locator('main [data-registration-pending]').first()).toBeVisible();
  await expect(page.locator('[data-registration-link]')).toHaveCount(0);
  const calendar = page.getByRole('link', { name: 'Add to calendar', exact: true });
  const href = new URL((await calendar.getAttribute('href')) ?? '');
  expect(href.hostname).toBe('calendar.google.com');
  expect(href.searchParams.get('dates')).toBe('20261114/20261116');
  expect(href.searchParams.get('ctz')).toBe('Asia/Hong_Kong');
  await expect(page.locator('[data-published-sponsors]')).toHaveCount(0);
  await expect(page.locator('[data-featured-speakers]')).toHaveCount(0);
});

test('mobile navigation opens a real access guide route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/');
  const menu = page.locator('[data-mobile-nav-trigger]');
  await menu.click();
  const mobileNav = page.locator('[data-mobile-nav-drawer]');
  await mobileNav.getByText('Conference', { exact: true }).click();
  await mobileNav.getByRole('link', { name: 'Access Guide', exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/en\/access-guide\/?$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Access Guide' })
  ).toBeVisible();
});

test('CFP is closed and uses the current conference theme in every locale', async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/2026/${locale}/cfp/`);
    await expect(page.locator('[data-cfp-closed]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ride and Leverage with AI'
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(0);
    await expect(
      page
        .locator('main a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
        .first()
    ).toBeVisible();
  }
});
