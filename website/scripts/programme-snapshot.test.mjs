import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fetchProgramme, normalizeProgramme, snapshotHash, unpublishedSnapshot, validateSnapshot } from './programme-snapshot.mjs';

const options = { event: 'pyconhk2025', environment: 'test', sourceUrl: 'https://pretalx.com/pyconhk2025/schedule/export/schedule.json', fetchedAt: '2026-09-08T00:00:00Z' };
function feed() {
  return { schedule: { version: 'v1', conference: {
    title: 'PyCon HK 2025', start: '2025-10-11', end: '2025-10-12', time_zone_name: 'Asia/Hong_Kong',
    rooms: [{ slug: 'main', name: 'Main' }], days: [{ date: '2025-10-11', rooms: { Main: [{
      code: 'TALK', title: 'A public talk', date: '2025-10-11T10:25:00+08:00', duration: '00:30',
      type: 'Talk', language: 'en', persons: [{ name: 'Speaker', email: 'private@example.com' }],
      url: 'https://pretalx.com/pyconhk2025/talk/TALK/', abstract: 'Public abstract',
      'Internal notes': 'secret', score: 8,
    }] } }, { date: '2025-10-12', rooms: {} }],
  } } };
}

test('public fields only, original dates, exact UTC calendar times, and empty second day', () => {
  const snapshot = normalizeProgramme(feed(), options);
  assert.equal(snapshot.sessions.length, 1);
  assert.equal(snapshot.sessions[0].start, '2025-10-11T02:25:00.000Z');
  assert.equal(snapshot.sessions[0].end, '2025-10-11T02:55:00.000Z');
  assert.equal(snapshot.sessions[0].startTime, '10:25');
  assert.deepEqual(snapshot.days, [{ date: '2025-10-11' }, { date: '2025-10-12' }]);
  assert.equal(JSON.stringify(snapshot).includes('secret'), false);
  assert.equal(JSON.stringify(snapshot).includes('private@example.com'), false);
  assert.equal(JSON.stringify(snapshot).includes('score'), false);
});

test('content hash ignores fetch time and detects public edits', () => {
  const first = normalizeProgramme(feed(), options);
  const second = normalizeProgramme(feed(), { ...options, fetchedAt: '2026-09-09T00:00:00Z' });
  assert.equal(first.hash, second.hash);
  const changed = feed();
  changed.schedule.conference.days[0].rooms.Main[0].title = 'Updated title';
  assert.notEqual(first.hash, normalizeProgramme(changed, options).hash);
});

test('reject wrong year, bad dates, duration, unknown room and malformed feed', () => {
  assert.throws(() => normalizeProgramme(feed(), { ...options, event: 'pyconhk2026' }), /dates/);
  const wrong = feed();
  wrong.schedule.conference.days[0].rooms.Main[0].date = '2025-10-12T10:25:00+08:00';
  assert.throws(() => normalizeProgramme(wrong, options), /date/);
  wrong.schedule.conference.days[0].rooms.Main[0].duration = 'broken';
  assert.throws(() => normalizeProgramme(wrong, options), /duration/);
  assert.throws(() => normalizeProgramme({ sessions: [] }, options), /Invalid/);
});

test('validates baseline identity and contents', () => {
  const snapshot = normalizeProgramme(feed(), options);
  assert.equal(validateSnapshot(snapshot, options.event, 'test'), snapshot);
  assert.throws(() => validateSnapshot(snapshot, options.event, 'production'), /identity/);
  assert.throws(() => validateSnapshot({ ...snapshot, title: 'changed' }, options.event, 'test'), /hash/);
  const contaminated = structuredClone(snapshot);
  contaminated.sessions[0]['Internal notes'] = 'not public';
  contaminated.hash = snapshotHash(contaminated);
  assert.throws(() => validateSnapshot(contaminated, options.event, 'test'), /non-public/);
});

test('first unavailable schedule is coming soon, but a published baseline is preserved', async () => {
  const input = { ...options, allowUnpublished: true, fetchImpl: async () => new Response('', { status: 404 }) };
  const missing = await fetchProgramme(input);
  assert.equal(missing.status, 'unpublished');
  await assert.rejects(fetchProgramme({ ...input, baseline: normalizeProgramme(feed(), options) }), /404/);
  await assert.rejects(fetchProgramme({ ...input, allowUnpublished: false }), /404/);
});

test('retries transient failure and rejects malformed successful responses', async () => {
  let attempts = 0;
  const snapshot = await fetchProgramme({ ...options, wait: async () => {}, fetchImpl: async () => {
    attempts += 1;
    return attempts < 3 ? new Response('', { status: 503 }) : Response.json(feed());
  } });
  assert.equal(attempts, 3);
  assert.equal(snapshot.status, 'published');
  await assert.rejects(fetchProgramme({ ...options, fetchImpl: async () => Response.json({}) }), /Invalid/);
});

test('checked-in sample contains only public feed data and authentic 2025 dates', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../src/years/2026/data/programme/pyconhk2025.public.json', import.meta.url), 'utf8'));
  validateSnapshot(snapshot, 'pyconhk2025', 'test');
  assert.equal(snapshot.sessions.length, 35);
  assert.equal(snapshot.rooms.length, 6);
  assert.equal(snapshot.days.length, 2);
  assert.equal(snapshot.sessions.every((session) => session.date === '2025-10-11'), true);
  assert.equal(snapshot.hash, snapshotHash(snapshot));
  const empty = unpublishedSnapshot({ event: 'pyconhk2026' });
  assert.equal(empty.sessions.length, 0);
});
