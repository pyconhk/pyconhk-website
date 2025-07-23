'use client';
import React, { useState } from 'react';
import { links } from './Links';
import ClickableLink from './ClickableLink';

interface NavBarDrawerLinkProps {
  children?: React.ReactNode;
}

export default function NavBarDrawerlinks({ children }: NavBarDrawerLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='drawer drawer-end w-fit'>
      <input
        id='nav-drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={isOpen}
        readOnly
      />
      <div className='drawer-content'>
        {/* Page content here */}
        <label
          htmlFor='nav-drawer'
          className='drawer-button'
          onClick={() => setIsOpen(!isOpen)}
        >
          {children}
        </label>
      </div>
      <div className='drawer-side'>
        <label
          htmlFor='nav-drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <ul className='menu bg-gray-800 text-white min-h-full w-80 p-4'>
          {links.map(link => (
            <React.Fragment key={`nav-drawer-${link.label}`}>
              {Array.isArray(link.children) ? (
                <React.Fragment key={`nav-drawer-${link.label}-inner`}>
                  <li
                    key={`nav-drawer-${link.label}`}
                    className='group relative'
                    onClick={() => setIsOpen(false)}
                  >
                    <ClickableLink
                      href={link.href as string}
                      title={link.label}
                      isActive={link.isActive}
                      className={
                        link.isActive
                          ? "after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full text-white"
                          : 'text-white/70'
                      }
                    />
                  </li>
                  {link.children.map(subLink => (
                    <li
                      key={`nav-drawer-${link.label}-${subLink.label}`}
                      className='group relative pl-6 ml-2 border-l border-gray-600'
                      onClick={() => setIsOpen(false)}
                    >
                      <ClickableLink
                        href={subLink.href as string}
                        title={subLink.label}
                        isActive={subLink.isActive}
                        className='text-white hover:bg-gray-400/50'
                      />
                    </li>
                  ))}
                  {/* {link.children.map(subLink => (
                    <li
                      key={`nav-drawer-${link.label}-${subLink.label}`}
                      className='group relative'
                      onClick={() => setIsOpen(false)}
                    >
                      <ClickableLink
                        href={subLink.href as string}
                        title={subLink.label}
                        isActive={subLink.isActive}
                        className='text-white hover:bg-gray-400/50'
                      />
                    </li>
                  ))} */}
                </React.Fragment>
              ) : (
                <li
                  key={`nav-drawer-${link.label}`}
                  className='group'
                  onClick={() => setIsOpen(false)}
                >
                  <ClickableLink
                    href={link.href as string}
                    title={link.label}
                    isActive={link.isActive}
                    className={
                      link.isActive
                        ? "after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full text-white"
                        : 'text-white/70'
                    }
                  />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
