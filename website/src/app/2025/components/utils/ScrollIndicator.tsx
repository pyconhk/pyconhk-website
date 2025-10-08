'use client';
import { FaChevronDown } from 'react-icons/fa6';

export default function ScrollIndicator() {
  const handleClick = () => {
    // Get viewport height and scroll to just below first screen
    // Navbar height is h-20 which is 5rem or approximately 80px
    const viewportHeight = window.innerHeight;
    const navbarHeight = 80;

    window.scrollTo({
      top: viewportHeight - navbarHeight,
      behavior: 'smooth',
    });
  };
  return (
    <div
      className='absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer'
      onClick={handleClick}
    >
      <div className='bg-white/70 rounded-full border border-[#016735]/40 flex items-center justify-center p-3 cursor-pointer'>
        <div className='flex items-center justify-center gap-2 text-[#016735]'>
          <span>Latest News</span>
          <FaChevronDown className='h-5 w-5' />
        </div>
      </div>
    </div>
  );
}
