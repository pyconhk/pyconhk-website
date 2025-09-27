import awsLogoImg from '../../../../public/2025/sponsorships/aws.svg';
import bloombergImg from '../../../../public/2025/sponsorships/bloomberg.svg';
import bootDevImg from '../../../../public/2025/sponsorships/boot.dev.webp';
import cityuCOCImg from '../../../../public/2025/sponsorships/cityu_coc.svg';
import jetbrainsImg from '../../../../public/2025/sponsorships/jetbrains.svg';
import lgtImg from '../../../../public/2025/sponsorships/lgt.svg';
import navicatImg from '../../../../public/2025/sponsorships/navicat.svg';
import psfImg from '../../../../public/2025/sponsorships/psf.webp';
import redhatImg from '../../../../public/2025/sponsorships/redhat.svg';
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
        name: 'Amazon Web Services',
        description: '❤️ Sponsor of 4 consecutive years',
        modalNode: (
          <div>
            <p>
              Since 2006, Amazon Web Services has been the world&apos;s most
              comprehensive and broadly adopted cloud. AWS has been continually
              expanding its services to support virtually any workload, and it
              now has more than 240 fully featured services for
            </p>
            <ul className='list-disc list-inside mt-2 mb-2 ml-4'>
              <li>compute</li>
              <li>storage</li>
              <li>databases</li>
              <li>networking</li>
              <li>analytics</li>
              <li>mobile</li>
              <li>security</li>
              <li>hybrid</li>
              <li>media</li>
              <li>application development</li>
              <li>deployment</li>
              <li>management</li>
            </ul>
            <p>
              from 120 Availability Zones within 38 geographic regions, with
              announced plans for 10 more Availability Zones, and three more AWS
              Regions in Chile, the Kingdom of Saudi Arabia, and the AWS
              European Sovereign Cloud.
            </p>
            <br />
            <p>
              Millions of customers—including the fastest-growing startups,
              largest enterprises, and leading government agencies—trust AWS to
              power their infrastructure, become more agile, and lower costs.
            </p>
          </div>
        ),
        logo: awsLogoImg,
        logoAlt: 'AWS Logo',
        href: 'https://aws.amazon.com/',
      },
    ],
  },
  {
    tier: 'Platinum Sponsors',
    sponsors: [
      {
        name: 'LGT Private Banking',
        description: '👏 First-time sponsor of PyCon HK',
        modalNode: (
          <div>
            <p>
              LGT is a leading international private banking and asset
              management group that has been fully controlled by the
              Liechtenstein Princely Family for over 90 years.
            </p>
            <br />
            <p>
              As at 30 June 2025, LGT managed assets of CHF 359.6 billion (USD
              451.6 billion) for wealthy private individuals and institutional
              clients. LGT employs over 6000 people who work out of more than 30
              locations in Europe, Asia, the Americas, Australia and the Middle
              East.
            </p>
          </div>
        ),
        logo: lgtImg,
        logoAlt: 'LGT Private Banking Logo',
        href: 'https://www.lgt.com/hk-en',
      },
      {
        name: 'Red Hat',
        description: '❤️ Sponsor of 3 consecutive years',
        modalNode: (
          <div>
            <p>
              Red Hat is the open hybrid cloud technology leader, delivering a
              trusted, consistent and comprehensive foundation for
              transformative IT innovation and AI applications.
            </p>
            <br />
            <p>
              Its portfolio of cloud, developer, AI, Linux, automation and
              application platform technologies enables any application,
              anywhere—from the datacenter to the edge. As the world&apos;s leading
              provider of enterprise open source software solutions, Red Hat
              invests in open ecosystems and communities to solve tomorrow&apos;s IT
              challenges.
            </p>
            <br />
            <p>
              Collaborating with partners and customers, Red Hat helps them
              build, connect, automate, secure and manage their IT environments,
              supported by consulting services and{' '}
              <a
                href='https://access.redhat.com/recognition'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                award-winning
              </a>{' '}
              training and certification offerings.
            </p>
          </div>
        ),
        logo: redhatImg,
        logoAlt: 'Red Hat Logo',
        href: 'https://www.redhat.com/en',
      },
    ],
  },
  {
    tier: 'Community Partner',
    sponsors: [
      {
        name: 'City University of Hong Kong<br/>College of Computing',
        description: '❤️ Supporter for 2 consecutive years',
        logo: cityuCOCImg,
        logoAlt: 'CityU COC Logo',
        href: 'https://www.cityu.edu.hk/cc/',
      },
    ],
  },
  {
    tier: 'Silver Sponsors',
    sponsors: [
      {
        name: 'Bloomberg',
        description: '👏 First-time sponsor of PyCon HK',
        logo: bloombergImg,
        logoAlt: 'Bloomberg Logo',
        href: 'https://www.bloomberg.com/asia',
      },
      {
        name: 'Boot.dev',
        description: '👏 First-time sponsor of PyCon HK',
        logo: bootDevImg,
        logoAlt: 'Boot.dev Logo',
        href: 'https://www.boot.dev/',
      },
      {
        name: 'Navicat',
        description: '👏 First-time sponsor of PyCon HK',
        logo: navicatImg,
        logoAlt: 'Navicat Logo',
        href: 'https://www.navicat.com/cht',
      },
    ],
  },
  {
    tier: 'Prize Sponsor',
    sponsors: [
      {
        name: 'JetBrains',
        description: '❤️ Sponsor of 3 consecutive years',
        logo: jetbrainsImg,
        logoAlt: 'JetBrains Logo',
        href: 'https://www.jetbrains.com/',
      },
    ],
  },
  {
    tier: 'Foundation Sponsor',
    sponsors: [
      {
        name: 'Python Software Foundation',
        description: '❤️ Sponsor for a total of 6 years',
        logo: psfImg,
        logoAlt: 'PSF Logo',
        href: 'https://www.python.org/psf-landing/',
      },
    ],
  },
];

export default async function Sponsorships() {
  return (
    <>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-center'>
        Sponsors
      </h1>
      <p className='mt-8'>
        A huge thanks to our amazing sponsors! Your support powers PyCon HK
        2025, fuels the Python community, and keeps the open-source spirit
        alive. We couldn&apos;t do it without you!
      </p>
      {sponsorTiers.map(tier => (
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
                modalNode={sponsor.modalNode}
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
