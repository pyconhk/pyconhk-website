import { expect, type Locator, type Page, test } from '@playwright/test';
import type { ScheduleItem } from '../../../lib/programme/types';

type Programme = { sessions: ScheduleItem[]; event: string };

async function openProgramme(page: Page, locale = 'en'): Promise<Programme> {
  await page.goto(`/2026/${locale}/schedule/`);
  test.skip(
    (await page
      .locator('[data-programme-status]')
      .getAttribute('data-programme-status')) !== 'published',
    'Requires a published public programme.'
  );
  return JSON.parse((await page.locator('#programme-data').textContent()) ?? '{}');
}

function sessionCard(page: Page, session: ScheduleItem): Locator {
  return page.locator(`[data-session-card=${JSON.stringify(session.id)}]`);
}

async function showSession(page: Page, session: ScheduleItem): Promise<Locator> {
  await page.locator(`[data-day=${JSON.stringify(session.date)}]`).click();
  return sessionCard(page, session);
}

async function calendarDownload(page: Page, trigger: Locator): Promise<string> {
  const downloaded = page.waitForEvent('download');
  await trigger.click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/\.ics$/);
  expect(await download.failure()).toBeNull();
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream ?? []) chunks.push(Buffer.from(chunk));
  // Unfold RFC 5545 content lines before checking long names and links.
  return Buffer.concat(chunks)
    .toString('utf8')
    .replace(/\r\n[ \t]/g, '');
}

function compactUtc(value: string): string {
  return new Date(value).toISOString().replaceAll(/[-:]|\.\d{3}/g, '');
}

function expectCalendarSessions(
  calendar: string,
  sessions: ScheduleItem[],
  programmeEvent: string
): void {
  expect(calendar).toContain('BEGIN:VCALENDAR\r\n');
  expect(calendar).toContain('VERSION:2.0\r\n');
  const events = calendar.match(/BEGIN:VEVENT\r\n[\s\S]*?END:VEVENT/g) ?? [];
  expect(events).toHaveLength(sessions.length);
  const uids: string[] = [];
  for (const session of sessions) {
    const uid = `${encodeURIComponent(programmeEvent)}-${encodeURIComponent(session.id)}@pycon.hk`;
    const event = events.find((value) => value.includes(`UID:${uid}\r\n`));
    expect(event, `Calendar entry for ${session.title}`).toBeDefined();
    expect(event).toContain(`DTSTART:${compactUtc(session.start)}\r\n`);
    expect(event).toContain(`DTEND:${compactUtc(session.end)}\r\n`);
    expect(event).toMatch(/URL:https?:\/\/[^\r\n]+\/2026\/en\/schedule\/\?session=/);
    uids.push(event?.match(/^UID:(.+)$/m)?.[1]?.trim() ?? '');
  }
  expect(uids.every(Boolean)).toBe(true);
  expect(new Set(uids).size).toBe(sessions.length);
}

