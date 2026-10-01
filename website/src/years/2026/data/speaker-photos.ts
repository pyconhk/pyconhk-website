import type { ScheduleItem } from '../../../lib/programme/types';

type SpeakerProfile = NonNullable<ScheduleItem['speakerProfiles']>[number];

// Verified 2026 Pretalx identities with existing official committee portraits.
// Match both the event-specific profile URL and name; never infer a photo from a
// name alone or substitute a generic portrait for a speaker without one.
const committeePortraits: Record<string, { name: string; avatar: string }> = {
  'https://pretalx.com/pyconhk2026/speaker/NYAWQ3/': {
    name: 'Calvin Tsang',
    avatar: '/2026/organizers-volunteers/volunteers/calvin-tsang-compressed.webp',
  },
  'https://pretalx.com/pyconhk2026/speaker/HTU7CV/': {
    name: 'Dr. Adrian Tam',
    avatar: '/2026/organizers-volunteers/volunteers/adrian-tam-compressed.webp',
  },
};

export function withOfficialSpeakerPhoto(profile: SpeakerProfile): SpeakerProfile {
  const portrait = committeePortraits[profile.url];
  return !profile.avatar && portrait?.name === profile.name
    ? { ...profile, avatar: portrait.avatar }
    : profile;
}
