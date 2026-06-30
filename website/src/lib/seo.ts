import {
  defaultLocale,
  locales,
  type SiteLocale,
  siteUrl,
  socialImagePath,
} from '@/config/site';
import { conferenceYear } from '@/years/2025/site';

type AlternateLink = {
  href: string;
  hreflang: string;
};

type SeoMetadataInput = {
  pathname: string;
  imagePath?: string;
};

type ParsedLocalizedPath = {
  locale: SiteLocale;
  suffix: string;
  year: number;
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
  return Boolean(value && /^\d{4}$/.test(value));
}

function findLocale(value: string | undefined): SiteLocale | undefined {
  return locales.find((locale) => locale.code === value)?.code;
}

function parseLocalizedPath(pathname: string): ParsedLocalizedPath | null {
  const normalizedPathname = normalizeSuffix(pathname);

  if (!normalizedPathname) {
    return {
      locale: defaultLocale,
      suffix: '',
      year: conferenceYear,
    };
  }

  const segments = normalizedPathname.split('/');
  const locale = findLocale(segments[0]);

  if (locale) {
    return {
      locale,
      suffix: segments.slice(1).join('/'),
      year: conferenceYear,
    };
  }

  if (isFourDigitYear(segments[0])) {
    const yearLocale = findLocale(segments[1]);

    if (yearLocale) {
      return {
        locale: yearLocale,
        suffix: segments.slice(2).join('/'),
        year: Number(segments[0]),
      };
    }
  }

  return null;
}

export function buildCanonicalPath(pathname: string): string {
  const parsedPath = parseLocalizedPath(pathname);

  if (!parsedPath) {
    return buildPath(pathname);
  }

  if (parsedPath.year === conferenceYear) {
    return buildPath(parsedPath.locale, parsedPath.suffix);
  }

  return buildPath(String(parsedPath.year), parsedPath.locale, parsedPath.suffix);
}

export function buildLocalizedCanonicalPath(
  pathname: string,
  locale: SiteLocale
): string {
  const parsedPath = parseLocalizedPath(pathname);
  const year = parsedPath?.year ?? conferenceYear;
  const suffix = parsedPath?.suffix ?? '';

  if (year === conferenceYear) {
    return buildPath(locale, suffix);
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
  const canonicalPath = buildCanonicalPath(pathname);
  const alternates: AlternateLink[] = locales.map((locale) => ({
    href: toAbsoluteSiteUrl(buildLocalizedCanonicalPath(pathname, locale.code)),
    hreflang: locale.htmlLang,
  }));
  const defaultAlternate = {
    href: toAbsoluteSiteUrl(buildLocalizedCanonicalPath(pathname, defaultLocale)),
    hreflang: 'x-default',
  };

  return {
    alternates: [...alternates, defaultAlternate],
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    imageUrl: toAbsoluteSiteUrl(imagePath ?? socialImagePath),
  };
}

export function toOpenGraphLocale(htmlLang: string): string {
  return htmlLang.replaceAll('-', '_');
}
