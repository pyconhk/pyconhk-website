import type { ScheduleItem } from '../../data/schedule';

/** Grid lines are elapsed minutes, so an end boundary never depends on card content. */
export function programmeTimeline(sessions: ScheduleItem[]) {
  const start = Math.min(...sessions.map((session) => Date.parse(session.start)));
  const end = Math.max(...sessions.map((session) => Date.parse(session.end)));
  const line = (timestamp: string) => (Date.parse(timestamp) - start) / 60_000 + 1;
  const halfHour = 30 * 60_000;
  const guideTimes = sessions.length
    ? [
        start,
        ...Array.from(
          {
            length: Math.max(
              0,
              Math.ceil(end / halfHour) - Math.floor(start / halfHour) - 1
            ),
          },
          (_, index) => (Math.floor(start / halfHour) + index + 1) * halfHour
        ),
      ]
    : [];
  return {
    minutes: sessions.length ? (end - start) / 60_000 : 0,
    guides: guideTimes.map((timestamp) => ({
      line: (timestamp - start) / 60_000 + 1,
      label: new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(timestamp),
    })),
    position: (session: ScheduleItem) => ({
      start: line(session.start),
      end: line(session.end),
    }),
  };
}
