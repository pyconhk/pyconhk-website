type RecordValue = Record<string, unknown>;

function record(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`Invalid published programme API ${field}.`);
  return value as RecordValue;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function localized(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const translations = value as RecordValue;
  return (
    text(translations.en) || Object.values(translations).map(text).find(Boolean) || ''
  );
}

function identifier(value: unknown, field: string): string {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0)
    return String(value);
  if (typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value)) return value;
  throw new Error(`Invalid published programme API ${field}.`);
}

function numericIdentifier(value: unknown, field: string): string {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : NaN;
  if (!Number.isSafeInteger(number) || number <= 0)
    throw new Error(`Invalid published programme API ${field}.`);
  return String(number);
}

function publishedRelease(
  value: unknown,
  field: string
): {
  id: string;
  version: string;
  published: string;
  slots: unknown[];
} {
  const release = record(value, field);
  const id = numericIdentifier(release.id, `${field} ID`);
  const version = text(release.version);
  const published = text(release.published);
  const slots = release.slots;
  if (
    !version.trim() ||
    version.trim().toLowerCase() === 'wip' ||
    !published ||
    !Number.isFinite(Date.parse(published)) ||
    !Array.isArray(slots) ||
    release.next != null
  )
    throw new Error('Programme API must return a complete published latest schedule.');
  return { id, version, published, slots };
}

function calendarDate(value: string): number {
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  )
    throw new Error('Invalid published programme API event dates.');
  return timestamp;
}

export const programmeApiExpansion =
  'slots.room,slots.submission.speakers,slots.submission.submission_type,slots.submission.track';

export function programmeApiMetadata(payload: unknown, event: string) {
  const metadata = record(payload, 'event metadata');
  if (metadata.slug !== event || metadata.is_public !== true || metadata.next != null)
    throw new Error('Programme API event must match the configured public event.');
  return {
    title: localized(metadata.name),
    timezone: text(metadata.timezone),
    startDate: text(metadata.date_from),
    endDate: text(metadata.date_to),
  };
}

