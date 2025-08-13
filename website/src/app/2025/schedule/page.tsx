'use client';

import Script from 'next/script';
import { useEffect, useMemo } from 'react';

export default function Schedule() {
  // Determine event year based on NEXT_PUBLIC_IS_TEST_ENV
  const eventYear = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_IS_TEST_ENV === 'true' ? '2024' : '2025';
    }
    return '2025';
  }, []);

  const eventUrl = `https://pretalx.com/pyconhk${eventYear}/`;

  useEffect(() => {
    const scheduleContainer = document.getElementById('schedule-container');
    if (
      scheduleContainer &&
      !scheduleContainer.querySelector('pretalx-schedule')
    ) {
      scheduleContainer.innerHTML = `
        <pretalx-schedule
          event-url="${eventUrl}"
          locale="en"
          style="--pretalx-clr-primary: #0ea5e9"
        ></pretalx-schedule>
      `;
    }
  }, [eventUrl]);

  return (
    <>
      {/* Load Pretalx widget script */}
      <Script
        src={`https://pretalx.com/pyconhk${eventYear}/schedule/widget/v2.en.js`}
        strategy='afterInteractive'
        onLoad={() => {
          const scheduleContainer =
            document.getElementById('schedule-container');
          if (
            scheduleContainer &&
            !scheduleContainer.querySelector('pretalx-schedule')
          ) {
            scheduleContainer.innerHTML = `
              <pretalx-schedule
                event-url="${eventUrl}"
                locale="en"
                style="--pretalx-clr-primary: #0ea5e9"
              ></pretalx-schedule>
            `;
          }
        }}
      />

      <div className='text-center pt-24 lg:pt-32 pb-8'>
        <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
          Schedule
        </h1>
      </div>

      {/* Pretalx Widget Container - Full width within the white transparent div */}
      <div id='schedule-container' className='w-full bg-white/70 lg:bg-white/0'>
        <div className='flex items-center justify-center py-16 w-full h-screen'>
          <div className='text-gray-500 text-lg'>Loading schedule...</div>
        </div>

        {/* Fallback for users with JavaScript disabled */}
        <noscript>
          <div className='pretalx-widget'>
            <div className='pretalx-widget-info-message text-center p-8'>
              JavaScript is disabled in your browser. To access our schedule
              without JavaScript, please{' '}
              <a
                target='_blank'
                href={`https://pretalx.com/pyconhk${eventYear}/schedule/`}
                className='text-sky-600 hover:text-sky-800 font-semibold'
              >
                click here
              </a>
              .
            </div>
          </div>
        </noscript>
      </div>
    </>
  );
}
