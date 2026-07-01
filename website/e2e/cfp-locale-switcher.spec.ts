import { expect, test, type Page } from '@playwright/test';

const expectedLocaleHrefs = ['/en', '/zh-hk', '/zh-hant', '/zh-hans', '/ko', '/ja'];
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

test.describe('2026 CFP locale switcher', () => {
  test('defaults cookie-less latest entry routes to top-level English', async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/en');

    await context.clearCookies();
    await page.goto('/2026');
    expect(new URL(page.url()).pathname).toBe('/en');
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

    expect(new URL(page.url()).pathname).toBe('/zh-hk');
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

      expect(new URL(page.url()).pathname).toBe('/en');
      await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
    }
  });

  for (const path of ['/', '/en', '/zh-hk', '/2026', '/2026/en']) {
    test(`uses top-level latest locale hrefs on ${path}`, async ({ page }) => {
      await page.goto(path);

      expect(await collectLocaleHrefs(page)).toEqual(expectedLocaleHrefs);
    });
  }

  test('clicks from latest entry pages keep visitors on top-level locale routes', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: '粵' }).first().click();
    expect(new URL(page.url()).pathname).toBe('/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');

    await page.goto('/2026');
    await page.locator('nav a', { hasText: 'EN' }).first().click();
    expect(new URL(page.url()).pathname).toBe('/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
  });

  test('shows the active current locale on top-level locale pages', async ({ page }) => {
    await page.goto('/en');
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');

    await page.goto('/zh-hk');
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-HK');
  });
});
