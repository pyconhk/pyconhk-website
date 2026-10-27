import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const sponsorships = [
  [
    'open-home-foundation',
    'Platinum',
    'Open Home Foundation',
    'https://www.openhomefoundation.org/',
  ],
  ['databricks', 'Gold', 'Databricks', 'https://www.databricks.com/'],
  ['redhat', 'Gold', 'Red Hat', 'https://www.redhat.com/en'],
  ['navicat', 'Silver', 'Navicat', 'https://www.navicat.com/'],
  ['calomei-bronze', 'Bronze', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['jetbrains', 'Prize Sponsor', 'JetBrains', 'https://www.jetbrains.com/'],
  ['calomei-prize', 'Prize Sponsor', 'CaLoMei Studio', 'https://www.calomei.com/'],
  ['lihkg', 'Media Sponsor', 'LIHKG', 'https://lihkg.com/'],
  [
    'python-software-foundation',
    'Foundation Sponsor',
    'Python Software Foundation',
    'https://www.python.org/psf-landing/',
  ],
];
const introductionTiers = new Set(['Gold', 'Platinum', 'Diamond']);

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
      await expect(wall.locator('[data-sponsor-description]:visible')).toHaveCount(0);

      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        await expect(wall).toBeVisible();
        await expect(wall.locator('[data-sponsor-card]')).toHaveCount(
          sponsorships.length
        );
        await expect(wall.locator('[data-sponsor-trigger]')).toHaveCount(3);
        await expect(wall.locator('[data-sponsor-link]')).toHaveCount(6);
        expect(
          await wall
            .locator('[data-sponsor-tier]')
            .evaluateAll((tiers) =>
              tiers.map((tier) => tier.getAttribute('data-sponsor-tier'))
            )
        ).toEqual([
          'Platinum',
          'Gold',
          'Silver',
          'Bronze',
          'Prize Sponsor',
          'Media Sponsor',
          'Foundation Sponsor',
        ]);
        const logoSizes: Record<
          string,
          { width: number; height: number; artworkWidth: number; artworkHeight: number }
        > = {};
        for (const [id, tier, name, url] of sponsorships) {
          const hasIntroduction = introductionTiers.has(tier);
          const control = wall
            .locator(`[data-sponsor-tier="${tier}"]`)
            .getByRole(hasIntroduction ? 'button' : 'link', { name, exact: true });
          await control.scrollIntoViewIfNeeded();
          await expect(control).toBeVisible();
          if (hasIntroduction) {
            await expect(control).toHaveAttribute('data-sponsor-trigger', id);
            await expect(control).toHaveAttribute('aria-haspopup', 'dialog');
            await expect(control).not.toHaveAttribute('href');
          } else {
            await expect(control).toHaveAttribute('data-sponsor-link', id);
            await expect(control).toHaveAttribute('href', url);
            await expect(control).toHaveAttribute('target', '_blank');
            await expect(wall.locator(`[data-sponsor-dialog="${id}"]`)).toHaveCount(0);
          }
          await expect(control).toHaveCSS('cursor', 'pointer');
          const image = control.locator('img');
          await expect(image).toHaveAttribute(
            'src',
            id === 'python-software-foundation'
              ? '/2026/supporting-organizations/psf.webp'
              : `/2026/sponsors/${id.replace('calomei-bronze', 'calomei').replace('calomei-prize', 'calomei')}.svg`
          );
          await expect
            .poll(() =>
              image.evaluate(
                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
              )
            )
            .toBe(true);
          await expect(image).toHaveCSS('filter', 'none');
          await expect(image).toHaveCSS(
            'object-fit',
            id === 'python-software-foundation' ? 'cover' : 'contain'
          );
          await expect(image).toHaveCSS('object-position', '50% 50%');
          const box = await control.boundingBox();
          expect(box?.x).toBeGreaterThanOrEqual(0);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
          expect(box?.height).toBeGreaterThanOrEqual(44);
          const plate = await control.locator('[data-sponsor-plate]').boundingBox();
          expect(plate).not.toBeNull();
          if (!plate) throw new Error(`${name} has no visible logo plate`);
          expect(plate.width / plate.height).toBeGreaterThanOrEqual(1.85);
          expect(plate.width / plate.height).toBeLessThanOrEqual(1.95);
          const imageBox = await image.boundingBox();
          if (!imageBox) throw new Error(`${name} has no visible artwork bounds`);
          expect(imageBox.x).toBeGreaterThanOrEqual(plate.x);
          expect(imageBox.y).toBeGreaterThanOrEqual(plate.y);
          expect(imageBox.x + imageBox.width).toBeLessThanOrEqual(
            plate.x + plate.width
          );
          expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(
            plate.y + plate.height
          );
          expect(imageBox.x + imageBox.width / 2).toBeCloseTo(
            plate.x + plate.width / 2,
            0
          );
          expect(imageBox.y + imageBox.height / 2).toBeCloseTo(
            plate.y + plate.height / 2,
            0
          );
          const artwork = await image.evaluate((img: HTMLImageElement) => {
            const style = getComputedStyle(img);
            const bounds = img.getBoundingClientRect();
            const width =
              bounds.width -
              Number.parseFloat(style.paddingLeft) -
              Number.parseFloat(style.paddingRight);
            const height =
              bounds.height -
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
          const goldToSilver =
            logoSizes.databricks[dimension] / logoSizes.navicat[dimension];
          // The narrowest phone constrains the gold plate to the available
          // space; wider viewports retain the package's 7:6 size ratio.
          if (width >= 390) {
            expect(goldToSilver).toBeCloseTo(7 / 6, 2);
          } else {
            expect(goldToSilver).toBeGreaterThan(1);
            expect(goldToSilver).toBeLessThanOrEqual(7 / 6 + 0.01);
          }
          expect(
            logoSizes.navicat[dimension] / logoSizes['calomei-bronze'][dimension]
          ).toBeCloseTo(1.5, 2);
          for (const id of [
            'jetbrains',
            'calomei-prize',
            'lihkg',
            'python-software-foundation',
          ])
            expect(logoSizes[id][dimension]).toBeCloseTo(
              logoSizes['calomei-bronze'][dimension],
              0
            );
        }
        for (const dimension of ['artworkWidth', 'artworkHeight'] as const) {
          for (const id of ['calomei-prize', 'lihkg'])
            expect(
              logoSizes[id][dimension] / logoSizes['calomei-bronze'][dimension]
            ).toBeCloseTo(1, 2);
        }
        const prizeRow = wall.locator('[data-sponsor-tier="Prize Sponsor"] ul');
        const row = await prizeRow.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            width:
              element.clientWidth -
              Number.parseFloat(style.paddingLeft) -
              Number.parseFloat(style.paddingRight),
            gap: Number.parseFloat(style.columnGap),
          };
        });
        const prize = prizeRow.locator('li');
        const first = await prize.nth(0).boundingBox();
        const second = await prize.nth(1).boundingBox();
        if (!first || !second) throw new Error('Prize sponsors have no visible bounds');
        if (first.width + second.width + row.gap > row.width + 1) {
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

for (const [locale, language] of [
  ['en', /[a-z]{3}/i],
  ['zh-hk', /\p{Script=Han}/u],
  ['zh-hant', /\p{Script=Han}/u],
  ['zh-hans', /\p{Script=Han}/u],
  ['ja', /\p{Script=Hiragana}/u],
  ['ko', /\p{Script=Hangul}/u],
] as const) {
  test(`Gold and Platinum introductions open in dialogs on both ${locale} sponsor surfaces`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      `/2026/${locale}/#sponsors`,
      `/2026/${locale}/sponsorships/`,
    ]) {
      await page.goto(route);
      await expect(page.locator('[data-sponsor-dialog]')).toHaveCount(3);
      await expect(page.locator('[data-sponsor-description]:visible')).toHaveCount(0);
      for (const [id, , name, url] of sponsorships.filter(([, tier]) =>
        introductionTiers.has(tier)
      )) {
        const trigger = page.locator(`[data-sponsor-trigger="${id}"]`);
        await trigger.click();
        const dialog = page.getByRole('dialog', { name, exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('data-sponsor-dialog', id);
        await expect(dialog.getByRole('heading', { name, exact: true })).toBeVisible();
        // The adjacent heading names the brand; the duplicate logo is decorative.
        await expect(dialog.locator('img')).toHaveAttribute(
          'src',
          `/2026/sponsors/${id}.svg`
        );
        const description = dialog.locator('[data-sponsor-description]');
        await expect(description).toBeVisible();
        await expect(description).toContainText(language);
        await expect(description.locator('p').first()).not.toBeEmpty();
        await expect(dialog.locator('[data-sponsor-website]')).toHaveAttribute(
          'href',
          url
        );
        const bounds = await description.boundingBox();
        if (!bounds) throw new Error('Sponsor description has no visible bounds');
        expect(bounds.width).toBeGreaterThanOrEqual(280);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
        await dialog.locator('[data-sponsor-close]').click();
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();
      }
    }
  });
}

