'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const images = [
  '/Event_1.webp',
  '/Event_2.webp',
  '/Event_3.webp',
  '/Event_4.webp',
];

export default function BannerImageSlide() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='  flex items-center justify-center w-full h-full p-8 md:p-0'>
      <div className='relative w-full md:max-w-144 xl:max-w-192 h-64 sm:h-74 md:h-80 xl:h-106 flex items-center justify-center opacity-75 border-4 rounded-3xl border-gray-700 xl:ml-0 lg:ml-8 group'>
        {/* Stacking border effect */}
        <div className='absolute inset-0 pointer-events-none z-10'>
          <div className='absolute inset-0 rounded-2xl border-2 border-slate-800 opacity-80 translate-x-3 translate-y-3 shadow-2xl'></div>
          <div className='absolute inset-0 rounded-2xl border-2 border-slate-800 opacity-80 translate-x-5 translate-y-5 shadow-2xl'></div>
        </div>
        {/* Main image */}
        <div className='relative w-full h-full rounded-2xl overflow-hidden z-20'>
          {images.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt={`Event ${idx + 1}`}
              fill
              className={`object-cover rounded-2xl ${
                idx === current ? 'opacity-100' : 'opacity-0'
              }`}
              priority={idx === 0}
            />
          ))}
        </div>
        {/* Dots indicator */}
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-30'>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx === current ? 'bg-white' : 'bg-slate-600'
              } border border-gray-300`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
