import { expect, test } from '@playwright/test';

// Check rendered lines after fonts load, rather than asserting CSS declarations.
for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  for (const width of [320, 390, 1080]) {
    test(`${locale} text fits at ${width}px without splitting heading words`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        'about',
        'organizers',
        'supporting-organizations',
        'sponsorships/opportunities',
        'code-of-conduct/staff-procedures',
      ]) {
        const response = await page.goto(`/2026/${locale}/${route}/`);
        expect(response?.status(), route).toBe(200);
        await page.evaluate(() => document.fonts.ready);
        const failures = await page.evaluate(() => {
          const failures: string[] = [];
          if (document.documentElement.scrollWidth > innerWidth + 1)
            failures.push('page overflow');
          for (const element of document.querySelectorAll<HTMLElement>(
            'main h1, main dt, main dd'
          )) {
            if (!element.getClientRects().length) continue;
            if (element.scrollWidth > element.clientWidth + 2)
              failures.push(`overflow: ${element.textContent}`);
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const node = walker.currentNode;
              if (node.parentElement?.closest('[aria-hidden="true"], .sr-only'))
                continue;
              if (!element.matches('h1')) continue;
              for (const match of (node.textContent ?? '').matchAll(/[A-Za-z]{6,}/g)) {
                const range = document.createRange();
                range.setStart(node, match.index);
                range.setEnd(node, match.index + match[0].length);
                const lines = new Set(
                  [...range.getClientRects()]
                    .filter((rect) => rect.width > 0)
                    .map((rect) => Math.round(rect.y))
                );
                if (lines.size > 1) failures.push(`split word: ${match[0]}`);
              }
            }
          }
          return failures;
        });
        expect(failures, route).toEqual([]);
      }
    });
  }
}

test('Korean paragraphs preserve words on narrow screens', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/ko/about/');
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.locator('main p').evaluateAll((elements) => {
      const broken: string[] = [];
      for (const element of elements) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (const match of (node.textContent ?? '').matchAll(/[가-힣]{2,}/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            if (
              new Set([...range.getClientRects()].map((rect) => Math.round(rect.y)))
                .size > 1
            )
              broken.push(match[0]);
          }
        }
      }
      return broken;
    });
    expect(broken).toEqual([]);
  }
});

test('mixed-language session titles keep Latin words intact in the Korean UI', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/2026/ko/speakers/dr-adrian-tam/');
  await page.evaluate(() => document.fonts.ready);
  const title = page
    .locator('[data-speaker-session]')
    .filter({ hasText: 'How AI Tools Changed' });
  await expect(title).toBeVisible();
  const lines = await title.evaluate((element) => {
    const node = element.firstChild;
    if (!node?.textContent) throw new Error('Session title missing');
    const start = node.textContent.indexOf('Python');
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + 'Python'.length);
    return new Set([...range.getClientRects()].map((rect) => Math.round(rect.y))).size;
  });
  expect(lines).toBe(1);
});

test('Japanese homepage introduction keeps its closing conference word together', async ({
  page,
}) => {
  for (const width of [320, 390, 1080]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/ja/');
    await page.evaluate(() => document.fonts.ready);
    const lines = await page.locator('[data-balanced-copy]').evaluate((element) => {
      const node = element.firstChild;
      if (!node?.textContent) throw new Error('Introduction missing');
      const word = 'カンファレンス';
      const start = node.textContent.indexOf(word);
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + word.length);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.y)))
        .size;
    });
    expect(lines, `${width}px`).toBe(1);
  }
});
