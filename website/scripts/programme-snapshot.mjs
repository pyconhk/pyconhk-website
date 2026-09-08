import { createHash } from 'node:crypto';

export function snapshotHash(snapshot) {
  const { fetchedAt: _fetchedAt, hash: _hash, ...content } = snapshot;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

function text(value) {
  return typeof value === 'string' ? value : '';
}

function dateInZone(value, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(value));
}

function timeInZone(value, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(value));
}

export function unpublishedSnapshot({ event, environment = 'production', sourceUrl = '', fetchedAt = new Date().toISOString() }) {
  const snapshot = {
    formatVersion: 1, event, environment, status: 'unpublished', sourceUrl,
    sourceVersion: '', title: `PyCon HK ${event.slice(-4)}`, timezone: 'Asia/Hong_Kong',
    startDate: '', endDate: '', days: [], rooms: [], sessions: [], fetchedAt,
  };
  return { ...snapshot, hash: snapshotHash(snapshot) };
}

/** Read only the public frab schedule export; never retain organiser fields. */
export function normalizeProgramme(payload, { event, environment = 'test', sourceUrl, fetchedAt = new Date().toISOString() }) {
  const schedule = payload?.schedule;
  const conference = schedule?.conference;
  if (!conference || !Array.isArray(conference.days) || !Array.isArray(conference.rooms)) {
    throw new Error('Invalid public schedule: conference, days, and rooms are required.');
  }
  const timezone = text(conference.time_zone_name);
  // Also validates that the supplied IANA timezone is supported.
  timeInZone('2025-01-01T00:00:00Z', timezone);
  const startDate = text(conference.start);
  const endDate = text(conference.end);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    || startDate > endDate || startDate.slice(0, 4) !== event.slice(-4)) {
    throw new Error('Public schedule dates do not match the configured event.');
  }
  const rooms = conference.rooms.map((room, index) => ({
    id: text(room.slug) || `room-${index + 1}`, name: text(room.name),
  }));
  if (rooms.some((room) => !room.name) || new Set(rooms.map((room) => room.id)).size !== rooms.length) {
    throw new Error('Invalid public schedule rooms.');
  }
  const roomByName = new Map(rooms.map((room) => [room.name, room]));
  const days = [];
  const sessions = [];
  const ids = new Set();
  for (const day of conference.days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || day.date < startDate || day.date > endDate) {
      throw new Error('Invalid public schedule day.');
    }
    days.push({ date: day.date });
    for (const [roomName, events] of Object.entries(day.rooms ?? {})) {
      const room = roomByName.get(roomName);
      if (!room || !Array.isArray(events)) throw new Error('Unknown room in public schedule.');
      for (const item of events) {
        const durationMatch = /^(\d+):(\d{2})(?::\d{2})?$/.exec(text(item.duration));
        const duration = durationMatch ? Number(durationMatch[1]) * 60 + Number(durationMatch[2]) : 0;
        if (!durationMatch || Number(durationMatch[2]) >= 60 || duration <= 0
          || !text(item.date).match(/(?:Z|[+-]\d{2}:\d{2})$/) || !Number.isFinite(Date.parse(item.date))) {
          throw new Error('Invalid public session timestamp or duration.');
        }
        const start = new Date(item.date).toISOString();
        const end = new Date(Date.parse(start) + duration * 60_000).toISOString();
        if (dateInZone(start, timezone) !== day.date || !text(item.title)) {
          throw new Error('Public session date/title is invalid.');
        }
        const code = text(item.code) || text(item.guid) || String(item.id ?? '');
        const id = code ? `${room.id}-${code}` : `${room.id}-${start}`;
        if (ids.has(id)) throw new Error('Duplicate public session ID.');
        ids.add(id);
        const speakers = (Array.isArray(item.persons) ? item.persons : []).map((person) => text(person.name)).filter(Boolean);
        const url = text(item.url);
        sessions.push({
          id, code, title: item.title, speakers, room: room.name, roomKey: room.id,
          track: text(item.track), sessionType: text(item.type), date: day.date,
          start, end, startTime: timeInZone(start, timezone), endTime: timeInZone(end, timezone), duration,
          abstract: text(item.abstract), description: text(item.description), language: text(item.language),
          url: /^https:\/\//.test(url) ? url : '', isBreak: speakers.length === 0 && !url,
        });
      }
    }
  }
  if (new Set(days.map((day) => day.date)).size !== days.length) throw new Error('Duplicate schedule day.');
  days.sort((a, b) => a.date.localeCompare(b.date));
  sessions.sort((a, b) => a.start.localeCompare(b.start) || a.roomKey.localeCompare(b.roomKey) || a.id.localeCompare(b.id));
  const snapshot = {
    formatVersion: 1, event, environment, status: 'published', sourceUrl,
    sourceVersion: text(schedule.version), title: text(conference.title), timezone,
    startDate, endDate, days, rooms, sessions, fetchedAt,
  };
  return { ...snapshot, hash: snapshotHash(snapshot) };
}

