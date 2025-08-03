import Link from 'next/link';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaRegClock } from 'react-icons/fa6';
import { HiOutlineCalendar, HiOutlineCursorClick } from 'react-icons/hi';
import { LiaMapMarkedAltSolid } from 'react-icons/lia';

export default async function Sprint() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Sprint
      </h1>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mt-4 border-gray-700'>
          <div className='flex items-center mt-6 md:mb-0'>
            <div className='bg-purple-100 p-2 rounded-full mr-4'>
              <HiOutlineCalendar className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <h3 className='text-sm text-gray-500 uppercase'>Date</h3>
              <p className='font-semibold text-gray-700'>
                12th October (Sun), 2025
              </p>
            </div>
          </div>

          <div className='flex items-center'>
            <div className='bg-blue-100 p-2 rounded-full mr-4'>
              <LiaMapMarkedAltSolid className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h3 className='text-sm text-gray-500 uppercase'>Venue</h3>
              <p className='font-semibold text-gray-700'>TBC</p>
            </div>
          </div>
        </div>

        <div className='mt-4 md:mt-6'>
          <h2 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
            <FaRegClock className='h-5 w-5 mr-2 text-yellow-500' />
            Schedule
          </h2>
          <div className='bg-gray-50 p-4 rounded-md'>
            <p className='text-gray-500 italic'>
              Schedule details coming soon...
            </p>
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-4 justify-center mt-4 md:mt-8'>
          <a
            // href='#' //! disabled link for now
            className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-md text-center transition-colors duration-300 flex items-center justify-center'
          >
            <HiOutlineCursorClick className='h-5 w-5 mr-2' />
            Submit your Sprint Projects
          </a>

          <Link
            href='/sprint/qna/en'
            className='bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-md text-center transition-colors duration-300 flex items-center justify-center'
          >
            <AiOutlineQuestionCircle className='h-5 w-5 mr-2 text-blue-500' />
            Sprint Q&A
          </Link>
        </div>
      </div>
    </div>
  );
}
