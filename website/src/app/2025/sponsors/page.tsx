import { HiOutlineEye, HiOutlineHeart, HiOutlineUsers } from 'react-icons/hi';
import SponsorChoice from './component/SponsorChoice';

interface SponsorBenefits {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const sponsorBenefits: SponsorBenefits[] = [
  {
    icon: (
      <div className='bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full mt-4'>
        <HiOutlineEye className='text-5xl text-sky-500' />
      </div>
    ),
    title: 'Brand Visibility',
    description: 'Increase visibility among tech professionals',
  },
  {
    icon: (
      <div className='bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-full mt-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300'>
        <HiOutlineUsers className='text-5xl text-green-600 group-hover:text-green-700 transition-colors duration-300' />
      </div>
    ),
    title: 'Network',
    description: 'Connect with industry leaders and potential clients',
  },
  {
    icon: (
      <div className='bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full mt-4 group-hover:from-red-200 group-hover:to-pink-200 transition-all duration-300'>
        <HiOutlineHeart className='text-5xl text-rose-500 group-hover:text-red-600 transition-colors duration-300' />
      </div>
    ),
    title: 'Community Support',
    description: 'Support Python community growth in Hong Kong',
  },
];

export default async function Sponsors() {
  return (
    <>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-center'>
        Sponsorship Opportunities
      </h1>
      <p className='mt-8'>
        PyCon HK 2025 presents an exceptional opportunity to connect with Hong
        Kong&apos;s most passionate Python developers, innovative tech leaders,
        and forward-thinking organizations.
        <br />
        <br />
        As a sponsor, you&apos;ll be at the heart of Asia&apos;s premier Python
        conference, where cutting-edge ideas meet practical solutions. Join
        hundreds of enthusiastic developers, seasoned engineers, data
        scientists, and tech entrepreneurs who are shaping the future of
        technology in the region.
        <br />
        <br />
        Your sponsorship doesn&apos;t just showcase your brand—it demonstrates
        your commitment to fostering innovation, supporting the open-source
        community, and driving technological advancement in Hong Kong and
        beyond.
      </p>

      <h2 className='text-2xl md:text-3xl lg:text-4xl font-semibold mt-16 text-center'>
        Why Sponsor?
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
        {sponsorBenefits.map(({ icon, title, description }, index) => (
          <div
            key={`benefit-${index}`}
            className='flex flex-col items-center text-center px-6 rounded-lg'
          >
            {icon}
            <h3 className='font-semibold mt-4 text-lg'>{title}</h3>
            <p className='text-base text-gray-600 mt-2'>{description}</p>
          </div>
        ))}
      </div>

      <div className='mt-2 lg:mt-6'>
        <SponsorChoice />
      </div>

      <div className='text-center mt-2 lg:mt-6'>
        <div className='bg-gradient-to-r from-blue to-yellow rounded-2xl p-8'>
          <h2 className='text-3xl xl:text-4xl font-bold'>Ready to Sponsor?</h2>
          <p className='text-lg mt-8 opacity-90'>
            Contact us to discuss your sponsorship package and customization
            options.
          </p>
          <div className='mt-6'>
            <a
              href={process.env.NEXT_PUBLIC_CALL_FOR_SPONSORSHIPS_URL}
              className='inline-block bg-white text-blue px-8 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors'
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
