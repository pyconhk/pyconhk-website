import { expect, test, type Page } from '@playwright/test';

const localeLinks = [
  { label: 'EN', href: '/privacy-policy' },
  { label: '粵', href: '/zh-hk/privacy-policy' },
  { label: '繁', href: '/zh-hant/privacy-policy' },
  { label: '简', href: '/zh-cn/privacy-policy' },
  { label: 'KR', href: '/ko/privacy-policy' },
  { label: 'JA', href: '/ja/privacy-policy' },
] as const;

async function visibleNav(page: Page) {
  const nav = page.getByRole('navigation');
  await expect(nav).toBeVisible();
  await expect(nav).toContainText('PyCon HK 2026 CFP');

  return nav;
}

async function visibleFooter(page: Page) {
  const footer = page.getByRole('contentinfo');
  await expect(footer).toBeVisible();

  return footer;
}

async function currentLocaleLabels(page: Page) {
  return page.locator('nav a[aria-current="page"]').evaluateAll((links) =>
    links.map((link) => link.textContent?.trim() ?? '')
  );
}

test.describe('2026 privacy policy i18n', () => {
  test('renders English latest privacy page with CFP nav and privacy locale links', async ({
    page,
  }) => {
    await page.goto('/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong Privacy Policy Statement' })
    ).toBeVisible();

    const nav = await visibleNav(page);
    for (const link of localeLinks) {
      await expect(nav.locator('a', { hasText: link.label }).first()).toHaveAttribute(
        'href',
        link.href
      );
    }
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
  });

  test('renders explicit English privacy route with English active in the CFP nav', async ({
    page,
  }) => {
    await page.goto('/en/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong Privacy Policy Statement' })
    ).toBeVisible();
    await visibleNav(page);
    await expect.poll(() => currentLocaleLabels(page)).toContain('EN');
  });

  test('renders Cantonese privacy route with Cantonese active in the CFP nav', async ({
    page,
  }) => {
    await page.goto('/zh-hk/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong 私隱政策聲明' })
    ).toBeVisible();
    await visibleNav(page);
    await expect.poll(() => currentLocaleLabels(page)).toContain('粵');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-HK');
  });

  test('renders Simplified Chinese privacy route with fallback policy content and Simplified Chinese shell', async ({
    page,
  }) => {
    await page.goto('/zh-cn/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong Privacy Policy Statement' })
    ).toBeVisible();
    await visibleNav(page);
    await expect.poll(() => currentLocaleLabels(page)).toContain('简');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  });

  test('renders Japanese privacy route with Japanese active in the CFP nav', async ({
    page,
  }) => {
    await page.goto('/ja/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong プライバシーポリシー' })
    ).toBeVisible();
    await visibleNav(page);
    await expect.poll(() => currentLocaleLabels(page)).toContain('JA');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  });

  test('keeps fallback locale active while rendering available privacy content', async ({
    page,
  }) => {
    await page.goto('/ko/privacy-policy');

    await expect(
      page.getByRole('heading', { name: 'PyCon Hong Kong Privacy Policy Statement' })
    ).toBeVisible();
    await visibleNav(page);
    await expect.poll(() => currentLocaleLabels(page)).toContain('KR');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  });

  test('points the 2026 footer privacy link to the current locale privacy page', async ({
    page,
  }) => {
    await page.goto('/zh-hk');

    const footer = await visibleFooter(page);
    await expect(footer.getByRole('link', { name: '私隱政策' })).toHaveAttribute(
      'href',
      '/zh-hk/privacy-policy'
    );

    await footer.getByRole('link', { name: '私隱政策' }).click();
    await expect(page).toHaveURL('/zh-hk/privacy-policy');
  });
});
