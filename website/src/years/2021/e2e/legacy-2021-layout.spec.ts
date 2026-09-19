import { expect, test } from '@playwright/test';
import * as legacy2021Data from '../data/pages';

type Legacy2021RouteRecord = {
  path?: string;
  route?: string;
};

const dataExports = legacy2021Data as unknown as {
  legacy2021Pages?: Legacy2021RouteRecord[];
  legacyArchivePages?: Legacy2021RouteRecord[];
};
const legacy2021Routes = (
  dataExports.legacy2021Pages ??
  dataExports.legacyArchivePages ??
  []
)
  .map((page) => page.route ?? page.path ?? '')
  .filter((route) => route.startsWith('/2021/'));

const imageExtensions = /\.(?:gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/iu;
const imageUrlAttributePattern =
  /(?:src|href|poster|content)=["']([^"']+)["']|srcset=["']([^"']+)["']/giu;

test('legacy 2021 detail pages use the captured WordPress shell', async ({ page }) => {
  await page.goto('/2021/2021-schedule/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body.wp-theme-marketingly')).toBeVisible();
  await expect(page.locator('.entry-title')).toHaveText(
    'Schedule – PyCon Hong Kong 2021'
  );
  await expect(page.locator('#secondary .widget_archive')).toBeVisible();
});

test('legacy 2021 speaker images use event-owned routes', async ({
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

  await page.goto('/2021/mysql-operator-for-kubernetes/', {
    waitUntil: 'networkidle',
  });

  const speakerImage = page.locator('.wp-post-image').first();

  await expect(speakerImage).toBeVisible();
  await expect(speakerImage).toHaveAttribute(
    'src',
    '/2021/assets/uploads/2021/09/Ryan-Kuan-850x478.png'
  );
  await expect(speakerImage).toHaveAttribute(
    'srcset',
    expect.stringContaining('/2021/assets/uploads/2021/09/Ryan-Kuan-300x169.png')
  );

  const speakerImageSize = await speakerImage.evaluate((image) => ({
    height: (image as HTMLImageElement).naturalHeight,
    width: (image as HTMLImageElement).naturalWidth,
  }));

  expect(speakerImageSize.width).toBeGreaterThan(0);
  expect(speakerImageSize.height).toBeGreaterThan(0);
  expect(sameOriginFailures).toEqual([]);
});

test('legacy 2021 local images are available', async ({ request }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1');
  const localImageUrls = new Set<string>();

  for (const route of legacy2021Routes) {
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

  expect(legacy2021Routes.length).toBeGreaterThan(30);
  expect(localImageUrls.size).toBeGreaterThan(40);
  expect([...localImageUrls]).toContain(
    '/2021/assets/uploads/2021/09/Ryan-Kuan-850x478.png'
  );
  expect(imageFailures).toEqual([]);
});

for (const route of legacy2021Routes) {
  test(`legacy 2021 page loads local assets: ${route}`, async ({ page }, testInfo) => {
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
