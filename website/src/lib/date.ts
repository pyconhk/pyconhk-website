import { getLocaleDefinition, type SiteLocale } from '@/config/site';

export function formatDate(dateString: string, locale: SiteLocale) {
  return new Intl.DateTimeFormat(getLocaleDefinition(locale).htmlLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
