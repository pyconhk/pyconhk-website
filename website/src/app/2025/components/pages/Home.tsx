import { Itim } from 'next/font/google';
import Image from 'next/image';
import backgroundImg from '../../../../../public/2025/landing-pages/background.png';
import BannerImageSlide from './BannerImageSlide';
import CountdownTimer from './CountdownTimer';
import { FaChevronDown } from 'react-icons/fa6';

const itim = Itim({ weight: ['400'], subsets: ['latin'] });

interface HeroBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

function HomeBackground({ children, className = '' }: HeroBackgroundProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Image
        src={backgroundImg}
        alt='Background'
        fill
        priority
        className='object-cover z-0'
        quality={100}
        sizes='100vw'
        style={{
          objectPosition: 'center',
        }}
      />
      <div className='relative z-10 w-full h-full'>{children}</div>
    </div>
  );
}

export default async function Home() {
  return (
    <section id='home' className='w-full min-h-screen lg:min-h-0 lg:h-screen'>
      <HomeBackground className='w-full min-h-screen lg:min-h-0 lg:h-screen'>
        <div className='w-full h-full grid grid-cols-1 lg:grid-cols-12 items-center container mx-auto lg:p-6 lg:mt-8'>
          <div className='col-span-1 lg:hidden mt-30'>
            <h1 className='text-5xl lg:text-6xl mb-5 text-gray-600 w-full text-center'>
              <small className='text-4xl lg:text-5xl font-bold text-gray-800 opacity-90 transition-all duration-200'>
                PyCon HK 2025 is
              </small>
              <br />
              <span className={itim.className}>Coming Soon</span>
            </h1>
          </div>
          <div className='col-span-1 lg:col-span-6 lg:col-start-7'>
            <div className='w-full flex justify-center items-center'>
              <BannerImageSlide />
            </div>
          </div>
          <div className='col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-1'>
            <h1 className='hidden lg:block text-5xl lg:text-6xl mb-5 text-gray-600'>
              <small className='text-4xl lg:text-5xl font-bold text-gray-800 opacity-90 transition-all duration-200'>
                PyCon HK 2025 is
              </small>
              <br />
              <span className={itim.className}>Coming Soon</span>
            </h1>
            <CountdownTimer launchDate='2025-10-11T09:00:00' />
            <div className='flex items-center justify-center lg:justify-start mb-8 lg:mb-0'>
              <div className='border-3 border-white text-gray-700 rounded shadow-md px-4 py-3 my-5 inline-block text-left mt-8 w-full max-w-xs sm:max-w-md md:max-w-lg'>
                <div className='font-bold text-md lg:text-xl mb-1'>Date:</div>
                <div className='font-semibold text-base lg:text-lg'>
                  October 11, 2025 (Conference Day)
                </div>
                <div className='font-semibold text-base lg:text-lg'>
                  October 12, 2025 (Sprint)
                </div>
                <div className='font-bold text-base lg:text-lg mt-3 mb-1'>
                  Venue:
                </div>
                <div className='font-semibold text-base lg:text-lg'>
                  City University of Hong Kong, Kowloon Tong, HK
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='hidden lg:inline-block absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce'>
          <div className='bg-white/70 rounded-full p-3 border border-blue-200 shadow-sm'>
            <FaChevronDown className='h-5 w-5 text-blue-400' />
          </div>
        </div>
      </HomeBackground>
    </section>
  );
}
