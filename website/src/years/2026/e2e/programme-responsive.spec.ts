import { expect, test } from '@playwright/test';

const sample = process.env.PROGRAMME_SOURCE_EVENT === 'pyconhk2025';
const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];
const widths = [
  320, 360, 390, 639, 640, 767, 768, 1023, 1024, 1279, 1280, 1459, 1460, 1535, 1536,
  1920,
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
        const roomColumnsFit = await programme.evaluate(
          (element) => element.clientWidth >= 1412
        );
        await expect(programme).toHaveAttribute(
          'data-room-layout',
          String(roomColumnsFit)
        );
        await expect(page.locator('[data-session-card]:visible')).toHaveCount(35);
        const geometry = await page.evaluate(() => {
          const programme = document.querySelector<HTMLElement>('.programme-scroll')!;
          const visible = [
            ...document.querySelectorAll<HTMLElement>(
              '[data-session-card], .programme-filters button, .programme-filters input, .programme-filters select'
            ),
          ].filter((element) => element.getClientRects().length);
          return {
            documentFits: document.documentElement.scrollWidth <= innerWidth,
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
                '[data-day], .programme-filters button, .programme-filters input, .programme-filters select, [data-save-session], [data-session-details]'
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
      for (const width of [1920, 1460]) {
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
