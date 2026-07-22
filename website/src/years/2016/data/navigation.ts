import { conferenceArchiveNavItems } from '@/legacy/conference-archive-links';

export interface Legacy2016NavItem {
  href: string;
  label: string;
}

export interface Legacy2016NavGroup {
  label: string;
  items: readonly Legacy2016NavItem[];
}

export const legacy2016Brand = {
  href: '/2016/',
  label: 'PyCon HK 2016',
} as const;

export const legacy2016NavGroups = [
  {
    label: 'About',
    items: [
      { href: '/2016/about/', label: 'Conference' },
      { href: '/2016/code-of-conducts/', label: 'Code of Conducts' },
      { href: 'mailto:pycon@pycon.hk', label: 'Contact Us' },
      { href: '/2015/', label: 'PyCon HK 2015' },
      { href: 'http://python.hk', label: 'Python HK' },
    ],
  },
  {
    label: 'Program',
    items: [
      { href: '/2016/program/', label: 'Program Info' },
      { href: '/2016/program/#day1', label: 'Schedule (Day 1)' },
      { href: '/2016/program/#day2', label: 'Schedule (Day 2)' },
    ],
  },
  {
    label: 'Participate',
    items: [
      { href: '/2016/participate/', label: 'Participate Info' },
      { href: '/2016/participate/#patrons', label: 'Patrons' },
      { href: '/2016/participate/#students', label: 'Students' },
    ],
  },
  {
    label: 'Sponsor',
    items: [
      { href: '/2016/sponsor/', label: 'Sponsorship' },
      { href: '/2016/sponsor/#platinum', label: 'Platinum' },
      { href: '/2016/sponsor/#gold', label: 'Gold' },
      { href: '/2016/sponsor/#silver', label: 'Silver' },
      { href: '/2016/sponsor/#bronze', label: 'Bronze' },
      { href: '/2016/sponsor/#general', label: 'General' },
      { href: '/2016/sponsor/#education', label: 'Education' },
      { href: '/2016/sponsor/#patrons', label: 'Patrons' },
    ],
  },
  {
    label: 'Volunteer',
    items: [
      { href: '/2016/volunteer/', label: 'Volunteer Info' },
      { href: '/2016/volunteer/#list', label: 'Volunteer List' },
      { href: '/2016/volunteer/#recruit', label: 'Recruit' },
    ],
  },
  {
    label: 'Venue',
    items: [{ href: '/2016/venue/', label: 'Venue Map' }],
  },
  {
    label: 'Archive',
    items: conferenceArchiveNavItems,
  },
] as const satisfies readonly Legacy2016NavGroup[];

export const legacy2016TicketHref = 'http://pyconhk2016.eventbrite.com/?aff=website';
