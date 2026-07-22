import type { SiteLocale, SiteYear } from '@/config/site';
import { getCurrentYearI18n, getYearI18n } from '@/i18n/registry';
import type { TranslationMessages } from '@/years/2025/i18n';
import { conferenceYear } from '@/years/2025/site';

type TranslationNamespace = keyof TranslationMessages;
type TranslationKey<TNamespace extends TranslationNamespace> = Extract<
  keyof TranslationMessages[TNamespace],
  string
>;

export function getUiFromLang(lang: SiteLocale, year: SiteYear = conferenceYear) {
  return getYearI18n(year).getUiFromLang(lang);
}

export function getMessages<TNamespace extends TranslationNamespace>(
  lang: SiteLocale,
  namespace: TNamespace,
  year: SiteYear = conferenceYear
) {
  return getYearI18n(year).getMessages(lang, namespace);
}

export function getTranslations<TNamespace extends TranslationNamespace>(
  lang: SiteLocale,
  namespace: TNamespace,
  year: SiteYear = conferenceYear
): (key: TranslationKey<TNamespace>) => string {
  return getYearI18n(year).getTranslations(lang, namespace);
}

export function useTranslations(
  lang: SiteLocale,
  year: SiteYear = conferenceYear
): (key: string) => string {
  return getYearI18n(year).useTranslations(lang);
}

export const { defaultLang, languages, ui } = getCurrentYearI18n();
