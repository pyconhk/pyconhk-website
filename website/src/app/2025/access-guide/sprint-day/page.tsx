import { HiOutlineCalendar, HiOutlineInformationCircle } from 'react-icons/hi';

export default async function AccessGuideSprintDay() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Access Guide - Sprint Day
      </h1>
      <div className='flex flex-col items-center justify-center mb-8 gap-3'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full shadow-sm'>
          <div className='bg-purple-100 p-1.5 rounded-full'>
            <HiOutlineCalendar className='h-4 w-4 text-purple-600' />
          </div>
          <span className='font-medium text-gray-700'>
            12th October (Sun), 2025
          </span>
        </div>

        <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full shadow-sm'>
          <div className='bg-amber-100 p-1.5 rounded-full'>
            <HiOutlineInformationCircle className='h-4 w-4 text-amber-600' />
          </div>
          <span className='font-medium text-gray-700'>Details TBC</span>
        </div>
      </div>
    </>
  );
}
