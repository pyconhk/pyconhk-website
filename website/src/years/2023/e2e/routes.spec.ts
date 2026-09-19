import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const specialLegacySlugRedirects = [
  {
    path: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript/',
    location: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript',
    text: /玩轉 Python 與 Javascript/u,
  },
  {
    path: '/2023/玩轉-python-與-javascript/',
    location: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript',
    text: /玩轉 Python 與 Javascript/u,
  },
];
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/pycon-hk-2023-photos/',
    to: '/2023/photos',
    title: 'PyCon HK 2023 Photos - PyCon HK',
  },
];
const legacyCompatibilityRedirectChecks = [
  {
    from: '/2023/about/code-of-conduct/',
    to: '/2023/2023-code-of-conduct',
    text: /Code of Conduct – As of 2023/u,
  },
];
const legacyTitleSuffixChecks = [
  {
    path: '/2023/2023-schedule/',
    title: 'Schedule – PyCon HK 2023 - PyCon HK',
  },
];
const marketinglyYearArchives = [
  {
    year: '2023',
    firstTitle: /PyCon HK 2023 Photos/u,
    pageTwoFirstTitle: /Discover the Future with Our Networking Hour Partner OpenSSF/u,
    pageTwoLastTitle: /Code of Conduct – As of 2023/u,
    pageTwoCount: 21,
  },
];
const legacyCompatibilityAssetPaths = [
  '/wp-content/uploads/2023/10/SCHEDULE-850x478.jpg',
];
const legacyScheduleMobileChecks = [
  { path: '/2023/2023-schedule/', maxDocumentHeight: 6_200 },
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

for (const check of legacyCompatibilityRedirectChecks) {
  test(`redirects legacy compatibility route to canonical year route: ${check.from}`, async ({
    page,
    request,
  }) => {
    const redirect = await request.get(check.from, { maxRedirects: 0 });

    expect(redirect.status()).toBe(308);
    expect(normalizeRedirectLocation(redirect.headers().location)).toBe(check.to);

    const response = await page.goto(check.from);

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(check.to);
    await expect(page.getByText(check.text).first()).toBeVisible();
  });
}

for (const check of legacyTitleSuffixChecks) {
  test(`uses live legacy title suffix: ${check.path}`, async ({ page }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
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
    if ('pageTwoLastTitle' in archive) {
      await expect(
        page.locator('article.posts-entry.blogposts-list').last()
      ).toContainText(archive.pageTwoLastTitle);
    }
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

for (const year of ['2023']) {
  test(`rejects nonexistent ${year} archive page 3`, async ({ page }) => {
    const response = await page.goto(`/${year}/page/3/`);
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain(`/${year}/page/3`);
  });
}

for (const path of legacyCompatibilityAssetPaths) {
  test(`does not publish root WordPress asset URL: ${path}`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.status()).toBe(404);
  });
}

for (const check of legacyScheduleMobileChecks) {
  test(`keeps legacy schedule tables horizontally scannable on mobile: ${check.path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 1000 });
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('.entry-content .wp-block-table').first()).toBeVisible();

    const metrics = await page.evaluate(() => {
      const figures = Array.from(
        document.querySelectorAll<HTMLElement>('.entry-content .wp-block-table')
      );

      return {
        documentHeight: document.documentElement.scrollHeight,
        tables: figures.map((figure) => {
          const table = figure.querySelector<HTMLElement>('table');

          return {
            figureClientWidth: figure.clientWidth,
            figureScrollWidth: figure.scrollWidth,
            overflowX: getComputedStyle(figure).overflowX,
            tableDisplay: table ? getComputedStyle(table).display : '',
            tableWidth: table?.getBoundingClientRect().width ?? 0,
          };
        }),
      };
    });

    expect(metrics.documentHeight).toBeLessThan(check.maxDocumentHeight);
    expect(metrics.tables.length).toBeGreaterThan(0);
    for (const table of metrics.tables) {
      expect(table.overflowX).toBe('auto');
      expect(table.tableDisplay).toBe('table');
      expect(table.figureScrollWidth).toBeGreaterThanOrEqual(table.figureClientWidth);
      expect(table.tableWidth).toBeGreaterThanOrEqual(table.figureClientWidth - 1);
    }
  });
}
