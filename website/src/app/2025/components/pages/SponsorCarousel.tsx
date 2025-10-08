import Image, { type StaticImageData } from 'next/image';
import awsLogoImg from '../../../../../public/2025/sponsorships/aws.svg';
import betaLabsImg from '../../../../../public/2025/sponsorships/beta_labs.svg';
import bloombergImg from '../../../../../public/2025/sponsorships/bloomberg.svg';
import bootDevImg from '../../../../../public/2025/sponsorships/boot.dev.webp';
import cityuCOCImg from '../../../../../public/2025/sponsorships/cityu_coc.svg';
import jetbrainsImg from '../../../../../public/2025/sponsorships/jetbrains.svg';
import lgtImg from '../../../../../public/2025/sponsorships/lgt.svg';
import navicatImg from '../../../../../public/2025/sponsorships/navicat.svg';
import psfImg from '../../../../../public/2025/sponsorships/psf.webp';
import pyladiesHKImg from '../../../../../public/2025/sponsorships/pyladies_hk.svg';
import redhatImg from '../../../../../public/2025/sponsorships/redhat.svg';

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

  // This CSS variable will be used in our keyframes animation
  const customStyles = {
    '--logo-count': sponsorshipLogos.length,
    width: `${trackWidth}px`,
  } as React.CSSProperties;

  return (
    <>
      <div className='container mx-auto px-4'>
        <h2 className='text-center text-2xl font-bold text-base-content mb-4'>
          Sponsorships
        </h2>

        {/* This is the main slider container from our CSS */}
        <div className='logo-slider'>
          {/* The track receives the inline style to set the width and CSS variable */}
          <div className='logo-slide-track' style={customStyles}>
            {extendedLogos.map((logo, index) => (
              <div className='slide' key={index}>
                <a
                  href={logo.logoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='cursor-pointer'
                >
                  <Image
                    src={logo.logo}
                    alt={logo.name}
                    width={150} // Base width for optimization
                    height={60} // Base height for optimization
                    style={{ objectFit: 'contain' }} // Ensures logo fits container
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
