'use client';

import { MdCheck, MdClose } from 'react-icons/md';

interface SponsorshipPlan {
  name: string;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  fee: string;
  maxSlots: string;
  features: {
    sponsoredTalks?: string;
    boothTables?: string;
    logoSpeakerPodium?: boolean;
    logoConferenceRollup?: string;
    logoYouTubeFrame?: string;
    logoWebsite?: string;
    rollupBysponsor?: boolean;
    adDuringBreak?: string;
    preEventEmails?: boolean;
    pressReleases?: boolean;
    socialNetworks?: boolean;
    openingClosing?: boolean;
  };
}

const sponsorshipPlans: SponsorshipPlan[] = [
  {
    name: 'Diamond',
    tier: 'diamond',
    fee: 'HKD 70,000+',
    maxSlots: '1',
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
    features: {
      logoConferenceRollup: 'Small',
      logoYouTubeFrame: 'Small',
      logoWebsite: 'Small',
      adDuringBreak: '+ HKD 3,100',
      openingClosing: true,
    },
  },
];

const tierColors = {
  diamond: 'from-purple-500 to-indigo-600',
  platinum: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-600',
};

const tierAccents = {
  diamond: 'border-purple-500 bg-purple-50',
  platinum: 'border-gray-500 bg-gray-50',
  gold: 'border-yellow-500 bg-yellow-50',
  silver: 'border-gray-400 bg-gray-50',
  bronze: 'border-orange-500 bg-orange-50',
};

interface FeatureItemProps {
  label: string;
  value: string | boolean | undefined;
  isHighlight?: boolean;
}

function FeatureItem({ label, value, isHighlight = false }: FeatureItemProps) {
  const isAvailable = value !== undefined && value !== false;
  const isBoolean = typeof value === 'boolean';
  const isNotAvailable = !isAvailable;

  const renderIcon = () => {
    if (isBoolean) {
      if (value) {
        return (
          <div className='flex-shrink-0 w-4 h-4 relative top-0.5'>
            <MdCheck
              className={`w-full h-full transition-colors duration-300 ${isHighlight ? 'text-blue group-hover:text-blue-300' : 'text-green-600 group-hover:text-green-400'}`}
            />
          </div>
        );
      } else {
        return (
          <div className='flex-shrink-0 w-4 h-4 relative top-0.5'>
            <MdClose className='text-red-500 group-hover:text-rose-400 w-full h-full transition-colors duration-300' />
          </div>
        );
      }
    }
    return null;
  };

  const displayValue = isBoolean
    ? null
    : value || (
        <div className='flex-shrink-0 w-4 h-4 relative top-0.5'>
          <MdClose className='text-red-500 group-hover:text-rose-400 w-full h-full transition-colors duration-300' />
        </div>
      );

  return (
    <div
      className={`flex justify-between items-center py-0.5 px-1 rounded text-xs transition-colors duration-300 ${isHighlight ? 'bg-blue-50 group-hover:bg-blue-900 border-l-2 border-blue' : ''}`}
    >
      <span className='text-gray-700 group-hover:text-white font-medium text-xs transition-colors duration-300'>
        {label}
      </span>
      <span
        className={`font-semibold text-xs transition-colors duration-300 ${
          isHighlight
            ? 'text-blue group-hover:text-blue-300'
            : isNotAvailable && !isBoolean
              ? 'text-red-500 group-hover:text-rose-400'
              : !isBoolean
                ? 'text-gray-900 group-hover:text-white'
                : ''
        }`}
      >
        {isBoolean ? renderIcon() : displayValue}
      </span>
    </div>
  );
}

interface SponsorCardProps {
  plan: SponsorshipPlan;
  isPopular?: boolean;
}

