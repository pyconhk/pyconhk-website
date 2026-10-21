import { expect, test } from '@playwright/test';
import type { ProgrammeSnapshot } from '../../../lib/programme/types';

function calendarPath(locale: string, ids: string[]): string {
  const query = new URLSearchParams();
  for (const id of ids) query.append('session', id);
  return `/2026/${locale}/schedule/calendar.ics?${query}`;
}

function utc(value: string): string {
  return new Date(value).toISOString().replaceAll(/[-:]|\.\d{3}/g, '');
}

function events(content: string): string[] {
  return (
    content.replaceAll(/\r\n[ \t]/g, '').match(/BEGIN:VEVENT\r\n[\s\S]*?END:VEVENT/g) ??
    []
  );
}

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  test(`calendar app links contain selected sessions and locale links for ${locale}`, async ({
    request,
    baseURL,
  }) => {
    const snapshotResponse = await request.get('/programme-snapshot.json');
    expect(snapshotResponse.status()).toBe(200);
    const snapshot: ProgrammeSnapshot = await snapshotResponse.json();
    const selected = snapshot.sessions
      .filter((session) => !session.isBreak)
      .slice(0, 2);
    test.skip(selected.length < 2, 'Requires two published sessions.');
    const ids = selected.map((session) => session.id);
    const path = calendarPath(locale, ids);
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(
      /^text\/calendar;\s*charset=utf-8$/i
    );
    expect(response.headers()['content-disposition']).toMatch(/^inline;.*\.ics/);
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    const content = await response.text();
    expect(content).not.toMatch(/^METHOD:/m);
    expect(content.replaceAll('\r\n', '')).not.toContain('\n');
    for (const line of content.split('\r\n'))
      expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    const calendarEvents = events(content);
    expect(calendarEvents).toHaveLength(selected.length);
    for (const session of selected) {
      const entry = calendarEvents.find((event) =>
        event.includes(`UID:${snapshot.event}-${session.id}@pycon.hk\r\n`)
      );
      expect(entry).toBeDefined();
      expect(entry).toContain(`DTSTART:${utc(session.start)}\r\n`);
      expect(entry).toContain(`DTEND:${utc(session.end)}\r\n`);
      expect(entry).toContain(
        `URL:${baseURL}/2026/${locale}/schedule/?session=${encodeURIComponent(session.id)}\r\n`
      );
    }
    expect(await (await request.get(path)).text()).toBe(content);
    const head = await request.head(path);
    expect(head.status()).toBe(200);
    expect(head.headers()['content-type']).toBe(response.headers()['content-type']);
    expect(head.headers()['content-disposition']).toBe(
      response.headers()['content-disposition']
    );
    expect(await head.body()).toHaveLength(0);
  });
}

test('calendar selection excludes breaks and retired IDs without exporting other sessions', async ({
  request,
}) => {
  const snapshot: ProgrammeSnapshot = await (
    await request.get('/programme-snapshot.json')
  ).json();
  const session = snapshot.sessions.find((item) => !item.isBreak);
  test.skip(!session, 'Requires a published session.');
  if (!session) return;
  const breakItem = snapshot.sessions.find((item) => item.isBreak);
  const ids = [
    session.id,
    session.id,
    'retired-session',
    ...(breakItem ? [breakItem.id] : []),
  ];
  const response = await request.get(calendarPath('en', ids));
  expect(response.status()).toBe(200);
  expect(events(await response.text())).toHaveLength(1);
  const retired = await request.get(calendarPath('en', ['retired-session']));
  expect(retired.status()).toBe(404);
  expect(retired.headers()['content-type']).not.toContain('text/calendar');
  expect(await retired.text()).not.toContain('BEGIN:VCALENDAR');
});

test('calendar rejects malformed or oversized selections and unsupported locales', async ({
  request,
}) => {
  for (const path of [
    calendarPath('en', []),
    calendarPath('en', ['bad\r\nBEGIN:VEVENT']),
    calendarPath(
      'en',
      Array.from({ length: 201 }, (_, index) => `selection-${index}`)
    ),
  ]) {
    expect((await request.get(path)).status(), path).toBe(400);
  }
  expect((await request.get(calendarPath('invalid', ['session']))).status()).toBe(404);
});

test('all published talks fit in one Google Calendar import file', async ({
  request,
}) => {
  const snapshot: ProgrammeSnapshot = await (
    await request.get('/programme-snapshot.json')
  ).json();
  const selected = snapshot.sessions.filter((session) => !session.isBreak);
  test.skip(selected.length === 0, 'Requires published sessions.');
  const response = await request.get(
    calendarPath(
      'en',
      selected.map((session) => session.id)
    )
  );
  expect(response.status()).toBe(200);
  const bytes = await response.body();
  expect(bytes.length).toBeLessThanOrEqual(1_000_000);
  expect(events(bytes.toString('utf8'))).toHaveLength(selected.length);
});
