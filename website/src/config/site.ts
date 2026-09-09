export const siteName = 'PyCon HK';
export const siteUrl = new URL(import.meta.env?.PUBLIC_SITE_URL || 'https://pycon.hk')
  .origin;
export const currentConferenceYear = 2026 as const;
export const defaultSeoTitle = 'PyCon HK 2026 | Ride and Leverage with AI';
export const defaultSeoDescription =
  'PyCon Hong Kong 2026 — A spirited gathering for Python people, ideas, and open-source possibility right in the heart of Hong Kong.';
export const defaultOpenGraphTitle = 'PyCon HK 2026 | Ride and Leverage with AI';
export const defaultOpenGraphDescription =
  'Ride and Leverage with AI — 14–15 November 2026';
export const socialImagePath = '/2026/conference-share.png';
export const archiveSocialImagePaths = {
  2025: '/2025/landing-pages/open-graph.webp',
} as const;
export const socialHandle = '@pyconhk';

export type SiteYear = 2025 | typeof currentConferenceYear;

export const archiveLocales = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    htmlLang: 'en',
  },
  {
    code: 'zh-hk',
    label: 'Cantonese',
    nativeLabel: '廣東話',
    htmlLang: 'zh-Hant-HK',
  },
  {
    code: 'zh-hant',
    label: 'Traditional Chinese',
    nativeLabel: '繁體中文',
    htmlLang: 'zh-Hant',
  },
  {
    code: 'zh-hans',
    label: 'Simplified Chinese',
    nativeLabel: '简体中文',
    htmlLang: 'zh-Hans',
  },
  {
    code: 'ja',
    label: 'Japanese',
    nativeLabel: '日本語',
    htmlLang: 'ja-JP',
  },
] as const;

export const locales = [
  ...archiveLocales,
  {
    code: 'ko',
    label: 'Korean',
    nativeLabel: '한국어',
    htmlLang: 'ko-KR',
  },
] as const;

export type ArchiveLocale = (typeof archiveLocales)[number]['code'];
export type SiteLocale = (typeof locales)[number]['code'];
export type LocalizedValue<T> = Partial<Record<SiteLocale, T>> & { en: T };

export const defaultLocale: SiteLocale = 'en';
export const preferredLocaleCookie = 'preferredLocale';

const localeFallbacks = {
  en: ['en'],
  'zh-hk': ['zh-hk', 'zh-hant', 'en'],
  'zh-hant': ['zh-hant', 'en'],
  'zh-hans': ['zh-hans', 'zh-hant', 'en'],
  ja: ['ja', 'en'],
  ko: ['ko', 'en'],
} as const satisfies Record<SiteLocale, readonly SiteLocale[]>;

export function getLocalesForYear(year: number) {
  return year >= 2026 ? locales : archiveLocales;
}

export function isSupportedLocale(value: string): value is SiteLocale {
  return locales.some((locale) => locale.code === value);
}

export function getLocaleFallbackChain(locale: SiteLocale): readonly SiteLocale[] {
  return localeFallbacks[locale];
}

export function resolveLocalizedValue<T>(
  value: Partial<Record<SiteLocale, T>>,
  locale: SiteLocale
): T | undefined {
  for (const candidate of getLocaleFallbackChain(locale)) {
    const resolvedValue = value[candidate];

    if (resolvedValue !== undefined) {
      return resolvedValue;
    }
  }

  return undefined;
}

export function resolveRequiredLocalizedValue<T>(
  value: LocalizedValue<T>,
  locale: SiteLocale
): T {
  const resolvedValue = resolveLocalizedValue(value, locale);

  if (resolvedValue === undefined) {
    throw new Error(`Missing localized value for locale: ${locale}`);
  }

  return resolvedValue;
}

export function getLocaleDefinition(locale: SiteLocale) {
  const match = locales.find((entry) => entry.code === locale);

  if (!match) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  return match;
}
