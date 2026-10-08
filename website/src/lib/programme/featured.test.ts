import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveFeaturedTalk } from './featured.ts';
import type { ProgrammeSnapshot, ScheduleItem } from './types';

const portrait = { src: '/bundled-indy.webp' };
const featured = {
  code: 'TF3HKJ',
  name: 'Indy Ho',
  title: 'Pre-publication title',
  abstract: 'Pre-publication abstract',
  biography: 'Pre-publication biography',
  language: 'en',
  image: portrait,
  slug: 'python-applications-in-sports-science',
  keynote: false,
};
const session: ScheduleItem = {
  id: 'room-6402-1621224',
  code: 'TF3HKJ',
  title: 'Published sports science talk',
  speakers: ['Indy Ho', 'Ken Lee'],
  speakerProfiles: [
    {
      name: 'Indy Ho',
      biography: 'Current public Indy biography',
      avatar: 'https://cfp.pycon.hk/media/avatars/indy.webp',
      url: 'https://pretalx.com/pyconhk2026/speaker/KCPHG9/',
    },
    {
      name: 'Ken Lee',
      biography: 'Ken Lee is a Technical Executive at Mosaic Digital Limited.',
      avatar: 'https://cfp.pycon.hk/media/avatars/ken.webp',
      url: 'https://pretalx.com/pyconhk2026/speaker/TJPDP9/',
    },
  ],
  abstract: 'Current public abstract',
  description: 'Current public additional description',
  language: 'zh-Hant-HK',
  room: 'LT1',
  roomKey: 'room-6402',
  track: '',
  sessionType: 'Talk',
  date: '2026-11-14',
  start: '2026-11-14T07:00:00.000Z',
  end: '2026-11-14T07:30:00.000Z',
  startTime: '15:00',
  endTime: '15:30',
  duration: 30,
  url: 'https://pretalx.com/pyconhk2026/talk/TF3HKJ/',
  isBreak: false,
};
const programme: Pick<ProgrammeSnapshot, 'event' | 'status' | 'sessions'> = {
  event: 'pyconhk2026',
  status: 'published',
  sessions: [session],
};

test('linked public featured talk uses current copy and every co-speaker', () => {
  const result = resolveFeaturedTalk(featured, programme);
  assert.equal(result.title, session.title);
  assert.equal(result.abstract, session.abstract);
  assert.equal(result.description, session.description);
  assert.equal(result.language, session.language);
  assert.equal(result.name, 'Indy Ho, Ken Lee');
  assert.deepEqual(
    result.profiles.map((person) => [person.name, person.biography]),
    session.speakerProfiles?.map((person) => [person.name, person.biography])
  );
  assert.equal(result.image, portrait);
  assert.equal(result.profiles[0].image, portrait);
  assert.equal(result.profiles[1].image, session.speakerProfiles?.[1].avatar);
  assert.equal(result.portraitName, 'Indy Ho');
  assert.equal(result.slug, featured.slug);
  assert.equal(result.keynote, featured.keynote);
});

test('unpublished, other-event and unavailable talks retain curated introductions', () => {
  for (const source of [
    { ...programme, status: 'unpublished' as const },
    { ...programme, event: 'pyconhk2025' },
    { ...programme, sessions: [] },
    { ...programme, sessions: [{ ...session, isBreak: true }] },
  ]) {
    const result = resolveFeaturedTalk(featured, source);
    assert.equal(result.title, featured.title);
    assert.equal(result.abstract, featured.abstract);
    assert.equal(result.name, featured.name);
    assert.equal(result.image, portrait);
    assert.deepEqual(result.profiles, [
      { name: featured.name, biography: featured.biography, image: portrait },
    ]);
  }
});

test('public speaker changes cannot retain another person’s curated portrait or biography', () => {
  const ken = session.speakerProfiles?.[1];
  assert.ok(ken);
  const replacement = {
    ...session,
    speakers: ['Ken Lee'],
    speakerProfiles: [{ ...ken, biography: '' }],
    abstract: '',
  };
  const result = resolveFeaturedTalk(featured, {
    ...programme,
    sessions: [replacement],
  });
  assert.equal(result.name, 'Ken Lee');
  assert.equal(result.portraitName, 'Ken Lee');
  assert.equal(result.image, replacement.speakerProfiles[0].avatar);
  assert.equal(result.profiles[0].biography, '');
  assert.equal(result.abstract, '');
});

test('older public snapshots without profile details still include all speaker names', () => {
  const result = resolveFeaturedTalk(featured, {
    ...programme,
    sessions: [{ ...session, speakerProfiles: undefined }],
  });
  assert.equal(result.name, 'Indy Ho, Ken Lee');
  assert.deepEqual(
    result.profiles.map((person) => person.name),
    session.speakers
  );
  assert.equal(result.profiles[1].biography, '');
  assert.equal(result.profiles[1].image, '');
});
