import { expect, test } from '@playwright/test';

const localeTitles = {
  en: 'Lightning Talks',
  'zh-hk': '閃電演講',
  'zh-hant': '閃電演講',
  'zh-hans': '闪电演讲',
  ja: 'ライトニングトーク',
  ko: '라이트닝 토크',
};

for (const [locale, title] of Object.entries(localeTitles)) {
  test(`Lightning Talk guidance is localized and fits mobile in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const response = await page.goto(`/2026/${locale}/lightning-talks/`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(`${title} | PyCon HK 2026`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const content = page.locator('[data-lightning-talks]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-lightning-duration]')).toContainText('5');
    await expect(content.locator('#lightning-preparation')).toBeVisible();
    await expect(content.locator('ol li')).toHaveCount(3);
    const schedule = content.locator('[data-lightning-schedule]');
    await expect(schedule.locator('dt')).toHaveText([
      '09:00',
      '13:00',
      '14:30',
      '15:00',
      '16:30',
      '16:50–17:15',
    ]);
    await expect(schedule).toContainText('2026');
    await expect(schedule).toContainText('UTC+8');
    await expect(content.locator('[data-lightning-registration-window]')).toContainText(
      /09:00[–〜~]13:00/
    );
    const signup = content.locator('[data-lightning-registration]');
    await expect(signup).toBeVisible();
    await expect(signup).toHaveAttribute(
      'href',
      /^https:\/\/docs\.google\.com\/forms\/d\/(?:e\/)?[^/]+\/viewform(?:\?.*)?$/
    );
    await expect(signup).toHaveAttribute('target', '_blank');
    await expect(signup).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(content.locator('[data-lightning-registration-pending]')).toHaveCount(
      0
    );
    for (const route of ['schedule', 'code-of-conduct']) {
      await expect(content.locator(`a[href="/2026/${locale}/${route}/"]`)).toHaveCount(
        1
      );
    }
    await expect(content.locator('a[href^="/2025/"], a[href^="/2024/"]')).toHaveCount(
      0
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(320);
  });
}

for (const width of [390, 1920]) {
  test(`Conference navigation opens Lightning Talks and retains the route when switching language at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/');
    if (width < 768) {
      await page.locator('[data-mobile-nav-trigger]').click();
      const drawer = page.locator('[data-mobile-nav-panel]');
      await drawer.getByText('Conference', { exact: true }).click();
      await drawer.getByRole('link', { name: 'Lightning Talks', exact: true }).click();
    } else {
      const navigation = page.getByRole('navigation', {
        name: 'Main Navigation',
        exact: true,
      });
      await navigation.getByRole('button', { name: 'Conference', exact: true }).hover();
      await navigation
        .getByRole('link', { name: 'Lightning Talks', exact: true })
        .click();
    }
    await expect(page).toHaveURL(/\/2026\/en\/lightning-talks\/?$/);
    await expect(page.locator('[data-lightning-talks]')).toBeVisible();
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
    await expect(page).toHaveURL(/\/2026\/zh-hant\/lightning-talks\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('閃電演講');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  });
}
