import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/2018-photos/',
    to: '/2018/photos',
    title: 'PyCon HK 2018 Photos - PyCon HK',
  },
];
const legacyTitleSuffixChecks = [
  {
    path: '/2018/schedule-2018/',
    title: 'Schedule 2018 - PyCon HK',
  },
  {
    path: '/2018/call-for-proposals-2018/',
    title: 'Call for Proposals 2018 - PyCon HK',
  },
];
const legacy2018FeaturedImageChecks = [
  '/2018/current-use-cases-for-machine-learning-in-the-industry/',
  '/2018/nosql-development-for-mysql-document-store-using-python/',
];
const legacy2018ContentQaChecks = [
  {
    path: '/2018/schedule-2018/',
    heading: 'Schedule 2018',
    minTables: 2,
    texts: [/23 November 2018, Friday/u, /Function Room 1-3/u],
  },
  {
    path: '/2018/sponsors-2018/',
    heading: 'Sponsors in 2018',
    minImages: 5,
    texts: [/Gold Sponsor – HK01/u, /Python Software Foundation/u],
  },
  {
    path: '/2018/organisers-and-partners-2018/',
    heading: 'Organisers and Partners 2018',
    minImages: 5,
    texts: [/Organisers/u, /Suppporting Organiastions/u],
  },
  {
    path: '/2018/ticket-pycon-hk-2018/',
    heading: 'Ticket – PyCon HK 2018',
    texts: [/Regular Ticket/u, /Financial Assistance program/u],
  },
  {
    path: '/2018/volunteers-2018/',
    heading: 'Volunteers 2018',
    texts: [/Conference Chair/u, /Session Hosts/u],
  },
  {
    path: '/2018/privacy-statement-2018/',
    heading: 'Privacy Statement 2018',
    texts: [/Microsoft’s privacy statement/u, /opt-out/u],
  },
];
const legacyCompatibilityAssetPaths = ['/wp-content/uploads/2018/11/Delon.png'];
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

for (const check of legacyTitleSuffixChecks) {
  test(`uses live legacy title suffix: ${check.path}`, async ({ page }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
  });
}

for (const path of legacy2018FeaturedImageChecks) {
  test(`preserves 2018 featured image aspect ratio: ${path}`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);

    const image = page.locator('.featured-thumbnail > img').first();

    await expect(image).toBeVisible();

    const metrics = await image.evaluate((element) => {
      const imageElement = element as HTMLImageElement;
      const box = imageElement.getBoundingClientRect();

      return {
        naturalRatio: imageElement.naturalWidth / imageElement.naturalHeight,
        objectFit: getComputedStyle(imageElement).objectFit,
        renderedRatio: box.width / box.height,
      };
    });

    expect(metrics.objectFit).not.toBe('cover');
    expect(Math.abs(metrics.renderedRatio - metrics.naturalRatio)).toBeLessThan(0.05);
  });
}

for (const check of legacy2018ContentQaChecks) {
  test(`keeps 2018 content QA page readable on mobile: ${check.path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: check.heading })).toBeVisible();
    for (const text of check.texts) {
      await expect(page.getByText(text).first()).toBeVisible();
    }

    if (check.minTables) {
      expect(await page.locator('.entry-content table').count()).toBeGreaterThanOrEqual(
        check.minTables
      );
    }

    if (check.minImages) {
      const images = page.locator('.entry-content img');

      expect(await images.count()).toBeGreaterThanOrEqual(check.minImages);
      const imageMetrics = await images.evaluateAll((elements) =>
        elements.map((element) => {
          const image = element as HTMLImageElement;

          return {
            complete: image.complete,
            naturalWidth: image.naturalWidth,
          };
        })
      );

      for (const image of imageMetrics) {
        expect(image.complete).toBe(true);
        expect(image.naturalWidth).toBeGreaterThan(0);
      }
    }

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );

    expect(horizontalOverflow).toBeLessThanOrEqual(4);
  });
}

test('preserves 2018 archive structure and pagination', async ({ page }) => {
  const response2018 = await page.goto('/2018/');

  expect(response2018?.status()).toBe(200);
  await expect(page).toHaveTitle(/2018 - PyCon HK/);
  await expect(page.getByRole('heading', { name: /Category:\s*2018/u })).toBeVisible();
  await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
  await expect(
    page.locator('article.posts-entry.blogposts-list').first()
  ).toContainText(/PyCon HK 2018 Photos/u);
  await expect(page.locator('#secondary .search-form')).toBeVisible();
  await expect(page.locator('#secondary .widget_archive')).toBeVisible();
  await expect(page.locator('a.next.page-numbers[href="/2018/page/2/"]')).toBeVisible();

  const pageTwoResponse = await page.goto('/2018/page/2/');

  expect(pageTwoResponse?.status()).toBe(200);
  await expect(page).toHaveTitle(/2018 - PyCon HK - Page 2/);
  await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(18);
  await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
    /Call for Proposals 2018/u
  );
  await expect(page.locator('span.page-numbers.current')).toHaveText('2');
  await expect(page.locator('a.prev.page-numbers[href="/2018/"]')).toBeVisible();
  await expect(
    page.locator('a.page-numbers[href="/2018/"]', { hasText: '1' })
  ).toBeVisible();

  const pageOne2018Response = await page.goto('/2018/page/1/');

  expect(pageOne2018Response?.status()).toBe(404);
  expect(page.url()).toContain('/2018/page/1');
});

for (const path of legacyCompatibilityAssetPaths) {
  test(`does not publish root WordPress asset URL: ${path}`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.status()).toBe(404);
  });
}
