import { expect, test } from '@playwright/test';

const closedTalkCopy = {
  en: 'submissions have closed',
  'zh-hk': '已經截止',
  'zh-hant': '的徵集已截止',
  'zh-hans': '的征集已截止',
  ja: 'の募集は終了しました',
  ko: '모집은 마감되었습니다',
};

for (const [locale, closedCopy] of Object.entries(closedTalkCopy)) {
  test(`${locale}: only Poster and Sprint proposals remain open with current deadlines`, async ({
    page,
  }) => {
    await page.goto(`/2026/${locale}/cfp/`);
    const stage = page.locator('[data-cfp-stage="poster-sprint"]');
    await expect(stage).toBeVisible();
    await expect(stage).toContainText(closedCopy);
    await expect(stage).toContainText('30');
    await expect(stage).toContainText('15');
    await expect(stage).toContainText('5');
    await expect(page.locator('[data-cfp-closed]')).toHaveCount(0);
    await expect(page.locator('[data-cfp-format]')).toHaveCount(2);
    await expect(page.locator('[data-cfp-format="poster"]')).toBeVisible();
    await expect(page.locator('[data-cfp-format="sprint"]')).toBeVisible();

    for (const [kind, date] of [
      ['poster-deadline', '2026-11-01'],
      ['sprint-deadline', '2026-11-14'],
    ] as const) {
      const card = page.locator(`[data-cfp-date="${kind}"]`);
      await expect(card).toContainText(date);
      await expect(card).toContainText('23:59 HKT');
    }
    await expect(page.locator('[data-cfp-date="sprint-day"]')).toContainText(
      '2026-11-15'
    );
    await expect(page.locator('#key-dates')).toContainText(
      'Asia/Hong_Kong (HKT, UTC+8)'
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(2);
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
    ).toHaveCount(2);

    const staleDeadline = /June\s*20|6\s*月\s*20|6월\s*20/u;
    await expect(stage).not.toContainText(staleDeadline);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
      'content',
      staleDeadline
    );
  });
}
