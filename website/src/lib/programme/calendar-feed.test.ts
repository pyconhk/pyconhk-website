import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../../../functions/2026/[locale]/schedule/calendar.ics.ts';
import { snapshotHash } from './snapshot.ts';
import type { ProgrammeSnapshot, ScheduleItem } from './types';

const sourceUrl = 'https://pretalx.com/api/events/pyconhk2026/schedules/latest/';

function session(
  id = 'room-main-42',
  overrides: Partial<ScheduleItem> = {}
): ScheduleItem {
  return {
    id,
    code: 'TALK',
    title: 'A public talk',
    speakers: ['Speaker One'],
    room: 'Main Hall',
    roomKey: 'room-main',
    track: 'Python',
    sessionType: 'Talk',
    date: '2026-11-14',
    start: '2026-11-14T02:00:00.000Z',
    end: '2026-11-14T02:30:00.000Z',
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    abstract: 'Public abstract.',
    description: '',
    language: 'en',
    url: 'https://pretalx.com/pyconhk2026/talk/TALK/',
    isBreak: false,
    ...overrides,
  };
}

function snapshot(sessions = [session()]): ProgrammeSnapshot {
  const value: ProgrammeSnapshot = {
    formatVersion: 1,
    event: 'pyconhk2026',
    environment: 'production',
    status: 'published',
    sourceUrl,
    sourceVersion: '0.6',
    title: 'PyCon HK 2026',
    timezone: 'Asia/Hong_Kong',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    days: [{ date: '2026-11-14' }, { date: '2026-11-15' }],
    rooms: [
      ...new Map(
        sessions.map((item) => [item.roomKey, { id: item.roomKey, name: item.room }])
      ).values(),
    ],
    sessions,
    fetchedAt: '2026-10-21T03:17:09.994Z',
    hash: '',
  };
  return { ...value, hash: snapshotHash(value) };
}

async function feed(
  query = '',
  value: unknown = snapshot(),
  { method = 'GET', locale = 'en', assetStatus = 200 } = {}
) {
  const requests: Request[] = [];
  const response = await onRequest({
    request: new Request(
      `https://pycon.hk/2026/${locale}/schedule/calendar.ics${query}`,
      { method }
    ),
    params: { locale },
    env: {
      ASSETS: {
        fetch: async (request) => {
          requests.push(request);
          return Response.json(value, { status: assetStatus });
        },
      },
    },
  });
  return { response, requests, content: await response.text() };
}

test('GET serves only selected public sessions from the deployed snapshot with stable timestamps', async () => {
  const value = snapshot([
    session(),
    session('room-main-43', { title: 'Unselected talk' }),
    session('room-main-44', { isBreak: true, title: 'Break' }),
  ]);
  const result = await feed(
    '?session=room-main-42&session=room-main-42&session=room-main-44&session=retired',
    value
  );
  assert.equal(result.response.status, 200);
  assert.equal(
    result.response.headers.get('content-type'),
    'text/calendar; charset=utf-8'
  );
  assert.match(result.response.headers.get('content-disposition') ?? '', /^inline;/);
  assert.equal(result.requests.length, 1);
  assert.equal(result.requests[0].url, 'https://pycon.hk/programme-snapshot.json');
  assert.equal(result.requests[0].method, 'GET');
  assert.equal(result.content.match(/BEGIN:VEVENT/g)?.length, 1);
  assert.match(result.content, /DTSTAMP:20261021T031709Z\r\n/);
  assert.match(result.content, /UID:pyconhk2026-room-main-42@pycon.hk/);
  assert.doesNotMatch(result.content, /Unselected talk|SUMMARY:Break|METHOD:/);
  assert.equal((await feed('?session=room-main-42', value)).content, result.content);
});

