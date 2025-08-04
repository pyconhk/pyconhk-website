import { Itim, Montserrat } from 'next/font/google';
import Image from 'next/image';
import { FaArrowDown } from 'react-icons/fa6';
import backgroundImg from '../../../../../public/2025/landing-pages/banner-2.jpeg';
import logoImg from '../../../../../public/2025/logos/logo.svg';

const itim = Itim({ weight: ['400'], subsets: ['latin'] });
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

interface HeroBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

function HomeBackground({ children, className = '' }: HeroBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className='absolute inset-0 opacity-20'>
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
              className='w-auto h-auto max-w-[70%] md:max-w-[50%] lg:max-w-[40%] min-w-[200px] max-h-[40vh] object-contain mx-auto'
              priority
            />

            <h1
              className={`${montserrat.className} text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mt-6 tracking-tight`}
            >
              PyCon HK 2025
            </h1>

            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <div className='h-0.5 w-full bg-blue-700/30'></div>
              </div>
              <div className='relative flex justify-center'>
                <span
                  className={`${itim.className} px-4 text-xl md:text-2xl lg:text-3xl text-blue-600 bg-white/80 italic`}
                >
                  Sailing Together
                </span>
              </div>
            </div>

            <p
              className={`${montserrat.className} text-lg md:text-xl lg:text-2xl mt-4 max-w-2xl mx-auto text-blue-800`}
            >
              "Raise the sail, let Python prevail"
            </p>
          </div>

          <div className='absolute bottom-8 animate-bounce'>
            <div className='bg-white/80 rounded-full p-3 border border-green-300 shadow-sm'>
              <FaArrowDown className='h-6 w-6 text-green-500' />
            </div>
          </div>
        </div>
      </HomeBackground>
    </section>
  );
}
