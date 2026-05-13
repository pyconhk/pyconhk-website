'use client';

import { MouseEvent } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

type Props = {
  label: string;
  targetId: string;
};

export default function ScrollIndicator({ label, targetId }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${targetId}`);
  };

  return (
    <a
      href={`#${targetId}`}
      aria-label={label}
      onClick={handleClick}
      className='absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#172033] bg-white/90 p-3 text-[#2b5b84] shadow-[4px_5px_0_#17203322] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b5b84] min-[1292px]:flex'
    >
      <FaChevronDown aria-hidden='true' className='h-5 w-5 animate-bounce' />
    </a>
  );
}
