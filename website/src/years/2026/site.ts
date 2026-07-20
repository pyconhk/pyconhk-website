import type { CfpLocale } from '@/years/2026/data/cfp';

export const conferenceYear = 2026 as const;
export const conferenceTheme = 'Many Voices, One Python Story';
export const conferenceDates = '14-15 November 2026';

export function privacyPolicyPath(locale: CfpLocale): string {
  const routeLocale = locale === 'zh-hans' ? 'zh-cn' : locale;

  return `/2026/${routeLocale}/privacy-policy`;
}
