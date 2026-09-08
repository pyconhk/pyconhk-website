import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
function cookieDomain(baseURL: string | undefined): string {
  if (!baseURL) {
    return '127.0.0.1';
  }

  return new URL(baseURL).hostname;
}
const redirectChecks = [
  { path: '/2000/', status: 301, location: 'https://legacy.pycon.hk/2000' },
  {
    path: '/2019/schedule/',
    status: 301,
    location: 'https://legacy.pycon.hk/2019/schedule',
  },
];
const criticalPages = [
  {
    path: '/',
    title: /PyCon HK 2026 \| Ride and Leverage with AI/,
    text: /Ride and Leverage with AI/u,
  },
  {
    path: '/en/',
    title: /PyCon HK 2026 \| Ride and Leverage with AI/,
    text: /Ride and Leverage with AI/u,
  },
  {
    path: '/zh-hk/',
    title: /PyCon HK 2026 \| Ride and Leverage with AI/,
    text: /Ride and Leverage with AI/u,
  },
  {
    path: '/news/pre-event-notice/',
    title: /Don't Miss the Boat! Your PyCon HK 2025 Pre-Event Essentials/,
    text: /PyCon HK 2025 Pre-Event Essentials/u,
  },
];
test('serves neutral entry pages as the current conference homepage', async ({
  baseURL,
  context,
  page,
}) => {
  await context.clearCookies();
  await page.goto('/');
  expect(new URL(page.url()).pathname).toBe('/2026/en');
  await expect(page).toHaveTitle(/PyCon HK 2026 \| Ride and Leverage with AI/);
  await expect(
    page.getByRole('heading', { name: /Ride and Leverage with AI/u })
  ).toBeVisible();

  await context.clearCookies();
  await context.addCookies([
    {
      domain: cookieDomain(baseURL),
      name: 'preferredLocale',
      path: '/',
      value: 'zh-hk',
    },
  ]);
  await page.goto('/');
  expect(new URL(page.url()).pathname).toBe('/2026/zh-hk');
  await expect(page).toHaveTitle(/PyCon HK 2026 \| Ride and Leverage with AI/);
  await expect(
    page.getByRole('heading', { name: /Ride and Leverage with AI/u })
  ).toBeVisible();

  await context.clearCookies();
  await page.goto('/2026/');
  expect(new URL(page.url()).pathname).toBe('/2026/en');
  await expect(page).toHaveTitle(/PyCon HK 2026 \| Ride and Leverage with AI/);
  await expect(
    page.getByRole('heading', { name: /Ride and Leverage with AI/u })
  ).toBeVisible();
});

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

for (const pageCheck of criticalPages) {
  test(`serves critical page ${pageCheck.path}`, async ({ page }) => {
    const response = await page.goto(pageCheck.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(pageCheck.title);
    await expect(page.getByText(pageCheck.text).first()).toBeVisible();
  });
}

test('does not publish root legacy archive pagination', async ({ request }) => {
  for (const path of ['/page/1/', '/page/2/']) {
    const response = await request.get(path);

    expect(response.status(), path).toBe(404);
  }
});

test('uses year-local highlight links on canonical archive pages', async ({ page }) => {
  for (const check of [
    { path: '/2018/', link: '/2018/photos', text: /PyCon HK 2018 Photos/u },
  ]) {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(
      page
        .locator(`main a[href="${check.link}"], main a[href="${check.link}/"]`, {
          hasText: check.text,
        })
        .first()
    ).toBeVisible();
    await expect(page.locator('main a[href^="/conference-highlights/"]')).toHaveCount(
      0
    );
  }

  const photos2024Response = await page.goto('/2024/photos/');

  expect(photos2024Response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'PyCon HK 2024 Photos' })
  ).toBeVisible();
  await expect(page.locator('a[href^="/conference-highlights/"]')).toHaveCount(0);

  const photosResponse = await page.goto('/2015/photos/');

  expect(photosResponse?.status()).toBe(200);
  await expect(page.locator('a[href^="/conference-highlights/"]')).toHaveCount(0);
  await expect(page.locator('a[rel="next"][href="/2016/photos/"]')).toBeVisible();
});

test('keeps Marketingly year archive navigation collapsed on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of [
    '/2018/',
    '/2018/page/2/',
    '/2020/',
    '/2020/page/2/',
    '/2020/page/3/',
    '/2021/',
    '/2021/page/2/',
    '/2022/',
    '/2022/page/2/',
    '/2023/',
    '/2023/page/2/',
  ]) {
    await page.goto(path);

    await expect(
      page.locator('.mobile-menu-toggle, .toggle-mobile-menu:not(.smenu-hide)').first()
    ).toBeVisible();
    await expect(page.locator('#masthead .center-main-menu').first()).toBeHidden();

    const headerBox = await page.locator('#masthead').first().boundingBox();

    expect(Math.round(headerBox?.height ?? 0)).toBeLessThanOrEqual(55);
  }
});

test('serves robots and sitemap for production crawling', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  const robotsText = await robots.text();

  expect(robots.status()).toBe(200);
  expect(robotsText).toContain('Allow: /');
  expect(robotsText).not.toMatch(/^Disallow:\s*\/\s*$/imu);
  for (const path of [
    '/author/',
    '/category/',
    '/conference-highlights/',
    '/page/',
    '/tag/',
  ]) {
    expect(robotsText).toContain(`Disallow: ${path}`);
  }
  expect(robotsText).toContain('Sitemap: https://pycon.hk/sitemap.xml');

  const sitemap = await request.get('/sitemap.xml');
  const sitemapText = await sitemap.text();

  expect(sitemap.status()).toBe(200);
  for (const url of [
    'https://pycon.hk/2026/en',
    'https://pycon.hk/2026/zh-hk',
    'https://pycon.hk/2026/en/privacy-policy',
    'https://pycon.hk/2026/zh-hk/privacy-policy',
    'https://pycon.hk/2026/zh-hant/privacy-policy',
    'https://pycon.hk/2026/zh-hans/privacy-policy',
    'https://pycon.hk/2026/ko/privacy-policy',
    'https://pycon.hk/2026/ja/privacy-policy',
    'https://pycon.hk/2015',
    'https://pycon.hk/2016',
    'https://pycon.hk/2017/recording',
    'https://pycon.hk/2018',
    'https://pycon.hk/2020-spring',
    'https://pycon.hk/2020-fall',
    'https://pycon.hk/2024',
    'https://pycon.hk/2024/news',
    'https://pycon.hk/2024/photos',
    'https://pycon.hk/2025',
    'https://pycon.hk/2025/news/pre-event-notice',
  ]) {
    expect(sitemapText).toContain(`<loc>${url}</loc>`);
  }
  for (const url of [
    'https://pycon.hk/2025/en/',
    'https://pycon.hk/2025/en/news/pre-event-notice/',
    'https://pycon.hk/2026/zh-cn/privacy-policy',
    'https://pycon.hk/author/sammyfung',
    'https://pycon.hk/category/2024',
    'https://pycon.hk/conference-highlights/pycon-hk-2024-photos',
    'https://pycon.hk/page/1',
    'https://pycon.hk/tag/communities',
  ]) {
    expect(sitemapText).not.toContain(`<loc>${url}</loc>`);
  }
});

test('serves key static assets', async ({ request }) => {
  for (const assetPath of [
    '/favicon.ico',
    '/2026/open-graph.webp',
    '/outstatic/images/2025-pyconhk-preevent-notice-g3MT.webp',
  ]) {
    const response = await request.get(assetPath);

    expect(response.status()).toBe(200);
    expect((await response.body()).byteLength).toBeGreaterThan(0);
  }
});
