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
    text: /多元聲音/u,
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
  { path: '/news/', status: 308, location: '/2025/news' },
  { path: '/2026/en/', status: 308, location: '/2026/en' },
  { path: '/2025/', status: 308, location: '/2025' },
  { path: '/2025/schedule/', status: 308, location: '/2025/schedule' },
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
    expect(new URL(page.url()).pathname).toBe('/en');
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
    expect(new URL(page.url()).pathname).toBe('/zh-hk');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP/);
    await expect(page.getByRole('heading', { name: /多元聲音/u })).toBeVisible();

    await context.clearCookies();
    await page.goto('/2026/');
    expect(new URL(page.url()).pathname).toBe('/en');
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

  test('normalizes 2026 locale slash variants without Astro interstitials', async ({
    page,
    request,
  }) => {
    const redirect = await request.get('/2026/en/', { maxRedirects: 0 });

    expect(redirect.status()).toBe(308);
    expect(normalizeRedirectLocation(redirect.headers().location)).toBe('/2026/en');
    expect(await redirect.text()).not.toContain(
      'Your site is configured with <code>trailingSlash</code> set to <code>never</code>'
    );

    const response = await page.goto('/2026/en/');

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/2026/en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://pycon.hk/en'
    );
  });

  test('renders 2025 schedule with live-width Pretalx frame', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    const response = await page.goto('/2025/schedule');

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/2025/schedule');
    await expect(page).toHaveTitle(/PyCon HK 2025/);

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
    await expect
      .poll(async () => page.evaluate(() => document.body.scrollWidth), {
        timeout: 10_000,
      })
      .toBeGreaterThan(1_900);
  });

  test('serves legacy year archives with live WordPress archive structure', async ({
    page,
  }) => {
    const response2018 = await page.goto('/2018/');

    expect(response2018?.status()).toBe(200);
    await expect(page).toHaveTitle(/2018 - PyCon HK/);
    await expect(page.getByRole('heading', { name: /Year:\s*2018/u })).toBeVisible();
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
    await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
      /PyCon HK 2018 Photos/u
    );
    await expect(page.locator('#secondary .search-form')).toBeVisible();
    await expect(page.locator('#secondary .widget_archive')).toBeVisible();
    await expect(page.locator('a.next.page-numbers[href="/2018/page/2/"]')).toBeVisible();

    const marketinglyYearArchives = [
      {
        year: '2020',
        firstTitle: /PyCon HK 2020 Fall Photos/u,
        pageTwoFirstTitle: /The status of Python community/u,
        pageTwoCount: 21,
        pageThreeFirstTitle: /django-scim2: User provisioning at scale/u,
        pageThreeCount: 16,
      },
      {
        year: '2021',
        firstTitle: /PyCon HK 2021 Photos/u,
        pageTwoFirstTitle: /Is the news media polarized\?/u,
        pageTwoCount: 16,
      },
      {
        year: '2022',
        firstTitle: /PyCon HK 2022 Photos/u,
        pageTwoFirstTitle: /Sponsors – PyCon Hong Kong 2022/u,
        pageTwoCount: 7,
      },
      {
        year: '2023',
        firstTitle: /PyCon HK 2023 Photos/u,
        pageTwoFirstTitle: /Discover the Future with Our Networking Hour Partner OpenSSF/u,
        pageTwoLastTitle: /Procedures for Reporting Incidents – As of 2023/u,
        pageTwoCount: 21,
        pageThreeFirstTitle: /Enforcement Procedures – As of 2023/u,
        pageThreeLastTitle: /Code of Conduct – As of 2023/u,
        pageThreeCount: 2,
      },
    ];

    for (const archive of marketinglyYearArchives) {
      const response = await page.goto(`/${archive.year}/`);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK`));
      await expect(
        page.getByRole('heading', { name: new RegExp(`Year:\\s*${archive.year}`, 'u') })
      ).toBeVisible();
      await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
      await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
        archive.firstTitle
      );
      await expect(
        page.locator(`a.next.page-numbers[href="/${archive.year}/page/2/"]`)
      ).toBeVisible();

      const pageOneResponse = await page.goto(`/${archive.year}/page/1/`);

      expect(pageOneResponse?.status()).toBe(200);
      expect(page.url()).toContain(`/${archive.year}/page/1`);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK`));
      await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
        archive.firstTitle
      );

      const pageTwoResponse = await page.goto(`/${archive.year}/page/2/`);

      expect(pageTwoResponse?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 2`));
      await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
        archive.pageTwoCount
      );
      await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
        archive.pageTwoFirstTitle
      );
      if ('pageTwoLastTitle' in archive) {
        await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
          archive.pageTwoLastTitle
        );
      }
      await expect(page.locator('span.page-numbers.current')).toHaveText('2');
      await expect(
        page.locator(`a.prev.page-numbers[href="/${archive.year}/page/1/"]`)
      ).toBeVisible();
      await expect(
        page.locator(`a.page-numbers[href="/${archive.year}/page/1/"]`, {
          hasText: '1',
        })
      ).toBeVisible();

      if ('pageThreeFirstTitle' in archive) {
        await expect(
          page.locator(`a.next.page-numbers[href="/${archive.year}/page/3/"]`)
        ).toBeVisible();

        const pageThreeResponse = await page.goto(`/${archive.year}/page/3/`);

        expect(pageThreeResponse?.status()).toBe(200);
        await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 3`));
        await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
          archive.pageThreeCount
        );
        await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
          archive.pageThreeFirstTitle
        );
        if ('pageThreeLastTitle' in archive) {
          await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
            archive.pageThreeLastTitle
          );
        }
        await expect(page.locator('span.page-numbers.current')).toHaveText('3');
        await expect(
          page.locator(`a.prev.page-numbers[href="/${archive.year}/page/2/"]`)
        ).toBeVisible();
      }
    }

    const response2024 = await page.goto('/2024/');

    expect(response2024?.status()).toBe(200);
    await expect(page).toHaveTitle(/2024 - PyCon HK/);
    await expect(page.locator('li.wp-block-post')).toHaveCount(21);
    await expect(page.locator('li.wp-block-post').first()).toContainText(
      /PyCon HK 2024 Photos/u
    );
    await expect(page.locator('.voyago-sidebar .voyago-search')).toBeVisible();
    await expect(page.locator('.voyago-sidebar select')).toBeVisible();
    await expect(page.locator('.voyago-pagination')).toHaveCount(0);

    const pageTwoResponse = await page.goto('/2018/page/2/');

    expect(pageTwoResponse?.status()).toBe(200);
    await expect(page).toHaveTitle(/2018 - PyCon HK - Page 2/);
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(19);
    await expect(
      page.locator('article.posts-entry.blogposts-list', {
        hasText: /Code of Conduct – As of 2024/u,
      })
    ).toHaveCount(1);
    await expect(page.locator('span.page-numbers.current')).toHaveText('2');
    await expect(page.locator('a.prev.page-numbers[href="/2018/page/1/"]')).toBeVisible();
    await expect(
      page.locator('a.page-numbers[href="/2018/page/1/"]', { hasText: '1' })
    ).toBeVisible();

    const pageOne2018Response = await page.goto('/2018/page/1/');

    expect(pageOne2018Response?.status()).toBe(200);
    expect(page.url()).toContain('/2018/page/1');
    await expect(page).toHaveTitle(/2018 - PyCon HK/);
    await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
      /PyCon HK 2018 Photos/u
    );

    const pageThree2022Response = await page.goto('/2022/page/3/');

    expect(pageThree2022Response?.status()).toBe(404);
    expect(page.url()).toContain('/2022/page/3');

    const pageTwo2024Response = await page.goto('/2024/page/2/');

    expect(pageTwo2024Response?.status()).toBe(404);
    expect(page.url()).toContain('/2024/page/2');
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
      'https://pycon.hk/en',
      'https://pycon.hk/zh-hk',
      'https://pycon.hk/2025',
      'https://pycon.hk/2025/news/pre-event-notice',
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
