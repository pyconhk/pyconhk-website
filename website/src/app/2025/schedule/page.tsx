'use client';
import Script from 'next/script';
import { useEffect } from 'react';
import { YEAR } from '../constants';
import { HiOutlineInformationCircle } from 'react-icons/hi2';

export default function Schedule() {
  const eventUrl = `https://pretalx.com/pyconhk${YEAR}/`;

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
          style="--pretalx-clr-primary: #0ea5e9;"
        ></pretalx-schedule>
      `;
    }
  }, [eventUrl]);

  return (
    <>
      <Script
        src={`https://pretalx.com/pyconhk${YEAR}/schedule/widget/v2.en.js`}
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
                style="--pretalx-clr-primary: #0ea5e9;"
              ></pretalx-schedule>
            `;
          }
        }}
      />

      <div className='text-center pt-24 lg:pt-32 pb-8'>
        <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
          Conference Schedule
        </h1>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-4 lg:py-6'>
        <div className='bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg mb-12'>
          <h2 className='text-xl font-bold text-amber-800 mb-3 flex items-center'>
            <HiOutlineInformationCircle className='h-6 w-6 mr-3 flex-shrink-0' />
            Important Schedule Update
          </h2>
          <div className='pl-9 text-amber-900/90 text-sm/relaxed md:text-base/relaxed space-y-3'>
            <p>
              Please note the following last-minute changes to our Day 1
              schedule:
            </p>
            <ul className='list-disc list-outside space-y-2 pl-5'>
              <li>
                The talk{' '}
                <strong>"The graph capture mechanisms in PyTorch"</strong> by
                Xuanteng Huang will now be a{' '}
                <strong>virtual/online session</strong>. It will be streamed
                live in the scheduled room.
              </li>
              <li>
                Due to unforeseen circumstances, the talk{' '}
                <strong>
                  &quot;Memory Efficient Iteration with Python's itertools - A Deep
                  Dive&quot; by Kaylan has been cancelled.
                </strong>
              </li>
            </ul>
            <p>
              The interactive schedule below has been updated to reflect these
              changes. We thank you for your understanding and apologize for any
              inconvenience.
            </p>
          </div>
        </div>
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
                href={`https://pretalx.com/pyconhk${YEAR}/schedule/`}
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
