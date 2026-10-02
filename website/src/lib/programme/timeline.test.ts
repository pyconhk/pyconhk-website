import assert from 'node:assert/strict';
import test from 'node:test';
import { programmeTimeline } from '../../years/2026/components/schedule/timeline.ts';
import type { ScheduleItem } from './types.ts';

const item = (start: string, end: string) =>
  ({
    start: `2026-11-14T${start}:00+08:00`,
    end: `2026-11-14T${end}:00+08:00`,
  }) as ScheduleItem;

test('mixed sessions and five-minute gaps share ordered boundaries', () => {
  const sessions = [
    item('11:25', '11:40'),
    item('11:25', '11:55'),
    item('11:25', '12:10'),
    item('11:25', '12:25'),
    item('11:55', '12:00'),
    item('12:00', '12:30'),
  ];
  const timeline = programmeTimeline(sessions);
  assert.equal(timeline.intervals, 7);
  assert.deepEqual(timeline.guides, [
    { line: 1, label: '11:25' },
    { line: 2, label: '11:30' },
    { line: 5, label: '12:00' },
  ]);
  assert.deepEqual(sessions.map(timeline.position), [
    { start: 1, end: 3 },
    { start: 1, end: 4 },
    { start: 1, end: 6 },
    { start: 1, end: 7 },
    { start: 4, end: 5 },
    { start: 5, end: 8 },
  ]);
  // A panel crosses the break and next session start, ending precisely at 12:10.
  assert.equal(
    timeline.position(sessions[2]).end - timeline.position(sessions[5]).start,
    1
  );
});

test('positions use actual timestamps rather than a stale duration field or input order', () => {
  const first = { ...item('23:45', '23:55'), duration: 60 };
  const next = { ...item('23:55', '00:15'), end: '2026-11-15T00:15:00+08:00' };
  const timeline = programmeTimeline([next, first]);
  assert.equal(timeline.intervals, 3);
  assert.deepEqual(timeline.position(first), { start: 1, end: 2 });
  assert.deepEqual(timeline.position(next), { start: 2, end: 4 });
  assert.equal(programmeTimeline([]).intervals, 0);
  assert.deepEqual(programmeTimeline([]).guides, []);
  assert.deepEqual(timeline.guides, [
    { line: 1, label: '23:45' },
    { line: 3, label: '00:00' },
  ]);
});
