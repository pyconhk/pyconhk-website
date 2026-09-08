import fs from 'node:fs';
import { expect, test } from '@playwright/test';

type LegacyArchivePage = {
  url: string;
};

type LegacyArchive = {
  pages: LegacyArchivePage[];
};

const archive = JSON.parse(
  fs.readFileSync(new URL('../data/archive.json', import.meta.url), 'utf8')
) as LegacyArchive;

const legacy2023Routes = [
  '/2023/',
  '/2023/page/2/',
  '/2023/photos/',
  ...archive.pages.map((page) => page.url),
];

const imageExtensions = /\.(?:gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/iu;
const imageUrlAttributePattern =
  /(?:src|href|poster|content)=["']([^"']+)["']|srcset=["']([^"']+)["']/giu;

test('legacy 2023 archive uses the captured WordPress shell', async ({ page }) => {
  await page.goto('/2023/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body.wp-theme-marketingly.archive')).toBeVisible();
  await expect(page.locator('.page-title')).toHaveText('Category: 2023');
  await expect(page.locator('#secondary .widget_archive')).toBeVisible();
});

test('legacy 2023 detail pages use event-owned speaker image routes', async ({
  page,
}, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? '');
  const sameOriginFailures: string[] = [];

  page.on('response', (response) => {
    const url = new URL(response.url());

    if (baseURL && url.origin === new URL(baseURL).origin && response.status() >= 400) {
      sameOriginFailures.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto('/2023/accelerating-networkx-fast-graph-analytics-with-python/', {
    waitUntil: 'networkidle',
  });

  const speakerImage = page.locator('.wp-post-image').first();

  await expect(page.locator('body.wp-theme-marketingly')).toBeVisible();
  await expect(page.locator('.entry-title')).toHaveText(
    'Accelerating NetworkX: Fast Graph Analytics with Python'
  );
  await expect(speakerImage).toBeVisible();
  await expect(speakerImage).toHaveAttribute(
    'src',
    '/2023/assets/uploads/2023/10/Erik-Welch-850x478.jpg'
  );
  await expect(speakerImage).toHaveAttribute(
    'srcset',
    expect.stringContaining('/2023/assets/uploads/2023/10/Erik-Welch-300x169.jpg')
  );

  const speakerImageSize = await speakerImage.evaluate((image) => ({
    height: (image as HTMLImageElement).naturalHeight,
    width: (image as HTMLImageElement).naturalWidth,
  }));

  expect(speakerImageSize.width).toBeGreaterThan(0);
  expect(speakerImageSize.height).toBeGreaterThan(0);
  expect(sameOriginFailures).toEqual([]);
});

test('legacy 2023 top-level photo route is normalized under the year', async ({
  page,
}) => {
  await page.goto('/2023/photos/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body.wp-theme-marketingly')).toBeVisible();
  await expect(page.locator('.entry-title')).toHaveText('PyCon HK 2023 Photos');
  await expect(page.locator('.wp-post-image').first()).toHaveAttribute(
    'src',
    '/2023/assets/uploads/2023/12/PyConHK-2023-02-850x567.jpg'
  );
});

test('legacy 2023 pagination routes first page to the year root', async ({ page }) => {
  await page.goto('/2023/page/2/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('a[href="/2023/page/1/"]')).toHaveCount(0);
  await expect(page.locator('a.prev.page-numbers')).toHaveAttribute('href', '/2023/');
});

test('legacy 2023 local images are available', async ({ request }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1');
  const localImageUrls = new Set<string>();

  for (const route of legacy2023Routes) {
    const pageResponse = await request.get(route);

    expect(pageResponse.status(), route).toBe(200);

    for (const url of collectLocalImageUrls(await pageResponse.text(), baseURL)) {
      localImageUrls.add(url);
    }
  }

  const imageFailures: string[] = [];

  for (const url of [...localImageUrls].sort()) {
    const response = await request.get(url);

    if (!response.ok()) {
      imageFailures.push(`${response.status()} ${url}`);
    }
  }

  expect(legacy2023Routes.length).toBeGreaterThan(40);
  expect(localImageUrls.size).toBeGreaterThan(120);
  expect([...localImageUrls]).toContain(
    '/2023/assets/uploads/2023/10/Erik-Welch-850x478.jpg'
  );
  expect(imageFailures).toEqual([]);
});

test('legacy 2023 same-year rendered links resolve locally', async ({
  request,
}, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1');
  const localLinks = new Set<string>();

  for (const route of legacy2023Routes) {
    const response = await request.get(route);
    const html = await response.text();

    for (const href of collectSameYearHrefs(html, route, baseURL)) {
      localLinks.add(href);
    }
  }

  const brokenLinks: string[] = [];

  for (const href of [...localLinks].sort()) {
    const response = await request.get(href);

    if (!response.ok()) {
      brokenLinks.push(`${response.status()} ${href}`);
    }
  }

  expect(localLinks.size).toBeGreaterThan(40);
  expect(brokenLinks).toEqual([]);
});

for (const route of legacy2023Routes) {
  test(`legacy 2023 page loads local assets: ${route}`, async ({ page }, testInfo) => {
    const baseOrigin = new URL(String(testInfo.project.use.baseURL)).origin;
    const sameOriginFailures: string[] = [];
    await page.route('**/*', (requestRoute) => {
      const url = new URL(requestRoute.request().url());
      return url.origin === baseOrigin ? requestRoute.continue() : requestRoute.abort();
    });
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.origin === baseOrigin && response.status() >= 400) {
        sameOriginFailures.push(`${response.status()} ${url.pathname}`);
      }
    });
    await page.goto(route, { waitUntil: 'networkidle' });
    expect([...new Set(sameOriginFailures)].sort()).toEqual([]);
  });
}

function collectLocalImageUrls(html: string, baseURL: string): string[] {
  const urls = new Set<string>();

  for (const match of html.matchAll(imageUrlAttributePattern)) {
    for (const candidate of collectImageCandidates(match[1] ?? match[2])) {
      const localUrl = localImageUrl(candidate, baseURL);

      if (localUrl) {
        urls.add(localUrl);
      }
    }
  }

  return [...urls];
}

function collectImageCandidates(value: string | undefined): string[] {
  if (!value || /^(?:about|data):/iu.test(value)) {
    return [];
  }

  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/u)[0])
    .filter(Boolean);
}

function localImageUrl(value: string, baseURL: string): string | undefined {
  const base = new URL(baseURL);
  const url = new URL(value, base);

  if (url.origin !== base.origin || !imageExtensions.test(url.pathname)) {
    return undefined;
  }

  return `${url.pathname}${url.search}`;
}

function collectSameYearHrefs(html: string, route: string, baseURL: string): string[] {
  const urls = new Set<string>();
  const base = new URL(baseURL);
  const pageUrl = new URL(route, base);

  for (const match of html.matchAll(/<a\b[^>]*\shref=(['"])(.*?)\1/giu)) {
    const rawHref = match[2].trim();

    if (
      !rawHref ||
      rawHref.startsWith('#') ||
      /^(?:javascript|mailto|tel):/iu.test(rawHref)
    ) {
      continue;
    }

    const url = new URL(rawHref, pageUrl);

    if (url.origin !== base.origin || !url.pathname.startsWith('/2023')) {
      continue;
    }

    url.hash = '';

    if (url.search) {
      continue;
    }

    urls.add(
      imageExtensions.test(url.pathname)
        ? url.pathname
        : `${url.pathname.replace(/\/$/u, '')}/`
    );
  }

  return [...urls];
}
