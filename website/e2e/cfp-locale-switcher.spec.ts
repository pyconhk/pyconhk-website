import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const expectedLocaleHrefs = [
  '/2026/en',
  '/2026/zh-hk',
  '/2026/zh-hant',
  '/2026/zh-hans',
  '/2026/ko',
  '/2026/ja',
];
const localeLabels = ['EN', '粵', '繁', '简', 'KR', 'JA'];

function cookieDomain(baseURL: string | undefined): string {
  if (!baseURL) {
    return '127.0.0.1';
  }

  return new URL(baseURL).hostname;
}

async function collectLocaleHrefs(page: Page) {
  const hrefs = await page
    .locator('nav a')
    .evaluateAll((anchors, labels) =>
      anchors
        .map((anchor) => ({
          href: anchor.getAttribute('href') ?? '',
          label: anchor.textContent?.trim() ?? '',
        }))
        .filter((link) => (labels as string[]).includes(link.label))
        .map((link) => link.href),
      localeLabels
    );

  return [...new Set(hrefs)];
}

async function currentLocaleLabels(page: Page) {
  return page.locator('nav a[aria-current="page"]').evaluateAll(
    (links, labels) =>
      links
        .map((link) => link.textContent?.trim() ?? '')
        .filter((label) => (labels as string[]).includes(label)),
    localeLabels
  );
}

async function preferredLocaleCookie(context: BrowserContext) {
  return (await context.cookies()).find((cookie) => cookie.name === 'preferredLocale');
}

test.describe('2026 CFP locale switcher', () => {
  test('serves latest locale entry aliases without HTTP redirects', async ({ request }) => {
    for (const path of ['/', '/2026/', '/privacy-policy/']) {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status(), path).toBe(200);
      expect(response.headers().location, path).toBeUndefined();
    }
  });

  test('defaults cookie-less latest entry routes to 2026 English', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/2026/en');

    await context.clearCookies();
    await page.goto('/2026');
    expect(new URL(page.url()).pathname).toBe('/2026/en');
  });

  test('writes preferredLocale when latest entry routes choose a fallback locale', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');

    expect(new URL(page.url()).pathname).toBe('/2026/en');
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

    expect(new URL(page.url()).pathname).toBe('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');
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

      expect(new URL(page.url()).pathname).toBe('/2026/en');
      await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
    }
  });

  test('persists locale preference from direct 2026 locale page visits', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/2026/ko');

    expect(new URL(page.url()).pathname).toBe('/2026/ko');
    expect(await preferredLocaleCookie(context)).toMatchObject({
      name: 'preferredLocale',
      path: '/',
      value: 'ko',
    });
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
    await page.locator('nav a', { hasText: '粵' }).first().click();
    expect(new URL(page.url()).pathname).toBe('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');

    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/2026/zh-hk');

    await page.goto('/2026');
    await page.locator('nav a', { hasText: 'EN' }).first().click();
    expect(new URL(page.url()).pathname).toBe('/2026/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
  });

  test('shows the active current locale on 2026 locale pages', async ({ page }) => {
    await page.goto('/2026/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');

    await page.goto('/2026/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-HK');
  });

  test('keeps the final Japanese and Korean CFP wording', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/2026/ja');
    await expect(page.getByText('プロポーザル', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        'よいプロポーザルは、対象者、持ち帰れること、セッションの進め方がはっきりしています。',
        { exact: true }
      )
    ).toBeVisible();

    await page.goto('/2026/ko');
    await expect(
      page.getByText(
        '좋은 제안서는 대상, 취득 가능한 사항, 세션 진행 방식을 분명히 보여 줍니다.',
        { exact: true }
      )
    ).toBeVisible();
  });
});
