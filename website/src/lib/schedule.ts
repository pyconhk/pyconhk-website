import {
  getLocaleDefinition,
  type LocalizedValue,
  type SiteLocale,
} from '@/config/site';

const pretalxScheduleUrl =
  'https://pretalx.com/pyconhk2025/schedule/export/schedule.json';

let conferenceSchedulePromise: Promise<ScheduleConference> | undefined;

export type ScheduleSessionStatus = 'scheduled' | 'virtual' | 'cancelled';

export interface ScheduleSession {
  code: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  start: string;
  end: string;
  durationMinutes: number;
  type: string;
  language: string | null;
  speakers: string[];
  room: string;
  track: string | null;
  url: string;
  status: ScheduleSessionStatus;
  note?: LocalizedValue<string>;
}

export interface ScheduleRoom {
  name: string;
  slug: string;
  capacity: number | null;
  sessions: ScheduleSession[];
}

export interface ScheduleDay {
  index: number;
  date: string;
  dayStart: string;
  dayEnd: string;
  rooms: ScheduleRoom[];
}

export interface ScheduleConference {
  acronym: string;
  title: string;
  eventUrl: string;
  timezone: string;
  startDate: string;
  endDate: string;
  roomCount: number;
  sessionCount: number;
  lastSyncedAt: string;
  days: ScheduleDay[];
}

export type ScheduleSessionOverride = Partial<Pick<ScheduleSession, 'status' | 'note'>>;

export type ScheduleSessionOverrides = Partial<
  Record<ScheduleSession['code'], ScheduleSessionOverride>
>;

type PretalxEvent = {
  abstract?: string | null;
  code: string;
  date: string;
  description?: string | null;
  duration?: string;
  language?: string | null;
  persons?: Array<{ name: string }>;
  room?: string;
  slug: string;
  subtitle?: string | null;
  title: string;
  track?: string | null;
  type: string;
  url: string;
};

type PretalxRoom = {
  capacity?: number | null;
  name: string;
  slug: string;
};

type PretalxDay = {
  date: string;
  day_end: string;
  day_start: string;
  index: number;
  rooms?: Record<string, PretalxEvent[]>;
};

type PretalxConference = {
  acronym: string;
  days?: PretalxDay[];
  end: string;
  rooms?: PretalxRoom[];
  start: string;
  time_zone_name: string;
  title: string;
};

type PretalxScheduleResponse = {
  schedule?: {
    conference?: PretalxConference;
    url: string;
  };
};

function parseDurationToMinutes(duration: string): number {
  const [hours = '0', minutes = '0'] = duration.split(':');

  return Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
}

function addMinutes(dateTimeString: string, minutes: number): string {
  const date = new Date(dateTimeString);
  date.setMinutes(date.getMinutes() + minutes);

  return date.toISOString();
}

function normalizeConference(payload: PretalxScheduleResponse): ScheduleConference {
  const schedule = payload.schedule;
  const conference = schedule?.conference;

  if (!schedule || !conference) {
    throw new Error('Pretalx payload is missing schedule conference data.');
  }

  const roomMetadata = new Map(
    (conference.rooms ?? []).map((room) => [room.name, room])
  );

  const days = (conference.days ?? []).map((day) => ({
    index: day.index,
    date: day.date,
    dayStart: day.day_start,
    dayEnd: day.day_end,
    rooms: Object.entries(day.rooms ?? {})
      .map(([roomName, events]) => {
        const room = roomMetadata.get(roomName);

        return {
          name: roomName,
          slug: room?.slug ?? roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          capacity: room?.capacity ?? null,
          sessions: events
            .map((event) => {
              const durationMinutes = parseDurationToMinutes(event.duration ?? '00:00');

              return {
                code: event.code,
                slug: event.slug,
                title: event.title,
                subtitle: event.subtitle || null,
                description: event.description || event.abstract || null,
                start: event.date,
                end: addMinutes(event.date, durationMinutes),
                durationMinutes,
                type: event.type,
                language: event.language || null,
                speakers: (event.persons ?? []).map((person) => person.name),
                room: roomName,
                track: event.track || null,
                url: event.url,
                status: 'scheduled' as const,
              };
            })
            .sort((left, right) => left.start.localeCompare(right.start)),
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name)),
  }));

  return {
    acronym: conference.acronym,
    title: conference.title,
    eventUrl: schedule.url,
    timezone: conference.time_zone_name,
    startDate: conference.start,
    endDate: conference.end,
    roomCount: conference.rooms?.length ?? 0,
    sessionCount: days.reduce(
      (count, day) =>
        count +
        day.rooms.reduce((roomCount, room) => roomCount + room.sessions.length, 0),
      0
    ),
    lastSyncedAt: new Date().toISOString(),
    days,
  };
}

export async function fetchConferenceSchedule(): Promise<ScheduleConference> {
  if (!conferenceSchedulePromise) {
    conferenceSchedulePromise = fetch(pretalxScheduleUrl, {
      headers: {
        Accept: 'application/json',
      },
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Pretalx schedule fetch failed with status ${response.status}.`
        );
      }

      const payload = (await response.json()) as PretalxScheduleResponse;

      return normalizeConference(payload);
    });
  }

  return conferenceSchedulePromise;
}

export function applySessionOverrides(
  conference: ScheduleConference,
  overrides: ScheduleSessionOverrides
): ScheduleConference {
  return {
    ...conference,
    days: conference.days.map((day) => ({
      ...day,
      rooms: day.rooms.map((room) => ({
        ...room,
        sessions: room.sessions.map((session) => {
          const override = overrides[session.code];

          return override
            ? {
                ...session,
                ...override,
              }
            : session;
        }),
      })),
    })),
  };
}

export function getPublishedSessionCount(day: ScheduleDay): number {
  return day.rooms.reduce((count, room) => count + room.sessions.length, 0);
}

export function hasPublishedSessions(day: ScheduleDay): boolean {
  return getPublishedSessionCount(day) > 0;
}

export function formatScheduleDayLabel(dateString: string, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Hong_Kong',
  }).format(new Date(`${dateString}T12:00:00+08:00`));
}

export function formatScheduleTime(dateTimeString: string, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Hong_Kong',
  }).format(new Date(dateTimeString));
}

export function formatScheduleTimeRange(
  startDateTime: string,
  endDateTime: string,
  locale: SiteLocale
): string {
  return `${formatScheduleTime(startDateTime, locale)} - ${formatScheduleTime(endDateTime, locale)}`;
}

export function formatScheduleSyncTime(
  dateTimeString: string,
  locale: SiteLocale
): string {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Hong_Kong',
  }).format(new Date(dateTimeString));
}

export function getLanguageLabel(
  languageCode: string | null,
  locale: SiteLocale
): string | null {
  if (!languageCode) {
    return null;
  }

  try {
    const displayNames = new Intl.DisplayNames([getLocaleDefinition(locale).htmlLang], {
      type: 'language',
    });

    return displayNames.of(languageCode) ?? languageCode.toUpperCase();
  } catch {
    return languageCode.toUpperCase();
  }
}