/** Select public fields explicitly: authenticated API objects may contain secrets or notes. */
export function programmeApiExport(
  payload: unknown,
  {
    event,
    sourceUrl,
    title,
    timezone,
    startDate,
    endDate,
  }: {
    event: string;
    sourceUrl: string;
    title: string;
    timezone: string;
    startDate: string;
    endDate: string;
  },
  publicSchedule: unknown
) {
  const schedule = publishedRelease(payload, 'schedule');
  const publicManifest = publishedRelease(publicSchedule, 'anonymous schedule');
  if (
    schedule.id !== publicManifest.id ||
    schedule.version !== publicManifest.version ||
    schedule.published !== publicManifest.published
  )
    throw new Error(
      'Authenticated programme release does not match the anonymous public release.'
    );
  const publicIds = new Set<string>();
  for (const candidate of publicManifest.slots) {
    const id = numericIdentifier(candidate, 'anonymous slot ID');
    if (publicIds.has(id)) throw new Error('Duplicate anonymous programme slot ID.');
    publicIds.add(id);
  }
  const seenIds = new Set<string>();
  const publicSlots: RecordValue[] = [];
  for (const candidate of schedule.slots) {
    const slot = record(candidate, 'expanded slot');
    const id = numericIdentifier(slot.id, 'slot ID');
    // Authentication may expose private entries: read only their ID, then discard.
    if (!publicIds.has(id)) continue;
    if (seenIds.has(id)) throw new Error('Duplicate published programme API slot ID.');
    seenIds.add(id);
    publicSlots.push(slot);
  }
  if (seenIds.size !== publicIds.size)
    throw new Error('Authenticated programme is missing anonymous public slots.');
  const firstDay = calendarDate(startDate);
  const lastDay = calendarDate(endDate);
  const dayMilliseconds = 86_400_000;
  const dayCount = (lastDay - firstDay) / dayMilliseconds + 1;
  if (dayCount < 1 || dayCount > 31)
    throw new Error('Published programme API event must span between 1 and 31 days.');
  const dateInZone = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const origin = new URL(sourceUrl).origin;
  const rooms = new Map<string, { slug: string; name: string }>();
  const roomIdsByName = new Map<string, string>();
  const days = new Map<string, Record<string, unknown[]>>();
  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = new Date(firstDay + offset * dayMilliseconds)
      .toISOString()
      .slice(0, 10);
    days.set(date, Object.create(null) as Record<string, unknown[]>);
  }
  for (const slot of publicSlots) {
    if (slot.is_visible === false || slot.slot_type === 'blocker') continue;
    // Unscheduled submissions are not public programme entries.
    if (slot.start === null || slot.room === null) continue;
    const room = record(slot.room, 'expanded room');
    if (room.hidden === true) continue;
    const submission =
      slot.submission === null ? null : record(slot.submission, 'expanded submission');
    if (submission && !['accepted', 'confirmed'].includes(text(submission.state)))
      continue;
    const slotId = numericIdentifier(slot.id, 'slot ID');
    const roomId = identifier(room.id, 'room ID');
    const roomName = localized(room.name);
    if (!roomName) throw new Error('Invalid published programme API room name.');
    const existingRoomId = roomIdsByName.get(roomName);
    if (existingRoomId !== undefined && existingRoomId !== roomId)
      throw new Error('Ambiguous published programme API room name.');
    roomIdsByName.set(roomName, roomId);
    const roomKey = `room-${roomId}`;
    const existingRoom = rooms.get(roomKey);
    if (existingRoom && existingRoom.name !== roomName)
      throw new Error('Inconsistent published programme API room.');
    rooms.set(roomKey, { slug: roomKey, name: roomName });
    const start = text(slot.start);
    const end = text(slot.end);
    const duration = (Date.parse(end) - Date.parse(start)) / 60_000;
    if (
      !/(?:Z|[+-]\d{2}:\d{2})$/.test(start) ||
      !/(?:Z|[+-]\d{2}:\d{2})$/.test(end) ||
      !Number.isInteger(duration) ||
      duration <= 0
    )
      throw new Error('Invalid published programme API slot timestamps.');
    const date = dateInZone.format(new Date(start));
    const code = submission
      ? identifier(submission.code, 'submission code')
      : `break-${slotId}`;
    if (submission && !Array.isArray(submission.speakers))
      throw new Error('Invalid published programme API expanded speakers.');
    const persons = ((submission?.speakers as unknown[] | undefined) ?? []).map(
      (candidate) => {
        const speaker = record(candidate, 'expanded speaker');
        const speakerCode = identifier(speaker.code, 'speaker code');
        return {
          name: text(speaker.name),
          biography: text(speaker.biography),
          avatar: text(speaker.avatar_url),
          url: `${origin}/${event}/speaker/${speakerCode}/`,
        };
      }
    );
    const dayRooms = days.get(date);
    if (!dayRooms)
      throw new Error('Published programme API slot is outside the event dates.');
    const session = {
      // Slots, not submissions, are unique when the same talk is scheduled twice.
      code,
      slotId,
      title: submission ? text(submission.title) : localized(slot.description),
      date: start,
      duration: `${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`,
      persons,
      url: submission ? `${origin}/${event}/talk/${code}/` : '',
      track:
        submission?.track == null
          ? ''
          : localized(record(submission.track, 'expanded track').name),
      type: submission
        ? localized(record(submission.submission_type, 'expanded submission type').name)
        : '',
      abstract: text(submission?.abstract),
      description: text(submission?.description),
      language: text(submission?.content_locale),
    };
    dayRooms[roomName] ??= [];
    dayRooms[roomName].push(session);
    days.set(date, dayRooms);
  }
  return {
    schedule: {
      version: text(schedule.version),
      conference: {
        title,
        time_zone_name: timezone,
        start: startDate,
        end: endDate,
        rooms: [...rooms.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
        days: [...days].map(([date, rooms]) => ({ date, rooms })),
      },
    },
  };
}
