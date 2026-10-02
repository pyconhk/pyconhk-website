import { expect, test } from '@playwright/test';

const sample = process.env.PROGRAMME_SOURCE_EVENT === 'pyconhk2025';
const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];
const widths = [
  320, 360, 390, 639, 640, 767, 768, 1023, 1024, 1279, 1280, 1459, 1460, 1482, 1483,
  1535, 1536, 1920, 2560, 3440,
];

test.describe('responsive public programme', () => {
  test.skip(!sample, 'Requires the public 2025 sample build.');

  for (const locale of locales) {
    test(`${locale}: all rooms and controls fit across breakpoint boundaries`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/2026/${locale}/schedule`);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const programme = page.locator('.programme-scroll');
        // Account for browser scrollbars at the exact six-room fit boundary.
        const roomColumnsFit = await programme.evaluate((element) => {
          const style = getComputedStyle(
            element.querySelector('.programme-room-headings') ?? element
          );
          return (
            element.clientWidth -
              Number.parseFloat(style.paddingLeft) -
              Number.parseFloat(style.paddingRight) >=
            1408
          );
        });
        await expect(programme).toHaveAttribute(
          'data-room-layout',
          String(roomColumnsFit)
        );
        await expect(page.locator('[data-session-card]:visible')).toHaveCount(35);
        const geometry = await page.evaluate(() => {
          const programme = document.querySelector<HTMLElement>('.programme-scroll')!;
          const visible = [
            ...document.querySelectorAll<HTMLElement>(
              '[data-session-card], .programme-filters button, .programme-filters input, .programme-filters select, [data-export-saved]'
            ),
          ].filter((element) => element.getClientRects().length);
          return {
            documentFits: document.documentElement.scrollWidth <= innerWidth,
            fillsViewport:
              Math.abs(
                programme.getBoundingClientRect().width -
                  document.documentElement.clientWidth
              ) < 1,
            programmeFits: programme.scrollWidth <= programme.clientWidth + 1,
            roomLabelsMatchLayout: [
              ...programme.querySelectorAll<HTMLElement>('.programme-room'),
            ]
              .filter((element) => element.getClientRects().length)
              .every((element) =>
                programme.dataset.roomLayout === 'true'
                  ? element.getBoundingClientRect().width === 1
                  : element.getBoundingClientRect().width > 1
              ),
            allElementsFit: visible.every((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.x >= 0 &&
                box.right <= innerWidth &&
                element.scrollWidth <= element.clientWidth + 1
              );
            }),
            touchTargetsFit: [
              ...document.querySelectorAll<HTMLElement>(
                '[data-day], .programme-filters button, .programme-filters input, .programme-filters select, [data-save-session], [data-session-details], [data-export-saved]'
              ),
            ]
              .filter((element) => element.getClientRects().length)
              .every((element) => element.getBoundingClientRect().height >= 44),
            pointerCursors: [
              ...document.querySelectorAll<HTMLElement>(
                '[data-conference-site] :is(a[href], button, select, summary):not(:disabled):not([aria-disabled="true"])'
              ),
            ]
              .filter((element) => element.getClientRects().length)
              .every((element) => getComputedStyle(element).cursor === 'pointer'),
          };
        });
        expect(geometry, `${locale} at ${width}px`).toEqual({
          documentFits: true,
          fillsViewport: true,
          programmeFits: true,
          roomLabelsMatchLayout: true,
          allElementsFit: true,
          touchTargetsFit: true,
          pointerCursors: true,
        });
      }
      await page.locator('[data-room-filter]').selectOption('4654-track-b-lt-14');
      await expect(page.locator('.programme-scroll')).toHaveAttribute(
        'data-room-layout',
        'false'
      );
      expect(await page.locator('[data-session-card]:visible').count()).toBeGreaterThan(
        0
      );
      await page.locator('[data-clear-filters]').click();
      await expect(page.locator('.programme-scroll')).toHaveAttribute(
        'data-room-layout',
        'true'
      );
      await page.locator('[data-day="2025-10-12"]').click();
      await expect(page.locator('[data-programme-empty]')).toBeVisible();
      await expect(page.locator('.programme-scroll')).toBeHidden();
      expect(errors).toEqual([]);
    });

    test(`${locale}: track headings stay below navigation while scrolling room columns`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 900 });
      await page.goto(`/2026/${locale}/schedule`);
      const programme = page.locator('.programme-scroll');
      const headings = page.locator('.programme-room-headings');
      for (const width of [1920, 1536]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(programme).toHaveAttribute('data-room-layout', 'true');
        for (const top of [1100, 1700]) {
          await page.evaluate((y) => window.scrollTo(0, y), top);
          await expect
            .poll(async () =>
              headings.evaluate((element) => {
                const header = document
                  .querySelector('[data-site-header]')
                  ?.getBoundingClientRect();
                if (!header) throw new Error('Site navigation is missing');
                return Math.abs(element.getBoundingClientRect().top - header.bottom);
              })
            )
            .toBeLessThan(2);
          // The visible column heading stays above the scrolling cards, with an opaque background.
          expect(
            await headings.evaluate((element) => {
              const box = element.getBoundingClientRect();
              return element.contains(
                document.elementFromPoint(
                  box.left + box.width / 2,
                  box.top + box.height / 2
                )
              );
            })
          ).toBe(true);
        }
      }
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      expect(
        await headings.evaluate((element) => {
          const programme = element.parentElement;
          if (!programme) throw new Error('Programme is missing');
          return (
            element.getBoundingClientRect().bottom <=
            programme.getBoundingClientRect().bottom
          );
        })
      ).toBe(true);
      await page.locator('[data-room-filter]').selectOption('4654-track-b-lt-14');
      await expect(headings).toBeHidden();
      const roomLabel = page
        .locator('[data-session-card]:visible .programme-room')
        .first();
      expect(
        await roomLabel.evaluate((element) => element.getBoundingClientRect().width)
      ).toBeGreaterThan(1);
    });

    for (const viewport of [
      { width: 320, height: 568 },
      { width: 844, height: 390 },
    ]) {
      test(`${locale}: long session details remain usable at ${viewport.width}x${viewport.height}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/2026/${locale}/schedule`);
        await page.locator('[data-programme-search]').fill('Domain-Level');
        const details = page.locator(
          '[data-session-card]:visible [data-session-details]'
        );
        await details.click();
        const dialog = page.locator('#session-modal');
        await expect(dialog).toBeVisible();
        expect(
          await dialog
            .locator('button, a[href]')
            .evaluateAll((elements) =>
              elements.every(
                (element) => getComputedStyle(element).cursor === 'pointer'
              )
            )
        ).toBe(true);
        expect(
          await dialog.evaluate((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.top >= 0 &&
              box.bottom <= innerHeight &&
              box.left >= 0 &&
              box.right <= innerWidth &&
              element.scrollWidth <= element.clientWidth
            );
          })
        ).toBe(true);
        expect(
          await page.evaluate(() => getComputedStyle(document.documentElement).overflow)
        ).toBe('hidden');
        await page.locator('[data-modal-calendar]').scrollIntoViewIfNeeded();
        await expect(page.locator('[data-modal-calendar]')).toBeInViewport();
        await page.locator('[data-modal-save]').click();
        await expect(page.locator('[data-modal-save]')).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        const close = dialog.locator('form button');
        await expect(close).toBeInViewport();
        expect(
          await close.evaluate((button) => {
            const bounds = button.getBoundingClientRect();
            const heading = button.closest('.modal-heading')!.getBoundingClientRect();
            return bounds.top >= heading.top && bounds.bottom <= heading.bottom;
          })
        ).toBe(true);
        await close.click();
        await expect(dialog).toBeHidden();
        await expect(details).toBeFocused();
        await page.locator('[data-saved-filter]').click();
        await expect(page.locator('[data-session-card]:visible')).toHaveCount(1);
      });
    }
  }
});

test('programme rules span the viewport with aligned centered 95% content', async ({
  page,
}) => {
  await page.goto('/2026/en/schedule/');
  test.skip(
    (await page
      .locator('[data-programme-status]')
      .getAttribute('data-programme-status')) !== 'published',
    'Requires a published public programme.'
  );
  for (const width of [390, 768, 1440, 1920, 3440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const leftEdge = viewport * 0.025;
          const rightEdge = viewport * 0.975;
          const close = (a: number, b: number) => Math.abs(a - b) < 1;
          const visible = (element: HTMLElement) => element.getClientRects().length > 0;
          const intros = [
            ...document.querySelectorAll<HTMLElement>('.programme-intro'),
          ];
          const rows = [
            ...document.querySelectorAll<HTMLElement>(
              '.programme-scroll[data-room-layout="false"] .programme-slot, .programme-scroll[data-room-layout="true"] .programme-day, .programme-room-headings'
            ),
          ].filter(visible);
          return {
            introCentered: intros.every((element) => {
              const box = element.getBoundingClientRect();
              return close(box.left, leftEdge) && close(box.right, rightEdge);
            }),
            linesFullWidth: rows.every((element) => {
              const box = element.getBoundingClientRect();
              return (
                close(box.left, 0) &&
                close(box.right, viewport) &&
                Number.parseFloat(getComputedStyle(element).borderBottomWidth) > 0
              );
            }),
            contentAligned: rows.every((element) => {
              const box = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return (
                close(box.left + Number.parseFloat(style.paddingLeft), leftEdge) &&
                close(box.right - Number.parseFloat(style.paddingRight), rightEdge)
              );
            }),
            noHorizontalOverflow: document.documentElement.scrollWidth <= viewport,
          };
        })
      )
      .toEqual({
        introCentered: true,
        linesFullWidth: true,
        contentAligned: true,
        noHorizontalOverflow: true,
      });
  }
});

test('room timeline ends each card at its actual end and keeps speaker names compact', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/2026/en/schedule/');
  test.skip(
    (await page
      .locator('[data-programme-status]')
      .getAttribute('data-programme-status')) !== 'published',
    'Requires a published programme.'
  );
  await expect(page.locator('.programme-scroll')).toHaveAttribute(
    'data-room-layout',
    'true'
  );
  const geometry = await page.evaluate(() => {
    const payload = document.querySelector('#programme-data')?.textContent;
    if (!payload) throw new Error('Published programme data is missing');
    const { sessions } = JSON.parse(payload);
    const cards = [
      ...document.querySelectorAll<HTMLElement>('[data-session-card]'),
    ].filter((card) => card.getClientRects().length);
    const earliest = Math.min(
      ...cards.map((card) =>
        Date.parse(
          sessions.find(
            (session: { id: string }) => session.id === card.dataset.sessionCard
          ).start
        )
      )
    );
    const firstTop = Math.min(...cards.map((card) => card.getBoundingClientRect().top));
    return cards.map((card) => {
      const session = sessions.find(
        (session: { id: string }) => session.id === card.dataset.sessionCard
      );
      const box = card.getBoundingClientRect();
      const minute = 14;
      return {
        startError: Math.abs(
          box.top -
            firstTop -
            ((Date.parse(session.start) - earliest) / 60_000) * minute
        ),
        endError: Math.abs(
          box.bottom +
            8 -
            firstTop -
            ((Date.parse(session.end) - earliest) / 60_000) * minute
        ),
      };
    });
  });
  for (const card of geometry) {
    expect(card.startError).toBeLessThan(1);
    expect(card.endError).toBeLessThan(1);
  }
  const multiple = page
    .locator('[data-session-card]')
    .filter({ hasText: 'Kubernetes Isekai' });
  await page.setViewportSize({ width: 390, height: 844 });
  await multiple.scrollIntoViewIfNeeded();
  const speakers = multiple.locator('.programme-speakers');
  await expect(speakers.locator('[data-card-speaker-avatar]')).toHaveCount(3);
  const compact = await speakers.evaluate((element) => {
    const images = [...element.querySelectorAll('img')].map((image) =>
      image.getBoundingClientRect()
    );
    return (
      images.every((box) => box.top === images[0].top) &&
      images[1].left < images[0].right &&
      element.getBoundingClientRect().height < 65
    );
  });
  expect(compact).toBe(true);
  await multiple.locator('[data-session-details]').click();
  await expect(page.locator('#session-modal')).toBeVisible();
});
