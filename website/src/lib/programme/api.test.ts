import assert from 'node:assert/strict';
import test from 'node:test';
import { programmeApiExport } from './api.ts';
import { normalizeProgramme } from './snapshot.ts';

const source = {
  event: 'pyconhk2026',
  sourceUrl: 'https://pretalx.com/api/events/pyconhk2026/schedules/latest/',
  title: 'PyCon HK 2026',
  timezone: 'Asia/Hong_Kong',
  startDate: '2026-11-14',
  endDate: '2026-11-15',
};

function publishedSchedule() {
  const room = { id: 17, name: { en: 'Main Hall' }, hidden: false };
  return {
    id: 42,
    version: '1.0',
    published: '2026-10-01T12:00:00Z',
    organiser_notes: 'private-schedule-note',
    slots: [
      {
        id: 101,
        room,
        start: '2026-11-14T10:00:00+08:00',
        end: '2026-11-14T10:30:00+08:00',
        duration: 30,
        is_visible: true,
        submission: {
          code: 'PUBLIC1',
          title: 'A public Python talk',
          state: 'confirmed',
          speakers: [
            {
              code: 'SPEAKER1',
              name: 'Example Speaker',
              biography: 'Builds Python tools.',
              avatar_url: 'https://cfp.pycon.hk/media/speaker.png',
              email: 'private-speaker@example.invalid',
              internal_notes: 'private-speaker-note',
            },
          ],
          submission_type: { id: 3, name: { en: 'Talk' } },
          track: { id: 7, name: { en: 'Python' } },
          abstract: 'A public abstract.',
          description: 'A public description.',
          content_locale: 'en',
          internal_notes: 'private-submission-note',
          answers: [{ answer: 'private-answer' }],
        },
        description: null,
      },
      {
        id: 102,
        room,
        start: '2026-11-14T10:30:00+08:00',
        end: '2026-11-14T11:00:00+08:00',
        duration: 30,
        is_visible: true,
        submission: null,
        description: { en: 'Break' },
      },
    ],
  };
}

function anonymousSchedule(payload: unknown = publishedSchedule()) {
  const release = payload as {
    id?: unknown;
    version?: unknown;
    published?: unknown;
    slots?: unknown[];
  };
  return {
    id: release.id,
    version: release.version,
    published: release.published,
    slots: release.slots?.map((slot) =>
      slot && typeof slot === 'object' ? (slot as { id?: unknown }).id : slot
    ),
  };
}

function snapshot(
  payload: unknown,
  metadata = source,
  publicManifest: unknown = anonymousSchedule(payload)
) {
  return normalizeProgramme(programmeApiExport(payload, metadata, publicManifest), {
    event: metadata.event,
    environment: 'production',
    sourceUrl: metadata.sourceUrl,
  });
}

test('expanded latest schedule maps public talks and breaks using trusted event metadata', () => {
  const result = snapshot(publishedSchedule());
  assert.equal(result.status, 'published');
  assert.equal(result.sourceVersion, '1.0');
  assert.equal(result.title, source.title);
  assert.equal(result.timezone, source.timezone);
  assert.equal(result.startDate, source.startDate);
  assert.equal(result.endDate, source.endDate);
  assert.deepEqual(result.days, [{ date: '2026-11-14' }, { date: '2026-11-15' }]);
  assert.equal(result.rooms.length, 1);
  assert.equal(result.rooms[0].name, 'Main Hall');
  assert.equal(result.sessions.length, 2);

  const [talk, pause] = result.sessions;
  assert.equal(talk.title, 'A public Python talk');
  assert.equal(talk.room, 'Main Hall');
  assert.equal(talk.track, 'Python');
  assert.equal(talk.sessionType, 'Talk');
  assert.equal(talk.abstract, 'A public abstract.');
  assert.equal(talk.description, 'A public description.');
  assert.equal(talk.language, 'en');
  assert.equal(talk.start, '2026-11-14T02:00:00.000Z');
  assert.equal(talk.end, '2026-11-14T02:30:00.000Z');
  assert.equal(talk.startTime, '10:00');
  assert.equal(talk.endTime, '10:30');
  assert.equal(talk.duration, 30);
  assert.equal(talk.isBreak, false);
  assert.equal(talk.url, 'https://pretalx.com/pyconhk2026/talk/PUBLIC1/');
  assert.deepEqual(talk.speakers, ['Example Speaker']);
  assert.ok(talk.speakerProfiles);
  assert.equal(talk.speakerProfiles[0].name, 'Example Speaker');
  assert.equal(talk.speakerProfiles[0].biography, 'Builds Python tools.');
  assert.equal(
    talk.speakerProfiles[0].avatar,
    'https://cfp.pycon.hk/media/speaker.png'
  );
  assert.equal(
    talk.speakerProfiles[0].url,
    'https://pretalx.com/pyconhk2026/speaker/SPEAKER1/'
  );
  assert.equal(pause.title, 'Break');
  assert.equal(pause.isBreak, true);
  assert.equal(pause.startTime, '10:30');
  assert.equal(pause.duration, 30);
  assert.deepEqual(pause.speakers, []);
  assert.equal(pause.url, '');
});

