'use client';

import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import SponsorCard, { SponsorshipPlan } from './SponsorCard';

const sponsorshipPlans: SponsorshipPlan[] = [
  {
    name: 'Diamond',
    tier: 'diamond',
    fee: 'HKD 70,000+',
    maxSlots: '1',
    isPopular: false,
    features: {
      sponsoredTalks: '2 x 30-minute talks',
      boothTables: 'Double-Sized',
      logoSpeakerPodium: true,
      logoConferenceRollup: 'Extra Large',
      logoYouTubeFrame: 'Extra Large',
      logoWebsite: 'Extra Large with write-up',
      rollupBysponsor: true,
      adDuringBreak: 'YES',
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: 'Platinum',
    tier: 'platinum',
    fee: 'HKD 44,000',
    maxSlots: '1',
    isPopular: false,
    features: {
      sponsoredTalks: '30-minute talk',
      boothTables: 'Normal Size',
      logoConferenceRollup: 'Large',
      logoYouTubeFrame: 'Large',
      logoWebsite: 'Large with write-up',
      rollupBysponsor: true,
      adDuringBreak: 'YES',
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: 'Gold',
    tier: 'gold',
    fee: 'HKD 22,000',
    maxSlots: '2',
    isPopular: true,
    features: {
      sponsoredTalks: '15-minute talk',
      boothTables: 'Normal Size',
      logoConferenceRollup: 'Medium',
      logoYouTubeFrame: 'Medium',
      logoWebsite: 'Medium',
      adDuringBreak: '+ HKD 3,100',
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: 'Silver',
    tier: 'silver',
    fee: 'HKD 11,000',
    maxSlots: '4',
    isPopular: true,
    features: {
      boothTables: 'Normal Size',
      logoConferenceRollup: 'Regular',
      logoYouTubeFrame: 'Regular',
      logoWebsite: 'Regular',
      adDuringBreak: '+ HKD 3,100',
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: 'Bronze',
    tier: 'bronze',
    fee: 'HKD 6,000',
    maxSlots: 'Unlimited',
    isPopular: false,
    features: {
      logoConferenceRollup: 'Small',
      logoYouTubeFrame: 'Small',
      logoWebsite: 'Small',
      adDuringBreak: '+ HKD 3,100',
      openingClosing: true,
    },
  },
];

export default function SponsorChoice() {
  return (
    <div className='w-full py-12'>
      <div className='container mx-auto px-0 lg:px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 mb-4'>
            Sponsorship Plans
          </h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            Choose the perfect sponsorship package to support PyCon HK 2025 and
            showcase your brand to the Python community.
          </p>
        </div>

        {/* Scrollable cards container */}
        <div className='relative'>
          <div className='flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth scroll-px-8'>
            {sponsorshipPlans.map(plan => (
              <div
                key={plan.name}
                className='flex-none w-full p-1 lg:w-1/2 xl:w-1/3 snap-start'
              >
                <SponsorCard plan={plan} />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className='flex justify-center mt-6 gap-8'>
            <div
              className='cursor-pointer rounded-full p-4 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
              onClick={() => {
                const container = document.querySelector(
                  '.flex.gap-6.overflow-x-auto'
                ) as HTMLElement;
                if (container) {
                  const scrollAmount = container.clientWidth + 24; // width of the gap
                  container.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth',
                  });
                }
              }}
              aria-label='Previous cards'
            >
              <FaAngleLeft />
            </div>
            <div
              className='cursor-pointer rounded-full p-4 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
              onClick={() => {
                const container = document.querySelector(
                  '.flex.gap-6.overflow-x-auto'
                ) as HTMLElement;
                if (container) {
                  const scrollAmount = container.clientWidth + 24; // width of the gap
                  container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth',
                  });
                }
              }}
              aria-label='Next cards'
            >
              <FaAngleRight />
            </div>
          </div>
        </div>

        {/* Contact CTA */}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
