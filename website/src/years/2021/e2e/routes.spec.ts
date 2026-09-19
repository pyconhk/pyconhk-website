import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const specialLegacySlugRedirects = [
  {
    path: '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project/',
    location:
      '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project',
    text: /廣東話自肥企画 Cantonese Selfish Project/u,
  },
  {
    path: '/2021/廣東話自肥企画-cantonese-selfish-project/',
    location:
      '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project',
    text: /廣東話自肥企画 Cantonese Selfish Project/u,
  },
];
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/pycon-hk-2021-photos/',
    to: '/2021/photos',
    title: 'PyCon HK 2021 Photos - PyCon HK',
  },
];
const legacyArchiveSlashRedirectChecks = [
  { from: '/2021/', to: '/2021', title: /2021 - PyCon HK/u },
  { from: '/2021/page/2/', to: '/2021/page/2', title: /2021 - PyCon HK/u },
];
const legacyTitleSuffixChecks = [
  {
    path: '/2021/2021-qa-prize/',
    title: 'Q&A Prize – PyCon HK 2021 - PyCon HK',
  },
];
const legacyArticlePresentationChecks = [
  {
    path: '/2021/financial-data-forecaster/',
    heading: /Financial Data Forecaster/u,
  },
];
const legacyMarketinglyMobileHeaderChecks = [
  {
    path: '/2021/financial-data-forecaster/',
    heading: /Financial Data Forecaster/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
];
const marketinglyYearArchives = [
  {
    year: '2021',
    firstTitle: /PyCon HK 2021 Photos/u,
    pageTwoFirstTitle: /Is the news media polarized\?/u,
    pageTwoCount: 16,
  },
];
for (const check of specialLegacySlugRedirects) {
  test(`serves special legacy slug alias without Unicode corruption: ${check.path}`, async ({
    request,
  }) => {
    const response = await request.get(check.path, { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(response.headers().location).toBeUndefined();
    expect(await response.text()).toMatch(check.text);
  });
}

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

for (const check of legacyArchiveSlashRedirectChecks) {
  test(`serves legacy archive slash alias: ${check.from}`, async ({ page }) => {
    const response = await page.goto(check.from);

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(check.from);
    await expect(page).toHaveTitle(check.title);
  });
}

for (const check of legacyTitleSuffixChecks) {
  test(`uses live legacy title suffix: ${check.path}`, async ({ page }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
  });
}

for (const check of legacyArticlePresentationChecks) {
  test(`uses shared legacy article presentation: ${check.path}`, async ({ page }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    const heading = page.getByRole('heading', { name: check.heading });
    await expect(heading).toBeVisible();
    await expect(page.locator('article.posts-entry')).toBeVisible();
    await expect(page.locator('#colophon a[href="/2021/"]')).toBeVisible();

    const fontFamily = await heading.evaluate(
      (element) => getComputedStyle(element).fontFamily
    );
    const mainBackground = await page
      .locator('body')
      .evaluate((element) => getComputedStyle(element).backgroundColor);

    expect(fontFamily).toMatch(/Lato/u);
    expect(mainBackground).toBe('rgb(238, 238, 238)');
  });
}

for (const check of legacyMarketinglyMobileHeaderChecks) {
  test(`keeps legacy header compact on mobile: ${check.path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    const headerBox = await page.locator('#masthead').boundingBox();
    const headingBox = await page
      .getByRole('heading', { name: check.heading })
      .boundingBox();

    expect(Math.round(headerBox?.height ?? 0)).toBeLessThanOrEqual(
      check.maxHeaderHeight
    );
    expect(Math.round(headingBox?.y ?? 0)).toBeLessThanOrEqual(check.maxHeadingTop);
  });
}

for (const archive of marketinglyYearArchives) {
  test(`preserves ${archive.year} archive structure and pagination`, async ({
    page,
  }) => {
    const response = await page.goto(`/${archive.year}/`);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK`));
    const headingKind = archive.year === '2020' ? 'Year' : 'Category';

    await expect(
      page.getByRole('heading', {
        name: new RegExp(`${headingKind}:\\s*${archive.year}`, 'u'),
      })
    ).toBeVisible();
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
    await expect(
      page.locator('article.posts-entry.blogposts-list').first()
    ).toContainText(archive.firstTitle);
    await expect(
      page.locator(`a.next.page-numbers[href="/${archive.year}/page/2/"]`)
    ).toBeVisible();

    if (archive.year === '2020') {
      const pageOneResponse = await page.goto('/2020/page/1/');

      expect(pageOneResponse?.status()).toBe(200);
      expect(page.url()).toContain('/2020/page/1');
      await expect(page).toHaveTitle(/2020 - PyCon HK/);
      await expect(
        page.locator('article.posts-entry.blogposts-list').first()
      ).toContainText(archive.firstTitle);
    }

    const pageTwoResponse = await page.goto(`/${archive.year}/page/2/`);

    expect(pageTwoResponse?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 2`));
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
      archive.pageTwoCount
    );
    await expect(
      page.locator('article.posts-entry.blogposts-list').first()
    ).toContainText(archive.pageTwoFirstTitle);
    await expect(page.locator('span.page-numbers.current')).toHaveText('2');
    const firstPageHref =
      archive.year === '2020' ? '/2020/page/1/' : `/${archive.year}/`;

    await expect(
      page.locator(`a.prev.page-numbers[href="${firstPageHref}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`a.page-numbers[href="${firstPageHref}"]`, {
        hasText: '1',
      })
    ).toBeVisible();
  });
}
