import {
  defaultLocale,
  isSupportedLocale,
  locales,
  type SiteLocale,
  type SiteYear,
} from '@/config/site';
import {
  isSupportedSection,
  type SiteSectionSlug,
  siteSections,
} from '@/years/2025/data/sections';
import { isSupportedSubpage, siteSubpages } from '@/years/2025/data/subpages';
import { conferenceYear } from '@/years/2025/site';

function normalizeSuffix(suffix: string): string {
  return suffix.replace(/^\/+|\/+$/g, '');
}

function buildPath(...segments: string[]): string {
  const normalizedSegments = segments
    .map((segment) => normalizeSuffix(segment))
    .filter(Boolean);

  if (normalizedSegments.length === 0) {
    return '/';
  }

  return `/${normalizedSegments.join('/')}/`;
}

export function getLocalizedSuffixFromPathname(pathname: string): string {
  const normalizedPathname = normalizeSuffix(pathname);

  if (!normalizedPathname) {
    return '';
  }

  const segments = normalizedPathname.split('/');

  if (isSupportedLocale(segments[0])) {
    return segments.slice(1).join('/');
  }

  if (segments[0] === String(conferenceYear) && isSupportedLocale(segments[1])) {
    return segments.slice(2).join('/');
  }

  return '';
}

export function isCurrentYear(year: SiteYear): boolean {
  return year === conferenceYear;
}

export function buildLocalizedPath(year: SiteYear, locale: SiteLocale, suffix = '') {
  const normalizedSuffix = normalizeSuffix(suffix);

  if (isCurrentYear(year)) {
    return buildPath(locale, normalizedSuffix);
  }

  return buildPath(String(year), locale, normalizedSuffix);
}

export function buildLocaleSwitchPath(
  pathname: string,
  year: SiteYear,
  locale: SiteLocale,
  fallbackSuffix = ''
) {
  const detectedSuffix = getLocalizedSuffixFromPathname(pathname);
  const resolvedSuffix = detectedSuffix || normalizeSuffix(fallbackSuffix);

  return buildLocalizedPath(year, locale, resolvedSuffix);
}

export function getCurrentYearLocaleStaticPaths() {
  return locales.map((locale) => ({
    params: {
      locale: locale.code,
    },
  }));
}

export function getCurrentYearLocaleSectionStaticPaths() {
  return locales.flatMap((locale) =>
    siteSections
      .filter((section) => section.slug !== 'news')
      .map((section) => ({
        params: {
          locale: locale.code,
          section: section.slug,
        },
      }))
  );
}

export function getCurrentYearLocaleSubpageStaticPaths() {
  return locales.flatMap((locale) =>
    siteSubpages.map((subpage) => ({
      params: {
        locale: locale.code,
        section: subpage.section,
        subsection: subpage.subsection,
      },
    }))
  );
}

export function resolveLocaleParam(value: string | undefined): SiteLocale {
  if (!value || !isSupportedLocale(value)) {
    return defaultLocale;
  }

  return value;
}

export function resolveSectionParam(value: string | undefined): SiteSectionSlug {
  if (!value || !isSupportedSection(value)) {
    return 'about';
  }

  return value;
}

export function resolveSubpageParam(
  section: SiteSectionSlug,
  value: string | undefined
): string {
  if (!value || !isSupportedSubpage(section, value)) {
    throw new Error(`Unsupported subpage: ${section}/${value ?? ''}`);
  }

  return value;
}
