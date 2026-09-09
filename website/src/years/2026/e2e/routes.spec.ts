import { expect, test } from '@playwright/test';

const siteOrigin = new URL(process.env.PUBLIC_SITE_URL || 'https://pycon.hk').origin;

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const redirectChecks = [
  { path: '/2026/en/', status: 200 },
  {
    path: '/2026/zh-cn/privacy-policy/',
    status: 308,
    location: '/2026/zh-hans/privacy-policy',
  },
];
const criticalPages = [
  {
    path: '/2026/',
    title: /PyCon HK 2026 \| Ride and Leverage with AI/,
    text: /Ride and Leverage with AI/u,
  },
  {
    path: '/2026/en/',
    title: /PyCon HK 2026 \| Ride and Leverage with AI/,
    text: /Ride and Leverage with AI/u,
  },
];
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

test('serves 2026 locale slash aliases without Astro interstitials', async ({
  page,
  request,
}) => {
  const redirect = await request.get('/2026/en/', { maxRedirects: 0 });

  expect(redirect.status()).toBe(200);
  expect(redirect.headers().location).toBeUndefined();
  expect(await redirect.text()).not.toContain(
    'Your site is configured with <code>trailingSlash</code> set to <code>never</code>'
  );

  const response = await page.goto('/2026/en/');

  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/2026/en/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${siteOrigin}/2026/en`
  );
});

const shareLocales = [
  {
    locale: 'en',
    ogLocale: 'en_HK',
    title: 'Ride and Leverage with AI',
    description: 'PyCon Hong Kong 2026',
  },
  {
    locale: 'zh-hk',
    ogLocale: 'zh_HK',
    title: 'Ride and Leverage with AI 乘風破浪 智領未來',
    description: '香港 Python 年會',
  },
  {
    locale: 'zh-hant',
    ogLocale: 'zh_TW',
    title: 'Ride and Leverage with AI 乘風破浪 智領未來',
    description: '香港 Python 年會',
  },
  {
    locale: 'zh-hans',
    ogLocale: 'zh_CN',
    title: 'Ride and Leverage with AI 乘风破浪 智领未来',
    description: '香港 Python 年会',
  },
  {
    locale: 'ja',
    ogLocale: 'ja_JP',
    title: '香港の Python カンファレンス',
    description: '香港の中心で',
  },
  {
    locale: 'ko',
    ogLocale: 'ko_KR',
    title: '홍콩 Python 콘퍼런스',
    description: '홍콩의 중심에서',
  },
];

for (const { locale, ogLocale, title, description } of shareLocales) {
  test(`shares current conference metadata for ${locale} on the configured origin`, async ({
    request,
  }) => {
    // Sharing crawlers read the server HTML without running the client router.
    const response = await request.get(`/2026/${locale}/`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    const canonicalUrl = `${siteOrigin}/2026/${locale}`;
    expect(html).toContain(`<link rel="canonical" href="${canonicalUrl}">`);
    expect(html).toContain(`<meta property="og:url" content="${canonicalUrl}">`);
    expect(html).toContain(
      `<meta property="og:title" content="PyCon HK 2026 | ${title}">`
    );
    expect(html).toContain(`<meta property="og:locale" content="${ogLocale}">`);
    for (const attribute of [
      'property="og:description"',
      'name="twitter:description"',
    ]) {
      const content = html.match(
        new RegExp(`<meta ${attribute} content="([^"]*)">`)
      )?.[1];
      expect(content).toContain(description);
    }
    expect(html).toContain(
      `<meta property="og:image" content="${siteOrigin}/2026/share/${locale}.png">`
    );
    expect(html).toContain(
      `<meta name="twitter:image" content="${siteOrigin}/2026/share/${locale}.png">`
    );
    const image = await request.get(`/2026/share/${locale}.png`);
    expect(image.ok()).toBeTruthy();
    expect(image.headers()['content-type']).toContain('image/png');
    const bytes = await image.body();
    expect(bytes.subarray(1, 4).toString()).toBe('PNG');
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
  });
}
