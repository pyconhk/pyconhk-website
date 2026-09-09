import { expect, test } from '@playwright/test';

const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];
const pendingRoutes = [
  'access-guide',
  'catering-guide',
  'sprint',
  'sprint/qna',
  'sponsorships',
  'sponsorships/patrons',
];

const publishedRoutes = [
  'about',
  'organizers',
  'supporting-organizations',
  'volunteers',
];

test('visible supporter artwork stays centered across layouts and themes', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/supporting-organizations/');
    for (const theme of ['light', 'dark']) {
      await page.locator('[data-theme-select]').first().selectOption(theme);
      await expect(page.locator('html')).toHaveAttribute(
        'data-conference-theme',
        theme
      );
      const logos = page.locator('[data-logo-frame] img');
      expect(await logos.count()).toBeGreaterThan(0);
      for (const logo of await logos.all()) {
        await logo.scrollIntoViewIfNeeded();
        const visible = await logo.evaluate(async (image: HTMLImageElement) => {
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas unavailable');
          context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let left = canvas.width;
          let top = canvas.height;
          let right = -1;
          let bottom = -1;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              // Inspect the clearly visible mark, independently of its CSS frame.
              if (pixels[(y * canvas.width + x) * 4 + 3] < 128) continue;
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          }
          const rect = image.getBoundingClientRect();
          const plateElement = image.closest('.organization-logo-plate');
          if (!plateElement) throw new Error('Logo plate missing');
          const plate = plateElement.getBoundingClientRect();
          const centerX = rect.x + ((left + right + 1) / 2 / canvas.width) * rect.width;
          const centerY =
            rect.y + ((top + bottom + 1) / 2 / canvas.height) * rect.height;
          return {
            name: image.alt,
            hasArtwork: right >= left,
            offsetX: Math.abs(centerX - (plate.x + plate.width / 2)),
            offsetY: Math.abs(centerY - (plate.y + plate.height / 2)),
          };
        });
        expect(visible.hasArtwork, visible.name).toBe(true);
        expect(visible.offsetX, `${visible.name}: ${width} ${theme}`).toBeLessThan(4);
        expect(visible.offsetY, `${visible.name}: ${width} ${theme}`).toBeLessThan(4);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
  }
});

test('wide supporter logos fill their plates and OSHK stays square', async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/supporting-organizations/');
    for (const file of ['aws_ug_hk.webp', 'hkace.webp']) {
      const logo = page.locator(`img[src$="${file}"]`);
      await logo.scrollIntoViewIfNeeded();
      await logo.evaluate((image: HTMLImageElement) => image.decode());
      const frame = await logo.locator('..').boundingBox();
      const plate = await logo.locator('../..').boundingBox();
      if (!frame || !plate) throw new Error(`Logo plate is missing: ${file}`);
      expect(frame.width).toBeGreaterThan(plate.width * 0.7);
      expect(frame.width / frame.height).toBeGreaterThan(2);
    }
    await page.goto('/2026/en/organizers/');
    const oshk = page.locator('img[src$="/oshk.webp"]');
    await oshk.scrollIntoViewIfNeeded();
    await oshk.evaluate((image: HTMLImageElement) => image.decode());
    expect(
      await oshk.evaluate(
        (image: HTMLImageElement) => image.naturalWidth / image.naturalHeight
      )
    ).toBe(1);
    const plate = await oshk.locator('..').boundingBox();
    if (!plate) throw new Error('OSHK logo plate is missing');
    expect(Math.abs(plate.width - plate.height)).toBeLessThan(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  }
});

test('every conference logo and placeholder has a transparent image background', async ({
  page,
}) => {
  const sources = new Set<string>([
    '/2026/logos/pyconlogo.png',
    '/2026/logos/pyconlogo.svg',
    '/2026/logos/horse-mark.svg',
    '/2026/logos/logo.png',
    '/2026/logos/logo2.png',
    '/2026/organizers-volunteers/volunteers/placeholder.webp',
  ]);
  for (const route of ['organizers', 'supporting-organizations']) {
    await page.goto(`/2026/en/${route}/`);
    for (const src of await page
      .locator('[data-conference-content] img')
      .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).src)))
      sources.add(src);
  }
  for (const src of sources) {
    const transparentPixels = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      const context = canvas.getContext('2d');
      if (!context)
        throw new Error('Canvas is unavailable for image transparency checks');
      context.drawImage(image, 0, 0, 64, 64);
      const pixels = context.getImageData(0, 0, 64, 64).data;
      return pixels.filter((alpha, index) => index % 4 === 3 && alpha === 0).length;
    }, src);
    expect(transparentPixels, src).toBeGreaterThan(64 * 64 * 0.1);
  }
});

test('unpublished conference details show pending content in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of pendingRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[data-content-pending]')).toBeVisible();
      await expect(page.locator('[data-conference-content]')).toHaveCount(0);
    }
  }
});

test('complete migrated conference content remains public in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of publishedRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-content-pending]')).toHaveCount(0);
      await expect(page.locator('[data-conference-content]')).toBeVisible();
    }

    const response = await page.goto(`/2026/${locale}/sponsorships/opportunities/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-content-pending]')).toHaveCount(0);
    await expect(page.locator('[data-published-sponsorship]')).toBeVisible();
  }
});

test('registration is pending and calendar uses the actual 2026 event dates', async ({
  page,
}) => {
  await page.goto('/2026/en/');
  await expect(page.locator('main [data-registration-pending]').first()).toBeVisible();
  await expect(page.locator('[data-registration-link]')).toHaveCount(0);
  const calendar = page.getByRole('link', { name: 'Add to calendar', exact: true });
  const href = new URL((await calendar.getAttribute('href')) ?? '');
  expect(href.hostname).toBe('calendar.google.com');
  expect(href.searchParams.get('dates')).toBe('20261114/20261116');
  expect(href.searchParams.get('ctz')).toBe('Asia/Hong_Kong');
  await expect(page.locator('[data-published-sponsors]')).toHaveCount(0);
  await expect(page.locator('[data-featured-speakers]')).toHaveCount(0);
});

test('mobile navigation opens a real access guide route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/');
  const menu = page.locator('[data-mobile-nav-trigger]');
  await menu.click();
  const mobileNav = page.locator('[data-mobile-nav-drawer]');
  await mobileNav.getByText('Conference', { exact: true }).click();
  await mobileNav.getByRole('link', { name: 'Access Guide', exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/en\/access-guide\/?$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Access Guide' })
  ).toBeVisible();
});

test('CFP is closed and uses the current conference theme in every locale', async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/2026/${locale}/cfp/`);
    await expect(page.locator('[data-cfp-closed]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ride and Leverage with AI'
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(0);
    await expect(
      page
        .locator('main a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
        .first()
    ).toBeVisible();
  }
});
