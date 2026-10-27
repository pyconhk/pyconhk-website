import { expect, test } from '@playwright/test';

const titles = {
  en: ['Job / Internship Matching Board', 'PyShare'],
  'zh-hk': ['工作／實習配對板', 'PyShare 心事台'],
  'zh-hant': ['工作／實習配對板', 'PyShare 心事台'],
  'zh-hans': ['工作／实习对接板', 'PyShare 心事台'],
  ja: ['求人・インターンシップ掲示板', 'PyShare'],
  ko: ['채용·인턴십 매칭 게시판', 'PyShare 이야기 게시판'],
};

for (const [locale, activityTitles] of Object.entries(titles)) {
  test(`Community activity guidance is available and fits mobile in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    for (const [index, activity] of ['job-board', 'pyshare'].entries()) {
      const response = await page.goto(`/2026/${locale}/${activity}/`);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(`${activityTitles[index]} | PyCon HK 2026`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        activityTitles[index]
      );
      const content = page.locator(`[data-community-activity="${activity}"]`);
      await expect(content).toBeVisible();
      await expect(
        content.locator('[data-activity-day], [data-activity-location]')
      ).toHaveCount(0);
      await expect(content.locator('[data-activity-instructions] > li')).toHaveCount(
        activity === 'pyshare' ? 4 : 2
      );
      if (activity === 'pyshare') {
        await expect(content.locator('ol')).toContainText('Blu Tack');
      }
      for (const route of ['schedule', 'code-of-conduct']) {
        await expect(
          content.locator(`a[href="/2026/${locale}/${route}/"]`)
        ).toHaveCount(1);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(320);
    }
  });
}

for (const width of [390, 1920]) {
  test(`Conference navigation opens both activities and preserves locale routes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of [
      ['job-board', 'Job Board'],
      ['pyshare', 'PyShare'],
    ]) {
      await page.goto('/2026/en/');
      if (width < 768) {
        await page.locator('[data-mobile-nav-trigger]').click();
        const drawer = page.locator('[data-mobile-nav-panel]');
        await drawer.getByText('Conference', { exact: true }).click();
        await drawer.getByRole('link', { name, exact: true }).click();
      } else {
        const navigation = page.getByRole('navigation', {
          name: 'Main Navigation',
          exact: true,
        });
        await navigation
          .getByRole('button', { name: 'Conference', exact: true })
          .hover();
        await navigation.getByRole('link', { name, exact: true }).click();
      }
      await expect(page).toHaveURL(new RegExp(`/2026/en/${route}/?$`));
      if (width < 768) {
        await page.locator('[data-mobile-nav-trigger]').click();
        await page
          .locator('[data-mobile-nav-panel] [data-locale-switch="zh-hant"]')
          .click();
      } else {
        const header = page.locator('[data-site-header]');
        await header.locator('summary').click();
        await header.locator('[data-locale-switch="zh-hant"]').click();
      }
      await expect(page).toHaveURL(new RegExp(`/2026/zh-hant/${route}/?$`));
      await expect(page.locator(`[data-community-activity="${route}"]`)).toBeVisible();
    }
  });
}