test('direct calendar requests are inline while download requests attach the identical body', async () => {
  const inline = await feed('?session=room-main-42');
  const download = await feed('?session=room-main-42&download=1');
  assert.equal(inline.response.status, 200);
  assert.equal(download.response.status, 200);
  assert.match(inline.response.headers.get('content-disposition') ?? '', /^inline;/);
  assert.match(
    download.response.headers.get('content-disposition') ?? '',
    /^attachment; filename="pyconhk2026-schedule.ics"$/
  );
  assert.equal(inline.content, download.content);
  for (const query of ['?session=room-main-42', '?session=room-main-42&download=1']) {
    const get = await feed(query);
    const head = await feed(query, snapshot(), { method: 'HEAD' });
    assert.equal(head.response.status, 200);
    assert.deepEqual([...head.response.headers], [...get.response.headers]);
    assert.equal(head.content, '');
    assert.equal(head.requests[0].method, 'GET');
  }
});

test('retired or excluded selections return 404 without generating an empty download', async () => {
  const value = snapshot([session(), session('room-main-44', { isBreak: true })]);
  for (const query of [
    '?session=retired',
    '?session=room-old-99',
    '?session=room-main-44',
  ]) {
    const result = await feed(query, value);
    assert.equal(result.response.status, 404);
    assert.doesNotMatch(result.content, /BEGIN:VCALENDAR|BEGIN:VEVENT|VTIMEZONE/);
  }
});

test('malformed and excessive selections fail before reading snapshot assets', async () => {
  for (const query of [
    '',
    '?session=',
    '?session=..%2Fprivate',
    '?session=one%0D%0AUID%3Aother',
    '?session=room-main-42&download=',
    '?session=room-main-42&download=0',
    '?session=room-main-42&download=true',
    '?session=room-main-42&download=1&download=1',
    `?session=${'a'.repeat(129)}`,
    `?${Array.from({ length: 201 }, () => 'session=one').join('&')}`,
    `?ignored=${'a'.repeat(8192)}`,
  ]) {
    const result = await feed(query);
    assert.equal(result.response.status, 400, query.slice(0, 100));
    assert.equal(result.requests.length, 0);
  }
  assert.equal((await feed('', snapshot(), { locale: 'fr' })).response.status, 404);
  const post = await feed('', snapshot(), { method: 'POST' });
  assert.equal(post.response.status, 405);
  assert.equal(post.response.headers.get('allow'), 'GET, HEAD');
  assert.equal(post.requests.length, 0);
});

test('missing, unpublished, mismatched or corrupted snapshots fail closed', async () => {
  const valid = snapshot();
  const unpublished = { ...valid, status: 'unpublished', sessions: [] };
  const missingStamp = { ...valid, fetchedAt: 'invalid' };
  const wrongYear = { ...valid, event: 'pyconhk2025' };
  for (const value of [
    null,
    { ...valid, hash: 'wrong' },
    ...[unpublished, missingStamp, wrongYear].map((value) => ({
      ...value,
      hash: snapshotHash(value as ProgrammeSnapshot),
    })),
  ]) {
    const result = await feed('?session=room-main-42', value);
    assert.equal(result.response.status, 503);
    assert.doesNotMatch(result.content, /BEGIN:VEVENT|A public talk/);
  }
  assert.equal(
    (await feed('?session=one', {}, { assetStatus: 404 })).response.status,
    503
  );
});

test('the intentional 2025 sample is available only in test snapshots', async () => {
  const sample = {
    ...snapshot([
      session('sample-talk', {
        date: '2025-10-11',
        start: '2025-10-11T02:00:00Z',
        end: '2025-10-11T02:30:00Z',
      }),
    ]),
    event: 'pyconhk2025',
    environment: 'test',
    title: 'PyCon HK 2025',
    sourceUrl: 'https://pretalx.com/pyconhk2025/schedule/export/schedule.json',
    startDate: '2025-10-11',
    endDate: '2025-10-12',
    days: [{ date: '2025-10-11' }, { date: '2025-10-12' }],
  };
  sample.hash = snapshotHash(sample);
  const result = await feed('?session=sample-talk', sample);
  assert.equal(result.response.status, 200);
  assert.match(result.content, /UID:pyconhk2025-sample-talk@pycon.hk/);
  const production = { ...sample, environment: 'production' };
  production.hash = snapshotHash(production);
  assert.equal((await feed('?session=sample-talk', production)).response.status, 503);
});
