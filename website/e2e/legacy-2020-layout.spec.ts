import { expect, test } from '@playwright/test';
import { legacy2020Pages } from '../src/years/2020/data/pages';

const legacy2020EditionRoutes = legacy2020Pages
  .map((page) => page.route)
  .filter((route) => route.startsWith('/2020-spring/') || route.startsWith('/2020-fall/'));

const imageExtensions = /\.(?:gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/iu;
const imageUrlAttributePattern =
  /(?:src|href|poster|content)=["']([^"']+)["']|srcset=["']([^"']+)["']/giu;

test('legacy 2020 article links wrap inside the content column', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1229 });
  await page.goto('/2020-spring/unconference', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.entry-content')).toBeVisible();

  const overflowingLinks = await page.locator('.entry-content').evaluate((entry) => {
    const entryRight = entry.getBoundingClientRect().right;

    return [...entry.querySelectorAll('a')]
      .map((link) => {
        const rect = link.getBoundingClientRect();

        return {
          right: Math.round(rect.right),
          text: link.textContent?.trim() ?? '',
        };
      })
      .filter(({ right }) => right > Math.ceil(entryRight));
  });

  expect(overflowingLinks).toEqual([]);
});

test('legacy 2020 Spring post icons use bundled asset routes', async ({
  page,
}) => {
  await page.goto('/2020-spring/opening-of-pycon-hk-2020-spring', {
    waitUntil: 'domcontentloaded',
  });

  const iconHrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? '')
    );

  expect(iconHrefs).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^\/_astro\/cropped-icon-1-192x192\.[^.]+\.gif$/u),
      expect.stringMatching(/^\/_astro\/cropped-icon-1-180x180\.[^.]+\.gif$/u),
    ])
  );
  expect(iconHrefs).not.toEqual(
    expect.arrayContaining([expect.stringContaining('/wp-content/')])
  );
  expect(iconHrefs).not.toEqual(
    expect.arrayContaining([
      expect.stringContaining('/src/years/2020/assets/live'),
    ])
  );

  const featuredImage = page.locator('.wp-post-image').first();

  await expect(featuredImage).toBeVisible();

  const featuredImageSize = await featuredImage.evaluate((image) => ({
    height: image.naturalHeight,
    width: image.naturalWidth,
  }));

  expect(featuredImageSize.width).toBeGreaterThan(0);
  expect(featuredImageSize.height).toBeGreaterThan(0);
});

test('legacy 2020 Spring speaker images use local asset routes', async ({
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

  await page.goto('/2020-spring/graalpython-polyglot-applications-with-graalvm', {
    waitUntil: 'networkidle',
  });

  const speakerImage = page
    .locator('.entry-content img[src*="Amitpal-Dhillon"]')
    .first();

  await expect(speakerImage).toBeVisible();
  await expect(speakerImage).toHaveAttribute(
    'src',
    /^\/_astro\/Amitpal-Dhillon\.[^.]+\.jpg$/u
  );
  await expect(speakerImage).toHaveAttribute(
    'srcset',
    expect.stringMatching(/\/_astro\/Amitpal-Dhillon-150x150\.[^.]+\.jpg/u)
  );

  const speakerImageSize = await speakerImage.evaluate((image) => ({
    height: image.naturalHeight,
    width: image.naturalWidth,
  }));

  expect(speakerImageSize.width).toBeGreaterThan(0);
  expect(speakerImageSize.height).toBeGreaterThan(0);
  expect(sameOriginFailures).toEqual([]);
});

test('legacy 2020 uploads are served from event-owned routes', async ({
  request,
}) => {
  const response = await request.get('/2020/assets/uploads/2020/05/Dave-Glover.jpg');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/jpeg');
});

test('legacy 2020 Spring and Fall local images are available', async ({
  request,
}, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1');
  const localImageUrls = new Set<string>();

  for (const route of legacy2020EditionRoutes) {
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

  expect(localImageUrls.size).toBeGreaterThan(100);
  expect(imageFailures).toEqual([]);
});

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
