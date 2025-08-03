import Image, { type StaticImageData } from 'next/image';
export interface SponsorshipLogoProps {
  name: string;
  description?: string;
  logo: StaticImageData;
  logoAlt?: string;
  href?: string;
  nameClassName?: string;
  descriptionClassName?: string;
  logoClassName?: string;
}

export default function SponsorshipLogo({
  name,
  logo,
  href,
  description,
  logoAlt = name,
  nameClassName = '',
  descriptionClassName = '',
  logoClassName = '',
}: SponsorshipLogoProps) {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='skeleton w-fit h-fit'>
        <a href={href} target='_blank' rel='noopener noreferrer'>
          <Image
            src={logo}
            alt={logoAlt}
            className={`object-contain ${logoClassName} aspect-square`}
          />
        </a>
      </div>
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
