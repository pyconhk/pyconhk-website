import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const sponsorships = [
  ['navicat', 'Silver', 'Navicat', 'https://www.navicat.com/'],
  ['calomei-bronze', 'Bronze', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['jetbrains', 'Prize Sponsor', 'JetBrains', 'https://www.jetbrains.com/'],
  ['calomei-prize', 'Prize Sponsor', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['lihkg', 'Media Sponsor', 'LIHKG', 'https://lihkg.com/'],
];

for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
  test(`sponsor tiers and original logos remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/2026/zh-hk/#sponsors');
    expect(
      await page
        .locator('#news, #sponsors, #featured-speakers')
        .evaluateAll((elements) => elements.map((element) => element.id))
    ).toEqual(['news', 'sponsors', 'featured-speakers']);

    for (const surface of ['overview', 'details']) {
      if (surface === 'details') {
        const details = page.locator('[data-sponsors-details]');
        await expect(details).toHaveAttribute('href', '/2026/zh-hk/sponsorships/');
        await expect(details).toHaveCSS('cursor', 'pointer');
        await details.click();
        await expect(page).toHaveURL(/\/2026\/zh-hk\/sponsorships\/$/);
      }
      const wall =
        surface === 'overview'
          ? page.locator('[data-sponsor-overview] [data-sponsor-wall]')
          : page.locator('[data-sponsor-wall]');

      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        await expect(wall).toBeVisible();
        await expect(wall.locator('a')).toHaveCount(5);
        expect(
          await wall
            .locator('[data-sponsor-tier]')
            .evaluateAll((tiers) =>
              tiers.map((tier) => tier.getAttribute('data-sponsor-tier'))
            )
        ).toEqual(['Silver', 'Bronze', 'Prize Sponsor', 'Media Sponsor']);
        const logoSizes: Record<
          string,
          { width: number; height: number; artworkWidth: number; artworkHeight: number }
        > = {};
        for (const [id, tier, name, url] of sponsorships) {
          const link = wall
            .locator(`[data-sponsor-tier="${tier}"]`)
            .getByRole('link', { name, exact: true });
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('data-sponsor-link', id);
          await expect(link).toHaveAttribute(
            'href',
            surface === 'overview' ? `/2026/zh-hk/sponsorships/#sponsor-${id}` : url
          );
          if (surface === 'overview') {
            await expect(link).not.toHaveAttribute('target', '_blank');
          } else {
            await expect(link).toHaveAttribute('target', '_blank');
            await expect(wall.locator(`li#sponsor-${id}`)).toContainText(name);
          }
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
          const plate = await link.locator('[data-sponsor-plate]').boundingBox();
          expect(plate).not.toBeNull();
          if (!plate) throw new Error(`${name} has no visible logo plate`);
          expect(plate.width / plate.height).toBeGreaterThanOrEqual(1.85);
          expect(plate.width / plate.height).toBeLessThanOrEqual(1.95);
          const artwork = await image.evaluate((img: HTMLImageElement) => {
            const style = getComputedStyle(img);
            const width =
              img.clientWidth -
              Number.parseFloat(style.paddingLeft) -
              Number.parseFloat(style.paddingRight);
            const height =
              img.clientHeight -
              Number.parseFloat(style.paddingTop) -
              Number.parseFloat(style.paddingBottom);
            const scale = Math.min(
              width / img.naturalWidth,
              height / img.naturalHeight
            );
            return {
              artworkWidth: img.naturalWidth * scale,
              artworkHeight: img.naturalHeight * scale,
            };
          });
          logoSizes[id] = { width: plate.width, height: plate.height, ...artwork };
        }
        for (const dimension of ['width', 'height'] as const) {
          expect(logoSizes.navicat[dimension]).toBeGreaterThan(
            logoSizes['calomei-bronze'][dimension] + 1
          );
          for (const id of ['jetbrains', 'calomei-prize'])
            expect(logoSizes[id][dimension]).toBeCloseTo(
              logoSizes.navicat[dimension],
              0
            );
          expect(logoSizes.lihkg[dimension]).toBeCloseTo(
            logoSizes['calomei-bronze'][dimension],
            0
          );
        }
        expect(logoSizes['calomei-prize'].artworkWidth).toBeGreaterThan(
          logoSizes['calomei-bronze'].artworkWidth + 1
        );
        expect(logoSizes['calomei-prize'].artworkHeight).toBeGreaterThan(
          logoSizes['calomei-bronze'].artworkHeight + 1
        );
        const prize = wall.locator('[data-sponsor-tier="Prize Sponsor"] li');
        const first = await prize.nth(0).boundingBox();
        const second = await prize.nth(1).boundingBox();
        if (!first || !second) throw new Error('Prize sponsors have no visible bounds');
        if (width <= 640) {
          expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
        } else {
          expect(second.y).toBeCloseTo(first.y, 0);
          expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('a homepage sponsor logo opens its own details before opening the vendor with the keyboard', async ({
  page,
  context,
}) => {
  // Isolate the outbound navigation from the vendor's network availability.
  await context.route('https://www.navicat.com/**', (route) =>
    route.fulfill({ body: '<title>Navicat</title>' })
  );
  await page.goto('/2026/en/#sponsors');
  const overviewLink = page
    .locator('[data-sponsor-overview]')
    .getByRole('link', { name: 'Navicat', exact: true });
  await overviewLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/#sponsor-navicat$/);
  const sponsor = page.locator('li#sponsor-navicat');
  await expect(sponsor).toBeInViewport();
  const link = sponsor.getByRole('link', { name: 'Navicat', exact: true });
  await link.focus();
  await expect(link).toBeFocused();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://www.navicat.com/');
  await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/#sponsor-navicat$/);
  await popup.close();
});
