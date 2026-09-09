import {
  archiveLocales,
  archiveSocialImagePaths,
  currentConferenceYear,
  defaultLocale,
  type SiteLocale,
  siteUrl,
  socialImagePath,
} from '@/config/site';
import {
  type CfpLocale,
  localeMetadata as cfpLocaleMetadata,
  supportedLocales as cfpLocales,
} from '@/years/2026/data/cfp';

type AlternateLink = {
  href: string;
  hreflang: string;
};

type SeoMetadataInput = {
  pathname: string;
  imagePath?: string;
};

type ParsedLocalizedPath = {
  advertiseAlternates: boolean;
  locale: string;
  suffix: string;
  year: number;
};

type SeoLocale = {
  code: string;
  htmlLang: string;
};

const archiveConferenceYear = 2025;
const archiveRootAliases = new Set(['news']);
const siteLocaleDefinitions = archiveLocales.map((locale) => ({
  code: locale.code,
  htmlLang: locale.htmlLang,
})) satisfies SeoLocale[];
const cfpLocaleDefinitions = cfpLocales.map((locale) => ({
  code: locale,
  htmlLang: cfpLocaleMetadata[locale].htmlLang,
})) satisfies SeoLocale[];

function normalizeSuffix(suffix: string): string {
  return suffix.replace(/^\/+|\/+$/g, '');
}

function normalizeAstroPathname(pathname: string): string {
  const normalizedPathname = pathname
    .replace(/\/index\.html$/u, '/')
    .replace(/\.html$/u, '');

  return normalizedPathname || '/';
}

function buildPath(...segments: string[]): string {
  const normalizedSegments = segments
    .map((segment) => normalizeSuffix(segment))
    .filter(Boolean);

  if (normalizedSegments.length === 0) {
    return '/';
  }

  const pathname = `/${normalizedSegments.join('/')}`;
  return /^\/2026\/[^/]+\/(speakers|talks)\/[^/]+$/u.test(pathname)
    ? `${pathname}/`
    : pathname;
}

function isFourDigitYear(value: string | undefined): boolean {
  return Boolean(value && /^\d{4}$/.test(value));
}

function getSeoLocalesForYear(year: number): readonly SeoLocale[] {
  if (year === currentConferenceYear) {
    return cfpLocaleDefinitions;
  }

  if (year === archiveConferenceYear) {
    return siteLocaleDefinitions;
  }

  return [];
}

function findLocale(
  value: string | undefined,
  seoLocales: readonly SeoLocale[]
): string | undefined {
  return seoLocales.find((locale) => locale.code === value)?.code;
}

function parseLocalizedPath(pathname: string): ParsedLocalizedPath | null {
  const normalizedPathname = normalizeSuffix(normalizeAstroPathname(pathname));
  const currentYearLocales = getSeoLocalesForYear(currentConferenceYear);

  if (!normalizedPathname) {
    return {
      advertiseAlternates: true,
      locale: defaultLocale,
      suffix: '',
      year: currentConferenceYear,
    };
  }

  const segments = normalizedPathname.split('/');
  const locale = findLocale(segments[0], currentYearLocales);

  if (locale) {
    return {
      advertiseAlternates: true,
      locale,
      suffix: segments.slice(1).join('/'),
      year: currentConferenceYear,
    };
  }

  if (archiveRootAliases.has(segments[0])) {
    return {
      advertiseAlternates: false,
      locale: defaultLocale,
      suffix: segments.join('/'),
      year: archiveConferenceYear,
    };
  }

  if (isFourDigitYear(segments[0])) {
    const year = Number(segments[0]);
    const yearLocales = getSeoLocalesForYear(year);
    const yearLocale = findLocale(segments[1], yearLocales);

    if (yearLocale) {
      return {
        advertiseAlternates: true,
        locale: yearLocale,
        suffix: segments.slice(2).join('/'),
        year,
      };
    }

    if (yearLocales.length > 0 && segments.length === 1) {
      return {
        advertiseAlternates: year === currentConferenceYear,
        locale: defaultLocale,
        suffix: '',
        year,
      };
    }

    if (year === archiveConferenceYear && segments.length > 1) {
      return {
        advertiseAlternates: false,
        locale: defaultLocale,
        suffix: segments.slice(1).join('/'),
        year,
      };
    }
  }

  return null;
}

function getDefaultSocialImagePath(parsedPath: ParsedLocalizedPath | null): string {
  if (!parsedPath || parsedPath.year === archiveConferenceYear) {
    return archiveSocialImagePaths[archiveConferenceYear] ?? socialImagePath;
  }

  return socialImagePath;
}

export function buildCanonicalPath(pathname: string): string {
  const normalizedPathname = normalizeAstroPathname(pathname);
  const parsedPath = parseLocalizedPath(normalizedPathname);

  if (!parsedPath) {
    return buildPath(normalizedPathname);
  }

  if (parsedPath.year === currentConferenceYear) {
    return buildPath(String(parsedPath.year), parsedPath.locale, parsedPath.suffix);
  }

  if (parsedPath.year === archiveConferenceYear) {
    return buildPath(String(parsedPath.year), parsedPath.suffix);
  }

  return buildPath(String(parsedPath.year), parsedPath.locale, parsedPath.suffix);
}

export function buildLocalizedCanonicalPath(
  pathname: string,
  locale: SiteLocale | CfpLocale | string
): string {
  const parsedPath = parseLocalizedPath(pathname);
  const year = parsedPath?.year ?? currentConferenceYear;
  const suffix = parsedPath?.suffix ?? '';

  if (year === currentConferenceYear) {
    return buildPath(String(year), locale, suffix);
  }

  if (year === archiveConferenceYear) {
    return buildPath(String(year), suffix);
  }

  return buildPath(String(year), locale, suffix);
}

export function toAbsoluteSiteUrl(pathname: string): string {
  if (/^https?:\/\//.test(pathname)) {
    return pathname;
  }

  const absolutePathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return new URL(absolutePathname, siteUrl).toString();
}

export function buildSeoMetadata({ pathname, imagePath }: SeoMetadataInput) {
  const parsedPath = parseLocalizedPath(pathname);
  const canonicalPath = buildCanonicalPath(pathname);
  const seoLocales = parsedPath?.advertiseAlternates
    ? getSeoLocalesForYear(parsedPath.year)
    : [];
  const alternates: AlternateLink[] = seoLocales.map((locale) => ({
    href: toAbsoluteSiteUrl(buildLocalizedCanonicalPath(pathname, locale.code)),
    hreflang: locale.htmlLang,
  }));
  const defaultAlternate =
    seoLocales.length > 0
      ? {
          href: toAbsoluteSiteUrl(buildLocalizedCanonicalPath(pathname, defaultLocale)),
          hreflang: 'x-default',
        }
      : null;

  return {
    alternates: defaultAlternate ? [...alternates, defaultAlternate] : alternates,
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    imageUrl: toAbsoluteSiteUrl(imagePath ?? getDefaultSocialImagePath(parsedPath)),
  };
}

export function toOpenGraphLocale(htmlLang: string): string {
  return htmlLang.replaceAll('-', '_');
}
