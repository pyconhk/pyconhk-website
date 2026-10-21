import type { ScheduleItem } from '../../data/schedule';

export function isSaveableSession(session: Pick<ScheduleItem, 'isBreak'>): boolean {
  return !session.isBreak;
}

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
    (!filters.savedOnly || (isSaveableSession(session) && saved.has(session.id)))
  );
}

function calendarDate(value: string | Date): string {
  if (typeof value === 'string' && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    throw new Error('Calendar dates must include a timezone.');
  }
  return new Date(value).toISOString().replaceAll(/[-:]|\.\d{3}/g, '');
}

function calendarText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(/\r\n|\r|\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
}

// RFC 5545 folds content lines at 75 octets, without splitting a UTF-8 character.
function foldCalendarLine(value: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let line = '';
  let octets = 0;
  for (const character of value) {
    const size = encoder.encode(character).length;
    if (octets + size > 75) {
      lines.push(line);
      line = ' ';
      octets = 1;
    }
    line += character;
    octets += size;
  }
  lines.push(line);
  return lines.join('\r\n');
}

export function sessionsCalendarContent(
  sessions: readonly ScheduleItem[],
  event: string,
  baseUrl: string,
  generatedAt = new Date()
): string {
  const uniqueSessions = new Map(
    sessions.filter(isSaveableSession).map((session) => [session.id, session])
  );
  if (!uniqueSessions.size) {
    throw new Error('Select at least one public session to add to your calendar.');
  }
  const stamp = calendarDate(generatedAt);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PyCon Hong Kong//Conference Schedule//EN',
    'CALSCALE:GREGORIAN',
  ];
  for (const session of [...uniqueSessions.values()].sort(
    (a, b) => Date.parse(a.start) - Date.parse(b.start) || a.id.localeCompare(b.id)
  )) {
    const url = new URL(baseUrl);
    url.hash = '';
    url.searchParams.set('session', session.id);
    const description = [
      session.speakers.join(', '),
      session.abstract || session.description,
      url.href,
    ]
      .filter(Boolean)
      .join('\n\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(event)}-${encodeURIComponent(session.id)}@pycon.hk`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${calendarDate(session.start)}`,
      `DTEND:${calendarDate(session.end)}`,
      `SUMMARY:${calendarText(session.title)}`,
      `LOCATION:${calendarText(session.room)}`,
      `DESCRIPTION:${calendarText(description)}`,
      `URL:${url.href}`,
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(foldCalendarLine).join('\r\n')}\r\n`;
}

export function calendarImportUrl(
  sessions: readonly Pick<ScheduleItem, 'id'>[],
  baseUrl: string
): string {
  if (!sessions.length)
    throw new Error('Select at least one session to add to your calendar.');
  const url = new URL(baseUrl);
  if (
    !/^\/2026\/(?:en|zh-hk|zh-hant|zh-hans|ja|ko)\/schedule\/?$/.test(url.pathname) ||
    (url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      )) ||
    url.username ||
    url.password ||
    sessions.length > 200 ||
    sessions.some(({ id }) => !/^[A-Za-z0-9_-]{1,128}$/.test(id))
  ) {
    throw new Error('Invalid calendar URL or session selection.');
  }
  url.pathname = `${url.pathname.replace(/\/$/, '')}/calendar.ics`;
  url.search = '';
  url.hash = '';
  for (const id of new Set(sessions.map((session) => session.id))) {
    url.searchParams.append('session', id);
  }
  if (url.href.length > 8192) throw new Error('Calendar selection URL is too long.');
  return url.href;
}

export function sessionCalendarUrl(
  session: Pick<ScheduleItem, 'title' | 'start' | 'end' | 'room' | 'url'>
): string {
  const parameters = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    dates: `${calendarDate(session.start)}/${calendarDate(session.end)}`,
    stz: 'Asia/Hong_Kong',
    etz: 'Asia/Hong_Kong',
    location: session.room,
    details: session.url,
  });
  return `https://calendar.google.com/calendar/r/eventedit?${parameters}`;
}
