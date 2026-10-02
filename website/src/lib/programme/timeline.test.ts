import assert from 'node:assert/strict';
import test from 'node:test';
import { programmeTimeline } from '../../years/2026/components/schedule/timeline.ts';
import type { ScheduleItem } from './types.ts';

const item = (start: string, end: string) =>
  ({
    start: `2026-11-14T${start}:00+08:00`,
    end: `2026-11-14T${end}:00+08:00`,
  }) as ScheduleItem;

test('mixed sessions and five-minute gaps share an exact elapsed-minute timescale', () => {
  const sessions = [
    item('11:25', '11:40'),
    item('11:25', '11:55'),
    item('11:25', '12:10'),
    item('11:25', '12:25'),
    item('11:55', '12:00'),
    item('12:00', '12:30'),
  ];
  const timeline = programmeTimeline(sessions);
  assert.equal(timeline.minutes, 65);
  assert.deepEqual(sessions.map(timeline.position), [
    { start: 1, end: 16 },
    { start: 1, end: 31 },
    { start: 1, end: 46 },
    { start: 1, end: 61 },
    { start: 31, end: 36 },
    { start: 36, end: 66 },
  ]);
  // A panel crosses the break and next session start, ending precisely at 12:10.
  assert.equal(
    timeline.position(sessions[2]).end - timeline.position(sessions[5]).start,
    10
  );
});

test('positions use actual timestamps rather than a stale duration field or input order', () => {
  const first = { ...item('23:45', '23:55'), duration: 60 };
  const next = { ...item('23:55', '00:15'), end: '2026-11-15T00:15:00+08:00' };
  const timeline = programmeTimeline([next, first]);
  assert.equal(timeline.minutes, 30);
  assert.deepEqual(timeline.position(first), { start: 1, end: 11 });
  assert.deepEqual(timeline.position(next), { start: 11, end: 31 });
  assert.equal(programmeTimeline([]).minutes, 0);
});
