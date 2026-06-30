import { type LegacyHighlight, legacyHighlights } from '@/legacy/legacy-indexes';

type YearHighlightRoute = {
  edition: string;
  sourceSlug: string;
  slug: string;
};

export type CanonicalLegacyHighlight = {
  edition: string;
  legacyPath: string;
  page: LegacyHighlight;
  path: string;
  slug: string;
};

const highlightRoutes = [
  { edition: '2015', sourceSlug: '2015-photos', slug: 'photos' },
  { edition: '2016', sourceSlug: '2016-photos', slug: 'photos' },
  { edition: '2017', sourceSlug: '2017-photos', slug: 'photos' },
  { edition: '2017', sourceSlug: '2017-recording', slug: 'recording' },
  { edition: '2018', sourceSlug: '2018-photos', slug: 'photos' },
  { edition: '2020-spring', sourceSlug: '2020-spring-photos', slug: 'photos' },
  {
    edition: '2020-spring',
    sourceSlug: 'conference-coverage',
    slug: 'conference-coverage',
  },
  { edition: '2020-fall', sourceSlug: 'pycon-hk-2020-fall-photos', slug: 'photos' },
  { edition: '2021', sourceSlug: 'pycon-hk-2021-photos', slug: 'photos' },
  { edition: '2022', sourceSlug: 'pycon-hk-2022-photos', slug: 'photos' },
  { edition: '2023', sourceSlug: 'pycon-hk-2023-photos', slug: 'photos' },
  { edition: '2024', sourceSlug: 'pycon-hk-2024-photos', slug: 'photos' },
] as const satisfies readonly YearHighlightRoute[];

function getHighlight(sourceSlug: string): LegacyHighlight {
  const match = legacyHighlights.find((page) => page.slug === sourceSlug);

  if (!match) {
    throw new Error(`Missing legacy highlight: ${sourceSlug}`);
  }

  return match;
}

export const canonicalLegacyHighlights = highlightRoutes.map((route) => {
  const page = getHighlight(route.sourceSlug);
  const path = `/${route.edition}/${route.slug}/`;

  return {
    edition: route.edition,
    legacyPath: page.path,
    page: {
      ...page,
      path,
    },
    path,
    slug: route.slug,
  };
});

export function getHighlightsForEdition(edition: string): CanonicalLegacyHighlight[] {
  return canonicalLegacyHighlights.filter((highlight) => highlight.edition === edition);
}
