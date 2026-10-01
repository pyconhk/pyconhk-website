import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isSaveableSession,
  sessionCalendarUrl,
  sessionMatches,
  sessionsCalendarContent,
} from '../../years/2026/components/schedule/schedule-interactions.ts';
import type { ScheduleItem } from './types';

const generatedAt = new Date('2026-10-02T00:00:00Z');
const baseUrl = 'https://pycon.hk/2026/zh-hk/schedule/';

function session(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    id: 'FIRST',
    code: 'FIRST',
    title: 'Python in Hong Kong',
    speakers: ['Speaker One'],
    room: 'LT1',
    roomKey: 'lt1',
    track: 'Python',
    sessionType: 'Talk',
    date: '2026-11-14',
    start: '2026-11-14T10:00:00+08:00',
    end: '2026-11-14T10:30:00+08:00',
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    abstract: 'A public session.',
    description: '',
    language: 'en',
    url: 'https://pretalx.com/pyconhk2026/talk/FIRST/',
    isBreak: false,
    ...overrides,
  };
}

function unfold(content: string): string {
  return content.replaceAll(/\r\n[ \t]/g, '');
}

test('calendar export uses UTC instants for Hong Kong sessions and local detail links', () => {
  const content = sessionsCalendarContent(
    [session()],
    'pyconhk2026',
    baseUrl,
    generatedAt
  );
  assert.match(content, /DTSTART:20261114T020000Z\r\n/);
  assert.match(content, /DTEND:20261114T023000Z\r\n/);
  assert.match(content, /DTSTAMP:20261002T000000Z\r\n/);
  assert.match(content, /UID:pyconhk2026-FIRST@pycon.hk\r\n/);
  assert.match(
    unfold(content),
    /URL:https:\/\/pycon.hk\/2026\/zh-hk\/schedule\/\?session=FIRST\r\n/
  );
  assert.ok(content.endsWith('END:VCALENDAR\r\n'));
  assert.equal(content.replaceAll('\r\n', '').includes('\n'), false);
});

test('saved calendar covers both days once and excludes stage transitions', () => {
  const first = session();
  const second = session({
    id: 'SECOND',
    date: '2026-11-15',
    start: '2026-11-15T09:00:00+08:00',
    end: '2026-11-15T10:00:00+08:00',
  });
  const breakItem = session({
    id: 'BREAK',
    title: 'Stage changeover',
    isBreak: true,
  });
  const content = sessionsCalendarContent(
    [second, breakItem, first, first],
    'pyconhk2026',
    baseUrl,
    generatedAt
  );
  assert.equal(content.match(/BEGIN:VEVENT/g)?.length, 2);
  assert.ok(content.indexOf('FIRST@') < content.indexOf('SECOND@'));
  assert.match(content, /DTSTART:20261115T010000Z/);
  assert.doesNotMatch(content, /Stage changeover|BREAK@/);
  assert.equal(isSaveableSession(breakItem), false);
  assert.equal(
    sessionMatches(
      breakItem,
      {
        date: breakItem.date,
        query: '',
        room: '',
        language: '',
        savedOnly: true,
      },
      new Set(['BREAK'])
    ),
    false
  );
});

test('session UIDs survive rescheduling and locale changes but remain event specific', () => {
  const uid = (content: string) => content.match(/^UID:(.+)$/m)?.[1];
  const original = uid(sessionsCalendarContent([session()], 'pyconhk2026', baseUrl));
  const rescheduled = uid(
    sessionsCalendarContent(
      [session({ start: '2026-11-15T10:00:00+08:00' })],
      'pyconhk2026',
      'https://pycon.hk/2026/en/schedule/'
    )
  );
  assert.equal(original, rescheduled);
  assert.notEqual(
    original,
    uid(sessionsCalendarContent([session()], 'pyconhk2025', baseUrl))
  );
});

test('calendar text escapes control characters and folds Unicode by UTF-8 bytes', () => {
  const title = `${'香港 Python 社群 👩🏽‍💻 '.repeat(9)}\\,;\r\nEND:VEVENT`;
  const content = sessionsCalendarContent(
    [session({ title })],
    'pyconhk2026',
    baseUrl,
    generatedAt
  );
  for (const line of content.split('\r\n')) {
    assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
    assert.equal(Buffer.from(line).toString('utf8'), line);
  }
  const unfolded = unfold(content);
  assert.match(unfolded, /\\\\\\,\\;\\nEND:VEVENT/);
  assert.equal(unfolded.match(/^END:VEVENT$/gm)?.length, 1);
  assert.ok(unfolded.includes('香港 Python 社群 👩🏽‍💻 '.repeat(9)));
});

test('dates without timezone cannot silently inherit the exporting device timezone', () => {
  assert.throws(
    () =>
      sessionsCalendarContent(
        [session({ start: '2026-11-14T10:00:00' })],
        'pyconhk2026',
        baseUrl
      ),
    /must include a timezone/
  );
});

test('Google Calendar remains an optional correctly timed alternative', () => {
  const url = new URL(sessionCalendarUrl(session()));
  assert.equal(url.searchParams.get('ctz'), 'Asia/Hong_Kong');
  assert.equal(url.searchParams.get('dates'), '20261114T020000Z/20261114T023000Z');
});