test('API conversion allowlists public fields before normalization', () => {
  const converted = programmeApiExport(
    publishedSchedule(),
    source,
    anonymousSchedule()
  );
  const result = normalizeProgramme(converted, {
    event: source.event,
    environment: 'production',
    sourceUrl: source.sourceUrl,
  });
  for (const value of [converted, result]) {
    const serialized = JSON.stringify(value);
    assert.doesNotMatch(serialized, /private-|internal_notes|organiser_notes/);
    assert.doesNotMatch(serialized, /"email"|"answers"|"state"/);
    assert.match(serialized, /A public abstract/);
    assert.match(serialized, /Builds Python tools/);
  }
});

test('hidden rooms, invisible slots, blockers, and unpublished submissions stay out of the public schedule', () => {
  const payload = publishedSchedule();
  const talk = payload.slots[0];
  const result = snapshot({
    ...payload,
    slots: [
      ...payload.slots,
      {
        ...talk,
        id: 103,
        room: { id: 18, name: { en: 'Hidden Hall' }, hidden: true },
      },
      { ...talk, id: 104, is_visible: false },
      { ...talk, id: 105, slot_type: 'blocker' },
      { ...talk, id: 106, submission: { ...talk.submission, state: 'submitted' } },
    ],
  });
  assert.equal(result.sessions.length, 2);
  assert.deepEqual(
    result.rooms.map((room) => room.name),
    ['Main Hall']
  );
});

test('an expanded latest schedule retains more than 50 public slots', () => {
  const payload = publishedSchedule();
  const result = snapshot({
    ...payload,
    slots: Array.from({ length: 75 }, (_, index) => ({
      ...payload.slots[0],
      id: 1000 + index,
    })),
  });
  assert.equal(result.sessions.length, 75);
  assert.equal(new Set(result.sessions.map((session) => session.id)).size, 75);
});

test('published schedules retain every event day even without any slots', () => {
  const result = snapshot(
    { ...publishedSchedule(), slots: [] },
    { ...source, endDate: '2026-11-16' }
  );
  assert.deepEqual(result.days, [
    { date: '2026-11-14' },
    { date: '2026-11-15' },
    { date: '2026-11-16' },
  ]);
  assert.deepEqual(result.sessions, []);
  assert.deepEqual(result.rooms, []);
});

test('event day expansion accepts 31 days and rejects a larger range', () => {
  const payload = { ...publishedSchedule(), slots: [] };
  const result = snapshot(payload, {
    ...source,
    startDate: '2026-11-01',
    endDate: '2026-12-01',
  });
  assert.equal(result.days.length, 31);
  assert.deepEqual(result.days[0], { date: '2026-11-01' });
  assert.deepEqual(result.days.at(-1), { date: '2026-12-01' });
  assert.throws(
    () =>
      snapshot(payload, {
        ...source,
        startDate: '2026-11-01',
        endDate: '2026-12-02',
      }),
    /between 1 and 31 days/
  );
});

for (const dates of [
  { startDate: '2026-02-30', endDate: '2026-03-02' },
  { startDate: '2026-02-28', endDate: '2026-02-30' },
  { startDate: '2026-11-15', endDate: '2026-11-14' },
]) {
  test(`invalid event date range is rejected (${dates.startDate}, ${dates.endDate})`, () => {
    assert.throws(() =>
      snapshot({ ...publishedSchedule(), slots: [] }, { ...source, ...dates })
    );
  });
}

test('different room IDs cannot share a name in the legacy public export', () => {
  const payload = publishedSchedule();
  assert.throws(
    () =>
      snapshot({
        ...payload,
        slots: [
          payload.slots[0],
          {
            ...payload.slots[1],
            room: { id: 18, name: { en: 'Main Hall' }, hidden: false },
          },
        ],
      }),
    /Ambiguous published programme API room name/
  );
});

for (const release of [
  { version: '1.0', published: null },
  { version: 'wip', published: '2026-10-01T12:00:00Z' },
]) {
  test(`unpublished or work-in-progress schedule is rejected (${release.version}, ${release.published})`, () => {
    assert.throws(() => snapshot({ ...publishedSchedule(), ...release }));
  });
}

test('unexpanded slot IDs are rejected', () => {
  assert.throws(() => snapshot({ ...publishedSchedule(), slots: [101] }));
});

for (const relation of ['room', 'submission', 'speaker'] as const) {
  test(`unexpanded ${relation} IDs are rejected`, () => {
    const payload = publishedSchedule();
    const talk = payload.slots[0];
    const unexpanded =
      relation === 'speaker'
        ? { ...talk, submission: { ...talk.submission, speakers: [1] } }
        : { ...talk, [relation]: 1 };
    assert.throws(() => snapshot({ ...payload, slots: [unexpanded] }));
  });
}

