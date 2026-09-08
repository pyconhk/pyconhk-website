import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const expectedLocaleHrefs = [
  '/2026/en',
  '/2026/zh-hk',
  '/2026/zh-hant',
  '/2026/zh-hans',
  '/2026/ja',
  '/2026/ko',
];

function cookieDomain(baseURL: string | undefined): string {
  if (!baseURL) {
    return '127.0.0.1';
  }

  return new URL(baseURL).hostname;
}

async function collectLocaleHrefs(page: Page) {
  const hrefs = await page
    .locator('[data-site-header] [data-locale-switch]')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor.getAttribute('href') ?? '').replace(/\/$/u, ''))
    );

  return [...new Set(hrefs)];
}

async function currentLocaleLabels(page: Page) {
  return page
    .locator(
      '[data-site-header] [data-locale-switch][aria-current="page"] > span:first-child'
    )
    .allTextContents();
}

async function selectLocale(page: Page, locale: string) {
  const header = page.locator('[data-site-header]');
  await header.locator('summary').first().click();
  await header.locator(`[data-locale-switch="${locale}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/2026/${locale}/?$`));
}

async function preferredLocaleCookie(context: BrowserContext) {
  return (await context.cookies()).find((cookie) => cookie.name === 'preferredLocale');
}

test.describe('2026 conference locale switcher', () => {
  test('redirects latest locale entry aliases before rendering HTML', async ({
    request,
  }) => {
    for (const [path, location] of [
      ['/', '/2026/en'],
      ['/2026/', '/2026/en'],
      ['/privacy-policy/', '/2026/en/privacy-policy'],
    ]) {
      const response = await request.get(path, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
        maxRedirects: 0,
      });

      expect(response.status(), path).toBe(302);
      expect(response.headers().location, path).toBe(location);
      expect(response.headers()['cache-control'], path).toContain('no-store');
      expect(await response.body(), path).toHaveLength(0);
    }
  });

  test('chooses the edge redirect locale from the cookie before the browser language', async ({
    baseURL,
    context,
  }) => {
    await context.clearCookies();
    await context.addCookies([
      {
        domain: cookieDomain(baseURL),
        name: 'preferredLocale',
        path: '/',
        value: 'ja',
      },
    ]);

    const response = await context.request.get('/2026', {
      headers: { 'Accept-Language': 'zh-HK,zh;q=0.9' },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/2026/ja');
  });

  test('uses the weighted browser language when no preferred locale exists', async ({
    context,
  }) => {
    await context.clearCookies();

    const response = await context.request.get('/', {
      headers: { 'Accept-Language': 'en;q=0.7,zh-HK;q=0.9' },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/2026/zh-hk');
    expect(response.headers()['set-cookie']).toContain('preferredLocale=zh-hk');
  });

  test('defaults cookie-less latest entry routes to 2026 English', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/en');

    await context.clearCookies();
    await page.goto('/2026');
    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/en');
  });

  test('writes preferredLocale when latest entry routes choose a fallback locale', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');

    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/en');
    expect(await preferredLocaleCookie(context)).toMatchObject({
      name: 'preferredLocale',
      path: '/',
      value: 'en',
    });
  });

  test('uses a supported preferred locale cookie on the latest entry route', async ({
    baseURL,
    context,
    page,
  }) => {
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

    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('廣東話');
  });

  test('falls back to English for unsupported or malformed preferred locale cookies', async ({
    baseURL,
    context,
    page,
  }) => {
    for (const value of ['pirate', '%E0%A4%A']) {
      await context.clearCookies();
      await context.addCookies([
        {
          domain: cookieDomain(baseURL),
          name: 'preferredLocale',
          path: '/',
          value,
        },
      ]);

      await page.goto('/');

      expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/en');
      await expect.poll(() => currentLocaleLabels(page)).toContain('English');
    }
  });

  test('persists locale preference from direct 2026 locale page visits', async ({
    context,
    page,
  }) => {
    for (const path of expectedLocaleHrefs) {
      await context.clearCookies();
      await page.goto(path);
      expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe(path);
      const cookie = await preferredLocaleCookie(context);
      expect(cookie).toMatchObject({
        name: 'preferredLocale',
        path: '/',
        sameSite: 'Lax',
        value: path.split('/')[2],
      });
      expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + 31_535_900);
      expect(cookie?.expires).toBeLessThan(Date.now() / 1000 + 31_536_010);
      await page.goto('/');
      expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe(path);
    }
  });

  for (const path of ['/', '/2026', '/2026/en', '/2026/zh-hk']) {
    test(`uses 2026 locale hrefs on ${path}`, async ({ page }) => {
      await page.goto(path);

      expect(await collectLocaleHrefs(page)).toEqual(expectedLocaleHrefs);
    });
  }

  test('clicks from latest entry pages keep visitors on 2026 locale routes', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    await selectLocale(page, 'zh-hk');
    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('廣東話');

    await page.goto('/');
    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/zh-hk');

    await page.goto('/2026');
    await selectLocale(page, 'en');
    expect(new URL(page.url()).pathname.replace(/\/$/u, '')).toBe('/2026/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('English');
  });

  test('shows the active current locale on 2026 locale pages', async ({ page }) => {
    await page.goto('/2026/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('English');

    await page.goto('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('廣東話');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant-HK');
  });

  test('keeps Japanese and Korean CFP guidance with the closed status and current theme', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/2026/ja/cfp');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ride and Leverage with AI'
    );
    await expect(page.locator('[data-cfp-closed]').first()).toHaveText(
      'プロポーザル募集は終了しました'
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(0);
    await expect(
      page.getByText(
        'よいプロポーザルは、対象者、持ち帰れること、セッションの進め方がはっきりしています。',
        { exact: true }
      )
    ).toBeVisible();

    await page.goto('/2026/ko/cfp');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ride and Leverage with AI'
    );
    await expect(page.locator('[data-cfp-closed]').first()).toHaveText(
      '발표 제안 모집 마감'
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(0);
    await expect(
      page.getByText(
        '좋은 제안서는 대상, 취득 가능한 사항, 세션 진행 방식을 분명히 보여 줍니다.',
        { exact: true }
      )
    ).toBeVisible();
  });
});
