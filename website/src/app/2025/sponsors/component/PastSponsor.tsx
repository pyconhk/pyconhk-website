'use client';

import Image from 'next/image';

const PastSponsor = () => {
  const sponsors = [
    {
      name: 'Amazon Web Services',
      logo: '/aws-25.png',
      width: 150,
      height: 80,
    },

    {
      name: 'Python Software Foundation',
      logo: '/Python-Logo-25.png',
      width: 150,
      height: 80,
    },
    {
      name: 'JetBrains',
      logo: '/JetBrains_25.svg',
      width: 150,
      height: 80,
    },

    {
      name: 'MySQL',
      logo: '/sql-25.png',
      width: 150,
      height: 80,
    },

    {
      name: 'City University of Hong Kong',
      logo: '/city-25.png',
      width: 150,
      height: 80,
    },
    {
      name: 'HKT',
      logo: '/hkt-25.png',
      width: 60,
      height: 30,
    },

    {
      name: 'PCCW',
      logo: '/pccw-25.png',
      width: 150,
      height: 80,
    },
  ];

  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className='mb-12'>
      <h2 className='text-3xl xl:text-4xl font-semibold mb-8 text-center'>
        Our Past Sponsors
      </h2>
      <p className='text-center text-gray-600 mb-8 max-w-2xl mx-auto'>
        We&apos;re proud to have partnered with these amazing organizations who
        have supported the Python community in Hong Kong.
      </p>

      {/* Scrolling container */}
      <div className='relative overflow-hidden bg-white rounded-3xl py-8'>
        <div className='flex animate-scroll space-x-16'>
          {duplicatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.name}-${index}`}
              className='flex-shrink-0 flex items-center justify-center p-6 transition-transform duration-300 hover:scale-110 w-[220px] h-[120px]'
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={sponsor.width}
                height={sponsor.height}
                className='max-w-[150px] max-h-[80px] w-auto h-auto object-contain'
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 15s linear infinite;
        }

        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll 8s linear infinite;
          }
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default PastSponsor;
