import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/2017-photos/',
    to: '/2017/photos',
    title: 'PyCon HK 2017 Photos | PyCon HK',
  },
  {
    from: '/conference-highlights/2017-recording/',
    to: '/2017/recording',
    title: 'PyCon HK 2017 Recording | PyCon HK',
  },
];
for (const check of legacyHighlightRedirectChecks) {
  test(`redirects legacy highlight to year-local canonical route: ${check.from}`, async ({
    page,
    request,
  }) => {
    const redirect = await request.get(check.from, { maxRedirects: 0 });

    expect(redirect.status()).toBe(308);
    expect(normalizeRedirectLocation(redirect.headers().location)).toBe(check.to);

    const response = await page.goto(check.to, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://pycon.hk${check.to}`
    );
  });
}
