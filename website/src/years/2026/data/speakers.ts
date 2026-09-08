import { createHash } from 'node:crypto';
import type { CfpLocale } from '../locales';
import { allScheduleItems, programmeSnapshot, type ScheduleItem } from './schedule';

type Profile = NonNullable<ScheduleItem['speakerProfiles']>[number];
export type ProgrammeSpeaker = Profile & { slug: string; sessions: ScheduleItem[] };

// Scope identity to the source event so sample profiles cannot become 2026 profiles.
export function speakerSlug(person: Pick<Profile, 'name' | 'url'>): string {
  const identity = `${programmeSnapshot.event}:${person.url || person.name}`;
  return createHash('sha256').update(identity).digest('hex').slice(0, 20);
}

export function speakerPath(
  person: Pick<Profile, 'name' | 'url'>,
  locale: CfpLocale
): string {
  return `/2026/${locale}/speakers/${speakerSlug(person)}/`;
}

export function sessionProfiles(session: ScheduleItem): Profile[] {
  return (
    session.speakerProfiles ??
    session.speakers.map((name) => ({ name, biography: '', avatar: '', url: '' }))
  );
}

const bySlug = new Map<string, ProgrammeSpeaker>();
for (const session of allScheduleItems) {
  for (const profile of sessionProfiles(session)) {
    const slug = speakerSlug(profile);
    const speaker = bySlug.get(slug) ?? { ...profile, slug, sessions: [] };
    speaker.biography ||= profile.biography;
    speaker.avatar ||= profile.avatar;
    if (!speaker.sessions.some(({ id }) => id === session.id))
      speaker.sessions.push(session);
    bySlug.set(slug, speaker);
  }
}
export const programmeSpeakers = [...bySlug.values()];