test('duplicate API slots cannot produce duplicate normalized sessions', () => {
  const payload = publishedSchedule();
  assert.throws(() =>
    snapshot(
      { ...payload, slots: [...payload.slots, payload.slots[0]] },
      source,
      anonymousSchedule(payload)
    )
  );
});

test('authenticated-only private breaks and other entries are discarded before field mapping', () => {
  const payload = publishedSchedule();
  const result = snapshot(
    {
      ...payload,
      slots: [
        ...payload.slots,
        {
          ...payload.slots[1],
          id: 999,
          description: { en: 'private-team-only-break' },
        },
        {
          id: 1000,
          get room() {
            throw new Error('Private slot fields must not be inspected.');
          },
        },
      ],
    },
    source,
    anonymousSchedule(payload)
  );
  assert.deepEqual(result.sessions, snapshot(payload).sessions);
  assert.doesNotMatch(JSON.stringify(result), /private-team-only-break/);
});

test('numeric and string release and slot IDs normalize to the same public identities', () => {
  const payload = publishedSchedule();
  const result = snapshot(payload, source, {
    ...anonymousSchedule(payload),
    id: '42',
    slots: ['101', '102'],
  });
  assert.deepEqual(result.sessions, snapshot(payload).sessions);
});

for (const changed of [
  { id: 43 },
  { version: '1.1' },
  { published: '2026-10-01T12:00:01Z' },
]) {
  test(`authenticated release must match anonymous release ${Object.keys(changed)[0]}`, () => {
    const payload = publishedSchedule();
    assert.throws(
      () => snapshot({ ...payload, ...changed }, source, anonymousSchedule(payload)),
      /does not match the anonymous public release/
    );
  });
}

test('every anonymous public slot must exist in the expanded response', () => {
  const payload = publishedSchedule();
  assert.throws(
    () =>
      snapshot(
        { ...payload, slots: [payload.slots[0]] },
        source,
        anonymousSchedule(payload)
      ),
    /missing anonymous public slots/
  );
});

test('duplicate public slot IDs fail even if one duplicate would be hidden', () => {
  const payload = publishedSchedule();
  assert.throws(
    () =>
      snapshot(
        {
          ...payload,
          slots: [
            ...payload.slots,
            { ...payload.slots[0], id: '101', is_visible: false },
          ],
        },
        source,
        anonymousSchedule(payload)
      ),
    /Duplicate published programme API slot ID/
  );
});

test('anonymous manifest cannot repeat a public slot using a different ID representation', () => {
  assert.throws(
    () =>
      snapshot(publishedSchedule(), source, {
        ...anonymousSchedule(),
        slots: [101, '101'],
      }),
    /Duplicate anonymous programme slot ID/
  );
});

for (const invalidId of [
  null,
  { id: 101 },
  [101],
  true,
  0,
  -1,
  1.5,
  'private',
  '1e2',
  Number.MAX_SAFE_INTEGER + 1,
]) {
  test(`anonymous manifest rejects malformed slot ID ${JSON.stringify(invalidId)}`, () => {
    assert.throws(
      () =>
        snapshot(publishedSchedule(), source, {
          ...anonymousSchedule(),
          slots: [invalidId],
        }),
      /Invalid published programme API anonymous slot ID/
    );
  });
}

for (const invalidManifest of [
  { id: undefined },
  { version: 'wip' },
  { published: null },
  { slots: null },
  { next: 'https://pretalx.com/api/events/pyconhk2026/schedules/?page=2' },
]) {
  test(`anonymous manifest requires a complete published release (${Object.keys(invalidManifest)[0]})`, () => {
    assert.throws(() =>
      snapshot(publishedSchedule(), source, {
        ...anonymousSchedule(),
        ...invalidManifest,
      })
    );
  });
}

test('the same submission in distinct slots remains separate public sessions', () => {
  const payload = publishedSchedule();
  const result = snapshot({
    ...payload,
    slots: [
      ...payload.slots,
      {
        ...payload.slots[0],
        id: 103,
        start: '2026-11-14T11:00:00+08:00',
        end: '2026-11-14T11:30:00+08:00',
      },
    ],
  });
  const talks = result.sessions.filter((session) => !session.isBreak);
  assert.equal(talks.length, 2);
  assert.notEqual(talks[0].id, talks[1].id);
  assert.equal(talks[0].url, talks[1].url);
  assert.deepEqual(
    talks.map((talk) => talk.startTime),
    ['10:00', '11:00']
  );
});

for (const timestamps of [
  { start: 'not-a-timestamp', end: '2026-11-14T10:30:00+08:00' },
  { start: '2026-11-14T10:00:00', end: '2026-11-14T10:30:00' },
  {
    start: '2026-11-14T10:30:00+08:00',
    end: '2026-11-14T10:00:00+08:00',
  },
]) {
  test(`invalid slot timestamps are rejected (${timestamps.start}, ${timestamps.end})`, () => {
    const payload = publishedSchedule();
    assert.throws(() =>
      snapshot({
        ...payload,
        slots: [{ ...payload.slots[0], ...timestamps }],
      })
    );
  });
}
