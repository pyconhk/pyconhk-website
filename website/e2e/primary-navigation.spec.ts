import { expect, type Locator, test } from '@playwright/test';

async function highlightedLabels(links: Locator): Promise<string[]> {
  return links.evaluateAll((items) =>
    items
      .map((item) => {
        const backgroundColor = getComputedStyle(item).backgroundColor;

        return {
          highlighted:
            backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent',
          label: item.textContent?.trim() ?? '',
        };
      })
      .filter((item) => item.highlighted)
      .map((item) => item.label)
  );
}

test.describe('2025 primary navigation', () => {
  test('keeps navigation in English on Chinese content pages', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/2025/sprint/qna/zh-hk');

    const desktopNavigation = page.locator('[data-site-header] .hidden.items-center');

    await expect(page.getByRole('heading', { name: 'Sprint Q&A' })).toBeVisible();
    await expect(desktopNavigation).toContainText('News');
    await expect(desktopNavigation).toContainText('Conference');
    await expect(desktopNavigation).toContainText('Organizers');
    await expect(desktopNavigation).toContainText('Code of Conduct');
    await expect(desktopNavigation).not.toContainText('最新消息');
    await expect(desktopNavigation).not.toContainText('會議資訊');
    await expect(desktopNavigation).not.toContainText('籌辦團隊');
    const chineseQnaLink = desktopNavigation
      .locator('a[href="/2025/sprint/qna/zh-hk"]')
      .filter({ hasText: /^Sprint Q&A \(Chinese\)$/u });

    await expect(chineseQnaLink).toHaveText('Sprint Q&A (Chinese)');
  });

  test('keeps dropdown item highlighting scoped to the hovered or focused link', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/2025/sprint/qna/en');

    const sprintButton = page.getByRole('button', { name: /^Sprint$/u });
    const sprintGroup = page.locator('li.group.relative', { has: sprintButton });
    const sprintLinks = sprintGroup.locator('a');
    const sprintDayLink = sprintLinks.filter({ hasText: /^Sprint Day$/u });

    await expect(sprintLinks).toHaveCount(3);

    await sprintButton.click();
    await sprintButton.hover();
    await expect(sprintLinks.first()).toBeVisible();
    await expect.poll(() => highlightedLabels(sprintLinks)).toEqual([]);

    await sprintDayLink.hover();
    await expect.poll(() => highlightedLabels(sprintLinks)).toEqual(['Sprint Day']);

    await sprintButton.focus();
    await page.keyboard.press('Tab');
    await expect(sprintDayLink).toBeFocused();
    await expect.poll(() => highlightedLabels(sprintLinks)).toEqual(['Sprint Day']);
  });
});
