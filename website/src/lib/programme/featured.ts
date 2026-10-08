import { sessionProfiles } from './speakers.ts';
import type { ProgrammeSnapshot } from './types';

type FeaturedTalkFallback = {
  code: string;
  name: string;
  title: string;
  language: string;
  abstract: string;
  biography: string;
  image: unknown;
};

type ResolvedFeaturedTalk<T extends FeaturedTalkFallback> = Omit<
  T,
  'name' | 'image'
> & {
  name: string;
  image: T['image'] | string;
  portraitName: string;
  description: string;
  profiles: {
    name: string;
    biography: string;
    image: T['image'] | string;
  }[];
};

// Curation selects the card, route and portrait. Once the current programme is
// public, its linked submission supplies the attendee-facing talk and speakers.
export function resolveFeaturedTalk<T extends FeaturedTalkFallback>(
  featured: T,
  programme: Pick<ProgrammeSnapshot, 'event' | 'status' | 'sessions'>
): ResolvedFeaturedTalk<T> {
  const session =
    programme.event === 'pyconhk2026' && programme.status === 'published'
      ? programme.sessions.find(
          (session) => session.code === featured.code && !session.isBreak
        )
      : undefined;
  const profiles = session
    ? sessionProfiles(session).map((person) => ({
        name: person.name,
        biography: person.biography,
        image: person.name === featured.name ? featured.image : person.avatar,
      }))
    : [{ name: featured.name, biography: featured.biography, image: featured.image }];
  const portrait =
    profiles.find((person) => person.name === featured.name) ?? profiles[0];
  return {
    ...featured,
    title: session?.title ?? featured.title,
    language: session?.language ?? featured.language,
    abstract: session?.abstract ?? featured.abstract,
    description: session?.description ?? '',
    name: profiles.map((person) => person.name).join(', '),
    image: portrait?.image ?? '',
    portraitName: portrait?.name ?? '',
    profiles,
  };
}
