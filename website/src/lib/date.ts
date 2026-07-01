import { getLocaleDefinition, type SiteLocale } from '@/config/site';

export function formatDate(dateString: string, locale: SiteLocale) {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatCompactDate(dateString: string, locale: SiteLocale) {
  return formatDate(dateString, locale);
}
