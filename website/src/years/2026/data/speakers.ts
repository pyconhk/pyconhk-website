import {
  createSpeakerDirectory,
  sessionProfiles as sourceSessionProfiles,
  speakerIdentity,
} from '../../../lib/programme/speakers.ts';
import type { CfpLocale } from '../locales';
import { allScheduleItems, programmeSnapshot, type ScheduleItem } from './schedule';

type Profile = NonNullable<ScheduleItem['speakerProfiles']>[number];
export type ProgrammeSpeaker = Profile & {
  id: string;
  slug: string;
  sessions: ScheduleItem[];
};

export function sessionProfiles(session: ScheduleItem): Profile[] {
  return sourceSessionProfiles(session);
}
export const programmeSpeakers: ProgrammeSpeaker[] = createSpeakerDirectory(
  allScheduleItems,
  programmeSnapshot.event
);
const byIdentity = new Map(programmeSpeakers.map((speaker) => [speaker.id, speaker]));

// Scope identity to the source event so sample profiles cannot become 2026 profiles.
export function speakerSlug(person: Pick<Profile, 'name' | 'url'>): string {
  const speaker = byIdentity.get(speakerIdentity(person, programmeSnapshot.event));
  if (!speaker) throw new Error(`Unknown programme speaker: ${person.name}`);
  return speaker.slug;
}

export function speakerPath(
  person: Pick<Profile, 'name' | 'url'>,
  locale: CfpLocale
): string {
  return `/2026/${locale}/speakers/${encodeURIComponent(speakerSlug(person))}/`;
}
