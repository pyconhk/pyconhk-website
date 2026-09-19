import type { ScheduleItem } from '../../data/schedule';

export function sessionMatches(
  session: ScheduleItem,
  filters: {
    date: string;
    query: string;
    room: string;
    language: string;
    savedOnly: boolean;
  },
  saved: Set<string>
): boolean {
  const haystack =
    `${session.title} ${session.speakers.join(' ')} ${session.room} ${session.track}`.toLocaleLowerCase();
  return (
    session.date === filters.date &&
    (!filters.query || haystack.includes(filters.query.trim().toLocaleLowerCase())) &&
    (!filters.room || session.roomKey === filters.room) &&
    (!filters.language || session.language === filters.language) &&
    (!filters.savedOnly || saved.has(session.id))
  );
}

export function sessionCalendarUrl(
  session: Pick<ScheduleItem, 'title' | 'start' | 'end' | 'room' | 'url'>
): string {
  const compact = (date: string) =>
    new Date(date).toISOString().replaceAll(/[-:]|\.\d{3}/g, '');
  const parameters = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    dates: `${compact(session.start)}/${compact(session.end)}`,
    ctz: 'Asia/Hong_Kong',
    location: session.room,
    details: session.url,
  });
  return `https://calendar.google.com/calendar/render?${parameters}`;
}
