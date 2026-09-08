import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionCalendarUrl, sessionMatches } from '../src/years/2026/components/schedule/schedule-interactions.ts';

const session = { id: 'a', title: 'Python at work', speakers: ['Alice'], room: 'Main', roomKey: 'main', track: 'Python', date: '2025-10-11', language: 'en', start: '2025-10-11T02:25:00.000Z', end: '2025-10-11T02:55:00.000Z', url: 'https://pretalx.com/pyconhk2025/talk/A/' };
const filters = { date: '2025-10-11', query: '', room: '', language: '', savedOnly: false };
test('search, room, language, saved and day filters compose', () => {
  assert.equal(sessionMatches(session, { ...filters, query: ' alice ', room: 'main', language: 'en' }, new Set()), true);
  assert.equal(sessionMatches(session, { ...filters, date: '2025-10-12' }, new Set()), false);
  assert.equal(sessionMatches(session, { ...filters, query: 'missing' }, new Set()), false);
  assert.equal(sessionMatches(session, { ...filters, room: 'other' }, new Set()), false);
  assert.equal(sessionMatches(session, { ...filters, language: 'ja' }, new Set()), false);
  assert.equal(sessionMatches(session, { ...filters, savedOnly: true }, new Set()), false);
  assert.equal(sessionMatches(session, { ...filters, savedOnly: true }, new Set(['a'])), true);
});
test('calendar preserves actual 2025 dates and converts Hong Kong timestamps to UTC', () => {
  const url = new URL(sessionCalendarUrl(session));
  assert.equal(url.searchParams.get('dates'), '20251011T022500Z/20251011T025500Z');
  assert.equal(url.searchParams.get('ctz'), 'Asia/Hong_Kong');
  assert.equal(url.searchParams.get('location'), 'Main');
});
