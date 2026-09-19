import { expect, type Locator, test } from '@playwright/test';
import { setTheme } from './theme';

const sponsorships = [
  ['Silver', 'Navicat', 'https://www.navicat.com/'],
  ['Bronze', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['Prize Sponsor', 'JetBrains', 'https://www.jetbrains.com/'],
  ['Prize Sponsor', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['Media Sponsor', 'LIHKG', 'https://lihkg.com/'],
];

const scrollPosition = (viewport: Locator) =>
  viewport.evaluate((element) => element.scrollLeft);

async function expectStopped(viewport: Locator) {
  const position = await scrollPosition(viewport);
  let samples = 0;
  await expect
    .poll(
      async () => {
        expect(Math.abs((await scrollPosition(viewport)) - position)).toBeLessThan(1);
        return ++samples;
      },
      { intervals: [100] }
    )
    .toBeGreaterThanOrEqual(5);
}

async function expectMoving(viewport: Locator) {
  const position = await scrollPosition(viewport);
  await expect
    .poll(async () => Math.abs((await scrollPosition(viewport)) - position))
    .toBeGreaterThan(5);
}

for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
  test(`sponsor tiers and original logos remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/2026/zh-hk/#sponsors');
    const overview = page.locator('[data-sponsor-overview]');
    const brands = overview.locator('ul[data-published-sponsors]');
    expect(
      await page
        .locator('#news, #sponsors, #featured-speakers')
        .evaluateAll((elements) => elements.map((element) => element.id))
    ).toEqual(['news', 'sponsors', 'featured-speakers']);
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await expect(brands.locator('li')).toHaveCount(4);
      for (const name of ['Navicat', 'CaLoMei Studio', 'JetBrains', 'LIHKG']) {
        const image = brands.getByRole('img', { name, exact: true });
        await expect(image).toBeVisible();
        await expect(image).toHaveAttribute('src', /^\/2026\/sponsors\/.+\.svg$/);
        await expect(image).toHaveCSS('filter', 'none');
        await expect
          .poll(() =>
            image.evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
            )
          )
          .toBe(true);
      }
      await expect(brands.getByRole('link')).toHaveCount(0);
      const duplicate = overview.locator('ul[aria-hidden="true"]');
      await expect(duplicate).toHaveAttribute('inert', '');
      const section = page.locator('#sponsors');
      await expect(
        page.getByRole('region', { name: '贊助夥伴', exact: true })
      ).toHaveCount(1);
      const sectionBox = await section.boundingBox();
      expect(sectionBox?.height).toBeGreaterThan(100);
      expect(sectionBox?.height).toBeLessThan(500);
      const details = page.locator('[data-sponsors-details]');
      await expect(details).toHaveAttribute('href', '/2026/zh-hk/sponsorships/');
      await expect(details).toHaveCSS('cursor', 'pointer');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    }
    await page.locator('[data-sponsors-details]').click();
    await expect(page).toHaveURL(/\/2026\/zh-hk\/sponsorships\/$/);
    const wall = page.locator('[data-sponsor-wall]');
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await expect(wall).toBeVisible();
      await expect(wall.locator('a')).toHaveCount(5);
      for (const [tier, name, url] of sponsorships) {
        const link = wall
          .locator(`[data-sponsor-tier="${tier}"]`)
          .getByRole('link', { name, exact: true });
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', url);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveCSS('cursor', 'pointer');
        const image = link.locator('img');
        await expect(image).toHaveAttribute('src', /^\/2026\/sponsors\/.+\.svg$/);
        await expect
          .poll(() =>
            image.evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
            )
          )
          .toBe(true);
        await expect(image).toHaveCSS('filter', 'none');
        const box = await link.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(0);
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    }
    expect(errors).toEqual([]);
  });
}

test('the homepage overview leads to sponsor details before opening a vendor with the keyboard', async ({
  page,
  context,
}) => {
  // Isolate the outbound navigation from the vendor's network availability.
  await context.route('https://www.navicat.com/**', (route) =>
    route.fulfill({ body: '<title>Navicat</title>' })
  );
  await page.goto('/2026/en/#sponsors');
  const details = page.locator('[data-sponsors-details]');
  await details.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/$/);
  const link = page
    .locator('[data-sponsor-wall]')
    .getByRole('link', { name: 'Navicat', exact: true });
  await link.focus();
  await expect(link).toBeFocused();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://www.navicat.com/');
  await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/$/);
  await popup.close();
});

test('the sponsor carousel moves, pauses on hover and obeys its motion control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/2026/en/#sponsors');
  const viewport = page.locator('[data-sponsor-overview]');
  const motion = page.locator('[data-sponsor-motion]');
  await viewport.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await expectMoving(viewport);

  await viewport.hover();
  await expectStopped(viewport);
  await page.mouse.move(1, 1);
  await expectMoving(viewport);

  await expect(motion).toHaveAccessibleName('Pause sponsor carousel');
  await motion.click();
  await expect(motion).toHaveAccessibleName('Play sponsor carousel');
  await motion.evaluate((button: HTMLButtonElement) => button.blur());
  await page.mouse.move(1, 1);
  await expectStopped(viewport);

  await motion.click();
  await expect(motion).toHaveAccessibleName('Pause sponsor carousel');
  await motion.evaluate((button: HTMLButtonElement) => button.blur());
  await page.mouse.move(1, 1);
  await viewport.scrollIntoViewIfNeeded();
  await expectMoving(viewport);
});

test('reduced motion keeps the mobile carousel still and keyboard scrolling reveals sponsors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/2026/en/#sponsors');
  const viewport = page.locator('[data-sponsor-overview]');
  const brands = viewport.locator('ul[data-published-sponsors]');
  await viewport.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sponsor-motion]')).toHaveAccessibleName(
    'Play sponsor carousel'
  );
  await expectStopped(viewport);
  await expect(viewport).toHaveAttribute('tabindex', '0');
  await viewport.focus();
  const position = await scrollPosition(viewport);
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('ArrowRight');
  }
  await expect.poll(() => scrollPosition(viewport)).toBeGreaterThan(position + 50);

  const lastLogo = brands.getByRole('img', { name: 'LIHKG', exact: true });
  await lastLogo.scrollIntoViewIfNeeded();
  await expect(lastLogo).toBeInViewport();
  await expectStopped(viewport);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390);
});
