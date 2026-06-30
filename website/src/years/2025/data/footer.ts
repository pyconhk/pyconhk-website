import type { SiteSectionSlug } from '@/years/2025/data/sections';

export const footerQuickLinks: SiteSectionSlug[] = [
  'news',
  'schedule',
  'sprint',
  'sponsorships',
  'supporting-organizations',
  'about',
  'code-of-conduct',
];

export const archiveLinks = [
  { label: '2025', href: '/2025' },
  { label: '2024', href: '/2024' },
  { label: '2023', href: '/2023' },
  { label: '2022', href: '/2022' },
  { label: '2021', href: '/2021' },
  { label: '2020 fall', href: '/2020-fall' },
  { label: '2020 spring', href: '/2020-spring' },
  { label: '2018', href: '/2018' },
  { label: '2017', href: '/2017' },
  { label: '2016', href: '/2016' },
  { label: '2015', href: '/2015' },
] as const;
