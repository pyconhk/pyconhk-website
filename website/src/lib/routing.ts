import {
  currentConferenceYear,
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

const sectionAliases: Partial<Record<string, SiteSectionSlug>> = {
  sponsors: 'sponsorships',
};

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

function isFourDigitYear(value: string | undefined): boolean {
  return Boolean(value && /^\d{4}$/u.test(value));
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

  if (segments[0] === String(currentConferenceYear) && isSupportedLocale(segments[1])) {
    return segments.slice(2).join('/');
  }

  if (isFourDigitYear(segments[0])) {
    if (isSupportedLocale(segments[1])) {
      return segments.slice(2).join('/');
    }

    return segments.slice(1).join('/');
  }

  return '';
}

export function isCurrentYear(year: SiteYear): boolean {
  return year === currentConferenceYear;
}

export function buildLocalizedPath(year: SiteYear, locale: SiteLocale, suffix = '') {
  const normalizedSuffix = normalizeSuffix(suffix);

  if (year === 2025) {
    return buildPath(String(year), normalizedSuffix);
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

function getSectionRouteSlugs(section: SiteSectionSlug): string[] {
  const aliases = Object.entries(sectionAliases)
    .filter(([, canonicalSection]) => canonicalSection === section)
    .map(([alias]) => alias);

  return [section, ...aliases];
}

export function getDefaultLocaleSectionStaticPaths() {
  return siteSections.flatMap((section) =>
    getSectionRouteSlugs(section.slug).map((sectionSlug) => ({
      params: {
        section: sectionSlug,
      },
    }))
  );
}

export function getDefaultLocaleSubpageStaticPaths() {
  return siteSubpages.flatMap((subpage) =>
    getSectionRouteSlugs(subpage.section).map((sectionSlug) => ({
      params: {
        section: sectionSlug,
        subsection: subpage.subsection,
      },
    }))
  );
}

export function getCurrentYearLocaleSectionStaticPaths() {
  return locales.flatMap((locale) =>
    siteSections
      .filter((section) => section.slug !== 'news')
      .flatMap((section) =>
        getSectionRouteSlugs(section.slug).map((sectionSlug) => ({
          params: {
            locale: locale.code,
            section: sectionSlug,
          },
        }))
      )
  );
}

export function getCurrentYearLocaleSubpageStaticPaths() {
  return locales.flatMap((locale) =>
    siteSubpages.flatMap((subpage) =>
      getSectionRouteSlugs(subpage.section).map((sectionSlug) => ({
        params: {
          locale: locale.code,
          section: sectionSlug,
          subsection: subpage.subsection,
        },
      }))
    )
  );
}

export function resolveLocaleParam(value: string | undefined): SiteLocale {
  if (!value || !isSupportedLocale(value)) {
    return defaultLocale;
  }

  return value;
}

export function resolveSectionParam(value: string | undefined): SiteSectionSlug {
  if (!value) {
    return 'about';
  }

  if (isSupportedSection(value)) {
    return value;
  }

  return sectionAliases[value] ?? 'about';
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
