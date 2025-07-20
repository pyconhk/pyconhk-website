import { MdCheck, MdClose } from 'react-icons/md';

export interface SponsorshipPlan {
  name: string;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  fee: string;
  maxSlots: string;
  isPopular?: boolean;
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

const tierColors = {
  diamond: 'from-sky-300 to-sky-600',
  platinum: 'from-slate-300 to-slate-600',
  gold: 'from-yellow-300 to-amber-600',
  silver: 'from-zinc-300 to-teal-600',
  bronze: 'from-cyan-300 to-yellow-600',
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
}

export default function SponsorCard({ plan }: SponsorCardProps) {
  return (
    <div
      className={`mt-1 group relative bg-white hover:bg-slate-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-95 hover:shadow-xl h-full border-2 border-slate-300 hover:border-slate-600 ${plan.isPopular ? 'ring-2 ring-blue ring-opacity-50' : ''}`}
    >
      {plan.isPopular && (
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
      <div className='p-3 bg-white group-hover:bg-slate-800 transition-colors duration-300'>
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
