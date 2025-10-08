import Image, { type StaticImageData } from 'next/image';
import awsLogoImg from '../../../../../public/2025/sponsorships/transparent-bg/aws.svg';
import bloombergImg from '../../../../../public/2025/sponsorships/transparent-bg/bloomberg.svg';
import bootDevImg from '../../../../../public/2025/sponsorships/transparent-bg/boot.dev.webp';
import cityuCOCImg from '../../../../../public/2025/sponsorships/transparent-bg/cityu_coc.svg';
import jetbrainsImg from '../../../../../public/2025/sponsorships/transparent-bg/jetbrains.svg';
import lgtImg from '../../../../../public/2025/sponsorships/transparent-bg/lgt.svg';
import navicatImg from '../../../../../public/2025/sponsorships/transparent-bg/navicat.svg';
import psfImg from '../../../../../public/2025/sponsorships/transparent-bg/psf.webp';
import redhatImg from '../../../../../public/2025/sponsorships/transparent-bg/redhat.svg';

// Define the shape of each sponsor/organization object
interface Logo {
  name: string;
  logo: StaticImageData;
  logoUrl: string;
}

const sponsorshipLogos: Logo[] = [
  {
    name: 'Amazon Web Services',
    logo: awsLogoImg,
    logoUrl: 'https://aws.amazon.com/',
  },
  {
    name: 'LGT Private Banking',
    logo: lgtImg,
    logoUrl: 'https://www.lgt.com/hk-en',
  },
  {
    name: 'Red Hat',
    logo: redhatImg,
    logoUrl: 'https://www.redhat.com/en',
  },
  {
    name: 'City University of Hong Kong College of Computing',
    logo: cityuCOCImg,
    logoUrl: 'https://www.cityu.edu.hk/cc/',
  },
  {
    name: 'Bloomberg',
    logo: bloombergImg,
    logoUrl: 'https://www.bloomberg.com/asia',
  },
  {
    name: 'Boot.dev',
    logo: bootDevImg,
    logoUrl: 'https://www.boot.dev/',
  },
  {
    name: 'Navicat',
    logo: navicatImg,
    logoUrl: 'https://www.navicat.com/cht',
  },
  // {
  //   name: 'Beta Labs',
  //   logo: betaLabsImg,
  //   logoUrl: 'https://www.linkedin.com/company/betalabs-hk',
  // },
  // {
  //   name: 'PyLadies Hong Kong',
  //   logo: pyladiesHKImg,
  //   logoUrl: 'https://linktr.ee/pyladieshk',
  // },
  {
    name: 'JetBrains',
    logo: jetbrainsImg,
    logoUrl: 'https://www.jetbrains.com/',
  },
  {
    name: 'Python Software Foundation',
    logo: psfImg,
    logoUrl: 'https://www.python.org/psf-landing/',
  },
];

const SLIDE_WIDTH_PX = 200;

export default function SponsorCarousel() {
  // We need to duplicate the logos to create the seamless loop effect
  const extendedLogos = [...sponsorshipLogos, ...sponsorshipLogos];

  // Calculate the total width of the track for the animation
  const trackWidth = extendedLogos.length * SLIDE_WIDTH_PX;

  return (
    <>
      <div className='container mx-auto px-4'>
        {/* Main slider container */}
        <div className='relative overflow-hidden py-10 w-full before:content-[""] before:absolute before:top-0 before:left-0 before:w-[150px] before:h-full before:z-10 before:bg-gradient-to-r before:from-white before:to-transparent after:content-[""] after:absolute after:top-0 after:right-0 after:w-[150px] after:h-full after:z-10 after:bg-gradient-to-l after:from-white after:to-transparent hover:[&>div]:animate-none'>
          {/* The moving track */}
          <div
            className='flex animate-scroll animate-[scroll_40s_linear_infinite]'
            style={{
              width: `${trackWidth}px`,
            }}
          >
            {extendedLogos.map((logo, index) => (
              <div
                className={`h-[60px] w-[${SLIDE_WIDTH_PX}px] flex items-center justify-center px-6`}
                key={index}
              >
                <a
                  href={logo.logoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='cursor-pointer'
                >
                  <Image
                    src={logo.logo}
                    alt={logo.name}
                    width={150}
                    height={60}
                    className='h-full w-auto grayscale hover:grayscale-0 transition-all duration-300 object-contain'
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
