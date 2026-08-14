import type { CfpLocale } from '@/years/2026/locales';

export type NavItem = {
  labelKey: 'about' | 'programme' | 'venue' | 'sponsors';
  href: (locale: CfpLocale) => string;
};

export const navItems: NavItem[] = [
  {
    labelKey: 'about',
    href: (_locale) => '#about',
  },
  {
    labelKey: 'programme',
    href: (_locale) => '#programme',
  },
  {
    labelKey: 'venue',
    href: (_locale) => '#venue',
  },
  {
    labelKey: 'sponsors',
    href: (_locale) => '#sponsors',
  },
];
