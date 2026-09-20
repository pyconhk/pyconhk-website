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

async function selectLocale(page: Page, locale: string, subpath = '') {
  const header = page.locator('[data-site-header]');
  if (await header.locator('[data-mobile-nav-trigger]').isVisible()) {
    await header.locator('[data-mobile-nav-trigger]').click();
    await header
      .locator(`[data-mobile-nav-panel] [data-locale-switch="${locale}"]`)
      .click();
  } else {
    await header.locator('summary').first().click();
    await header.locator(`[data-locale-switch="${locale}"]`).first().click();
  }
  await expect(page).toHaveURL(new RegExp(`/2026/${locale}${subpath}/?$`));
}

async function preferredLocaleCookie(context: BrowserContext) {
  return (await context.cookies()).find((cookie) => cookie.name === 'preferredLocale');
}

test.describe('2026 conference locale switcher', () => {
  for (const width of [390, 1440]) {
    test(`written Chinese and Cantonese stay distinct when switching at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/2026/zh-hant/');
      for (const locale of ['zh-hant', 'zh-hk', 'zh-hant']) {
        if (!new URL(page.url()).pathname.includes(`/${locale}/`)) {
          if (width < 768) {
            await page.locator('[data-mobile-nav-trigger]').click();
            await page
              .locator(`[data-mobile-nav-panel] [data-locale-switch="${locale}"]`)
              .click();
          } else {
            await selectLocale(page, locale);
          }
          await expect(page).toHaveURL(new RegExp(`/2026/${locale}/?$`));
        }
        const cantonese = locale === 'zh-hk';
        await expect(page.locator('html')).toHaveAttribute(
          'lang',
          cantonese ? 'zh-Hant-HK' : 'zh-Hant'
        );
        await expect(page.locator('#home-title')).toHaveText('編程・連結・前行');
        await expect(page.locator('#home')).toContainText(
          'HKIIT（將軍澳李惠利，待定）'
        );
        await expect(page.locator('#home a[aria-label]')).toHaveAttribute(
          'aria-label',
          cantonese ? '加入日曆' : '加入行事曆'
        );
        await expect(page.locator('[data-sponsors-details]')).toHaveText(
          cantonese ? '睇晒贊助夥伴' : '查看所有贊助夥伴'
        );
        const introduction = page.locator('#participate');
        if (cantonese) {
          await expect(introduction).toContainText(/[嘅喺唔冇哋嚟睇畀咗]/);
        } else {
          await expect(introduction).not.toContainText(/[嘅喺唔冇哋嚟睇畀咗]/);
        }
        // Original talk titles remain untouched even when the interface is written Chinese.
        await expect(page.locator('#featured-talk-TSBGZH')).toHaveText(
          'AI 聽到聲音時，會聯想到乜嘢？'
        );
        await expect(page.locator('footer a[href$="privacy-policy"]')).toHaveText(
          'Privacy Policy'
        );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
      }
    });

    for (const { route, titles } of [
      {
        route: 'about',
        titles: { ja: 'PyCon Hong Kong について', ko: 'PyCon Hong Kong 소개' },
      },
      {
        route: 'sponsorships/opportunities',
        titles: { ja: 'スポンサー募集', ko: '후원 안내' },
      },
    ]) {
      test(`Japanese and Korean retain ${route} and localized metadata when switching at ${width}px`, async ({
        page,
        context,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/2026/ja/${route}/`);

        for (const locale of ['ja', 'ko', 'ja'] as const) {
          if (!new URL(page.url()).pathname.includes(`/${locale}/`))
            await selectLocale(page, locale, `/${route}`);

          const title = titles[locale];
          const pageTitle = `${title} | PyCon HK 2026`;
          await expect(page).toHaveURL(new RegExp(`/2026/${locale}/${route}/?$`));
          await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
          await expect(page).toHaveTitle(pageTitle);
          await expect(page.locator('html')).toHaveAttribute(
            'lang',
            locale === 'ja' ? 'ja-JP' : 'ko-KR'
          );
          await expect
            .poll(() => currentLocaleLabels(page))
            .toContain(locale === 'ja' ? '日本語' : '한국어');
          expect(await preferredLocaleCookie(context)).toMatchObject({ value: locale });

          for (const selector of [
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
          ])
            await expect(page.locator(selector)).toHaveAttribute('content', pageTitle);
          for (const selector of [
            'meta[name="description"]',
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
          ])
            await expect(page.locator(selector)).toHaveAttribute(
              'content',
              locale === 'ja' ? /[ぁ-ゟァ-ヿ]/u : /[가-힣]/u
            );
          await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
            'content',
            locale === 'ja' ? 'ja_JP' : 'ko_KR'
          );
          const canonicalPath = new RegExp(`/2026/${locale}/${route}/?$`);
          await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            canonicalPath
          );
          await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
            'content',
            canonicalPath
          );
          for (const selector of [
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
          ])
            await expect(page.locator(selector)).toHaveAttribute(
              'content',
              new RegExp(`/2026/share/${locale}\\.png$`)
            );

          await page.evaluate(() => document.fonts.ready);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth)
          ).toBeLessThanOrEqual(width);
        }
      });
    }
  }

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

  for (const width of [390, 1440]) {
    test(`keeps Japanese and Korean CFP guidance with the closed status and current theme at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/2026/ja/cfp');

      for (const copy of [
        {
          locale: 'ja',
          theme: 'コードを書き、つながり、前へ',
          closed: 'プロポーザル募集は終了しました',
          subtitle: 'PyCon Hong Kong 2026 プロポーザルのご案内',
          guidance: '発表アイデア',
          guidanceExcerpt: 'セッションの進め方',
          edit: '提出済みのプロポーザルを見る',
        },
        {
          locale: 'ko',
          theme: '코딩하고, 연결하고, 계속 나아가다',
          closed: '발표 제안 모집 마감',
          subtitle: 'PyCon Hong Kong 2026 발표 제안 안내',
          guidance: '발표 제안 아이디어',
          guidanceExcerpt: '참가자가 배울 내용',
          edit: '제출한 제안 보기',
        },
      ]) {
        if (copy.locale === 'ko') await selectLocale(page, copy.locale, '/cfp');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(copy.theme);
        await expect(page.locator('[data-cfp-closed]').first()).toHaveText(copy.closed);
        await expect(page.getByText(copy.subtitle, { exact: true })).toBeVisible();
        await expect(
          page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
        ).toHaveCount(0);
        await expect(
          page.getByRole('heading', { level: 2, name: copy.guidance, exact: true })
        ).toBeVisible();
        await expect(page.getByText(copy.guidanceExcerpt)).toBeVisible();
        await expect(
          page
            .locator('a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
            .first()
        ).toHaveText(copy.edit);
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
      }
    });
  }
});