for (const width of [390, 1440]) {
  test(`speaker portraits, star bookmarks and portable calendars work at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const programme = await openProgramme(page);
    const sessions = programme.sessions.filter((session) => !session.isBreak);
    const first = sessions.find((session) =>
      session.speakerProfiles?.some((speaker) => speaker.avatar)
    );
    expect(first, 'Published programme includes a speaker portrait').toBeDefined();
    if (!first) return;
    const second =
      sessions.find((session) => session.date !== first.date) ??
      sessions.find((session) => session.id !== first.id);
    expect(second, 'At least two sessions exercise bulk export').toBeDefined();
    if (!second) return;

    const exportSaved = page.locator('[data-export-saved]');
    await expect(exportSaved).toBeDisabled();
    const firstCard = await showSession(page, first);
    await expect(firstCard).toHaveAttribute('data-session-kind', 'session');
    const portrait = firstCard.locator('img[data-card-speaker-avatar]').first();
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute('src', /^\/(?!\/)/);
    await expect
      .poll(() =>
        portrait.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
        )
      )
      .toBe(true);

    const star = firstCard.locator('[data-save-session]');
    await expect(star).toHaveAccessibleName(/session/i);
    await expect(star.locator('svg')).toHaveCount(1);
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await star.click();
    await expect(star).toHaveAttribute('aria-pressed', 'true');
    await expect(star.locator('svg')).toHaveCount(1);
    await expect(page.locator('#session-modal')).not.toBeVisible();
    await expect(page.locator('[data-saved-count]')).toHaveText('1');

    await firstCard.locator('[data-session-details]').click();
    await expect(page.locator('#session-modal')).toBeVisible();
    const close = page.locator('[data-modal-close]');
    await expect(close).toHaveAccessibleName('Close');
    await expect(close.locator('svg')).toHaveCount(1);
    const single = await calendarDownload(page, page.locator('[data-modal-calendar]'));
    expectCalendarSessions(single, [first], programme.event);
    const google = new URL(
      (await page.locator('[data-modal-google-calendar]').getAttribute('href')) ?? ''
    );
    expect(google.searchParams.get('ctz')).toBe('Asia/Hong_Kong');
    expect(google.searchParams.get('dates')).toBe(
      `${compactUtc(first.start)}/${compactUtc(first.end)}`
    );
    await close.click();
    await expect(page.locator('#session-modal')).not.toBeVisible();
    await expect(firstCard.locator('[data-session-details]')).toBeFocused();

    const secondCard = await showSession(page, second);
    await secondCard.locator('[data-save-session]').click();
    await expect(page.locator('[data-saved-count]')).toHaveText('2');
    await page.reload();
    await expect(page.locator('[data-saved-count]')).toHaveText('2');
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '[]'),
        `pyconhk-programme-${programme.event}`
      )
    ).toEqual(expect.arrayContaining([first.id, second.id]));

    // Export keeps selections across days and even when search hides every card.
    await page
      .locator('[data-programme-search]')
      .fill('no-session-matches-this-search');
    await expect(page.locator('[data-session-card]:visible')).toHaveCount(0);
    await expect(exportSaved).toBeEnabled();
    const combined = await calendarDownload(page, exportSaved);
    expectCalendarSessions(combined, [first, second], programme.event);

    await page.locator('[data-clear-filters]').click();
    const savedFilter = page.locator('[data-saved-filter]');
    await savedFilter.click();
    await showSession(page, first);
    await firstCard.locator('[data-session-details]').click();
    await page.locator('[data-modal-save]').click();
    await expect(page.locator('[data-modal-save]')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await expect(firstCard).not.toBeVisible();
    await close.click();
    await expect(page.locator('#session-modal')).not.toBeVisible();
    await expect(savedFilter).toBeFocused();
    await expect(page.locator('[data-saved-count]')).toHaveText('1');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('breaks remain timetable information and stale break bookmarks are removed', async ({
  page,
}) => {
  const programme = await openProgramme(page);
  const breaks = programme.sessions.filter((session) => session.isBreak);
  test.skip(breaks.length === 0, 'This public release contains no break slots.');
  const session = programme.sessions.find((item) => !item.isBreak);
  expect(session).toBeDefined();
  if (!session) return;
  const key = `pyconhk-programme-${programme.event}`;
  await page.evaluate(
    ({ storageKey, ids }) => localStorage.setItem(storageKey, JSON.stringify(ids)),
    {
      storageKey: key,
      ids: [session.id, ...breaks.map((item) => item.id), 'removed-session'],
    }
  );
  await page.reload();
  await expect(page.locator('[data-saved-count]')).toHaveText('1');
  expect(
    await page.evaluate(
      (storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? '[]'),
      key
    )
  ).toEqual([session.id]);
  for (const item of breaks) {
    const card = sessionCard(page, item);
    await expect(card).toHaveAttribute('data-session-kind', 'break');
    await expect(card.locator('button, a, [role="button"]')).toHaveCount(0);
  }
  const firstBreak = await showSession(page, breaks[0]);
  await firstBreak.click();
  await expect(page.locator('#session-modal')).not.toBeVisible();
  await page.locator('[data-saved-filter]').click();
  await expect(page.locator('[data-session-kind="break"]:visible')).toHaveCount(0);
  const calendar = await calendarDownload(page, page.locator('[data-export-saved]'));
  expectCalendarSessions(calendar, [session], programme.event);
  await page.goto(`/2026/en/schedule/?session=${encodeURIComponent(breaks[0].id)}`);
  await expect(page.locator('#session-modal')).not.toBeVisible();
});

test('mobile calendar export still works when browser storage is blocked', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const programme = await openProgramme(page);
  const session = programme.sessions.find((item) => !item.isBreak);
  expect(session).toBeDefined();
  if (!session) return;
  const card = await showSession(page, session);
  await card.locator('[data-save-session]').click();
  await expect(page.locator('[data-saved-count]')).toHaveText('1');
  const calendar = await calendarDownload(page, page.locator('[data-export-saved]'));
  expectCalendarSessions(calendar, [session], programme.event);
  await card.locator('[data-save-session]').click();
  await expect(page.locator('[data-saved-count]')).toHaveText('0');
  await expect(page.locator('[data-export-saved]')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('Cantonese modal uses a standard accessible close icon', async ({ page }) => {
  const programme = await openProgramme(page, 'zh-hk');
  const session = programme.sessions.find((item) => !item.isBreak);
  expect(session).toBeDefined();
  if (!session) return;
  const card = await showSession(page, session);
  await card.locator('[data-session-details]').click();
  const close = page.locator('[data-modal-close]');
  await expect(close).toHaveAccessibleName('關閉');
  await expect(close.locator('svg')).toHaveCount(1);
  await close.click();
  await expect(page.locator('#session-modal')).not.toBeVisible();
});
