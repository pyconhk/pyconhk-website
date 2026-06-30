import type { SiteYear } from '@/config/site';
import * as year2025I18n from '@/years/2025/i18n';
import { conferenceYear } from '@/years/2025/site';

export type YearI18nRegistryEntry = typeof year2025I18n;

export function getYearI18n(year: SiteYear): YearI18nRegistryEntry {
  if (year === conferenceYear) {
    return year2025I18n;
  }

  throw new Error(`Unsupported year for i18n: ${year}`);
}

export function getCurrentYearI18n(): YearI18nRegistryEntry {
  return getYearI18n(conferenceYear);
}
