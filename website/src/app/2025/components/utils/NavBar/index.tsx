import ClickableLink from './ClickableLink';
import NavBarLinks from './Links';
import NavBarDrawerlinks from './DrawerLinks';
import { LuAlignJustify } from 'react-icons/lu';

export default async function NavBar() {
  return (
    <nav className='px-4 flex items-center justify-between top-0 left-0 w-full sticky z-50 h-20 backdrop-blur-sm bg-white/10 '>
      <div className='flex items-center justify-between lg:container lg:mx-auto px-4 md:px-8 w-full'>
        <div className='flex items-center w-fit'>
          <ClickableLink
            href='/'
            title='PyCon HK 2025'
            className='text-slate-700 font-bold text-lg w-fit whitespace-nowrap'
            isActive={true}
          />
        </div>
        <div className='hidden lg:flex lg:items-center lg:justify-between w-fit'>
          <NavBarLinks />
        </div>
        <div className='flex items-center lg:hidden w-full h-full justify-end'>
          <NavBarDrawerlinks>
            <LuAlignJustify className='text-2xl text-slate-600 cursor-pointer' />
          </NavBarDrawerlinks>
        </div>
      </div>
    </nav>
  );
}
