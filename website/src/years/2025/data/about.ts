export type SocialLink = {
  label: string;
  href: string;
  display: string;
};

export const socialLinks: readonly SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pyconhk/',
    display: 'linkedin.com/company/pyconhk',
  },
  {
    label: 'Substack',
    href: 'https://pyconhk.substack.com/',
    display: 'pyconhk.substack.com',
  },
  {
    label: 'Discord',
    href: 'https://bit.ly/pyconhk',
    display: 'bit.ly/pyconhk',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pyconhk',
    display: 'instagram.com/pyconhk',
  },
  {
    label: 'Threads',
    href: 'https://www.threads.net/@pyconhk',
    display: 'threads.net/@pyconhk',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/pyconhk/',
    display: 'facebook.com/pyconhk',
  },
  {
    label: 'X',
    href: 'https://x.com/pyconhk/',
    display: 'x.com/pyconhk',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/c/pyconhk',
    display: 'youtube.com/c/pyconhk',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/pyconhk/',
    display: 'github.com/pyconhk',
  },
] as const;
