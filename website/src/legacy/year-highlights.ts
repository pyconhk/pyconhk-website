import { type LegacyHighlight, legacyHighlights } from '@/legacy/legacy-indexes';

type YearHighlightRoute = {
  edition: string;
  navLabel: string;
  sourceSlug: string;
  slug: string;
};

export type CanonicalLegacyHighlight = {
  edition: string;
  legacyPath: string;
  navLabel: string;
  page: LegacyHighlight;
  path: string;
  slug: string;
};

const highlightRoutes = [
  {
    edition: '2015',
    navLabel: '2015 Photos',
    sourceSlug: '2015-photos',
    slug: 'photos',
  },
  {
    edition: '2016',
    navLabel: '2016 Photos',
    sourceSlug: '2016-photos',
    slug: 'photos',
  },
  {
    edition: '2017',
    navLabel: '2017 Photos',
    sourceSlug: '2017-photos',
    slug: 'photos',
  },
  {
    edition: '2017',
    navLabel: '2017 Recording',
    sourceSlug: '2017-recording',
    slug: 'recording',
  },
  {
    edition: '2018',
    navLabel: '2018 Photos',
    sourceSlug: '2018-photos',
    slug: 'photos',
  },
  {
    edition: '2020-spring',
    navLabel: '2020 Spring Photos',
    sourceSlug: '2020-spring-photos',
    slug: 'photos',
  },
  {
    edition: '2020-spring',
    navLabel: '2020 Spring Conference Coverage',
    sourceSlug: 'conference-coverage',
    slug: 'conference-coverage',
  },
  {
    edition: '2020-fall',
    navLabel: '2020 Fall Photos',
    sourceSlug: 'pycon-hk-2020-fall-photos',
    slug: 'photos',
  },
  {
    edition: '2021',
    navLabel: '2021 Photos',
    sourceSlug: 'pycon-hk-2021-photos',
    slug: 'photos',
  },
  {
    edition: '2022',
    navLabel: '2022 Photos',
    sourceSlug: 'pycon-hk-2022-photos',
    slug: 'photos',
  },
  {
    edition: '2023',
    navLabel: '2023 Photos',
    sourceSlug: 'pycon-hk-2023-photos',
    slug: 'photos',
  },
  {
    edition: '2024',
    navLabel: '2024 Photos',
    sourceSlug: 'pycon-hk-2024-photos',
    slug: 'photos',
  },
] as const satisfies readonly YearHighlightRoute[];

function normalizeLegacyHighlightPath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function getHighlight(sourceSlug: string): LegacyHighlight {
  const match = legacyHighlights.find((page) => page.slug === sourceSlug);

  if (!match) {
    throw new Error(`Missing legacy highlight: ${sourceSlug}`);
  }

  return match;
}

export const canonicalLegacyHighlights = highlightRoutes.map((route) => {
  const page = getHighlight(route.sourceSlug);
  const path = `/${route.edition}/${route.slug}`;

  return {
    edition: route.edition,
    legacyPath: page.path,
    navLabel: route.navLabel,
    page: {
      ...page,
      path,
    },
    path,
    slug: route.slug,
  };
});

export const legacyHighlightNavLinks = canonicalLegacyHighlights
  .map((highlight) => ({
    href: highlight.path,
    label: highlight.navLabel,
  }))
  .toReversed();

const canonicalLegacyHighlightSourcePaths = new Set(
  canonicalLegacyHighlights.map((highlight) =>
    normalizeLegacyHighlightPath(highlight.legacyPath)
  )
);
const canonicalLegacyHighlightPathBySource = new Map(
  canonicalLegacyHighlights.map((highlight) => [
    normalizeLegacyHighlightPath(highlight.legacyPath),
    highlight.path,
  ])
);

export const canonicalLegacyHighlightRedirects = canonicalLegacyHighlights.map(
  (highlight) => ({
    from: highlight.legacyPath,
    to: highlight.path,
  })
);

export function isCanonicalLegacyHighlightSource(pathname: string): boolean {
  return canonicalLegacyHighlightSourcePaths.has(
    normalizeLegacyHighlightPath(pathname)
  );
}

export function canonicalLegacyHighlightPath(pathname: string): string | undefined {
  return canonicalLegacyHighlightPathBySource.get(
    normalizeLegacyHighlightPath(pathname)
  );
}

export function getHighlightsForEdition(edition: string): CanonicalLegacyHighlight[] {
  return canonicalLegacyHighlights.filter((highlight) => highlight.edition === edition);
}
