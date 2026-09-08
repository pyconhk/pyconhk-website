import { expect, test } from '@playwright/test';

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
    'https://pycon.hk/2026/en'
  );
});
