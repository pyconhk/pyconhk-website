import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const redirectChecks = [
  { path: '/news/', status: 308, location: '/2025/news' },
  { path: '/2025/', status: 200 },
  { path: '/2025/schedule/', status: 200 },
];
const archive2025TitleChecks = [
  { path: '/2025/news', title: 'News | PyCon HK 2025' },
  { path: '/2025/schedule', title: 'Conference Schedule | PyCon HK 2025' },
  { path: '/2025/access-guide', title: 'Access Guide | PyCon HK 2025' },
  { path: '/2025/catering-guide', title: 'Catering Guide | PyCon HK 2025' },
  { path: '/2025/sprint', title: 'Sprint Day | PyCon HK 2025' },
  { path: '/2025/organizers', title: 'Organizations | PyCon HK 2025' },
  { path: '/2025/volunteers', title: 'Volunteers | PyCon HK 2025' },
  {
    path: '/2025/supporting-organizations',
    title: 'Supporting Organizations | PyCon HK 2025',
  },
  { path: '/2025/about', title: 'About | PyCon HK 2025' },
  { path: '/2025/sponsorships', title: 'Sponsors | PyCon HK 2025' },
  {
    path: '/2025/code-of-conduct',
    title: 'Code of Conduct Overview | PyCon HK 2025',
  },
  { path: '/2025/privacy-policy', title: 'Privacy Policy | PyCon HK 2025' },
];
for (const path of [
  '/2025/en/',
  '/2025/zh-hk/',
  '/2025/en/news/',
  '/2025/en/news/pre-event-notice/',
]) {
  test(`keeps non-live public route at 404: ${path}`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.status()).toBe(404);
  });
}

for (const check of redirectChecks) {
  test(`serves redirect ${check.path}`, async ({ request }) => {
    const response = await request.get(check.path, { maxRedirects: 0 });

    expect(response.status()).toBe(check.status);
    if ('location' in check) {
      expect(normalizeRedirectLocation(response.headers().location)).toBe(
        normalizeRedirectLocation(check.location)
      );
    } else {
      expect(response.headers().location).toBeUndefined();
    }
  });
}

for (const check of archive2025TitleChecks) {
  test(`uses a descriptive 2025 page title on ${check.path}`, async ({ page }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
  });
}

test('contains the 2025 Pretalx schedule without page-level horizontal overflow', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });

  const response = await page.goto('/2025/schedule');

  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/2025/schedule');
  await expect(page).toHaveTitle('Conference Schedule | PyCon HK 2025');

  const scheduleContainer = page.locator('#schedule-container');
  const pretalxSchedule = page.locator('pretalx-schedule');

  await expect(pretalxSchedule).toBeAttached({ timeout: 45_000 });
  await expect
    .poll(
      async () => {
        const box = await pretalxSchedule.boundingBox();

        return Math.round(box?.height ?? 0);
      },
      { timeout: 45_000 }
    )
    .toBeGreaterThan(4_000);

  const scheduleBox = await scheduleContainer.boundingBox();
  const pretalxBox = await pretalxSchedule.boundingBox();

  expect(scheduleBox).not.toBeNull();
  expect(pretalxBox).not.toBeNull();
  expect(Math.round(scheduleBox?.x ?? -1)).toBe(0);
  expect(Math.round(pretalxBox?.x ?? -1)).toBe(0);
  expect(Math.round(scheduleBox?.width ?? 0)).toBe(1440);
  expect(Math.round(pretalxBox?.width ?? 0)).toBe(1440);
  expect(Math.round(scheduleBox?.y ?? 0)).toBe(630);
  expect(Math.round(pretalxBox?.y ?? 0)).toBe(630);
  expect(Math.round(pretalxBox?.height ?? 0)).toBeLessThan(5_400);
  const desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  expect(desktopOverflow).toBeLessThanOrEqual(4);

  await page.setViewportSize({ width: 390, height: 844 });

  const mobileMetrics = await scheduleContainer.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );

  expect(mobileMetrics.clientWidth).toBeLessThanOrEqual(390);
  expect(mobileMetrics.scrollWidth).toBeGreaterThanOrEqual(mobileMetrics.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(4);

  const menuTrigger = page.locator('[data-mobile-nav-trigger]');

  await menuTrigger.click();
  await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-mobile-nav-close]').last().click();
  await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
});
