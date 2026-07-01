import type { APIRoute } from 'astro';
import { currentConferenceYear, locales, type SiteLocale } from '@/config/site';
import { legacyHighlights } from '@/legacy/legacy-indexes';
import { getAvailablePostYears, getPublishedPostSlugs } from '@/lib/news';
import { buildLocalizedCanonicalPath, toAbsoluteSiteUrl } from '@/lib/seo';
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

type SiteSitemapLocale = {
  code: SiteLocale;
  htmlLang: string;
};

export const prerender = true;

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

function buildYearOwnedPath(year: number, locale: SiteLocale, suffix: string): string {
  const normalizedSuffix = suffix.replace(/^\/+|\/+$/g, '');

  return `/${[String(year), locale, normalizedSuffix].filter(Boolean).join('/')}`;
}

function buildDefaultYearPath(year: number, suffix: string): string {
  const normalizedSuffix = suffix.replace(/^\/+|\/+$/g, '');

  return `/${[String(year), normalizedSuffix].filter(Boolean).join('/')}`;
}

function buildYearOwnedEntry(
  year: number,
  locale: SiteLocale,
  suffix: string,
  sitemapLocales: readonly SiteSitemapLocale[]
): SitemapEntry {
  const alternates = sitemapLocales.map((alternateLocale) => ({
    href: toAbsoluteSiteUrl(buildYearOwnedPath(year, alternateLocale.code, suffix)),
    hreflang: alternateLocale.htmlLang,
  }));

  return {
    alternates: [
      ...alternates,
      {
        href: toAbsoluteSiteUrl(buildYearOwnedPath(year, 'en', suffix)),
        hreflang: 'x-default',
      },
    ],
    loc: toAbsoluteSiteUrl(buildYearOwnedPath(year, locale, suffix)),
  };
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
  const availablePostYears = await getAvailablePostYears();
  const postSlugs = await getPublishedPostSlugs(conferenceYear);
  const currentYearLocales = cfpLocales.map((locale) => ({
    code: locale,
    htmlLang: cfpLocaleMetadata[locale].htmlLang,
  })) satisfies SitemapLocale[];
  const archiveYearLocales = locales.map((locale) => ({
    code: locale.code,
    htmlLang: locale.htmlLang,
  })) satisfies SiteSitemapLocale[];
  const currentYearEntries = currentYearLocales.map((locale) =>
    buildEntry(currentConferenceYear, locale.code, '', currentYearLocales)
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
  const cmsPostEntries = (
    await Promise.all(
      availablePostYears
        .filter((year) => year !== conferenceYear)
        .map(async (year) => {
          const slugs = await getPublishedPostSlugs(year);

          return archiveYearLocales.flatMap((locale) =>
            slugs.map((slug) =>
              buildYearOwnedEntry(year, locale.code, `news/${slug}`, archiveYearLocales)
            )
          );
        })
    )
  ).flat();
  const legacyHighlightEntries = legacyHighlights.map((highlight) =>
    buildStaticEntry(highlight.path)
  );
  const entries = [
    ...currentYearEntries,
    ...archiveYearEntries,
    ...cmsPostEntries,
    ...legacyHighlightEntries,
  ];
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
