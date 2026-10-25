import { expect, test } from '@playwright/test';

const questionIds = [
  'what-is-sprint',
  'what-happens',
  'sprint-vs-conference',
  'who-should-attend',
  'beginners',
  'preparation',
  'observe',
  'join-or-leave',
  'fee-and-registration',
  'project-eligibility',
  'sprint-leads',
  'project-list',
];

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  test(`Sprint introduction leads to usable local Q&A in ${locale}`, async ({
    page,
  }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`/2026/${locale}/sprint/`);
      expect(response?.status()).toBe(200);
      const sprint = page.locator('[data-conference-content="sprint"]');
      await expect(sprint).toBeVisible();
      await expect(sprint.locator('time')).toHaveAttribute('datetime', '2026-11-15');
      await expect(sprint).toContainText('10:00');
      await expect(sprint).toContainText('UTC+8');
      await expect(sprint).toContainText('HKIIT');
      await expect(sprint.locator('ul')).toHaveCount(0);
      const qaLink = sprint.locator('[data-sprint-qa-link]');
      await expect(qaLink).toHaveAttribute('href', `/2026/${locale}/sprint/qna/`);
      await qaLink.click();
      await expect(page).toHaveURL(new RegExp(`/2026/${locale}/sprint/qna/$`));
      const qa = page.locator('[data-conference-content="qa"]');
      const questions = qa.locator('article[data-sprint-question]');
      await expect(questions).toHaveCount(12);
      expect(
        await questions.evaluateAll((items) => items.map((item) => item.id))
      ).toEqual(questionIds);
      await expect(qa.locator('details, summary')).toHaveCount(0);
      await expect(page.locator('[data-content-pending]')).toHaveCount(0);
      for (const question of await questions.all()) {
        await expect(question.getByRole('heading', { level: 2 })).toBeVisible();
        await expect(question.locator('p')).toBeVisible();
        await expect(question.locator('p')).not.toHaveText('');
      }
      for (const [selector, href] of [
        [
          '[data-sprint-registration]',
          'https://www.eventbrite.hk/e/pycon-hk-2026-tickets-1998483131845',
        ],
        ['[data-sprint-proposal]', 'https://cfp.pycon.hk/pyconhk2026/cfp'],
      ]) {
        const link = qa.locator(selector);
        await expect(link).toHaveAttribute('href', href);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(link).not.toHaveText('');
      }
      await expect(qa.locator(`a[href="/2026/${locale}/sprint/"]`)).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
  });
}

test('Sprint explains collaboration rather than a taught workshop', async ({
  page,
}) => {
  await page.goto('/2026/en/sprint/');
  const sprint = page.locator('[data-conference-content="sprint"]');
  await expect(sprint).toContainText('not a taught workshop');
  await expect(sprint).toContainText('finalizing');
  await page.locator('[data-sprint-qa-link]').click();
  const qa = page.locator('[data-conference-content="qa"]');
  await expect(qa.locator('#what-is-sprint')).toContainText('not a taught workshop');
  await expect(qa.locator('#beginners')).toContainText('vary by project');
  await expect(qa.locator('#fee-and-registration')).toContainText('separate tickets');
  await expect(qa.locator('#preparation')).toContainText('laptop');
  await expect(qa.locator('#project-list')).toContainText('finalizing');
  await expect(qa.locator('#project-eligibility')).toContainText(
    '14 November 2026 at 23:59 Hong Kong time (UTC+8)'
  );
});
