import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

for (const touch of [false, true]) {
  test.describe(`theme cycle with ${touch ? 'touch' : 'keyboard'}`, () => {
    test.use({ viewport: { width: touch ? 390 : 1440, height: 900 }, hasTouch: touch });
    test('cycles system → light → dark → system with matching icons', async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/2026/en/');
      const button = page.getByRole('button', { name: /Appearance:/ });
      await expect(button).toHaveAttribute('data-theme-mode', 'system');
      await expect(button.locator('[data-theme-icon="system"]')).toBeVisible();
      for (const [mode, next, theme] of [
        ['light', 'Dark', 'light'],
        ['dark', 'System', 'dark'],
        ['system', 'Light', 'dark'],
      ]) {
        if (touch) await button.tap();
        else {
          await button.focus();
          await page.keyboard.press(mode === 'dark' ? 'Enter' : 'Space');
        }
        await expect(button).toHaveAttribute('data-theme-mode', mode);
        await expect(button).toHaveAccessibleName(new RegExp(`Switch to: ${next}$`));
        await expect(button.locator('[data-theme-icon]:visible')).toHaveCount(1);
        await expect(button.locator(`[data-theme-icon="${mode}"]`)).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute(
          'data-conference-theme',
          theme
        );
      }
    });
  });
}

test('system theme, saved choice, client navigation and archive isolation', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/2026/en/');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-conference-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(root).toHaveAttribute('data-conference-theme', 'light');
  await setTheme(page, 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(root).toHaveAttribute('data-conference-theme', 'dark');
  await page.locator('footer a[href="/2026/en/privacy-policy"]').click();
  await expect(page.locator('[data-policy-body]')).toBeVisible();
  await expect(root).toHaveAttribute('data-conference-theme', 'dark');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'data-theme-mode',
    'dark'
  );
  await page.reload();
  await expect(root).toHaveAttribute('data-conference-theme', 'dark');
  await page.goto('/2026/ja/about/');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'data-theme-mode',
    'dark'
  );
  await page.locator('footer a[href="/2024/"]').click();
  await expect(page).toHaveURL(/\/2024\/?$/);
  await expect(root).not.toHaveAttribute('data-conference-theme');
  await page.goBack();
  await expect(root).toHaveAttribute('data-conference-theme', 'dark');
  await setTheme(page, 'system');
  await expect(root).toHaveAttribute('data-conference-theme', 'light');
});

test('theme works without local storage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable');
    };
  });
  await page.goto('/2026/en/');
  await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
  await setTheme(page, 'light');
  await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'light');
  await page.locator('footer a[href="/2026/en/privacy-policy"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'light');
});

test('preference synchronizes across tabs and invalid storage falls back to system', async ({
  context,
  page,
}) => {
  await page.goto('/2026/en/');
  const other = await context.newPage();
  await other.goto('/2026/en/about/');
  await setTheme(page, 'dark');
  await expect(other.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
  await expect(other.locator('[data-theme-toggle]')).toHaveAttribute(
    'data-theme-mode',
    'dark'
  );
  await page.evaluate(() => localStorage.setItem('pyconhk-2026-theme', 'invalid'));
  await page.reload();
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'data-theme-mode',
    'system'
  );
});

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  test(`dark surfaces and responsive controls in ${locale}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.emulateMedia({ colorScheme: 'dark' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const route of [
      '',
      'about',
      'organizers',
      'volunteers',
      'supporting-organizations',
      'news',
      'schedule',
      'speakers/peter-ho/',
      'sponsorships/opportunities',
      'privacy-policy',
      'code-of-conduct',
      'code-of-conduct/attendee-reporting',
      'code-of-conduct/staff-procedures',
      'cfp',
      'access-guide',
      'catering-guide',
      'sprint/qna',
    ]) {
      const response = await page.goto(`/2026/${locale}/${route}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute(
        'data-conference-theme',
        'dark'
      );
      await expect(page.locator('[data-conference-site]')).toHaveCSS(
        'background-color',
        'rgb(16, 24, 39)'
      );
      await expect(page.locator('main h1').first()).toBeVisible();
    }
    for (const width of [320, 390, 640, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const control of await page
        .locator('[data-theme-toggle], [data-mobile-nav-trigger]')
        .all()) {
        if (!(await control.isVisible())) continue;
        const bounds = await control.boundingBox();
        expect(bounds?.x).toBeGreaterThanOrEqual(0);
        expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
    await page.goto(`/2026/${locale}/schedule/`);
    await page
      .locator('[data-session-details]')
      .filter({ hasText: /vLLM/ })
      .first()
      .click();
    await expect(page.locator('#session-modal')).toBeVisible();
    await expect(page.locator('#session-modal')).toHaveCSS(
      'background-color',
      'rgb(27, 39, 59)'
    );
    await page.keyboard.press('Escape');
    await expect(page.locator('#session-modal')).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}