for (const [locale, foundation, fourYears, twoYears, sevenYears] of [
  [
    'en',
    'Foundation Sponsor',
    '4 consecutive years of support',
    '2 consecutive years of support',
    '7 years of support in total',
  ],
  ['zh-hk', '基金會贊助', '連續支持咗 4 年', '連續支持咗 2 年', '累計支持咗 7 年'],
  ['zh-hant', '基金會贊助', '連續支持 4 年', '連續支持 2 年', '累計支持 7 年'],
  ['zh-hans', '基金会赞助', '连续支持 4 年', '连续支持 2 年', '累计支持 7 年'],
  ['ja', '財団スポンサー', '4年連続のご支援', '2年連続のご支援', '通算7年のご支援'],
  ['ko', '재단 후원', '4년 연속 후원', '2년 연속 후원', '총 7년 후원'],
] as const) {
  test(`${locale}: sponsor recognition distinguishes consecutive and cumulative support`, async ({
    page,
  }) => {
    for (const route of [
      `/2026/${locale}/#sponsors`,
      `/2026/${locale}/sponsorships/`,
    ]) {
      await page.goto(route);
      await expect(page.locator('[data-sponsor-recognition]')).toHaveCount(5);
      for (const [id, label, kind] of [
        ['redhat', fourYears, 'consecutive'],
        ['navicat', twoYears, 'consecutive'],
        ['jetbrains', fourYears, 'consecutive'],
        ['lihkg', twoYears, 'consecutive'],
        ['python-software-foundation', sevenYears, 'cumulative'],
      ]) {
        const recognition = page.locator(`#sponsor-${id} [data-sponsor-recognition]`);
        await expect(recognition).toHaveText(label);
        await expect(recognition).toHaveAttribute('data-sponsor-recognition', kind);
      }
      const psf = page.locator('[data-sponsor-tier="Foundation Sponsor"]');
      await expect(
        psf.getByRole('heading', { name: foundation, exact: true })
      ).toBeVisible();
      await expect(
        psf.getByRole('link', { name: 'Python Software Foundation', exact: true })
      ).toHaveAttribute('href', 'https://www.python.org/psf-landing/');
      await expect(psf.locator('[data-sponsor-trigger]')).toHaveCount(0);
    }
    // Its new sponsor category does not remove the existing community credit.
    await page.goto(`/2026/${locale}/supporting-organizations/`);
    const communityCredit = page
      .locator('[data-conference-content="supporters"] article')
      .filter({
        has: page.getByRole('heading', {
          name: 'Python Software Foundation',
          exact: true,
        }),
      });
    await expect(communityCredit).toHaveCount(1);
    await expect(communityCredit.getByRole('link').first()).toHaveAttribute(
      'href',
      'https://www.python.org/psf-landing/'
    );
  });
}

