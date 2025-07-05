import { IconType } from 'react-icons/lib';
import {
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaThreads,
} from 'react-icons/fa6';
import Link from 'next/link';

interface SocialMediaIconsProps {
  spacing?: string;
  iconColor?: string;
  iconHoverColor?: string;
  iconExtraClassName?: string;
}

interface SocialMediaLink {
  icon: IconType;
  href: string;
}

const socialMediaLinks: SocialMediaLink[] = [
  {
    icon: FaXTwitter,
    href: process.env.NEXT_PUBLIC_TWITTER_URL,
  },
  {
    icon: FaLinkedin,
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  },
  {
    icon: FaYoutube,
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  },
  {
    icon: FaFacebook,
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  },
  {
    icon: FaInstagram,
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  },
  {
    icon: FaThreads,
    href: process.env.NEXT_PUBLIC_THREADS_URL,
  },
];

export default async function SocialMediaIcons({
  spacing = 'space-x-4',
  iconColor = 'text-gray-600',
  iconHoverColor = 'hover:text-gray-800',
  iconExtraClassName = '',
}: SocialMediaIconsProps) {
  return (
    <div className={`flex items-center ${spacing}`}>
      {socialMediaLinks.map(({ icon: Icon, href }) => (
        <Link
          key={href}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='transition-transform duration-200'
        >
          <Icon
            className={`font-bold ${iconColor} ${iconHoverColor} transition-colors ${iconExtraClassName}`}
          />
        </Link>
      ))}
    </div>
  );
}