function SponsorCard({ plan, isPopular = false }: SponsorCardProps) {
  return (
    <div
      className={`group relative bg-white hover:bg-slate-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-95 hover:shadow-xl h-full border border-slate-300 hover:border-slate-600 ${isPopular ? 'ring-1 ring-blue ring-opacity-50' : ''}`}
    >
      {isPopular && (
        <div className='absolute top-2 right-2 bg-blue text-white px-2 py-0.5 rounded-full text-xs font-bold z-10'>
          POPULAR
        </div>
      )}

      {/* Header with gradient */}
      <div
        className={`h-16 bg-gradient-to-br ${tierColors[plan.tier]} relative`}
      >
        <div className='absolute inset-0 bg-slate-700 bg-opacity-10'></div>
        <div className='relative z-10 p-3 text-white'>
          <h3 className='text-lg font-bold mb-0.5'>{plan.name}</h3>
          <p className='text-xs font-semibold opacity-90'>
            Sponsorship Fee: {plan.fee}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='p-3 bg-white hover:bg-slate-800 transition-colors duration-300'>
        <div
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${tierAccents[plan.tier]}`}
        >
          Max {plan.maxSlots} slot{plan.maxSlots !== '1' ? 's' : ''}
        </div>

        <div className='space-y-0.5'>
          <h4 className='font-bold text-gray-800 group-hover:text-white mb-1 text-xs transition-colors duration-300'>
            Brand Visibility
          </h4>
          <FeatureItem
            label='Sponsored Talk(s)'
            value={plan.features.sponsoredTalks}
            isHighlight={!!plan.features.sponsoredTalks}
          />
          <FeatureItem label='Booth Tables' value={plan.features.boothTables} />
          <FeatureItem
            label='Logo on Speaker Podium'
            value={plan.features.logoSpeakerPodium}
          />
          <FeatureItem
            label='Logo on Conference Rollup'
            value={plan.features.logoConferenceRollup}
          />
          <FeatureItem
            label='Logo on YouTube Frame'
            value={plan.features.logoYouTubeFrame}
          />
          <FeatureItem
            label='Logo on Website'
            value={plan.features.logoWebsite}
          />
          <FeatureItem
            label='Rollup by Sponsor'
            value={plan.features.rollupBysponsor}
          />
          <FeatureItem
            label='Ad During Break'
            value={plan.features.adDuringBreak}
          />

          <h4 className='font-bold text-gray-800 group-hover:text-white mb-1 mt-3 text-xs transition-colors duration-300'>
            Social Media & Press
          </h4>
          <FeatureItem
            label='Pre-event Emails'
            value={plan.features.preEventEmails}
          />
          <FeatureItem
            label='Press Releases'
            value={plan.features.pressReleases}
          />
          <FeatureItem
            label='Social Networks'
            value={plan.features.socialNetworks}
          />
          <FeatureItem
            label='Opening & Closing'
            value={plan.features.openingClosing}
          />
        </div>

        <button
          className={`w-full mt-3 py-1.5 px-3 rounded font-semibold text-white text-xs transition-all duration-200 bg-gradient-to-r ${tierColors[plan.tier]} hover:shadow-md hover:opacity-90`}
        >
          Choose {plan.name}
        </button>
      </div>
    </div>
  );
}

export default function SponsorChoice() {
  return (
    <div className='w-full py-12'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-gray-700 mb-4'>
            Sponsorship Plans
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Choose the perfect sponsorship package to support PyCon HK 2025 and
            showcase your brand to the Python community.
          </p>
        </div>

        {/* Scrollable cards container */}
        <div className='relative'>
          <div
            className='flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory'
            style={{
              scrollBehavior: 'smooth',
              scrollPadding: '0 2rem',
            }}
          >
            {sponsorshipPlans.map(plan => (
              <div
                key={plan.name}
                className='flex-none w-4/5 sm:w-2/5 lg:w-1/3 snap-start'
              >
                <SponsorCard
                  plan={plan}
                  isPopular={plan.tier === 'gold'} // Highlighting Gold as popular mid-tier option
                />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className='flex justify-center mt-6 space-x-4'>
            <button
              className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={() => {
                const container = document.querySelector(
                  '.flex.gap-6.overflow-x-auto'
                ) as HTMLElement;
                if (container) {
                  const scrollAmount = container.clientWidth;
                  container.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth',
                  });
                }
              }}
              aria-label='Previous cards'
            >
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
            <button
              className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={() => {
                const container = document.querySelector(
                  '.flex.gap-6.overflow-x-auto'
                ) as HTMLElement;
                if (container) {
                  const scrollAmount = container.clientWidth;
                  container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth',
                  });
                }
              }}
              aria-label='Next cards'
            >
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contact CTA */}
        <div className='text-center mt-12'>
          <div className='bg-gradient-to-r from-blue to-yellow rounded-2xl p-8'>
            <h3 className='text-2xl font-bold mb-4'>Ready to Sponsor?</h3>
            <p className='text-lg mb-6 opacity-90'>
              Contact us to discuss your sponsorship package and customization
              options.
            </p>
            <button className='bg-white text-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'>
              Contact Us
            </button>
          </div>
        </div>
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
