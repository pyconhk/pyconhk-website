import Image, { StaticImageData } from 'next/image';
import { HiOutlineAcademicCap, HiOutlineSpeakerphone } from 'react-icons/hi';
import adrianTamImg from '../../../../../public/2025/featured-speakers/adrian-tam.webp';
import georgiKerImg from '../../../../../public/2025/featured-speakers/georgi-ker.webp';
import hemangiImg from '../../../../../public/2025/featured-speakers/hemangi.webp';

interface Speaker {
  name: string;
  title: string;
  type: 'Talk' | 'Workshop';
  avatar?: StaticImageData;
  slug?: string;
}

const speakers: Speaker[] = [
  {
    name: 'Georgi Ker',
    title: 'pip install community',
    type: 'Talk',
    avatar: georgiKerImg,
  },
  {
    name: 'HEMANGI',
    title: 'OpenTelemetry Foundations: Hands-On Guide to Observability',
    type: 'Workshop',
    avatar: hemangiImg,
  },
  {
    name: 'Dr. Adrian Tam',
    title: 'AI工具改變了Python甚麼 / How AI Tools Changed the Python Language',
    type: 'Talk',
    avatar: adrianTamImg,
  },
];

async function SpeakerCard({ name, title, type, avatar }: Speaker) {
  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden min-w-64 min-h-52'>
      <div className='h-2 bg-sky-400'></div>
      <div className='p-6 flex-grow w-full h-full'>
        <div className='flex items-start w-full h-full'>
          <div className='flex-shrink-0 mr-4'>
            <div className='relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200'>
              {avatar ? (
                <Image src={avatar} alt={name} fill className='object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-blue-100 text-blue-500'>
                  <span className='text-2xl font-bold'>{name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-800'>{name}</h3>
            <div className='inline-flex items-center mt-1 px-2 py-1 rounded-full bg-blue-50 text-xs font-medium text-blue-700'>
              {type === 'Talk' ? (
                <>
                  <HiOutlineSpeakerphone className='mr-1' /> Talk
                </>
              ) : (
                <>
                  <HiOutlineAcademicCap className='mr-1' /> Workshop
                </>
              )}
            </div>
          </div>
        </div>

        <h4 className='mt-4 text-gray-700 font-medium leading-snug'>{title}</h4>
      </div>
    </div>
  );
}

export default async function FeaturedSpeakers() {
  return (
    <section className='py-24 bg-gradient-to-b from-white to-blue-50'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-slate-600 mb-6'>
            Featured Speakers
          </h2>
          <div className='h-1 w-24 bg-blue-400 mx-auto'></div>
          <p className='text-base sm:text-lg md:text-xl mt-4 text-gray-600 max-w-2xl mx-auto'>
            We&apos;re excited to announce our first batch of confirmed speakers
            for PyCon HK 2025!
          </p>
        </div>

        <div className='flex flex-col items-center lg:flex-row lg:justify-around gap-8 lg:gap-16'>
          {speakers.map((speaker, index) => (
            <div
              key={`featured-speaker-${index}`}
              className='max-w-96 min-h-48 w-full h-full'
            >
              <SpeakerCard
                key={`featured-speaker-${index}`}
                name={speaker.name}
                title={speaker.title}
                type={speaker.type}
                avatar={speaker.avatar}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
