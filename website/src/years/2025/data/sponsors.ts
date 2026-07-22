import {
  type LocalizedValue,
  resolveLocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';
import type { ContentBlock } from '@/years/2025/data/content-blocks';

type LocalizedText = LocalizedValue<string>;

export type FeaturedSponsor = {
  name: string;
  imagePath: string;
  url: string;
};

export type SponsorCard = {
  slug: string;
  nameLines: readonly string[];
  badge: LocalizedText;
  imagePath: string;
  logoAlt: string;
  url: string;
  logoClass?: string;
  details?: Partial<Record<SiteLocale, readonly ContentBlock[]>>;
};

export type SponsorTier = {
  name: LocalizedText;
  sponsors: readonly SponsorCard[];
};

export function getSponsorTierName(tier: SponsorTier, locale: SiteLocale): string {
  return resolveRequiredLocalizedValue(tier.name, locale);
}

export function getSponsorBadge(sponsor: SponsorCard, locale: SiteLocale): string {
  return resolveRequiredLocalizedValue(sponsor.badge, locale);
}

export function getSponsorDetails(
  sponsor: SponsorCard,
  locale: SiteLocale
): readonly ContentBlock[] | undefined {
  return sponsor.details ? resolveLocalizedValue(sponsor.details, locale) : undefined;
}

export const featuredSponsors: readonly FeaturedSponsor[] = [
  {
    name: 'Amazon Web Services',
    imagePath: '/2025/sponsorships/transparent-bg/aws.svg',
    url: 'https://aws.amazon.com/',
  },
  {
    name: 'LGT Private Banking',
    imagePath: '/2025/sponsorships/transparent-bg/lgt.svg',
    url: 'https://www.lgt.com/hk-en',
  },
  {
    name: 'Red Hat',
    imagePath: '/2025/sponsorships/transparent-bg/redhat.svg',
    url: 'https://www.redhat.com/en',
  },
  {
    name: 'CityU College of Computing',
    imagePath: '/2025/sponsorships/transparent-bg/cityu_coc.svg',
    url: 'https://www.cityu.edu.hk/cc/',
  },
  {
    name: 'Bloomberg',
    imagePath: '/2025/sponsorships/transparent-bg/bloomberg.svg',
    url: 'https://www.bloomberg.com/asia',
  },
  {
    name: 'Boot.dev',
    imagePath: '/2025/sponsorships/transparent-bg/boot.dev.webp',
    url: 'https://www.boot.dev/',
  },
  {
    name: 'Navicat',
    imagePath: '/2025/sponsorships/transparent-bg/navicat.svg',
    url: 'https://www.navicat.com/cht',
  },
  {
    name: 'JetBrains',
    imagePath: '/2025/sponsorships/transparent-bg/jetbrains.svg',
    url: 'https://www.jetbrains.com/',
  },
  {
    name: 'Python Software Foundation',
    imagePath: '/2025/sponsorships/transparent-bg/psf.webp',
    url: 'https://www.python.org/psf-landing/',
  },
];

export const sponsorTiers: readonly SponsorTier[] = [
  {
    name: {
      en: 'Diamond Sponsor',
      'zh-hk': '鑽石贊助',
    },
    sponsors: [
      {
        slug: 'amazon-web-services',
        nameLines: ['Amazon Web Services'],
        badge: {
          en: 'Sponsor of 4 consecutive years',
          'zh-hk': '連續 4 年支持 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/aws.svg',
        logoAlt: 'AWS Logo',
        url: 'https://aws.amazon.com/',
        logoClass: 'w-56 sm:w-80',
        details: {
          en: [
            {
              type: 'paragraph',
              text: "Since 2006, Amazon Web Services has grown into one of the world's most comprehensive and broadly adopted cloud platforms.",
            },
            {
              type: 'list',
              items: [
                'Compute',
                'Storage',
                'Databases',
                'Networking',
                'Analytics',
                'Mobile',
                'Security',
                'Hybrid',
                'Media',
                'Application development',
                'Deployment',
                'Management',
              ],
            },
            {
              type: 'paragraph',
              text: 'AWS operates across 120 Availability Zones in 38 geographic regions, with additional regions and zones announced around the world.',
            },
            {
              type: 'paragraph',
              text: 'Startups, enterprises, and public-sector organizations rely on AWS to power infrastructure, move faster, and lower costs.',
            },
          ],
          'zh-hk': [
            {
              type: 'paragraph',
              text: '自 2006 年以來，Amazon Web Services 已發展成為全球最全面、亦最廣泛被採用的雲端平台之一。',
            },
            {
              type: 'list',
              items: [
                '運算',
                '儲存',
                '資料庫',
                '網絡',
                '數據分析',
                '流動應用',
                '安全',
                '混合雲',
                '媒體',
                '應用程式開發',
                '部署',
                '管理',
              ],
            },
            {
              type: 'paragraph',
              text: 'AWS 目前於全球 38 個地理區域營運 120 個可用區（Availability Zones），並已公布將於更多地區增設區域及可用區。',
            },
            {
              type: 'paragraph',
              text: '初創企業、大型企業及公營機構都依靠 AWS 建構基礎設施、提升開發速度，並降低整體成本。',
            },
          ],
        },
      },
    ],
  },
  {
    name: {
      en: 'Platinum Sponsors',
      'zh-hk': '白金贊助',
    },
    sponsors: [
      {
        slug: 'lgt-private-banking',
        nameLines: ['LGT Private Banking'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/lgt.svg',
        logoAlt: 'LGT Private Banking Logo',
        url: 'https://www.lgt.com/hk-en',
        logoClass: 'w-52 sm:w-72',
        details: {
          en: [
            {
              type: 'paragraph',
              text: 'LGT is a leading international private banking and asset management group that has remained under the ownership of the Liechtenstein Princely Family for more than 90 years.',
            },
            {
              type: 'paragraph',
              text: 'As of 30 June 2025, LGT managed CHF 359.6 billion in assets for wealthy private individuals and institutional clients, supported by more than 6,000 employees across over 30 locations worldwide.',
            },
          ],
          'zh-hk': [
            {
              type: 'paragraph',
              text: 'LGT 是領先的國際私人銀行及資產管理集團，九十多年來一直由列支敦士登王室家族擁有。',
            },
            {
              type: 'paragraph',
              text: '截至 2025 年 6 月 30 日，LGT 為高淨值個人及機構客戶管理的資產總額達 3,596 億瑞士法郎，並由遍布全球 30 多個據點、超過 6,000 名員工提供支援。',
            },
          ],
        },
      },
      {
        slug: 'red-hat',
        nameLines: ['Red Hat'],
        badge: {
          en: 'Sponsor of 3 consecutive years',
          'zh-hk': '連續 3 年支持 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/redhat.svg',
        logoAlt: 'Red Hat Logo',
        url: 'https://www.redhat.com/en',
        logoClass: 'w-52 sm:w-72',
        details: {
          en: [
            {
              type: 'paragraph',
              text: 'Red Hat is an open hybrid cloud technology company helping organizations build a trusted foundation for modern IT and AI applications.',
            },
            {
              type: 'paragraph',
              text: 'Its portfolio spans cloud, developer, AI, Linux, automation, and application platform technologies that support applications from the datacenter to the edge.',
            },
            {
              type: 'paragraph',
              text: 'Red Hat works with partners and customers to connect, automate, secure, and manage their environments with consulting, training, and certification offerings.',
            },
          ],
          'zh-hk': [
            {
              type: 'paragraph',
              text: 'Red Hat 是一家開放式混合雲技術公司，協助各類機構為現代 IT 與 AI 應用建立可靠而值得信賴的基礎。',
            },
            {
              type: 'paragraph',
              text: '其產品組合涵蓋雲端、開發者工具、AI、Linux、自動化，以及應用平台等技術，支援應用程式從資料中心一路延伸至邊緣環境。',
            },
            {
              type: 'paragraph',
              text: 'Red Hat 亦與合作夥伴及客戶攜手，透過顧問、培訓及認證服務，協助他們連接、自動化、保護及管理整體環境。',
            },
          ],
        },
      },
    ],
  },
  {
    name: {
      en: 'Community Partner',
      'zh-hk': '社群夥伴',
    },
    sponsors: [
      {
        slug: 'cityu-college-of-computing',
        nameLines: ['City University of Hong Kong', 'College of Computing'],
        badge: {
          en: 'Supporter for 2 consecutive years',
          'zh-hk': '連續 2 年支持 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/cityu_coc.svg',
        logoAlt: 'CityU College of Computing Logo',
        url: 'https://www.cityu.edu.hk/cc/',
        logoClass: 'w-48 sm:w-64',
      },
    ],
  },
  {
    name: {
      en: 'Silver Sponsors',
      'zh-hk': '白銀贊助',
    },
    sponsors: [
      {
        slug: 'bloomberg',
        nameLines: ['Bloomberg'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/bloomberg.svg',
        logoAlt: 'Bloomberg Logo',
        url: 'https://www.bloomberg.com/asia',
        logoClass: 'w-44 sm:w-56',
      },
      {
        slug: 'boot-dev',
        nameLines: ['Boot.dev'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/boot.dev.webp',
        logoAlt: 'Boot.dev Logo',
        url: 'https://www.boot.dev/',
        logoClass: 'w-44 sm:w-56',
      },
      {
        slug: 'navicat',
        nameLines: ['Navicat'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/navicat.svg',
        logoAlt: 'Navicat Logo',
        url: 'https://www.navicat.com/cht',
        logoClass: 'w-44 sm:w-56',
      },
    ],
  },
  {
    name: {
      en: 'Bronze Sponsors',
      'zh-hk': '青銅贊助',
    },
    sponsors: [
      {
        slug: 'beta-labs',
        nameLines: ['Beta Labs'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/beta_labs.svg',
        logoAlt: 'Beta Labs Logo',
        url: 'https://www.linkedin.com/company/betalabs-hk',
        logoClass: 'w-40 sm:w-48',
      },
    ],
  },
  {
    name: {
      en: 'Sparkle Sponsors',
      'zh-hk': 'Sparkle 贊助',
    },
    sponsors: [
      {
        slug: 'pyladies-hong-kong',
        nameLines: ['PyLadies Hong Kong'],
        badge: {
          en: 'First-time sponsor of PyCon HK',
          'zh-hk': '首次贊助 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/pyladies_hk.svg',
        logoAlt: 'PyLadies Hong Kong Logo',
        url: 'https://linktr.ee/pyladieshk',
        logoClass: 'w-40 sm:w-48',
      },
    ],
  },
  {
    name: {
      en: 'Prize Sponsor',
      'zh-hk': '獎品贊助',
    },
    sponsors: [
      {
        slug: 'jetbrains',
        nameLines: ['JetBrains'],
        badge: {
          en: 'Sponsor of 3 consecutive years',
          'zh-hk': '連續 3 年支持 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/jetbrains.svg',
        logoAlt: 'JetBrains Logo',
        url: 'https://www.jetbrains.com/',
        logoClass: 'w-44 sm:w-56',
      },
    ],
  },
  {
    name: {
      en: 'Foundation Sponsor',
      'zh-hk': '基金會贊助',
    },
    sponsors: [
      {
        slug: 'python-software-foundation',
        nameLines: ['Python Software Foundation'],
        badge: {
          en: 'Sponsor for a total of 6 years',
          'zh-hk': '累計 6 年支持 PyCon HK',
        },
        imagePath: '/2025/sponsorships/white-bg/psf.webp',
        logoAlt: 'Python Software Foundation Logo',
        url: 'https://www.python.org/psf-landing/',
        logoClass: 'w-44 sm:w-56',
      },
    ],
  },
];
