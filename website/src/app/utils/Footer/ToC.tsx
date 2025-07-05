'use client';
export default function ToC() {
  const currentYear = new Date().getFullYear();

  return (
    <div className='text-center text-gray-200 text-sm font-semibold'>
      &copy; {currentYear} PyCon Hong Kong. All rights reserved.
    </div>
  );
}
