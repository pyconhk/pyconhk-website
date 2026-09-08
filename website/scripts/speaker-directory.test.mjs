import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalSpeakerName, createSpeakerDirectory, speakerIdentity, speakerRedirects } from './speaker-directory.mjs';

const profile = (name, code) => ({ name, biography: '', avatar: '', url: `https://pretalx.com/pyconhk2025/speaker/${code}/` });
const session = (id, ...people) => ({ id, speakers: people.map((person) => person.name), speakerProfiles: people });

test('canonical speaker URLs normalize spacing, case, accents and punctuation without changing names', () => {
  assert.equal(canonicalSpeakerName('  Peter   Ho  '), 'peter-ho');
  assert.equal(canonicalSpeakerName('José O’Connor'), 'jose-oconnor');
  assert.equal(canonicalSpeakerName('Philip C.'), 'philip-c');
  assert.equal(canonicalSpeakerName('陳 大文'), '陳-大文');
  assert.equal(canonicalSpeakerName('김 민수'), '김-민수');
  const person = profile('Camila leung', 'PERSON');
  const [speaker] = createSpeakerDirectory([session('talk', person)], 'pyconhk2025');
  assert.equal(speaker.name, 'Camila leung');
  assert.equal(speaker.slug, 'camila-leung');
});

test('same-name speakers remain distinct, repeated appearances deduplicate and slugs are order-independent', () => {
  const one = profile('José Smith', 'ONE');
  const two = profile('Jose Smith', 'TWO');
  const talks = [session('a', one), session('b', one, two)];
  const directory = createSpeakerDirectory(talks, 'pyconhk2025');
  assert.equal(directory.length, 2);
  assert.equal(directory[0].sessions.length, 2);
  assert.equal(new Set(directory.map((speaker) => speaker.slug)).size, 2);
  for (const speaker of directory) assert.equal(speaker.slug, `jose-smith-${speaker.id}`);
  const mapping = (speakers) => Object.fromEntries(speakers.map(({ id, slug }) => [id, slug]));
  assert.deepEqual(mapping(directory), mapping(createSpeakerDirectory([...talks].reverse(), 'pyconhk2025')));
});

test('legacy identities stay unchanged and both URL spellings redirect within each locale', () => {
  const person = profile('Peter Ho', 'ESXRPE');
  assert.equal(speakerIdentity(person, 'pyconhk2025'), 'a520d5ae8a6503a04d37');
  const directory = createSpeakerDirectory([session('a', person)], 'pyconhk2025');
  const rules = speakerRedirects(directory, ['en', 'zh-hk']);
  assert.equal(rules.length, 6);
  assert.ok(rules.includes('/2026/en/speakers/a520d5ae8a6503a04d37/ /2026/en/speakers/peter-ho 301'));
  assert.ok(rules.includes('/2026/zh-hk/speakers/a520d5ae8a6503a04d37 /2026/zh-hk/speakers/peter-ho 301'));
  assert.ok(rules.includes('/2026/en/speakers/peter-ho/ /2026/en/speakers/peter-ho 301'));
  assert.ok(rules.includes('/2026/zh-hk/speakers/peter-ho/ /2026/zh-hk/speakers/peter-ho 301'));
});

test('generated suffixes and the legacy hash namespace cannot collide with literal names', () => {
  const first = profile('Alex', 'ONE');
  const id = speakerIdentity(first, 'pyconhk2025');
  const directory = createSpeakerDirectory([session('a', first, profile('Alex', 'TWO'), profile(`Alex ${id}`, 'THREE'), profile(id, 'FOUR'))], 'pyconhk2025');
  assert.equal(new Set(directory.map(({ slug }) => slug)).size, directory.length);
  assert.ok(directory.every(({ slug }) => !/^[a-f0-9]{20}$/.test(slug)));
});