for (const route of ['/2026/en/#sponsors', '/2026/en/sponsorships/']) {
  test(`${route}: Gold dialogs support keyboard close, focus return and official website navigation`, async ({
    page,
    context,
  }) => {
    // Isolate outbound navigation from the vendors' network availability.
    await context.route(/^https:\/\/www\.(databricks|redhat)\.com\//, (route) =>
      route.fulfill({ body: '<title>Sponsor website</title>' })
    );
    await page.goto(route);
    const pageUrl = page.url();
    for (const [id, , name, url] of sponsorships.filter(
      ([, tier]) => tier === 'Gold'
    )) {
      const trigger = page.getByRole('button', { name, exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator(`[data-sponsor-dialog="${id}"]`);
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeVisible();
      const website = dialog.locator('[data-sponsor-website]');
      await expect(website).toHaveAttribute('target', '_blank');
      await expect(website).toHaveAttribute('rel', /noopener/);
      await website.focus();
      const popupPromise = page.waitForEvent('popup');
      await page.keyboard.press('Enter');
      const popup = await popupPromise;
      await expect(popup).toHaveURL(url);
      await popup.close();
      await expect(page).toHaveURL(pageUrl);
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  });

  test(`${route}: lower-tier logos open their official websites directly`, async ({
    page,
    context,
  }) => {
    await context.route('https://www.navicat.com/**', (route) =>
      route.fulfill({ body: '<title>Navicat</title>' })
    );
    await page.goto(route);
    const pageUrl = page.url();
    const link = page.getByRole('link', { name: 'Navicat', exact: true });
    const popupPromise = page.waitForEvent('popup');
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL('https://www.navicat.com/');
    await expect(page.locator('[data-sponsor-dialog]:visible')).toHaveCount(0);
    await expect(page).toHaveURL(pageUrl);
    await popup.close();
  });
}
