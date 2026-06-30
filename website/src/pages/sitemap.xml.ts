import type { APIRoute } from 'astro';
import { locales, type SiteLocale } from '@/config/site';
import { getPublishedPostSlugs } from '@/lib/news';
import { buildLocalizedCanonicalPath, toAbsoluteSiteUrl } from '@/lib/seo';
import { siteSections } from '@/years/2025/data/sections';
import { siteSubpages } from '@/years/2025/data/subpages';
import { conferenceYear } from '@/years/2025/site';

type SitemapEntry = {
  alternates: {
    href: string;
    hreflang: string;
  }[];
  loc: string;
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

function buildEntry(locale: SiteLocale, suffix: string): SitemapEntry {
  const pathname = buildLocalizedCanonicalPath(`/${locale}/${suffix}`, locale);
  const alternates = locales.map((alternateLocale) => ({
    href: toAbsoluteSiteUrl(
      buildLocalizedCanonicalPath(`/${locale}/${suffix}`, alternateLocale.code)
    ),
    hreflang: alternateLocale.htmlLang,
  }));

  return {
    alternates: [
      ...alternates,
      {
        href: toAbsoluteSiteUrl(
          buildLocalizedCanonicalPath(`/${locale}/${suffix}`, 'en')
        ),
        hreflang: 'x-default',
      },
    ],
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
  const suffixes = [
    '',
    'news',
    ...siteSections
      .filter((section) => section.slug !== 'news')
      .map((section) => section.slug),
    ...siteSubpages.map((subpage) => `${subpage.section}/${subpage.subsection}`),
    ...postSlugs.map((slug) => `news/${slug}`),
  ];
  const entries = locales.flatMap((locale) =>
    suffixes.map((suffix) => buildEntry(locale.code, suffix))
  );
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
