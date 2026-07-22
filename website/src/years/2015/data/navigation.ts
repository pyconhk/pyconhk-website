import { conferenceArchiveNavItems } from '@/legacy/conference-archive-links';

export interface Legacy2015NavItem {
  href: string;
  label: string;
}

export interface Legacy2015NavGroup {
  label: string;
  items: readonly Legacy2015NavItem[];
}

export const legacy2015Brand = {
  href: '/2015/',
  label: 'PyCON HK 2015',
} as const;

export const legacy2015NavGroups = [
  {
    label: 'About',
    items: [
      { href: '/2015/about/what-is-pycon/', label: 'What is PyCon?' },
      { href: '/2015/about/code-of-conducts/', label: 'Code of Conducts' },
      { href: '/2015/about/staffs/', label: 'Staffs' },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/2015/schedule/', label: 'Schedule' },
      { href: 'http://bit.ly/pyconhk2015-cfp', label: 'Call For Proposals' },
    ],
  },
  {
    label: 'Sponsors',
    items: [
      { href: '/2015/sponsor/', label: 'PyCON HK 2015 Sponsors' },
      { href: '/2015/sponsor/prospectus/', label: 'Sponsorship Prospectus' },
    ],
  },
  {
    label: 'Venue',
    items: [
      { href: '/2015/venue/', label: 'Venue Map' },
      { href: '/2015/venue/hotels/', label: 'Hotels' },
    ],
  },
  {
    label: 'Attend',
    items: [
      { href: 'https://pycon-hk-2015.eventbrite.com/', label: 'Registration' },
      { href: 'http://bit.ly/pyconhk2015-faa', label: 'Financial Aid' },
    ],
  },
  {
    label: 'Archive',
    items: conferenceArchiveNavItems,
  },
] as const satisfies readonly Legacy2015NavGroup[];

export const legacy2015TicketHref = 'https://pycon-hk-2015.eventbrite.com/';
