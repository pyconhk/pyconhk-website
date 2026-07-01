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
    path: '/',
    title: /PyCon HK 2026 CFP \| Many Voices, One Python Story/,
    text: /Many Voices, One Python Story/u,
  },
  {
    path: '/2026/',
    title: /PyCon HK 2026 CFP \| Many Voices, One Python Story/,
    text: /Many Voices, One Python Story/u,
  },
  {
    path: '/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/zh-hk/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/2026/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/news/pre-event-notice/',
    title: /Don't Miss the Boat! Your PyCon HK 2025 Pre-Event Essentials/,
    text: /PyCon HK 2025 Pre-Event Essentials/u,
  },
  {
    path: '/2024/',
    title: /2024 - PyCon HK/,
    text: /PyCon HK 2024/,
  },
  {
    path: '/conference-highlights/pycon-hk-2024-photos/',
    title: /PyCon HK 2024 Photos/,
    text: /PyCon HK 2024 Photos/u,
  },
];

const redirectChecks = [
  { path: '/news/', status: 308, location: '/2025/news/' },
  { path: '/2000/', status: 301, location: 'https://legacy.pycon.hk/2000' },
];

test.describe('blue-green launch smoke', () => {
  test('serves neutral entry pages like the live CFP page', async ({
    baseURL,
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP \| Many Voices, One Python Story/);
    await expect(page.getByRole('heading', { name: /Many Voices/u })).toBeVisible();

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
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP \| Many Voices, One Python Story/);
    await expect(page.getByRole('heading', { name: /Many Voices/u })).toBeVisible();

    await page.goto('/2026/');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP \| Many Voices, One Python Story/);
    await expect(page.getByRole('heading', { name: /Many Voices/u })).toBeVisible();
  });

  for (const path of [
    '/2025/en/',
    '/2025/zh-hk/',
    '/2025/en/news/',
    '/2025/en/news/pre-event-notice/',
    '/2024/photos/',
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

  test('serves legacy year archives with live WordPress archive structure', async ({
    page,
  }) => {
    const response2018 = await page.goto('/2018/');

    expect(response2018?.status()).toBe(200);
    await expect(page).toHaveTitle(/2018 - PyCon HK/);
    await expect(page.getByRole('heading', { name: /Category:\s*2018/u })).toBeVisible();
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
    await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
      /PyCon HK 2018 Photos/u
    );
    await expect(page.locator('#secondary .search-form')).toBeVisible();
    await expect(page.locator('#secondary .widget_archive')).toBeVisible();
    await expect(page.locator('a.next.page-numbers[href="/2018/page/2/"]')).toBeVisible();

    const response2024 = await page.goto('/2024/');

    expect(response2024?.status()).toBe(200);
    await expect(page).toHaveTitle(/2024 - PyCon HK/);
    await expect(page.locator('li.wp-block-post')).toHaveCount(21);
    await expect(page.locator('li.wp-block-post').first()).toContainText(
      /PyCon HK 2024 Photos/u
    );
    await expect(page.locator('.voyago-sidebar .voyago-search')).toBeVisible();
    await expect(page.locator('.voyago-sidebar select')).toBeVisible();
    await expect(page.locator('a.next.page-numbers[href="/2024/page/2/"]')).toBeVisible();

    const pageTwoResponse = await page.goto('/2018/page/2/');

    expect(pageTwoResponse?.status()).toBe(200);
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(18);
    await expect(page.locator('span.page-numbers.current')).toHaveText('2');
    await expect(page.locator('a.prev.page-numbers[href="/2018/"]')).toBeVisible();

    const pageTwo2024Response = await page.goto('/2024/page/2/');

    expect(pageTwo2024Response?.status()).toBe(200);
    await expect(page.locator('li.wp-block-post')).toHaveCount(3);
    await expect(page.locator('span.page-numbers.current')).toHaveText('2');
    await expect(page.locator('a.prev.page-numbers[href="/2024/"]')).toBeVisible();
  });

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
      'https://pycon.hk/2025/',
      'https://pycon.hk/2025/news/pre-event-notice/',
    ]) {
      expect(sitemapText).toContain(`<loc>${url}</loc>`);
    }
    for (const url of [
      'https://pycon.hk/2025/en/',
      'https://pycon.hk/2025/en/news/pre-event-notice/',
      'https://pycon.hk/2024/photos/',
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
});