export function validateSnapshot(snapshot, event, environment) {
  const fields = ['formatVersion', 'event', 'environment', 'status', 'sourceUrl', 'sourceVersion', 'title', 'timezone', 'startDate', 'endDate', 'days', 'rooms', 'sessions', 'fetchedAt', 'hash'];
  if (snapshot?.formatVersion !== 1 || snapshot.event !== event || snapshot.environment !== environment
    || !['published', 'unpublished'].includes(snapshot.status) || !Array.isArray(snapshot.sessions)
    || !Array.isArray(snapshot.days) || !Array.isArray(snapshot.rooms) || snapshot.hash !== snapshotHash(snapshot)
    || Object.keys(snapshot).some((key) => !fields.includes(key))) {
    throw new Error('Snapshot identity or content hash is invalid.');
  }
  const sessionFields = ['id', 'code', 'title', 'speakers', 'room', 'roomKey', 'track', 'sessionType', 'date', 'start', 'end', 'startTime', 'endTime', 'duration', 'abstract', 'description', 'language', 'url', 'isBreak'];
  const stringFields = sessionFields.filter((key) => !['speakers', 'duration', 'isBreak'].includes(key));
  for (const session of snapshot.sessions) {
    if (Object.keys(session).some((key) => !sessionFields.includes(key))
      || stringFields.some((key) => typeof session[key] !== 'string')
      || !Array.isArray(session.speakers) || session.speakers.some((name) => typeof name !== 'string')
      || !Number.isFinite(session.duration) || session.duration <= 0
      || !Number.isFinite(Date.parse(session.start)) || !Number.isFinite(Date.parse(session.end))
      || !snapshot.days.some((day) => day.date === session.date)
      || !snapshot.rooms.some((room) => room.id === session.roomKey)) {
      throw new Error('Snapshot contains invalid or non-public session fields.');
    }
  }
  if (snapshot.status === 'unpublished' && snapshot.sessions.length > 0) {
    throw new Error('An unpublished snapshot must not contain sessions.');
  }
  return snapshot;
}

export async function fetchProgramme({ event, environment, sourceUrl, baseline, allowUnpublished = false, fetchImpl = fetch, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  if (baseline) validateSnapshot(baseline, event, environment);
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetchImpl(sourceUrl, {
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.status !== 429 && response.status < 500) break;
      if (attempt === 2) throw new Error(`Pretalx fetch failed: HTTP ${response.status}.`);
    } catch (error) {
      if (attempt === 2) throw error;
    }
    await wait((attempt + 1) * 1_000);
  }
  if (response?.status === 404 && allowUnpublished && baseline?.status !== 'published') {
    return unpublishedSnapshot({ event, environment, sourceUrl });
  }
  if (!response?.ok) throw new Error(`Pretalx fetch failed: HTTP ${response?.status}.`);
  return normalizeProgramme(await response.json(), { event, environment, sourceUrl });
}
