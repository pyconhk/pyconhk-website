import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const marketingHeadings = {
  en: 'Marketing',
  'zh-hk': '市場推廣',
  'zh-hant': '市場推廣',
  'zh-hans': '市场推广',
  ja: 'マーケティング',
  ko: '마케팅',
};

const profiles = [
  ['Jackson Chan', 'https://www.linkedin.com/in/jacksonchanhongkong/'],
  ['Coby Lam', 'https://www.linkedin.com/in/shun-hang-lam-62097431b'],
  ['Sophia Wong', 'https://www.linkedin.com/in/sophia-wong-digital/'],
];

for (const [locale, heading] of Object.entries(marketingHeadings)) {
  test(`Marketing volunteers have their supplied photos and links in ${locale}`, async ({
    page,
  }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`/2026/${locale}/volunteers/`);
      expect(response?.status()).toBe(200);
      const group = page.locator('[data-volunteer-group]').filter({
        has: page.getByRole('heading', { name: heading, exact: true }),
      });
      await expect(group).toHaveCount(1);
      await expect(group.locator('[data-person-card]')).toHaveCount(3);
      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        for (const [name, url] of profiles) {
          const card = group.locator('[data-person-card]').filter({
            has: page.getByRole('heading', { name, exact: true }),
          });
          await expect(card).toHaveCount(1);
          const image = card.getByRole('img', { name, exact: true });
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element: HTMLImageElement) => element.decode());
          await expect(image).toBeVisible();
          const link = card.getByRole('link', { name: `LinkedIn profile of ${name}` });
          await expect(link).toHaveAttribute('href', url);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
        ).toBe(true);
      }
    }
  });
}

for (const locale of Object.keys(marketingHeadings)) {
  test(`Active volunteer roster is complete without invented portraits in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/2026/${locale}/volunteers/`);
    const roster = page.locator('[data-conference-content="people"]');
    await expect(roster.locator('[data-person-card]')).toHaveCount(65);
    const nameOnlyCards = roster.locator('[data-person-card][data-portrait="false"]');
    await expect(nameOnlyCards).toHaveCount(48);
    await expect(nameOnlyCards.locator('img')).toHaveCount(0);
    for (const name of [
      'Ronald (Hamsterthon)',
      'Ronald (OSHK)',
      'Brisson Lam',
      'Tim Tan',
      'Jared',
      'Rainbow Cheng',
      'Cyrus Wong',
      'CHEN Fengyi',
    ]) {
      await expect(roster.getByRole('heading', { name, exact: true })).toHaveCount(1);
    }
    for (const name of ['Clara Chan', 'Katrina', 'Magnus Law']) {
      await expect(roster.getByRole('heading', { name, exact: true })).toHaveCount(0);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  });
}
