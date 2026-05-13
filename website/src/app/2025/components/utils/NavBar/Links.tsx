import React from 'react';
import ClickableLink from './ClickableLink';
import NavigationDropdown from './Dropdown';

const yearPath = '/2025';

interface NavBarLink {
  label: string;
  href?: string;
  children?: NavBarLink[];
  isActive?: boolean;
}

export const links: NavBarLink[] = [
  {
    label: 'News',
    href: `${yearPath}/news`,
    isActive: true,
  },
  {
    label: 'Conference',
    href: '',
    isActive: false,
    children: [
      {
        label: 'Conference Schedule',
        href: `${yearPath}/schedule`,
        isActive: true,
      },
      {
        label: 'Access Guide',
        href: `${yearPath}/access-guide`,
        isActive: true,
      },
      {
        label: 'Catering Guide',
        href: `${yearPath}/catering-guide`,
        isActive: true,
      },
    ],
  },
  {
    label: 'Sprint',
    href: '',
    isActive: false,
    children: [
      {
        label: 'Sprint Day',
        href: `${yearPath}/sprint`,
        isActive: true,
      },
      {
        label: 'Sprint Q&A',
        href: `${yearPath}/sprint/qna/en`,
        isActive: true,
      },
      {
        label: 'Sprint Q&A (Chinese)',
        href: `${yearPath}/sprint/qna/zh-hk`,
        isActive: true,
      },
    ],
  },
  {
    label: 'Organizers',
    href: '',
    isActive: false,
    children: [
      {
        label: 'Organizations',
        href: `${yearPath}/organizers`,
        isActive: true,
      },
      {
        label: 'Volunteers',
        href: `${yearPath}/volunteers`,
        isActive: true,
      },
    ],
  },
  {
    label: 'Sponsorships',
    href: '',
    isActive: false,
    children: [
      {
        label: 'Sponsors',
        href: `${yearPath}/sponsorships`,
        isActive: true,
      },
      {
        label: 'Patrons',
        href: `${yearPath}/sponsorships/patrons`,
        isActive: true,
      },
      {
        label: 'Opportunities',
        href: `${yearPath}/sponsorships/opportunities`,
        isActive: true,
      },
    ],
  },
  {
    label: 'Communities', //! to save space
    href: `${yearPath}/supporting-organizations`,
    isActive: true,
  },
  {
    label: 'About',
    href: `${yearPath}/about`,
    isActive: true,
  },
  {
    label: 'Code of Conduct',
    href: '',
    children: [
      {
        label: 'Overview',
        href: `${yearPath}/code-of-conduct`,
        isActive: true,
      },
      {
        label: 'Enforcement Procedures',
        href: `${yearPath}/code-of-conduct/staff-procedures`,
        isActive: true,
      },
      {
        label: 'Procedures for Reporting Incidents',
        href: `${yearPath}/code-of-conduct/attendee-reporting`,
        isActive: true,
      },
    ] as NavBarLink[],
    isActive: false,
  },
  {
    label: 'Contact Us',
    href: process.env.NEXT_PUBLIC_CONTACT_US_URL,
    isActive: true,
  },
  {
    label: 'Album',
    href: `${yearPath}/album`,
    isActive: true,
  },
];

export default async function NavBarLinks() {
  return (
    <div className='flex items-center h-full text-gray-600'>
      <ul className='flex space-x-6 xl:space-x-7 font-semibold text-sm 2xl:text-base'>
        {links.map(link => (
          <React.Fragment key={`nav-${link.label}`}>
            {Array.isArray(link.children) ? (
              <NavigationDropdown
                title={link.label}
                titleHref={link.href}
                titleClassName={
                  link.isActive
                    ? "after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                    : ''
                }
              >
                {link.children.map(subLink => (
                  <li
                    key={`nav-${link.label}-${subLink.label}`}
                    className='group relative'
                  >
                    <ClickableLink
                      href={subLink.href as string}
                      title={subLink.label}
                      isActive={subLink.isActive}
                      className='hover:bg-gray-400/50'
                    />
                  </li>
                ))}
              </NavigationDropdown>
            ) : (
              <li key={`nav-${link.label}`} className='group'>
                <ClickableLink
                  href={link.href as string}
                  title={link.label}
                  isActive={link.isActive}
                  className={
                    link.isActive
                      ? "after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                      : ''
                  }
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}
