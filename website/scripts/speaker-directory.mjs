import { createHash } from 'node:crypto';

export function speakerIdentity(person, event) {
  return createHash('sha256').update(`${event}:${person.url || person.name}`).digest('hex').slice(0, 20);
}

export function canonicalSpeakerName(name) {
  return name.normalize('NFKD').replace(/\p{M}/gu, '').normalize('NFC').toLowerCase()
    .replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'speaker';
}

export function sessionProfiles(session) {
  return session.speakerProfiles ?? session.speakers.map((name) => ({ name, biography: '', avatar: '', url: '' }));
}

export function createSpeakerDirectory(sessions, event) {
  const byId = new Map();
  for (const session of sessions) {
    for (const profile of sessionProfiles(session)) {
      const id = speakerIdentity(profile, event);
      const speaker = byId.get(id) ?? { ...profile, id, slug: '', sessions: [] };
      speaker.biography ||= profile.biography;
      speaker.avatar ||= profile.avatar;
      if (!speaker.sessions.some((item) => item.id === session.id)) speaker.sessions.push(session);
      byId.set(id, speaker);
    }
  }
  const speakers = [...byId.values()];
  const bases = speakers.map((speaker) => {
    const name = canonicalSpeakerName(speaker.name);
    // Reserve the previous hash namespace for legacy redirects.
    return /^[a-f0-9]{20}$/.test(name) ? `speaker-${name}` : name;
  });
  const counts = new Map();
  for (const base of bases) counts.set(base, (counts.get(base) ?? 0) + 1);
  const reserved = new Set(bases);
  speakers.forEach((speaker, index) => {
    const base = bases[index];
    let slug = base;
    if (counts.get(base) > 1) {
      slug = `${base}-${speaker.id}`;
      while (reserved.has(slug)) slug += `-${speaker.id}`;
    }
    reserved.add(slug);
    speaker.slug = slug;
  });
  return speakers;
}

export function speakerRedirects(speakers, locales) {
  return locales.flatMap((locale) => speakers.flatMap(({ id, slug }) => {
    const prefix = `/2026/${locale}/speakers/`;
    const target = `${prefix}${encodeURIComponent(slug)}/`;
    return [`${prefix}${id} ${target} 301`, `${prefix}${id}/ ${target} 301`];
  }));
}
