import type { CfpLocale } from '@/years/2026/locales';

export const conferenceYear = 2026 as const;
export const conferenceTheme = 'Ride and Leverage with AI';
export const conferenceDates = '14–15 November 2026';
export const conferenceLocation = 'Hong Kong SAR';

export const submitProposalUrl = 'https://cfp.pycon.hk/pyconhk2026/cfp';
export const editProposalUrl = 'https://cfp.pycon.hk/pyconhk2026/me/submissions/';
export const registrationUrl = submitProposalUrl;
export const sponsorshipEmail =
  'mailto:pycon@pycon.hk?cc=calvin@opensource.hk&subject=Regarding%20Sponsoring%20PyCon%20HK%202026';

export function privacyPolicyPath(locale: CfpLocale): string {
  return `/2026/${locale}/privacy-policy`;
}
