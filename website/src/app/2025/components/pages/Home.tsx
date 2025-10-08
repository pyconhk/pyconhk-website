import { Lexend } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import backgroundImg from '../../../../../public/2025/landing-pages/banner-1.jpeg';
import logoImg from '../../../../../public/2025/logos/logo.png';
import ScrollIndicator from '../utils/ScrollIndicator';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface HeroBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

function HomeBackground({ children, className = '' }: HeroBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className='absolute inset-0 opacity-30'>
        <Image
          src={backgroundImg}
          alt='Background'
          fill
          priority
          className='object-cover z-0 object-center'
          quality={100}
          sizes='100vw'
        />
      </div>
      <div className='relative z-10 w-screen h-screen opacity-100'>
        {children}
      </div>
    </div>
  );
}

export default async function Home() {
  return (
    <section id='home' className='w-full h-screen bg-white overflow-hidden'>
      <HomeBackground className='w-full h-full'>
        <div className='flex flex-col items-center justify-center w-full h-full px-4'>
          <div className='text-center mb-8 animate-fade-in'>
            <Image
              src={logoImg}
              alt='PyCon HK 2025 Logo'
              className='w-auto h-auto max-w-[70%] md:max-w-[60%] lg:max-w-[70%] min-w-[200px] max-h-[70vh] object-contain mx-auto'
              priority
            />

            <h1
              className={`${lexend.className} text-4xl md:text-5xl lg:text-6xl font-bold text-[#016735] mt-3 tracking-tight`}
            >
              PyCon HK 2025
            </h1>

            <div className='relative my-4'>
              <div className='relative flex justify-center'>
                <span
                  className={`${lexend.className} px-8 py-1 text-xl text-[#f4dc03] bg-[#016735] italic`}
                >
                  Sailing Together
                </span>
              </div>
            </div>
          </div>

          <div className='mt-6 mb-2 animate-fade-in-up animation-delay-300 w-full text-center'>
            <a
              href={process.env.NEXT_PUBLIC_EVENTBRITE_URL || '#'}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block px-8 py-3 bg-[#f4dc03] text-[#016735] rounded-full shadow-sm hover:shadow-xl transform transition-all duration-300'
            >
              <span className={`${lexend.className} font-semibold text-lg`}>
                Grab Your Tickets Now!
              </span>
            </a>
          </div>

          <div className='mt-6 mb-2 animate-fade-in-up animation-delay-300 w-full text-center'>
            <Link
              href='/schedule'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block px-8 py-3 text-[#f4dc03] bg-[#016735] rounded-full shadow-sm hover:shadow-xl transform transition-all duration-300'
            >
              <span className={`${lexend.className} font-semibold text-lg`}>
                Conference Schedule
              </span>
            </Link>
          </div>

          <ScrollIndicator />
        </div>
      </HomeBackground>
    </section>
  );
}
