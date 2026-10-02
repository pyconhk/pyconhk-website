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
          const intro = element.closest('section')?.querySelector('.programme-intro');
          if (!intro) throw new Error('Programme content gutters are missing');
          return intro.getBoundingClientRect().width >= 1408;
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
            speakerContentFits: [
              ...programme.querySelectorAll<HTMLElement>('.programme-speakers'),
            ]
              .filter((element) => element.getClientRects().length)
              .every((element) => {
                const card = element.closest('article');
                return (
                  card &&
                  element.getBoundingClientRect().bottom <=
                    card.getBoundingClientRect().bottom - 8
                );
              }),
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
          speakerContentFits: true,
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

test('room layout remains stable around the readable column boundary', async ({
  page,
}) => {
  await page.goto('/2026/en/schedule/');
  test.skip(
    (await page
      .locator('[data-programme-status]')
      .getAttribute('data-programme-status')) !== 'published',
    'Requires a published programme.'
  );
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1408, 1440, 1459, 1460, 1482, 1483, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    const expected = await page.locator('.programme-scroll').evaluate((element) => {
      const rootSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const rooms = Number((element as HTMLElement).dataset.roomCount);
      const intro = element.closest('section')?.querySelector('.programme-intro');
      if (!intro) throw new Error('Programme content gutters are missing');
      return String(
        intro.getBoundingClientRect().width >=
          Math.max(1024, (4 + rooms * 14) * rootSize)
      );
    });
    await expect(page.locator('.programme-scroll')).toHaveAttribute(
      'data-room-layout',
      expected
    );
    const frames = await page.locator('.programme-scroll').evaluate(async (element) => {
      const states = [];
      for (let frame = 0; frame < 20; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        states.push({
          layout: (element as HTMLElement).dataset.roomLayout,
          height: element.getBoundingClientRect().height,
        });
      }
      return states;
    });
    expect(new Set(frames.map((frame) => frame.layout))).toEqual(new Set([expected]));
    expect(
      Math.max(...frames.map((frame) => frame.height)) -
        Math.min(...frames.map((frame) => frame.height))
    ).toBeLessThan(1);
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

test('compact room timeline shares boundaries without overlap and keeps speaker names compact', async ({
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
    const day = cards[0].closest('.programme-day') as HTMLElement;
    const rows = getComputedStyle(day)
      .gridTemplateRows.split(' ')
      .map(Number.parseFloat);
    const firstTop =
      day.getBoundingClientRect().top +
      Number.parseFloat(getComputedStyle(day).paddingTop);
    const boundary = (line: number) =>
      firstTop + rows.slice(0, line - 1).reduce((sum, height) => sum + height, 0);
    return cards.map((card) => {
      const session = sessions.find(
        (session: { id: string }) => session.id === card.dataset.sessionCard
      );
      const box = card.getBoundingClientRect();
      const start = Number(card.style.getPropertyValue('--start-line'));
      const end = Number(card.style.getPropertyValue('--end-line'));
      const sameRoom = cards.filter(
        (other) =>
          other !== card &&
          other.style.getPropertyValue('--room-column') ===
            card.style.getPropertyValue('--room-column')
      );
      return {
        startError: Math.abs(box.top - boundary(start)),
        endError: Math.abs(box.bottom + 8 - boundary(end)),
        contentFits: card.scrollHeight <= card.clientHeight + 1,
        ordinaryCompact: session.duration !== 30 || box.height < 400,
        noOverlap: sameRoom.every((other) => {
          const otherBox = other.getBoundingClientRect();
          return box.bottom <= otherBox.top + 1 || otherBox.bottom <= box.top + 1;
        }),
      };
    });
  });
  for (const card of geometry) {
    expect(card.startError).toBeLessThan(1);
    expect(card.endError).toBeLessThan(1);
    expect(card.contentFits).toBe(true);
    expect(card.ordinaryCompact).toBe(true);
    expect(card.noOverlap).toBe(true);
  }
  if (!sample) return;
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

test('half-hour guides align with compact boundaries behind cards and disappear on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/2026/en/schedule');
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
  const guides = page.locator('.programme-day:visible .programme-time-guide');
  expect(await guides.count()).toBeGreaterThan(1);
  const geometry = await guides.evaluateAll((elements) =>
    elements.map((element) => {
      const guide = element as HTMLElement;
      const day = guide.closest('.programme-day') as HTMLElement;
      const rows = getComputedStyle(day)
        .gridTemplateRows.split(' ')
        .map(Number.parseFloat);
      const line = Number(guide.style.getPropertyValue('--guide-line'));
      return {
        expectedTop:
          20 + rows.slice(0, line - 1).reduce((sum, height) => sum + height, 0),
        line,
        top: guide.getBoundingClientRect().top - day.getBoundingClientRect().top,
        width: guide.getBoundingClientRect().width,
        dayWidth: day.clientWidth,
        zIndex: getComputedStyle(guide).zIndex,
        label: guide.textContent?.trim(),
      };
    })
  );
  for (const guide of geometry) {
    expect(guide.top).toBeCloseTo(guide.expectedTop, 0);
    expect(guide.width).toBeCloseTo(guide.dayWidth * 0.95, 0);
    expect(guide.zIndex).toBe('-1');
  }
  expect(geometry.slice(1).every((guide) => /:(00|30)$/.test(guide.label ?? ''))).toBe(
    true
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.programme-scroll')).toHaveAttribute(
    'data-room-layout',
    'false'
  );
  await expect(page.locator('.programme-time-guide:visible')).toHaveCount(0);
  await expect(page.locator('.programme-time:visible').first()).toBeVisible();
});

for (const locale of locales) {
  test(`${locale}: published compact cards fit content and share room boundaries`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.goto(`/2026/${locale}/schedule`);
    test.skip(
      (await page
        .locator('[data-programme-status]')
        .getAttribute('data-programme-status')) !== 'published',
      'Requires a published programme.'
    );
    const programme = page.locator('.programme-scroll');
    await expect(programme).toHaveAttribute('data-room-layout', 'true');
    const geometry = await programme.evaluate((element) => {
      const cards = [
        ...element.querySelectorAll<HTMLElement>('[data-session-card]'),
      ].filter((card) => card.getClientRects().length);
      const guides = [
        ...element.querySelectorAll<HTMLElement>('.programme-time-guide'),
      ].filter((guide) => guide.getClientRects().length);
      return {
        contentFits: cards.every((card) => card.scrollHeight <= card.clientHeight + 1),
        orderedGuides: guides.every(
          (guide, index) =>
            index === 0 ||
            guide.getBoundingClientRect().top >
              guides[index - 1].getBoundingClientRect().top
        ),
        sameStartAligned: cards.every((card) =>
          cards
            .filter(
              (other) =>
                other.style.getPropertyValue('--start-line') ===
                card.style.getPropertyValue('--start-line')
            )
            .every(
              (other) =>
                Math.abs(
                  other.getBoundingClientRect().top - card.getBoundingClientRect().top
                ) < 1
            )
        ),
        noOverlap: cards.every((card) =>
          cards
            .filter(
              (other) =>
                other !== card &&
                other.style.getPropertyValue('--room-column') ===
                  card.style.getPropertyValue('--room-column')
            )
            .every((other) => {
              const a = card.getBoundingClientRect();
              const b = other.getBoundingClientRect();
              return a.bottom <= b.top + 1 || b.bottom <= a.top + 1;
            })
        ),
      };
    });
    expect(geometry).toEqual({
      contentFits: true,
      orderedGuides: true,
      sameStartAligned: true,
      noOverlap: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(programme).toHaveAttribute('data-room-layout', 'false');
    await expect(page.locator('.programme-time-guide:visible')).toHaveCount(0);
    expect(
      await programme.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1
      )
    ).toBe(true);
  });
}

test('filtering rebuilds the shared time axis and restores its scoped guide styles', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/2026/en/schedule');
  test.skip(
    (await page
      .locator('[data-programme-status]')
      .getAttribute('data-programme-status')) !== 'published',
    'Requires a published programme.'
  );
  const first = page.locator('[data-session-card]:visible').first();
  const title = await first.locator('h3').innerText();
  const search = page.locator('[data-programme-search]');
  await search.fill(title);
  await expect(page.locator('[data-session-card]:visible')).toHaveCount(1);
  expect(
    await page
      .locator('[data-session-card]:visible')
      .evaluate((card) => card.style.getPropertyValue('--start-line'))
  ).toBe('1');
  await search.fill('no-such-published-session-xyz');
  await expect(page.locator('.programme-scroll')).toBeHidden();
  await search.fill('');
  await expect(page.locator('.programme-scroll')).toBeVisible();
  const styles = await page
    .locator('.programme-day:visible .programme-time-guide')
    .evaluateAll((guides) =>
      guides.map((guide) => ({
        position: getComputedStyle(guide).position,
        height: guide.getBoundingClientRect().height,
        labelTransform: guide.querySelector('span')
          ? getComputedStyle(guide.querySelector('span') as HTMLElement).transform
          : 'none',
      }))
    );
  expect(styles.length).toBeGreaterThan(1);
  expect(
    styles.every(
      (style) =>
        style.position === 'absolute' &&
        style.height <= 2 &&
        style.labelTransform !== 'none'
    )
  ).toBe(true);
});
