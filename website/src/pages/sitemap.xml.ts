import type { APIRoute } from 'astro';
import { currentConferenceYear, type SiteLocale } from '@/config/site';
import { migratedTopLevelRouteTargets } from '@/legacy/migrated-routes';
import { canonicalLegacyHighlights } from '@/legacy/year-highlights';
import { getPublishedPostSlugs } from '@/lib/news';
import { buildLocalizedCanonicalPath, toAbsoluteSiteUrl } from '@/lib/seo';
import routeContract2016 from '@/years/2016/data/routes.json';
import routeContract2017 from '@/years/2017/data/routes.json';
import routeContract2018 from '@/years/2018/data/routes.json';
import { siteSections } from '@/years/2025/data/sections';
import { siteSubpages } from '@/years/2025/data/subpages';
import { conferenceYear } from '@/years/2025/site';
import {
  type CfpLocale,
  localeMetadata as cfpLocaleMetadata,
  supportedLocales as cfpLocales,
} from '@/years/2026/data/cfp';

type SitemapEntry = {
  alternates: {
    href: string;
    hreflang: string;
  }[];
  loc: string;
};

type SitemapLocale = {
  code: SiteLocale | CfpLocale;
  htmlLang: string;
};

export const prerender = true;

const legacyYearPaths = [
  '/2015',
  '/2016',
  '/2017',
  '/2018',
  '/2020-spring',
  '/2020-fall',
  '/2020',
  '/2021',
  '/2022',
  '/2023',
  '/2024',
  '/2024/news',
];
const legacy2016MicrositePaths = routeContract2016.requiredRoutes.map((route) =>
  route.replace(/\/$/u, '')
);
const legacy2017MicrositePaths = routeContract2017.requiredRoutes.map((route) =>
  route.replace(/\/$/u, '')
);
const legacy2018WordPressPaths = routeContract2018.requiredRoutes.map((route) =>
  route.replace(/\/$/u, '')
);

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildEntry(
  year: number,
  locale: SiteLocale | CfpLocale,
  suffix: string,
  sitemapLocales: readonly SitemapLocale[]
): SitemapEntry {
  const pathname = buildLocalizedCanonicalPath(`/${year}/${locale}/${suffix}`, locale);
  const alternates = sitemapLocales.map((alternateLocale) => ({
    href: toAbsoluteSiteUrl(
      buildLocalizedCanonicalPath(`/${year}/${locale}/${suffix}`, alternateLocale.code)
    ),
    hreflang: alternateLocale.htmlLang,
  }));

  return {
    alternates: [
      ...alternates,
      {
        href: toAbsoluteSiteUrl(
          buildLocalizedCanonicalPath(`/${year}/${locale}/${suffix}`, 'en')
        ),
        hreflang: 'x-default',
      },
    ],
    loc: toAbsoluteSiteUrl(pathname),
  };
}

function buildStaticEntry(pathname: string): SitemapEntry {
  return {
    alternates: [],
    loc: toAbsoluteSiteUrl(pathname),
  };
}

function uniqueEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.loc)) {
      return false;
    }

    seen.add(entry.loc);

    return true;
  });
}

function buildDefaultYearPath(year: number, suffix: string): string {
  const normalizedSuffix = suffix.replace(/^\/+|\/+$/g, '');

  return `/${[String(year), normalizedSuffix].filter(Boolean).join('/')}`;
}

function serializeEntry(entry: SitemapEntry): string {
  const alternates = entry.alternates
    .map(
      (alternate) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`
    )
    .join('\n');

  return [
    '  <url>',
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    alternates,
    '  </url>',
  ].join('\n');
}

export const GET: APIRoute = async () => {
  const [postSlugs, currentPostSlugs] = await Promise.all([
    getPublishedPostSlugs(conferenceYear),
    getPublishedPostSlugs(currentConferenceYear),
  ]);
  const currentYearLocales = cfpLocales.map((locale) => ({
    code: locale,
    htmlLang: cfpLocaleMetadata[locale].htmlLang,
  })) satisfies SitemapLocale[];
  const currentYearEntries = currentYearLocales.flatMap((locale) =>
    [
      '',
      'about',
      'cfp',
      'news',
      'schedule',
      'privacy-policy',
      'code-of-conduct',
      'code-of-conduct/attendee-reporting',
      'code-of-conduct/staff-procedures',
      'organizers',
      'volunteers',
      'supporting-organizations',
      'sponsorships',
      'sponsorships/opportunities',
      'sponsorships/patrons',
      'access-guide',
      'catering-guide',
      'sprint',
      'sprint/qna',
      ...currentPostSlugs.map((slug) => `news/${slug}`),
    ].map((suffix) =>
      buildEntry(currentConferenceYear, locale.code, suffix, currentYearLocales)
    )
  );
  const archiveYearSuffixes = [
    '',
    'news',
    ...siteSections
      .filter((section) => section.slug !== 'news')
      .map((section) => section.slug),
    ...siteSubpages.map((subpage) => `${subpage.section}/${subpage.subsection}`),
    ...postSlugs.map((slug) => `news/${slug}`),
  ];
  const archiveYearEntries = archiveYearSuffixes.map((suffix) =>
    buildStaticEntry(buildDefaultYearPath(conferenceYear, suffix))
  );
  const legacyYearEntries = legacyYearPaths.map(buildStaticEntry);
  const legacy2016MicrositeEntries = legacy2016MicrositePaths.map(buildStaticEntry);
  const legacy2017MicrositeEntries = legacy2017MicrositePaths.map(buildStaticEntry);
  const legacy2018WordPressEntries = legacy2018WordPressPaths.map(buildStaticEntry);
  const legacyHighlightEntries = canonicalLegacyHighlights.map((highlight) =>
    buildStaticEntry(highlight.path)
  );
  const migratedTopLevelRouteEntries =
    migratedTopLevelRouteTargets.map(buildStaticEntry);
  const entries = uniqueEntries([
    ...currentYearEntries,
    ...archiveYearEntries,
    ...legacyYearEntries,
    ...legacy2016MicrositeEntries,
    ...legacy2017MicrositeEntries,
    ...legacy2018WordPressEntries,
    ...migratedTopLevelRouteEntries,
    ...legacyHighlightEntries,
  ]);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(serializeEntry),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
