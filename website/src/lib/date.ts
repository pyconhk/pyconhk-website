import { getLocaleDefinition, type SiteLocale } from '@/config/site';

export function formatDate(dateString: string, locale: SiteLocale) {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatCompactDate(dateString: string, locale: SiteLocale) {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}
