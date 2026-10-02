import type { ScheduleItem } from '../../data/schedule';

/** Shared ordered time boundaries align rooms; content determines interval height. */
export function programmeTimeline(sessions: ScheduleItem[]) {
  const start = Math.min(...sessions.map((session) => Date.parse(session.start)));
  const end = Math.max(...sessions.map((session) => Date.parse(session.end)));

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
  const boundaries = [
    ...new Set([
      ...sessions.flatMap((session) => [
        Date.parse(session.start),
        Date.parse(session.end),
      ]),
      ...guideTimes,
    ]),
  ].sort((a, b) => a - b);
  const line = (timestamp: number) => boundaries.indexOf(timestamp) + 1;
  return {
    intervals: Math.max(0, boundaries.length - 1),
    guides: guideTimes.map((timestamp) => ({
      line: line(timestamp),
      label: new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(timestamp),
    })),
    position: (session: ScheduleItem) => ({
      start: line(Date.parse(session.start)),
      end: line(Date.parse(session.end)),
    }),
  };
}
