import { createHash } from 'node:crypto';
import {
  programmeApiExpansion,
  programmeApiExport,
  programmeApiMetadata,
} from './api.ts';
import type { ProgrammeSnapshot, ScheduleItem } from './types';

type SourceOptions = {
  event: string;
  environment?: string;
  sourceUrl?: string;
  fetchedAt?: string;
};
type PublicPerson = {
  name?: string;
  biography?: string;
  avatar?: string;
  url?: string;
};
type PublicSession = {
  duration?: string;
  date: string;
  title: string;
  code?: string;
  slotId?: string;
  guid?: string;
  id?: string | number;
  persons?: PublicPerson[];
  url?: string;
  track?: string;
  type?: string;
  abstract?: string;
  description?: string;
  language?: string;
};
type PublicExport = {
  schedule?: {
    version?: string;
    conference?: {
      time_zone_name?: string;
      start?: string;
      end?: string;
      title?: string;
      rooms: { slug?: string; name?: string }[];
      days: { date: string; rooms?: Record<string, PublicSession[]> }[];
    };
  };
};

export function snapshotHash(snapshot: Partial<ProgrammeSnapshot>) {
  const { fetchedAt: _fetchedAt, hash: _hash, ...content } = snapshot;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function publicUrl(value: unknown): string {
  try {
    const url = new URL(text(value));
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

function dateInZone(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function timeInZone(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

export function unpublishedSnapshot({
  event,
  environment = 'production',
  sourceUrl = '',
  fetchedAt = new Date().toISOString(),
}: SourceOptions): ProgrammeSnapshot {
  const snapshot: Omit<ProgrammeSnapshot, 'hash'> = {
    formatVersion: 1,
    event,
    environment,
    status: 'unpublished',
    sourceUrl,
    sourceVersion: '',
    title: `PyCon HK ${event.slice(-4)}`,
    timezone: 'Asia/Hong_Kong',
    startDate: '',
    endDate: '',
    days: [],
    rooms: [],
    sessions: [],
    fetchedAt,
  };
  return { ...snapshot, hash: snapshotHash(snapshot) };
}

/** Read only the public frab schedule export; never retain organiser fields. */
export function normalizeProgramme(
  payload: unknown,
  {
    event,
    environment = 'test',
    sourceUrl = '',
    fetchedAt = new Date().toISOString(),
  }: SourceOptions
): ProgrammeSnapshot {
  const schedule = (payload as PublicExport | null)?.schedule;
  const conference = schedule?.conference;
  if (
    !conference ||
    !Array.isArray(conference.days) ||
    !Array.isArray(conference.rooms)
  ) {
    throw new Error(
      'Invalid public schedule: conference, days, and rooms are required.'
    );
  }
  const timezone = text(conference.time_zone_name);
  // Also validates that the supplied IANA timezone is supported.
  timeInZone('2025-01-01T00:00:00Z', timezone);
  const startDate = text(conference.start);
  const endDate = text(conference.end);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    startDate > endDate ||
    startDate.slice(0, 4) !== event.slice(-4)
  ) {
    throw new Error('Public schedule dates do not match the configured event.');
  }
  const rooms = conference.rooms.map((room, index) => ({
    id: text(room.slug) || `room-${index + 1}`,
    name: text(room.name),
  }));
  if (
    rooms.some((room) => !room.name) ||
    new Set(rooms.map((room) => room.id)).size !== rooms.length
  ) {
    throw new Error('Invalid public schedule rooms.');
  }
  const roomByName = new Map(rooms.map((room) => [room.name, room]));
  const days: ProgrammeSnapshot['days'] = [];
  const sessions: ScheduleItem[] = [];
  const ids = new Set();
  for (const day of conference.days) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
      day.date < startDate ||
      day.date > endDate
    ) {
      throw new Error('Invalid public schedule day.');
    }
    days.push({ date: day.date });
    for (const [roomName, events] of Object.entries(day.rooms ?? {})) {
      const room = roomByName.get(roomName);
      if (!room || !Array.isArray(events))
        throw new Error('Unknown room in public schedule.');
      for (const item of events) {
        const durationMatch = /^(\d+):(\d{2})(?::\d{2})?$/.exec(text(item.duration));
        const duration = durationMatch
          ? Number(durationMatch[1]) * 60 + Number(durationMatch[2])
          : 0;
        if (
          !durationMatch ||
          Number(durationMatch[2]) >= 60 ||
          duration <= 0 ||
          !text(item.date).match(/(?:Z|[+-]\d{2}:\d{2})$/) ||
          !Number.isFinite(Date.parse(item.date))
        ) {
          throw new Error('Invalid public session timestamp or duration.');
        }
        const start = new Date(item.date).toISOString();
        const end = new Date(Date.parse(start) + duration * 60_000).toISOString();
        if (dateInZone(start, timezone) !== day.date || !text(item.title)) {
          throw new Error('Public session date/title is invalid.');
        }
        const code = text(item.code) || text(item.guid) || String(item.id ?? '');
        const id = code
          ? `${room.id}-${text(item.slotId) || code}`
          : `${room.id}-${start}`;
        if (ids.has(id)) throw new Error('Duplicate public session ID.');
        ids.add(id);
        const speakerProfiles = (Array.isArray(item.persons) ? item.persons : [])
          .filter((person) => text(person.name))
          .map((person) => ({
            name: text(person.name),
            biography: text(person.biography),
            avatar: publicUrl(person.avatar),
            url: publicUrl(person.url),
          }));
        const speakers = speakerProfiles.map((person) => person.name);
        const url = text(item.url);
        sessions.push({
          id,
          code,
          title: item.title,
          speakers,
          speakerProfiles,
          room: room.name,
          roomKey: room.id,
          track: text(item.track),
          sessionType: text(item.type),
          date: day.date,
          start,
          end,
          startTime: timeInZone(start, timezone),
          endTime: timeInZone(end, timezone),
          duration,
          abstract: text(item.abstract),
          description: text(item.description),
          language: text(item.language),
          url: /^https:\/\//.test(url) ? url : '',
          isBreak: speakers.length === 0 && !url,
        });
      }
    }
  }
  if (new Set(days.map((day) => day.date)).size !== days.length)
    throw new Error('Duplicate schedule day.');
  days.sort((a, b) => a.date.localeCompare(b.date));
  sessions.sort(
    (a, b) =>
      a.start.localeCompare(b.start) ||
      a.roomKey.localeCompare(b.roomKey) ||
      a.id.localeCompare(b.id)
  );
  const snapshot: Omit<ProgrammeSnapshot, 'hash'> = {
    formatVersion: 1,
    event,
    environment,
    status: 'published',
    sourceUrl,
    sourceVersion: text(schedule?.version),
    title: text(conference.title),
    timezone,
    startDate,
    endDate,
    days,
    rooms,
    sessions,
    fetchedAt,
  };
  return { ...snapshot, hash: snapshotHash(snapshot) };
}

export function validateSnapshot(
  candidate: unknown,
  event: string,
  environment: string
): ProgrammeSnapshot {
  const snapshot = candidate as ProgrammeSnapshot;
  const fields = [
    'formatVersion',
    'event',
    'environment',
    'status',
    'sourceUrl',
    'sourceVersion',
    'title',
    'timezone',
    'startDate',
    'endDate',
    'days',
    'rooms',
    'sessions',
    'fetchedAt',
    'hash',
  ];
  if (
    snapshot?.formatVersion !== 1 ||
    snapshot.event !== event ||
    snapshot.environment !== environment ||
    !['published', 'unpublished'].includes(snapshot.status) ||
    !Array.isArray(snapshot.sessions) ||
    !Array.isArray(snapshot.days) ||
    !Array.isArray(snapshot.rooms) ||
    snapshot.hash !== snapshotHash(snapshot) ||
    Object.keys(snapshot).some((key) => !fields.includes(key))
  ) {
    throw new Error('Snapshot identity or content hash is invalid.');
  }
  const sessionFields: (keyof ScheduleItem)[] = [
    'id',
    'code',
    'title',
    'speakers',
    'speakerProfiles',
    'room',
    'roomKey',
    'track',
    'sessionType',
    'date',
    'start',
    'end',
    'startTime',
    'endTime',
    'duration',
    'abstract',
    'description',
    'language',
    'url',
    'isBreak',
  ];
  const stringFields = sessionFields.filter(
    (key) => !['speakers', 'speakerProfiles', 'duration', 'isBreak'].includes(key)
  );
  for (const session of snapshot.sessions) {
    if (
      Object.keys(session).some(
        (key) => !sessionFields.includes(key as keyof ScheduleItem)
      ) ||
      stringFields.some((key) => typeof session[key] !== 'string') ||
      !Array.isArray(session.speakers) ||
      session.speakers.some((name) => typeof name !== 'string') ||
      !Number.isFinite(session.duration) ||
      session.duration <= 0 ||
      !Number.isFinite(Date.parse(session.start)) ||
      !Number.isFinite(Date.parse(session.end)) ||
      !snapshot.days.some((day) => day.date === session.date) ||
      !snapshot.rooms.some((room) => room.id === session.roomKey)
    ) {
      throw new Error('Snapshot contains invalid or non-public session fields.');
    }
    // Accept older successful snapshots during the first deployment of this additive field.
    if (
      session.speakerProfiles !== undefined &&
      (!Array.isArray(session.speakerProfiles) ||
        session.speakerProfiles.length !== session.speakers.length ||
        session.speakerProfiles.some(
          (person, index) =>
            !person ||
            typeof person !== 'object' ||
            Object.keys(person).some(
              (key) => !['name', 'biography', 'avatar', 'url'].includes(key)
            ) ||
            (['name', 'biography', 'avatar', 'url'] as const).some(
              (key) => typeof person[key] !== 'string'
            ) ||
            person.name !== session.speakers[index] ||
            [person.avatar, person.url].some(
              (url) => url !== '' && publicUrl(url) !== url
            )
        ))
    ) {
      throw new Error('Snapshot contains invalid or non-public speaker fields.');
    }
  }
  if (snapshot.status === 'unpublished' && snapshot.sessions.length > 0) {
    throw new Error('An unpublished snapshot must not contain sessions.');
  }
  return snapshot;
}

function isCloudflareError(response: Response): boolean {
  // Cloudflare may inject scripts into ordinary origin pages. Only its explicit
  // response headers distinguish a challenge/error from a Pretalx denial.
  return (
    response.headers.get('cf-mitigated') === 'challenge' ||
    (!response.ok &&
      (response.headers.has('cf-error-type') ||
        response.headers.has('cf-error-origin')))
  );
}

export async function fetchProgramme({
  event,
  environment,
  sourceUrl,
  baseline,
  allowUnpublished = false,
  apiToken,
  fetchImpl = fetch,
  wait = (ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
}: {
  event: string;
  environment: string;
  sourceUrl: string;
  baseline?: ProgrammeSnapshot;
  allowUnpublished?: boolean;
  apiToken?: string;
  fetchImpl?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
}): Promise<ProgrammeSnapshot> {
  const url = new URL(sourceUrl);
  const apiSource =
    url.origin === 'https://pretalx.com' &&
    url.pathname === `/api/events/${event}/schedules/latest/` &&
    !url.search &&
    !url.hash;
  if (
    !/^pyconhk\d{4}$/.test(event) ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (!apiSource && !url.pathname.includes(`/${event}/schedule/export/`))
  ) {
    throw new Error(
      'Use the public HTTPS schedule export or the approved latest schedule API for the configured event.'
    );
  }
  if (apiToken !== undefined && (!apiSource || !/^[!-~]+$/.test(apiToken)))
    throw new Error(
      'A valid programme API token may only be used with the approved latest schedule API.'
    );
  if (baseline) validateSnapshot(baseline, event, environment);
  async function request(requestUrl: URL, authenticated = true): Promise<Response> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      let response: Response;
      try {
        response = await fetchImpl(requestUrl.href, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            ...(apiSource ? { 'Pretalx-Version': 'v2' } : {}),
            ...(authenticated && apiToken
              ? { Authorization: `Token ${apiToken}` }
              : {}),
          },
          ...(apiSource ? { redirect: 'manual' as const } : {}),
          signal: AbortSignal.timeout(20_000),
        });
      } catch {
        // Transport errors must not echo request headers or a supplied token.
        if (attempt === 2) throw new Error('Pretalx fetch failed after 3 attempts.');
        await wait((attempt + 1) * 1_000);
        continue;
      }
      const responseHeaders = response.headers;
      console.info(
        `[programme] response ${JSON.stringify({
          event,
          environment,
          source: `${requestUrl.origin}${requestUrl.pathname}`,
          attempt: attempt + 1,
          status: response.status,
          headers: Object.fromEntries(
            [
              'content-type',
              'cache-control',
              'age',
              'cf-cache-status',
              'cf-mitigated',
              'cf-ray',
              'cf-error-type',
              'cf-error-origin',
            ].map((name) => [name, responseHeaders.get(name)])
          ),
        })}`
      );
      if (
        apiSource &&
        (response.redirected ||
          (response.status >= 300 && response.status < 400) ||
          (response.url && response.url !== requestUrl.href))
      )
        throw new Error('Pretalx API redirects are not permitted.');
      if (isCloudflareError(response)) {
        throw new Error(
          `Pretalx fetch failed: HTTP ${response.status} (Cloudflare challenge or error; see programme response diagnostics).`
        );
      }
      if (response.status !== 429 && response.status < 500) return response;
      if (attempt === 2)
        throw new Error(`Pretalx fetch failed: HTTP ${response.status}.`);
      await wait((attempt + 1) * 1_000);
    }
    throw new Error('Pretalx fetch failed after 3 attempts.');
  }
  // A token may have organiser access. The anonymous published release defines
  // which slots are public, independent of the credential's permissions.
  const response = await request(url, !apiSource);
  // An unpublished event may deny anonymous exports (403) or have no export
  // yet (404). Once a published snapshot exists, neither response may replace it.
  let snapshot: ProgrammeSnapshot;
  if (
    (response.status === 404 || (!apiSource && response.status === 403)) &&
    allowUnpublished &&
    baseline?.status !== 'published'
  ) {
    snapshot = unpublishedSnapshot({ event, environment, sourceUrl });
  } else {
    if (!response.ok) throw new Error(`Pretalx fetch failed: HTTP ${response.status}.`);
    let payload: unknown = await response.json();
    if (apiSource) {
      const publicSchedule = payload;
      const expandedUrl = new URL(url);
      expandedUrl.searchParams.set('expand', programmeApiExpansion);
      const expandedResponse = await request(expandedUrl);
      if (!expandedResponse.ok)
        throw new Error(
          `Pretalx expanded schedule fetch failed: HTTP ${expandedResponse.status}.`
        );
      payload = await expandedResponse.json();
      const metadataResponse = await request(
        new URL(`/api/events/${event}/`, url.origin)
      );
      if (!metadataResponse.ok)
        throw new Error(
          `Pretalx event metadata fetch failed: HTTP ${metadataResponse.status}.`
        );
      const metadata = programmeApiMetadata(await metadataResponse.json(), event);
      payload = programmeApiExport(
        payload,
        { event, sourceUrl, ...metadata },
        publicSchedule
      );
    }
    snapshot = normalizeProgramme(payload, {
      event,
      environment,
      sourceUrl,
    });
  }
  console.info(
    `[programme] snapshot ${JSON.stringify({
      event,
      environment,
      status: snapshot.status,
      sourceVersion: snapshot.sourceVersion,
      sessions: snapshot.sessions.length,
      hash: snapshot.hash,
    })}`
  );
  return snapshot;
}
