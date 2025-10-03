'use client';
import Image, { type StaticImageData } from 'next/image';
import { useRef } from 'react';
import { RxCross2 } from 'react-icons/rx';

export interface OrganizationLogoProps {
  name: string;
  description?: string;
  modalNode?: React.ReactNode;
  logo: StaticImageData;
  logoAlt?: string;
  href?: string;
  nameClassName?: string;
  descriptionClassName?: string;
  logoClassName?: string;
  overallClassName?: string; // Removed as per the latest changes
}

export default function OrganizationLogo({
  name,
  logo,
  href,
  description,
  modalNode,
  logoAlt = name,
  nameClassName = '',
  descriptionClassName = '',
  logoClassName = '',
  overallClassName = '',
}: OrganizationLogoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };
  return (
    <div
      className={`flex flex-col items-center justify-center ${overallClassName}`}
    >
      <div className='skeleton w-fit h-fit'>
        {href && !modalNode ? (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='cursor-pointer'
          >
            <Image
              src={logo}
              alt={logoAlt}
              className={`object-contain ${logoClassName} aspect-square`}
            />
          </a>
        ) : (
          <Image
            src={logo}
            alt={logoAlt}
            className={`object-contain ${logoClassName} aspect-square ${modalNode ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={openDialog}
          />
        )}
      </div>
      {modalNode && (
        <dialog id={`org-${name}`} className='modal' ref={dialogRef}>
          <div className='modal-box w-11/12 max-w-5xl max-h-11/12 lg:max-h-23/24 bg-white text-sm md:text-base modal-middle'>
            <form method='dialog'>
              {/* if there is a button in form, it will close the modal */}
              <button className='cursor-pointer absolute right-6 top-6 md:right-8 md:top-8'>
                <RxCross2 size={24} />
              </button>
            </form>
            <div className='flex items-center justify-center flex-col'>
              <Image
                src={logo}
                alt={logoAlt}
                className='object-contain aspect-square w-24 md:w-36 rounded-xl'
              />
              <h3 className='font-bold text-base md:text-xl mt-2 flex items-center justify-center'>
                <span
                  className='text-center'
                  dangerouslySetInnerHTML={{ __html: name }}
                />
              </h3>
            </div>
            <div className='p-4 md:p-10'>{modalNode}</div>
            <div className='flex justify-center mt-4 mb-4 md:mb-6'>
              <button className='btn btn-primary btn-sm md:btn-md'>
                <a href={href} target='_blank' rel='noopener noreferrer'>
                  Official Website
                </a>
              </button>
            </div>
          </div>
          <form method='dialog' className='modal-backdrop'>
            <button>close</button>
          </form>
        </dialog>
      )}
      <span
        className={`text-gray-700 font-semibold text-center w-full ${nameClassName}`}
        dangerouslySetInnerHTML={{ __html: name }}
      />
      {description && (
        <p
          className={`text-gray-500 mt-1 text-center w-full ${descriptionClassName} text-wrap`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
