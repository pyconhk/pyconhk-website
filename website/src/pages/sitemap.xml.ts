import type { APIRoute } from 'astro';
import { currentConferenceYear, locales, type SiteLocale } from '@/config/site';
import { canonicalLegacyHighlights } from '@/legacy/year-highlights';
import { getPublishedPostSlugs } from '@/lib/news';
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
  const postSlugs = await getPublishedPostSlugs(conferenceYear);
  const currentYearLocales = cfpLocales.map((locale) => ({
    code: locale,
    htmlLang: cfpLocaleMetadata[locale].htmlLang,
  })) satisfies SitemapLocale[];
  const archiveYearLocales = locales.map((locale) => ({
    code: locale.code,
    htmlLang: locale.htmlLang,
  })) satisfies SitemapLocale[];
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
  const archiveYearEntries = archiveYearLocales.flatMap((locale) =>
    archiveYearSuffixes.map((suffix) =>
      buildEntry(conferenceYear, locale.code, suffix, archiveYearLocales)
    )
  );
  const legacyHighlightEntries = canonicalLegacyHighlights.map((highlight) =>
    buildStaticEntry(highlight.path)
  );
  const entries = [
    ...currentYearEntries,
    ...archiveYearEntries,
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
