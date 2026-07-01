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

const criticalPages = [
  {
    path: '/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/zh-hk/',
    title: /PyCon HK 2026 CFP/,
    text: /多元聲音/u,
  },
  {
    path: '/2026/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/2025/en/',
    title: /PyCon Hong Kong 2025/,
    text: /PYCON HK 2025/i,
  },
  {
    path: '/2025/en/news/',
    title: /News/,
    text: /PyCon HK 2025 Pre-Event Essentials/u,
  },
  {
    path: '/news/pre-event-notice/',
    title: /Don't Miss the Boat! Your PyCon HK 2025 Pre-Event Essentials/,
    text: /PyCon HK 2025 Pre-Event Essentials/u,
  },
  {
    path: '/2024/',
    title: /PyCon HK 2024/,
    text: /PyCon HK 2024/,
  },
];

const redirectChecks = [
  { path: '/news/', status: 308, location: '/2025/news/' },
  {
    path: '/conference-highlights/pycon-hk-2024-photos/',
    status: 308,
    location: '/2024/photos/',
  },
  { path: '/2000/', status: 301, location: 'https://legacy.pycon.hk/2000' },
];

test.describe('blue-green launch smoke', () => {
  test('redirects neutral entry pages by preferred locale cookie', async ({
    baseURL,
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/u);

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
    await expect(page).toHaveURL(/\/zh-hk\/$/u);

    await page.goto('/2026/');
    await expect(page).toHaveURL(/\/2026\/zh-hk\/$/u);
  });

  for (const check of redirectChecks) {
    test(`serves redirect ${check.path}`, async ({ request }) => {
      const response = await request.get(check.path, { maxRedirects: 0 });

      expect(response.status()).toBe(check.status);
      expect(normalizeRedirectLocation(response.headers().location)).toBe(
        normalizeRedirectLocation(check.location)
      );
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

  test('serves robots and sitemap for production crawling', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    const robotsText = await robots.text();

    expect(robots.status()).toBe(200);
    expect(robotsText).toContain('Allow: /');
    expect(robotsText).not.toMatch(/^Disallow:\s*\/\s*$/imu);
    expect(robotsText).toContain('Sitemap: https://pycon.hk/sitemap.xml');

    const sitemap = await request.get('/sitemap.xml');
    const sitemapText = await sitemap.text();

    expect(sitemap.status()).toBe(200);
    for (const url of [
      'https://pycon.hk/en/',
      'https://pycon.hk/zh-hk/',
      'https://pycon.hk/2025/en/',
      'https://pycon.hk/2025/en/news/pre-event-notice/',
      'https://pycon.hk/2024/photos/',
    ]) {
      expect(sitemapText).toContain(`<loc>${url}</loc>`);
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
});
