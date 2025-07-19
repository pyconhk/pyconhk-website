import { HiOutlineEye, HiOutlineHeart, HiOutlineUsers } from 'react-icons/hi';
import PastSponsor from './component/PastSponsor';
import SponsorChoice from './component/SponsorChoice';

export default async function Sponsors() {
  return (
    <div className='container mx-auto px-4 py-8 text-gray-700 '>
      <h1 className='text-3xl xl:text-4xl font-bold mb-6 text-center'>
        Sponsorship Opportunities
      </h1>
      <p className='mb-8 text-justify'>
        PyCon HK 2025 presents an exceptional opportunity to connect with Hong
        Kong&apos;s most passionate Python developers, innovative tech leaders,
        and forward-thinking organizations. As a sponsor, you&apos;ll be at the
        heart of Asia&apos;s premier Python conference, where cutting-edge ideas
        meet practical solutions. Join hundreds of enthusiastic developers,
        seasoned engineers, data scientists, and tech entrepreneurs who are
        shaping the future of technology in the region. Your sponsorship
        doesn&apos;t just showcase your brand—it demonstrates your commitment to
        fostering innovation, supporting the open-source community, and driving
        technological advancement in Hong Kong and beyond.
      </p>

      <h1 className='text-3xl xl:text-4xl font-semibold mb-4 text-center'>
        Why Sponsor?
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
        <div className='flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 group'>
          <div className='bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300'>
            <HiOutlineEye className='text-5xl text-sky-500 group-hover:text-sky-600 transition-colors duration-300' />
          </div>
          <h3 className='font-semibold mb-2 text-lg'>Brand Visibility</h3>
          <p className='text-sm text-gray-600'>
            Increase visibility among tech professionals
          </p>
        </div>
        <div className='flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 group'>
          <div className='bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-full mb-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300'>
            <HiOutlineUsers className='text-5xl text-green-600 group-hover:text-green-700 transition-colors duration-300' />
          </div>
          <h3 className='font-semibold mb-2 text-lg'>Network</h3>
          <p className='text-sm text-gray-600'>
            Connect with industry leaders and potential clients
          </p>
        </div>
        <div className='flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 group'>
          <div className='bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full mb-4 group-hover:from-red-200 group-hover:to-pink-200 transition-all duration-300'>
            <HiOutlineHeart className='text-5xl text-rose-500 group-hover:text-red-600 transition-colors duration-300' />
          </div>
          <h3 className='font-semibold mb-2 text-lg'>Community Support</h3>
          <p className='text-sm text-gray-600'>
            Support Python community growth in Hong Kong
          </p>
        </div>
      </div>

      <PastSponsor />

      <SponsorChoice />
    </div>
  );
}
