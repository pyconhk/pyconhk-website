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

const legacy2022Routes = [
  '/2022/',
  '/2022/page/2/',
  '/2022/photos/',
  ...archive.pages.map((page) => page.url),
];

const imageExtensions = /\.(?:gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/iu;
const imageUrlAttributePattern =
  /(?:src|href|poster|content)=["']([^"']+)["']|srcset=["']([^"']+)["']/giu;

test('legacy 2022 archive uses the captured WordPress shell', async ({ page }) => {
  await page.goto('/2022/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body.wp-theme-marketingly.archive')).toBeVisible();
  await expect(page.locator('.page-title')).toHaveText('Category: 2022');
  await expect(page.locator('#secondary .widget_archive')).toBeVisible();
});

test('legacy 2022 detail pages use event-owned speaker image routes', async ({
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

  await page.goto('/2022/healthcare-by-a-pythonista/', {
    waitUntil: 'networkidle',
  });

  const speakerImage = page.locator('.wp-post-image').first();

  await expect(page.locator('body.wp-theme-marketingly')).toBeVisible();
  await expect(page.locator('.entry-title')).toHaveText('Healthcare by a Pythonista');
  await expect(speakerImage).toBeVisible();
  await expect(speakerImage).toHaveAttribute(
    'src',
    '/2022/assets/uploads/2022/10/Shilpa-Karkeraa-850x478.png'
  );
  await expect(speakerImage).toHaveAttribute(
    'srcset',
    expect.stringContaining('/2022/assets/uploads/2022/10/Shilpa-Karkeraa-300x169.png')
  );

  const speakerImageSize = await speakerImage.evaluate((image) => ({
    height: (image as HTMLImageElement).naturalHeight,
    width: (image as HTMLImageElement).naturalWidth,
  }));

  expect(speakerImageSize.width).toBeGreaterThan(0);
  expect(speakerImageSize.height).toBeGreaterThan(0);
  expect(sameOriginFailures).toEqual([]);
});

test('legacy 2022 top-level photo route is normalized under the year', async ({
  page,
}) => {
  await page.goto('/2022/photos/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body.wp-theme-marketingly')).toBeVisible();
  await expect(page.locator('.entry-title')).toHaveText('PyCon HK 2022 Photos');
  await expect(page.locator('.wp-post-image').first()).toHaveAttribute(
    'src',
    '/2022/assets/uploads/2022/11/PyConHK2022-01-850x567.jpg'
  );
});

test('legacy 2022 pagination routes first page to the year root', async ({ page }) => {
  await page.goto('/2022/page/2/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('a[href="/2022/page/1/"]')).toHaveCount(0);
  await expect(page.locator('a.prev.page-numbers')).toHaveAttribute('href', '/2022/');
});

test('legacy 2022 local images are available', async ({ request }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1');
  const localImageUrls = new Set<string>();

  for (const route of legacy2022Routes) {
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

  expect(legacy2022Routes.length).toBeGreaterThan(25);
  expect(localImageUrls.size).toBeGreaterThan(80);
  expect([...localImageUrls]).toContain(
    '/2022/assets/uploads/2022/10/Shilpa-Karkeraa-850x478.png'
  );
  expect(imageFailures).toEqual([]);
});

for (const route of legacy2022Routes) {
  test(`legacy 2022 page loads local assets: ${route}`, async ({ page }, testInfo) => {
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
