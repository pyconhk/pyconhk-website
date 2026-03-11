import type { conferenceYear } from '@/years/2025/site';

export const siteName = 'PyCon Hong Kong';
export const siteUrl = 'https://pycon.hk';

export type SiteYear = typeof conferenceYear;

export const locales = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    htmlLang: 'en-HK',
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
} as const satisfies Record<SiteLocale, readonly SiteLocale[]>;

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
