import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const specialLegacySlugRedirects = [
  {
    path: '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83/',
    location:
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83',
    text: /廣東話香港Python社群聚會/u,
  },
  {
    path: '/2020-spring/廣東話香港python社群聚會/',
    location:
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83',
    text: /廣東話香港Python社群聚會/u,
  },
  {
    path: '/2020-spring/a-day-has-only-24%C2%B11-hours/',
    location: '/2020-spring/a-day-has-only-24%C2%B11-hours',
    text: /A Day Has Only 24±1 Hours/u,
  },
  {
    path: '/2020-spring/a-day-has-only-24±1-hours/',
    location: '/2020-spring/a-day-has-only-24%C2%B11-hours',
    text: /A Day Has Only 24±1 Hours/u,
  },
];
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/2020-spring-photos/',
    to: '/2020-spring/photos',
    title: 'PyCon HK 2020 Spring Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/conference-coverage/',
    to: '/2020-spring/conference-coverage',
    title: 'Conference Coverage | PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2020-fall-photos/',
    to: '/2020-fall/photos',
    title: 'PyCon HK 2020 Fall Photos - PyCon HK',
  },
];
const legacyArchiveSlashRedirectChecks = [
  {
    from: '/2020-spring/',
    to: '/2020-spring',
    title: /2020 Spring - PyCon HK/u,
    heading: 'Category: 2020 Spring',
    fontFamily: /Lato/u,
    mainBackground: 'rgb(238, 238, 238)',
  },
  {
    from: '/2020-fall/',
    to: '/2020-fall',
    title: /2020 Fall - PyCon HK/u,
    heading: 'Category: 2020 Fall',
    fontFamily: /Lato/u,
    mainBackground: 'rgb(238, 238, 238)',
  },
];
const legacyTitleSuffixChecks = [
  {
    path: '/2020-spring/opening-of-pycon-hk-2020-spring/',
    title: 'Opening of PyCon HK 2020 Spring - PyCon HK',
  },
  {
    path: '/2020-fall/mysql-speaks-at-pycon-hk/',
    title: 'MySQL speaks at PyCon HK - PyCon HK',
  },
];
const legacyArticlePresentationChecks = [
  {
    path: '/2020-spring/geospatial-data-processing-using-python/',
    heading: /Geospatial Data Processing using Python/u,
  },
  {
    path: '/2020-fall/2020-fall-schedule/',
    heading: /Schedule – PyCon HK 2020 Fall/u,
  },
];
const legacyMarketinglyMobileHeaderChecks = [
  {
    path: '/2020-spring/',
    heading: 'Category: 2020 Spring',
    maxHeaderHeight: 260,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-fall/',
    heading: 'Category: 2020 Fall',
    maxHeaderHeight: 260,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-spring/geospatial-data-processing-using-python/',
    heading: /Geospatial Data Processing using Python/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-fall/2020-fall-schedule/',
    heading: /Schedule – PyCon HK 2020 Fall/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
];
const marketinglyYearArchives = [
  {
    year: '2020',
    firstTitle: /PyCon HK 2020 Fall Photos/u,
    pageTwoFirstTitle: /The status of Python community/u,
    pageTwoCount: 21,
    pageThreeFirstTitle: /django-scim2: User provisioning at scale/u,
    pageThreeCount: 16,
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
    if ('heading' in check && check.heading) {
      const heading = page.getByRole('heading', { name: check.heading });

      await expect(heading).toBeVisible();
      if ('fontFamily' in check && check.fontFamily) {
        const fontFamily = await heading.evaluate(
          (element) => getComputedStyle(element).fontFamily
        );

        expect(fontFamily).toMatch(check.fontFamily);
      }
    }
    if ('mainBackground' in check && check.mainBackground) {
      const mainBackground = await page
        .locator('body')
        .evaluate((element) => getComputedStyle(element).backgroundColor);

      expect(mainBackground).toBe(check.mainBackground);
    }
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

    if ('pageThreeFirstTitle' in archive) {
      await expect(
        page.locator(`a.next.page-numbers[href="/${archive.year}/page/3/"]`)
      ).toBeVisible();

      const pageThreeResponse = await page.goto(`/${archive.year}/page/3/`);

      expect(pageThreeResponse?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 3`));
      await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
        archive.pageThreeCount
      );
      await expect(
        page.locator('article.posts-entry.blogposts-list').first()
      ).toContainText(archive.pageThreeFirstTitle);
      await expect(page.locator('span.page-numbers.current')).toHaveText('3');
      await expect(
        page.locator(`a.prev.page-numbers[href="/${archive.year}/page/2/"]`)
      ).toBeVisible();
    }
  });
}
