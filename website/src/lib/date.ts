import { getLocaleDefinition, type SiteLocale } from '../config/site.ts';

export function formatDate(dateString: string, locale: SiteLocale, timeZone = 'UTC') {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    day: 'numeric',
    month: 'long',
    timeZone,
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatCompactDate(dateString: string, locale: SiteLocale) {
  return formatDate(dateString, locale);
}
