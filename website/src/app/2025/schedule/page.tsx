// 'use client';

// import Script from 'next/script';
// import { useEffect, useMemo } from 'react';

// export default function Schedule() {
//   // Determine event year based on NEXT_PUBLIC_IS_TEST_ENV
//   const eventYear = useMemo(() => {
//     if (typeof window !== 'undefined') {
//       return process.env.NEXT_PUBLIC_IS_TEST_ENV === 'true' ? '2024' : '2025';
//     }
//     return '2025';
//   }, []);

//   const eventUrl = `https://pretalx.com/pyconhk${eventYear}/`;

//   useEffect(() => {
//     const scheduleContainer = document.getElementById('schedule-container');
//     if (
//       scheduleContainer &&
//       !scheduleContainer.querySelector('pretalx-schedule')
//     ) {
//       scheduleContainer.innerHTML = `
//         <pretalx-schedule
//           event-url="${eventUrl}"
//           locale="en"
//           style="--pretalx-clr-primary: #0ea5e9"
//         ></pretalx-schedule>
//       `;
//     }
//   }, [eventUrl]);

//   return (
//     <>
//       {/* Load Pretalx widget script */}
//       <Script
//         src={`https://pretalx.com/pyconhk${eventYear}/schedule/widget/v2.en.js`}
//         strategy='afterInteractive'
//         onLoad={() => {
//           const scheduleContainer =
//             document.getElementById('schedule-container');
//           if (
//             scheduleContainer &&
//             !scheduleContainer.querySelector('pretalx-schedule')
//           ) {
//             scheduleContainer.innerHTML = `
//               <pretalx-schedule
//                 event-url="${eventUrl}"
//                 locale="en"
//                 style="--pretalx-clr-primary: #0ea5e9"
//               ></pretalx-schedule>
//             `;
//           }
//         }}
//       />

//       <div className='text-center pt-24 lg:pt-32 pb-8'>
//         <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
//           Schedule
//         </h1>
//       </div>

//       {/* Pretalx Widget Container - Full width within the white transparent div */}
//       <div id='schedule-container' className='w-full bg-white/70 lg:bg-white/0'>
//         <div className='flex items-center justify-center py-16 w-full h-screen'>
//           <div className='text-gray-500 text-lg'>Loading schedule...</div>
//         </div>

//         {/* Fallback for users with JavaScript disabled */}
//         <noscript>
//           <div className='pretalx-widget'>
//             <div className='pretalx-widget-info-message text-center p-8'>
//               JavaScript is disabled in your browser. To access our schedule
//               without JavaScript, please{' '}
//               <a
//                 target='_blank'
//                 href={`https://pretalx.com/pyconhk${eventYear}/schedule/`}
//                 className='text-sky-600 hover:text-sky-800 font-semibold'
//               >
//                 click here
//               </a>
//               .
//             </div>
//           </div>
//         </noscript>
//       </div>
//     </>
//   );
// }

// Add this at the top of your file
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { transformToCamelCase } from '@/utils/api';

interface Speaker {
  name: string;
  avatarUrl: string; // URL to the speaker's avatar image
}

interface Proposal {
  title: string;
  speakers: Speaker[]; // Array of speakers
  state: string; // e.g., 'submitted', 'accepted', etc.
  description: string;
  isFeatured: boolean;
  image: null | string; // Assuming this can be a URL or null
  submissionType: string;
  contentLocale: string; // e.g., 'en'
}

interface ProposalResponseResult {
  code: string;
  title: string;
  speakers: string[];
  submissionType: number; // Assuming this is an enum or constant
  track: number; // Assuming this is an enum or constant
  tags: number[]; // Assuming these are IDs for tags
  state: string; // e.g., 'submitted', 'accepted', etc.
  isFeatured: boolean;
  abstract: string;
  description: string;
  contentLocale: string; // e.g., 'en'
  image: null | string; // Assuming this can be a URL or null
}

