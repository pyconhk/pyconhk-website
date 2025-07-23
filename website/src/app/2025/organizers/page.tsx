import Image, { type StaticImageData } from 'next/image';
import hkcotaImg from '../../../../public/2025/organizers-volunteers/organizers/hkcota.webp';
import hkpugImg from '../../../../public/2025/organizers-volunteers/organizers/hkpug.webp';
import oshkImg from '../../../../public/2025/organizers-volunteers/organizers/oshk.webp';

interface OrganizerProps {
  title: React.ReactNode;
  description: string;
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

function Organizer({
  title,
  description,
  href,
  image,
  imageAlt,
}: OrganizerProps) {
  return (
    <div className='opacity-100'>
      <h2 className='text-3xl font-bold text-center text-gray-800'>{title}</h2>

      <p className='mt-8'>{description}</p>

      <div className='flex items-center justify-center mt-8'>
        <div className='skeleton w-fit h-fit'>
          <a href={href} target='_blank'>
            <Image
              src={image}
              alt={imageAlt}
              width={300}
              fetchPriority='low'
              decoding='async'
            />
          </a>
        </div>
      </div>
    </div>
  );
}

const organizers: OrganizerProps[] = [
  {
    title: <p>Hong Kong Python User Group</p>,
    description:
      'The Hong Kong Python User Group is a vibrant community of Python enthusiasts dedicated to promoting the use of Python programming language in Hong Kong. Through regular meetups, workshops, and events, they foster a collaborative environment for learning and sharing knowledge about Python.',
    href: 'https://www.facebook.com/groups/hkpug',
    image: hkpugImg,
    imageAlt: 'Hong Kong Python User Group',
  },
  {
    title: (
      <p>
        Open Source Hong Kong (OSHK)
        <br />
        開源香港
      </p>
    ),
    description:
      'The Hong Kong Python User Group is a vibrant community of Python enthusiasts dedicated to promoting the use of Python programming language in Hong Kong. Through regular meetups, workshops, and events, they foster a collaborative environment for learning and sharing knowledge about Python.',
    href: 'https://opensource.hk/',
    image: oshkImg,
    imageAlt: 'Open Source Hong Kong',
  },
  {
    title: (
      <p>
        Hong Kong Creative Open Technology Association (HKCOTA)
        <br />
        香港創意開放科技協會
      </p>
    ),
    description:
      'Founded in 2014, the Hong Kong Creative Open Technology Association (HKCOTA) is a non-profit, tax-exempt charitable organization. HKCOTA is dedicated to educating and promoting open standards, free and open-source software, open hardware, open data, and creative commons. By working closely with students and professionals, HKCOTA strives to advance the open technology movement in Hong Kong.',
    href: 'https://hkcota.org/',
    image: hkcotaImg,
    imageAlt: 'Hong Kong Creative Open Technology Association',
  },
];

export default function OrganizersPage() {
  return (
    <>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-bold text-center text-gray-900'>
          Organizers
        </h1>

        <p className='mt-4'>
          PyCon Hong Kong 2025 is organized by a dedicated group of passionate
          organizations committed to growing the Python community in Hong Kong.
        </p>

        {organizers.map(
          ({ title, description, href, image, imageAlt }, index) => (
            <div key={`organizer-${index}`} className='mt-24'>
              <Organizer
                key={`organizer-${index}`}
                title={title}
                description={description}
                href={href}
                image={image}
                imageAlt={imageAlt}
              />
            </div>
          )
        )}
      </div>
    </>
  );
}
