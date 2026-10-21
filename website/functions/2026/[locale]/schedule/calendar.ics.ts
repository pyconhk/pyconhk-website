import { validateSnapshot } from '../../../../src/lib/programme/snapshot.ts';
import type { ScheduleItem } from '../../../../src/lib/programme/types';
import {
  calendarFeedUrl,
  sessionsCalendarContent,
} from '../../../../src/years/2026/components/schedule/schedule-interactions.ts';

type CalendarContext = {
  request: Request;
  params: { locale?: string | string[] };
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } };
};

const programmeSource = 'https://pretalx.com/api/events/pyconhk2026/schedules/latest/';

function slotId(session: Pick<ScheduleItem, 'id' | 'roomKey'>): string | undefined {
  if (!/^room-[A-Za-z0-9_-]+$/.test(session.roomKey)) return;
  const prefix = `${session.roomKey}-`;
  const suffix = session.id.startsWith(prefix) ? session.id.slice(prefix.length) : '';
  return /^[1-9]\d*$/.test(suffix) ? suffix : undefined;
}

export async function onRequest({
  request,
  params,
  env,
}: CalendarContext): Promise<Response> {
  const head = request.method === 'HEAD';
  const error = (message: string, status: number, headers = {}) =>
    new Response(head ? null : message, {
      status,
      headers: { 'Cache-Control': 'no-store', ...headers },
    });
  if (!['GET', 'HEAD'].includes(request.method)) {
    return error('Use GET or HEAD for calendar feeds.', 405, { Allow: 'GET, HEAD' });
  }
  const locale = params.locale;
  if (
    typeof locale !== 'string' ||
    !/^(?:en|zh-hk|zh-hant|zh-hans|ja|ko)$/.test(locale)
  ) {
    return error('Unknown calendar language.', 404);
  }
  const url = new URL(request.url);
  const baseUrl = new URL(`/2026/${locale}/schedule/`, url).href;
  const requested = url.searchParams.getAll('session');
  const download = url.searchParams.getAll('download');
  try {
    if (
      requested.length === 0 ||
      request.url.length > 8192 ||
      download.length > 1 ||
      download.some((value) => value !== '1')
    ) {
      throw new Error('Invalid calendar request.');
    }
    calendarFeedUrl(
      requested.map((id) => ({ id })),
      baseUrl,
      'download'
    );
  } catch {
    return error('Invalid calendar request or session selection.', 400);
  }

  try {
    const response = await env.ASSETS.fetch(
      new Request(new URL('/programme-snapshot.json', url))
    );
    if (!response.ok || response.redirected) {
      throw new Error('Missing public programme.');
    }
    const data = await response.json();
    if (!['production', 'test'].includes(data?.environment)) {
      throw new Error('Invalid programme environment.');
    }
    const event = data.event;
    if (
      event !== 'pyconhk2026' &&
      !(event === 'pyconhk2025' && data.environment === 'test')
    ) {
      throw new Error('Invalid programme event.');
    }
    const snapshot = validateSnapshot(data, event, data.environment);
    if (
      snapshot.status !== 'published' ||
      typeof snapshot.fetchedAt !== 'string' ||
      !/(?:Z|[+-]\d{2}:\d{2})$/.test(snapshot.fetchedAt) ||
      !Number.isFinite(Date.parse(snapshot.fetchedAt))
    ) {
      throw new Error('Public programme is unavailable.');
    }
    const publicSessions = snapshot.sessions.filter((session) => !session.isBreak);
    const byId = new Map(snapshot.sessions.map((session) => [session.id, session]));
    const selected = new Map<string, ScheduleItem & { calendarId: string }>();
    for (const id of requested) {
      let session = byId.get(id);
      if (session?.isBreak) continue;
      // API slot IDs survive room moves; legacy talk codes must never be treated
      // as slots merely because they end with digits.
      const previousSlot = /^room-[A-Za-z0-9_-]+-([1-9]\d*)$/.exec(id)?.[1];
      if (!session && previousSlot && snapshot.sourceUrl === programmeSource) {
        const matches = publicSessions.filter(
          (candidate) => slotId(candidate) === previousSlot
        );
        if (matches.length === 1) session = matches[0];
      }
      if (session && !selected.has(session.id)) {
        selected.set(session.id, { ...session, calendarId: id });
      }
    }
    const content = sessionsCalendarContent(
      [...selected.values()],
      event,
      baseUrl,
      new Date(snapshot.fetchedAt)
    );
    return new Response(head ? null : content, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `${download.length ? 'attachment' : 'inline'}; filename="${event}-schedule.ics"`,
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return error('The published programme is temporarily unavailable.', 503);
  }
}