interface SubmissionTypeResult {
  id: number;
  name: {
    en: string;
  };
}
interface SpeakerResponseResult {
  code: string;
  name: string;
  biography: string;
  avatarUrl: null | string; // URL to the speaker's avatar image
}

interface PretalxResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default async function Schedule() {
  const event =
    process.env.NEXT_PUBLIC_CURRENT_YEAR === '2024'
      ? 'pyconhk2024'
      : 'pyconhk2025';

  // Fetch all proposals from the Pretalx API
  const allProposalResults: ProposalResponseResult[] = [];

  const proposalsResponse = await fetch(
    `https://pretalx.com/api/events/${event}/submissions/`,
    {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_PRETALX_API_KEY}`,
      },
    }
  );

  if (!proposalsResponse.ok) {
    console.log('Failed to fetch accepted proposals');
    throw new Error('Failed to fetch accepted proposals');
  }

  const proposalResults = await proposalsResponse.json();
  const camelCaseProposalResults =
    transformToCamelCase<PretalxResponse<ProposalResponseResult>>(
      proposalResults
    );
  allProposalResults.push(...camelCaseProposalResults.results);

  while (proposalResults.next) {
    // Fetch next page of proposals
    const nextPageResponse = await fetch(proposalResults.next, {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_PRETALX_API_KEY}`,
      },
    });

    if (!nextPageResponse.ok) {
      throw new Error('Failed to fetch next page of proposals');
    }

    const nextPageProposals = await nextPageResponse.json();
    const nextPagecCamelCaseProposals =
      transformToCamelCase<PretalxResponse<ProposalResponseResult>>(
        nextPageProposals
      );
    allProposalResults.push(...nextPagecCamelCaseProposals.results);
    proposalResults.next = nextPagecCamelCaseProposals.next;
  }

  // Fetch all submission types
  const submissionTypesResponse = await fetch(
    `https://pretalx.com/api/events/${event}/submission-types/`,
    {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_PRETALX_API_KEY}`,
      },
    }
  );

  if (!submissionTypesResponse.ok) {
    console.log('Failed to fetch submission types');
    throw new Error('Failed to fetch submission types');
  }

  const submissionTypes = await submissionTypesResponse.json();
  const camelCaseSubmissionTypes =
    transformToCamelCase<PretalxResponse<SubmissionTypeResult>>(
      submissionTypes
    );

  // Fetch all speakers

  const allSpeakerResults: SpeakerResponseResult[] = [];

  const speakersResponse = await fetch(
    `https://pretalx.com/api/events/${event}/speakers/`,
    {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_PRETALX_API_KEY}`,
      },
    }
  );

  if (!speakersResponse.ok) {
    console.log('Failed to fetch speakers');
    throw new Error('Failed to fetch speakers');
  }

  const speakerResponseResults = await speakersResponse.json();
  const camelCaseSpeakerResults = transformToCamelCase<
    PretalxResponse<SpeakerResponseResult>
  >(speakerResponseResults);
  allSpeakerResults.push(...camelCaseSpeakerResults.results);

  while (speakerResponseResults.next) {
    // Fetch next page of proposals
    const nextPageResponse = await fetch(speakerResponseResults.next, {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_PRETALX_API_KEY}`,
      },
    });

    if (!nextPageResponse.ok) {
      console.log('Failed to fetch next page of speakers');
      throw new Error('Failed to fetch next page of speakers');
    }

    const nextPageProposals = await nextPageResponse.json();
    const nextPagecCamelCaseSpeakers =
      transformToCamelCase<PretalxResponse<SpeakerResponseResult>>(
        nextPageProposals
      );
    allSpeakerResults.push(...nextPagecCamelCaseSpeakers.results);
    speakerResponseResults.next = nextPagecCamelCaseSpeakers.next;
  }

  const submissionTypeMap = new Map<number, string>(
    camelCaseSubmissionTypes.results.map(type => [type.id, type.name.en])
  );

  const speakerMap = new Map<string, Speaker>(
    allSpeakerResults.map(speaker => [
      speaker.code,
      {
        name: speaker.name,
        avatarUrl: speaker.avatarUrl || '', // Default to empty string if null
      },
    ])
  );

  const mergedProposals: Proposal[] = allProposalResults
    .filter(proposal => proposal.state === 'confirmed' || proposal.isFeatured)
    .map(proposal => {
      const submissionTypeName = submissionTypeMap.get(proposal.submissionType);
      const speakers = proposal.speakers
        .map(speakerCode => {
          const speaker = speakerMap.get(speakerCode);
          return speaker
            ? { name: speaker.name, avatarUrl: speaker.avatarUrl }
            : { name: 'Unknown', avatarUrl: '' };
        })
        .filter(speaker => speaker.name !== 'Unknown');
      return {
        title: proposal.title,
        speakers: speakers,
        state: proposal.state,
        description: proposal.description,
        isFeatured: proposal.isFeatured,
        image: proposal.image,
        submissionType: submissionTypeName || 'Unknown',
        contentLocale: proposal.contentLocale, // e.g., 'en'
      };
    })
    .filter(proposal => proposal.submissionType !== 'Unknown');

  // Group proposals by submission type
  const proposalsByType: Record<string, Proposal[]> = {};

  mergedProposals.forEach(proposal => {
    if (!proposalsByType[proposal.submissionType]) {
      proposalsByType[proposal.submissionType] = [];
    }
    proposalsByType[proposal.submissionType].push(proposal);
  });

  // Define the order of submission types
  const typeOrder = ['Talk', 'Workshop', 'Short talk', 'Lightning talk'];

  // Sort the submission types according to our predefined order
  const sortedTypes = Object.keys(proposalsByType).sort((a, b) => {
    const indexA = typeOrder.indexOf(a);
    const indexB = typeOrder.indexOf(b);

    // If both types are in our predefined list, sort by their order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is in the list, prioritize the one in the list
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // For any other types not in our predefined list, sort alphabetically
    return a.localeCompare(b);
  });

  return (
    <>
      <div className='text-center pt-24 lg:pt-32'>
        <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mt-8 text-gray-700 text-center'>
          Schedule
        </h1>
      </div>
      <div className='pb-16 px-4 md:px-10 lg:px-16'>
        {sortedTypes.map(type => (
          <section key={type} className='mt-12'>
            <h2 className='text-2xl lg:text-3xl font-bold mt-6 inline-block w-full text-center'>
              {type}
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
              {proposalsByType[type].map((proposal, idx) => (
                <div
                  key={`${type}-${idx}`}
                  className='bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all'
                >
                  {/* Card content with flex justify-between */}
                  <div className='flex flex-col h-full justify-between'>
                    {/* Title */}
                    <div className='flex justify-between items-start gap-2'>
                      <h3 className='font-bold text-lg text-gray-800 mt-0'>
                        {proposal.title}
                      </h3>

                      {/* Content locale tag */}
                      <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'>
                        {proposal.contentLocale.toUpperCase() === 'ZH-HANT'
                          ? 'CANT'
                          : proposal.contentLocale.toUpperCase()}
                      </span>
                    </div>

                    {/* Speakers */}
                    {proposal.speakers.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-4'>
                        {proposal.speakers.map((speaker, i) => (
                          <div
                            key={i}
                            className='flex items-center bg-blue-50 px-3 py-1 rounded-full'
                          >
                            {speaker.avatarUrl ? (
                              <img
                                src={speaker.avatarUrl}
                                alt={speaker.name}
                                className='w-6 h-6 rounded-full mr-2 object-cover'
                              />
                            ) : (
                              <div className='w-6 h-6 rounded-full mr-2 bg-blue-200 text-blue-800 flex items-center justify-center text-xs'>
                                {speaker.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className='text-sm'>{speaker.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
