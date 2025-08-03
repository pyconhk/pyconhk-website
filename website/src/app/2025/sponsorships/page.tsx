import awsLogoImg from '../../../../public/2025/sponsorships/aws.webp';
import cityucocLogoImg from '../../../../public/2025/sponsorships/cityucoc.webp';
import jetbrainsLogoImg from '../../../../public/2025/sponsorships/jetbrains.webp';
import mysqlLogoImg from '../../../../public/2025/sponsorships/mysql.webp';
import pccwLogoImg from '../../../../public/2025/sponsorships/pccw.webp';
import psfLogoImg from '../../../../public/2025/sponsorships/psf.webp';
import redhatLogoImg from '../../../../public/2025/sponsorships/redhat.webp';
import OrganizationLogo, {
  OrganizationLogoProps,
} from '../components/utils/OrganizationLogo';

interface SponsorTier {
  tier: string;
  sponsors: OrganizationLogoProps[];
}

const sponsorTiers: SponsorTier[] = [
  {
    tier: 'Diamond Sponsor',
    sponsors: [
      {
        name: 'AWS',
        description: '❤️ Sponsor of 3 consecutive years',
        logo: awsLogoImg,
        logoAlt: 'AWS Logo',
        href: 'https://aws.amazon.com/',
      },
    ],
  },
  {
    tier: 'Platinum Sponsor',
    sponsors: [
      {
        name: 'Python Software Foundation',
        description: '❤️ Sponsor for a total of 5 years',
        logo: psfLogoImg,
        logoAlt: 'Python Software Foundation Logo',
        href: 'https://www.python.org/psf-landing/',
      },
    ],
  },
  {
    tier: 'Gold Sponsor',
    sponsors: [
      {
        name: 'Red Hat',
        description: '❤️ Sponsor of 2 consecutive years',
        logo: redhatLogoImg,
        logoAlt: 'Red Hat Logo',
        href: 'https://www.redhat.com/',
      },
    ],
  },
  {
    tier: 'Venue Partner',
    sponsors: [
      {
        name: 'City University of Hong Kong<br/>College of Computing',
        logo: cityucocLogoImg,
        logoAlt: 'CityU College of Computing Logo',
        href: 'https://www.cityu.edu.hk/cc/',
      },
    ],
  },
  {
    tier: 'Silver Sponsor',
    sponsors: [
      {
        name: 'MySQL',
        description: '❤️ Sponsor of 9 consecutive years',
        logo: mysqlLogoImg,
        logoAlt: 'MySQL Logo',
        href: 'https://www.mysql.com/',
      },
    ],
  },
  {
    tier: 'Prize Sponsor',
    sponsors: [
      {
        name: 'JetBrains',
        description: '❤️ Sponsor of 2 consecutive years',
        logo: jetbrainsLogoImg,
        logoAlt: 'JetBrains Logo',
        href: 'https://www.jetbrains.com/',
      },
      {
        name: 'HKT Limited',
        description: '❤️ Sponsor of 3 consecutive years',
        logo: pccwLogoImg,
        logoAlt: 'HKT Limited Logo',
        href: 'https://www.hkt.com/',
      },
    ],
  },
];

export default function Sponsorships() {
  const isTestEnv = process.env.NEXT_PUBLIC_IS_TEST_ENV == 'true';
  return (
    <>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-center'>
        Sponsorships
      </h1>
      <p className='mt-8'>
        A huge thanks to our amazing sponsors! Your support powers PyCon HK
        2025, fuels the Python community, and keeps the open-source spirit
        alive. We couldn&apos;t do it without you!
      </p>
      {isTestEnv &&
        sponsorTiers.map(tier => (
          <div key={tier.tier} className='flex flex-col items-center mt-16'>
            <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold'>
              {tier.tier}
            </h2>
            <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24 mt-8'>
              {tier.sponsors.map(sponsor => (
                <OrganizationLogo
                  key={sponsor.name}
                  name={sponsor.name}
                  nameClassName='text-base sm:text-xl font-semibold mt-4'
                  description={sponsor.description}
                  descriptionClassName='text-sm sm:text-base text-gray-600 mt-2'
                  logo={sponsor.logo}
                  logoAlt={sponsor.logoAlt}
                  logoClassName='w-56 sm:w-80'
                  href={sponsor.href}
                />
              ))}
            </div>
          </div>
        ))}
    </>
  );
}
