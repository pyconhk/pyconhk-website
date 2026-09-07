import { expect, test } from '@playwright/test';

const locales = [
  { code: 'en', htmlLang: 'en' },
  { code: 'zh-hk', htmlLang: 'zh-Hant-HK' },
  { code: 'zh-hant', htmlLang: 'zh-Hant' },
  { code: 'zh-hans', htmlLang: 'zh-Hans' },
  { code: 'ja', htmlLang: 'ja-JP' },
  { code: 'ko', htmlLang: 'ko-KR' },
] as const;
const policies = [
  { route: 'privacy-policy', heading: 'PyCon Hong Kong Privacy Policy Statement' },
  { route: 'code-of-conduct', heading: 'Code of Conduct Overview' },
  { route: 'code-of-conduct/attendee-reporting', heading: 'Procedures for Reporting Incidents' },
  { route: 'code-of-conduct/staff-procedures', heading: 'Enforcement Procedures' },
] as const;

test.describe('2026 English policy content in localized site shells', () => {
  for (const policy of policies) {
    test(`keeps the same English ${policy.route} body across all locales`, async ({ page }) => {
      let englishBody = '';
      for (const locale of locales) {
        await page.goto(`/2026/${locale.code}/${policy.route}/`);
        await expect(page.getByRole('heading', { level: 1, name: policy.heading, exact: true })).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', locale.htmlLang);
        const body = page.locator('[data-policy-body]');
        await expect(body).toHaveAttribute('lang', 'en');
        const text = (await body.innerText()).replace(/\s+/g, ' ').trim();
        if (locale.code === 'en') englishBody = text;
        else expect(text).toBe(englishBody);
        await expect(page.locator('[data-site-header]')).toBeVisible();
        await expect(page.locator('[data-site-header] a[aria-label="PYCON HK 2026"]')).toHaveAttribute('href', `/2026/${locale.code}/`);
        for (const target of locales) {
          expect((await page.locator(`[data-locale-switch="${target.code}"]`).first().getAttribute('href'))?.replace(/\/$/, '')).toBe(`/2026/${target.code}/${policy.route}`);
        }
        for (const link of await body.locator('a[href^="/2026/"]').all()) {
          expect(await link.getAttribute('href')).toContain(`/2026/${locale.code}/`);
        }
      }
    });
  }

  test('language switching preserves policy page and English body', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/2026/en/privacy-policy/');
    const header = page.locator('[data-site-header]');
    await header.locator('summary').first().click();
    await header.locator('[data-locale-switch="zh-hk"]').first().click();
    await expect(page).toHaveURL(/\/2026\/zh-hk\/privacy-policy\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('PyCon Hong Kong Privacy Policy Statement');
    await expect(page.locator('[data-policy-body]')).toHaveAttribute('lang', 'en');
  });
});
