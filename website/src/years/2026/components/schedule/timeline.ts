import type { ScheduleItem } from '../../data/schedule';

/** Pretalx-style shared boundaries, with bounded minima rather than scaled cards. */
export function programmeTimeline(sessions: ScheduleItem[]) {
  const ranges = sessions.map((session) => ({
    start: Date.parse(session.start),
    end: Date.parse(session.end),
    talk: !session.isBreak,
  }));
  const start = Math.min(...ranges.map((range) => range.start));
  const end = Math.max(...ranges.map((range) => range.end));
  const halfHour = 30 * 60_000;
  const activeAt = (timestamp: number) =>
    ranges.some(
      (range) => range.talk && range.start <= timestamp && range.end > timestamp
    );
  const edges = new Set(ranges.flatMap((range) => [range.start, range.end]));
  const halfHours = sessions.length
    ? Array.from(
        {
          length: Math.max(0, Math.ceil(end / halfHour) - Math.floor(start / halfHour)),
        },
        (_, index) => (Math.floor(start / halfHour) + index + 1) * halfHour
      ).filter((time) => time <= end)
    : [];
  // Interior markers in long empty periods/breaks must not manufacture blank rows.
  const boundaries = [
    ...new Set([
      ...edges,
      ...halfHours.filter(
        (time) =>
          activeAt(time) ||
          edges.has(time) ||
          [...edges].some(
            (edge) => edge % halfHour !== 0 && Math.abs(edge - time) < halfHour
          )
      ),
    ]),
  ].sort((a, b) => a - b);
  const line = (timestamp: number) => boundaries.indexOf(timestamp) + 1;
  const rows = boundaries.slice(0, -1).map((time, index) => {
    const minutes = (boundaries[index + 1] - time) / 60_000;
    // This is a minimum only: intrinsic content controls the final track height.
    const empty = !ranges.some(
      (range) => range.start < boundaries[index + 1] && range.end > time
    );
    return `minmax(${empty && minutes > 30 ? 60 : Math.min(60, minutes * 2)}px, auto)`;
  });
  return {
    intervals: rows.length,
    rows: rows.join(' '),
    guides: boundaries
      .filter((time) => time === start || time % halfHour === 0)
      .map((timestamp) => ({
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
