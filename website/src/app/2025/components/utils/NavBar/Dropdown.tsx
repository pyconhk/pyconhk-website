import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

interface NavigationDropdownProps {
  title: string;
  titleHref?: string;
  titleClassName?: string;
  children: React.ReactNode;
}

export default async function NavigationDropdown({
  title,
  titleHref,
  titleClassName,
  children,
}: NavigationDropdownProps) {
  return (
    <div className='dropdown dropdown-hover group'>
      <div tabIndex={0} className='flex items-center gap-1'>
        <span className='text-gray-800 font-bold'>
          {titleHref ? (
            <li key={title} className={`group relative ${titleClassName}`}>
              <Link href={titleHref} className={titleClassName || ''}>
                {title}
              </Link>
            </li>
          ) : (
            title
          )}
        </span>
        <span className='text-sm flex items-center justify-center'>
          <FaChevronUp className='hidden group-hover:inline-block' />
          <FaChevronDown className='inline-block group-hover:hidden' />
        </span>
      </div>
      <ul
        tabIndex={0}
        className='menu dropdown-content bg-white rounded-box z-1 w-52 p-2 shadow-sm'
      >
        {children}
      </ul>
    </div>
  );
}
