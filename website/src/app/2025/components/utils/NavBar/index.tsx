import Image from 'next/image';
import Link from 'next/link';
import { LuAlignJustify } from 'react-icons/lu';
import logoImage from '../../../../../../public/2025/logos/logo.svg';
import NavBarDrawerlinks from './DrawerLinks';
import NavBarLinks from './Links';

export default async function NavBar() {
  return (
    <nav className='px-4 flex items-center justify-between left-0 w-full sticky top-0 z-50 h-20 backdrop-blur-sm'>
      <div className='flex items-center justify-between lg:container lg:mx-auto px-4 md:px-8 w-full'>
        <div className='flex items-center justify-center h-full'>
          <Link
            href='/'
            className='flex items-center text-slate-700 font-bold text-lg w-fit whitespace-nowrap'
          >
            <Image
              src={logoImage}
              alt='PyCon HK 2025 Logo'
              width={80}
              height={80}
              className='my-auto p-1'
            />
          </Link>
        </div>
        <div className='hidden xl:flex xl:items-center xl:justify-between w-fit'>
          <NavBarLinks />
        </div>
        <div className='flex items-center xl:hidden w-full h-full justify-end'>
          <NavBarDrawerlinks>
            <LuAlignJustify className='text-2xl text-slate-600 cursor-pointer' />
          </NavBarDrawerlinks>
        </div>
      </div>
    </nav>
  );
}
