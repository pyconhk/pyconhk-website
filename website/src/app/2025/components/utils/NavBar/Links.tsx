import React from 'react';
import ClickableLink from './ClickableLink';
import NavigationDropdown from './Dropdown';
interface NavBarLink {
  label: string;
  href?: string;
  children?: NavBarLink[];
  isActive?: boolean;
}

export const links: NavBarLink[] = [
  {
    label: 'News',
    href: '#news',
    isActive: false,
  },
  {
    label: 'Organizers',
    href: '/organizers',
    isActive: true,
    children: [
      {
        label: 'Volunteers',
        href: '/volunteers',
        isActive: true,
      },
    ],
  },
  {
    label: 'Sponsors',
    href: '/sponsors',
    isActive: true,
  },
  {
    label: 'About',
    href: '/about',
    isActive: true,
  },
  {
    label: 'Code of Conduct',
    href: '/code-of-conduct',
    children: [
      {
        label: 'Enforcement Procedures',
        href: '/code-of-conduct/staff-procedures',
        isActive: true,
      },
      {
        label: 'Procedures for Reporting Incidents',
        href: '/code-of-conduct/attendee-reporting',
        isActive: true,
      },
    ] as NavBarLink[],
    isActive: true,
  },
  {
    label: 'Contact Us',
    href: process.env.NEXT_PUBLIC_CONTACT_US_URL,
    isActive: true,
  },
];

export default async function NavBarLinks() {
  return (
    <div className='flex items-center h-full text-gray-600'>
      <ul className='flex space-x-8 xl:space-x-12 font-semibold text-base xl:text-lg'>
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
