import type { ScheduleItem } from '../../data/schedule';

/** Grid lines are elapsed minutes, so an end boundary never depends on card content. */
export function programmeTimeline(sessions: ScheduleItem[]) {
  const start = Math.min(...sessions.map((session) => Date.parse(session.start)));
  const end = Math.max(...sessions.map((session) => Date.parse(session.end)));
  const line = (timestamp: string) => (Date.parse(timestamp) - start) / 60_000 + 1;
  return {
    minutes: sessions.length ? (end - start) / 60_000 : 0,
    position: (session: ScheduleItem) => ({
      start: line(session.start),
      end: line(session.end),
    }),
  };
}
