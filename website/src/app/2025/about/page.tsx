import Image from 'next/image';
import Link from 'next/link';
import aboutUsImg from '../../../../public/about-us.jpeg';

export default async function About() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-slate-600 text-center'>
        About PyCon Hong Kong
      </h1>

      <div className='relative w-full h-full mb-8 rounded-lg overflow-hidden flex items-center justify-center'>
        <Image
          src='/about-us.jpeg'
          width={1080}
          height={aboutUsImg.height * (1080 / aboutUsImg.width)}
          alt='PyCon Hong Kong Event'
          priority
          className='rounded-lg'
        />
      </div>

      <div className='space-y-6 text-slate-500 text-base/7 lg:text-lg/8 text-justify'>
        <p>
          PyCon Hong Kong (PyCon HK) is the leading Python conference in Hong
          Kong, bringing together Python enthusiasts to share their insights and
          foster collaboration. Among the 50+ PyCons hosted annually in various
          cities and countries worldwide, PyCon HK is proud to be one of them.
        </p>

        <p className='mt-4'>
          The founding of PyCon HK traces back to &nbsp;
          <Link
            href='https://sammy.hk/'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            Sammy Fung
          </Link>
          , who drew inspiration from the PyCon APAC 2013 event in Tokyo. Sammy
          recognized that Hong Kong was missing out on this vital Python
          conference, despite PyCon being hosted in various Asian cities.
          Determined to fill this gap, Sammy collaborated with &nbsp;
          <Link
            href='https://opensource.hk/'
            target='_blank'
            className='text-sky-600 hover:text-sky-800'
          >
            Open Source Hong Kong
          </Link>
          &nbsp; to organize the inaugural PyCon HK in 2015. Since then, PyCon
          HK has played a pivotal role in nurturing Python development and
          adoption within the city.
        </p>

        <p className='mt-4'>
          In 2025, PyCon Hong Kong celebrates its 11th anniversary with Mr.
          Henry Law as the Chairman of PyCon HK 2025. A cornerstone of the event
          since its founding, Mr. Law brings extensive expertise and leadership
          to the Python community. With over ten years as a software engineer at
          a Fortune 500 tech company, specializing in server-side development
          and client / server / web infrastructure, he offers a blend of
          technical proficiency and innovative vision. Under his guidance, PyCon
          HK 2025 is set to deliver an inspiring, high-impact event for Python
          enthusiasts worldwide.
        </p>

        <div className='mt-8'>
          <h2 className='text-2xl font-bold text-sky-600 mb-4'>
            Follow us on:
          </h2>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            <Link
              href='https://www.linkedin.com/company/pyconhk/'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>LinkedIn:</span>
              <span className='text-sm'>linkedin.com/company/pyconhk</span>
            </Link>
            <Link
              href='https://pyconhk.substack.com/'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>Substack:</span>
              <span className='text-sm'>pyconhk.substack.com</span>
            </Link>
            <Link
              href='https://bit.ly/pyconhk'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>Discord:</span>
              <span className='text-sm'>bit.ly/pyconhk</span>
            </Link>
            <Link
              href='https://www.instagram.com/pyconhk'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>Instagram:</span>
              <span className='text-sm'>instagram.com/pyconhk</span>
            </Link>
            <Link
              href='https://www.threads.net/@pyconhk'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>Threads:</span>
              <span className='text-sm'>threads.net/@pyconhk</span>
            </Link>
            <Link
              href='https://www.facebook.com/pyconhk/'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>Facebook:</span>
              <span className='text-sm'>facebook.com/pyconhk</span>
            </Link>
            <Link
              href='https://x.com/pyconhk/'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>X:</span>
              <span className='text-sm'>x.com/pyconhk</span>
            </Link>
            <Link
              href='https://www.youtube.com/c/pyconhk'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>YouTube:</span>
              <span className='text-sm'>youtube.com/c/pyconhk</span>
            </Link>
            <Link
              href='https://github.com/pyconhk/'
              target='_blank'
              className='flex items-center text-sky-600 hover:text-sky-800'
            >
              <span className='mr-2'>GitHub:</span>
              <span className='text-sm'>github.com/pyconhk</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
