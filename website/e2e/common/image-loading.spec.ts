import { expect, test } from '@playwright/test';

for (const year of [2025, 2026]) {
  for (const width of [390, 1440]) {
    for (const theme of year === 2026 ? ['light', 'dark'] : ['light']) {
      test(`image skeleton ${year} ${width}px ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
        let release = () => {};
        const imagesReady = new Promise<void>((resolve) => {
          release = resolve;
        });
        await page.route('**/*', async (route) => {
          if (route.request().resourceType() === 'image') await imagesReady;
          await route.continue();
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(year === 2025 ? '/2025/volunteers' : '/2026/en/volunteers/', {
            waitUntil: 'domcontentloaded',
          });
          await expect(page.locator('main h1')).toContainText('Volunteers');
          await page.evaluate(() => document.fonts.ready);
          const portrait = page.locator('main img').first();
          await portrait.scrollIntoViewIfNeeded();
          await expect(portrait).toHaveAttribute('data-image-loading', '');
          await expect(portrait).toHaveCSS('animation-name', 'image-loading-shimmer');
          await expect(portrait).toHaveCSS(
            'background-color',
            theme === 'dark' ? 'rgb(41, 56, 77)' : 'rgb(226, 232, 240)'
          );
          const before = await portrait.boundingBox();
          release();
          await expect(portrait).not.toHaveAttribute('data-image-loading');
          await expect
            .poll(() =>
              portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)
            )
            .toBeGreaterThan(0);
          await expect(portrait).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
          expect(await portrait.boundingBox()).toEqual(before);
          expect(errors).toEqual([]);
        } finally {
          release();
        }
      });
    }
  }
}

test('image errors clear the skeleton and source replacements can load again', async ({
  page,
}) => {
  await page.goto('/2026/en/volunteers/');
  const image = page.locator('main img').first();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
    .toBeGreaterThan(0);
  const original = await image.evaluate((node: HTMLImageElement) => node.src);
  let release = () => {};
  const failed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/skeleton-missing-image.webp', async (route) => {
    await failed;
    await route.abort();
  });
  try {
    await image.evaluate((node: HTMLImageElement) => {
      node.src = '/skeleton-missing-image.webp';
    });
    await expect(image).toHaveAttribute('data-image-loading', '');
    release();
    await expect(image).not.toHaveAttribute('data-image-loading');
    await expect(image).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await image.evaluate((node: HTMLImageElement, src) => {
      node.src = src;
    }, original);
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).not.toHaveAttribute('data-image-loading');
  } finally {
    release();
  }
});

test('skeleton respects reduced motion and still works after cross-year navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/2026/en/');
  let release = () => {};
  const imagesReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/2025/**', async (route) => {
    if (route.request().resourceType() === 'image') await imagesReady;
    await route.continue();
  });
  try {
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: '2025', exact: true })
      .click();
    await expect(page).toHaveTitle('PyCon HK 2025');
    const image = page.locator('main img').first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('data-image-loading', '');
    await expect(image).toHaveCSS('animation-name', 'none');
    release();
    await expect(image).not.toHaveAttribute('data-image-loading');
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
  } finally {
    release();
  }
});

test('images remain visible with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/2026/en/');
    const image = page.locator('main img').first();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator('img[data-image-loading]')).toHaveCount(0);
  } finally {
    await context.close();
  }
});
