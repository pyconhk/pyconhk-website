'use client';
import React, { useState } from 'react';
import { IoChevronDownSharp } from 'react-icons/io5';
import { RxCross2 } from 'react-icons/rx';
import ClickableLink from './ClickableLink';
import { links } from './Links';

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
          onClick={() => setIsOpen(true)}
        >
          {children}
        </label>
      </div>
      <div className='drawer-side'>
        <label
          htmlFor='nav-drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
          onClick={() => setIsOpen(false)}
        ></label>
        <ul className='bg-gray-800 text-white min-h-full w-80 p-6'>
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className='absolute top-6 right-4 my-6 mx-4 rounded-full cursor-pointer'
            aria-label='Close menu'
          >
            <RxCross2 className='h-6 w-6' size={24} />
          </button>
          {links.map(link => (
            <React.Fragment key={`nav-drawer-${link.label}`}>
              {Array.isArray(link.children) ? (
                <React.Fragment key={`nav-drawer-${link.label}-inner`}>
                  <li
                    key={`nav-drawer-${link.label}`}
                    className='group relative mt-6'
                  >
                    <ul>
                      <div className='text-white flex items-center justify-start gap-2'>
                        <span className='text-white/80'>{link.label}</span>
                        <IoChevronDownSharp size={18} />
                      </div>
                      {link.children.map(subLink => (
                        <li
                          key={`nav-drawer-${link.label}-${subLink.label}`}
                          className='group relative pl-6 ml-2 border-l border-gray-600 pt-3'
                        >
                          <span onClick={() => setIsOpen(false)}>
                            <ClickableLink
                              href={subLink.href as string}
                              title={subLink.label}
                              isActive={subLink.isActive}
                              className="after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full text-white font-normal"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                </React.Fragment>
              ) : (
                <li key={`nav-drawer-${link.label}`} className='group mt-6'>
                  <span onClick={() => setIsOpen(false)}>
                    <ClickableLink
                      href={link.href as string}
                      title={link.label}
                      isActive={link.isActive}
                      className={
                        link.isActive
                          ? "after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full text-white font-normal"
                          : 'text-white/70 font-normal'
                      }
                    />
                  </span>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
