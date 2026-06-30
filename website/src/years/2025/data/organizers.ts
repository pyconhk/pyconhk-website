import {
  type LocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';

export type Organizer = {
  titleLines: readonly string[];
  description: LocalizedValue<string>;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export function getOrganizerDescription(
  organizer: Organizer,
  locale: SiteLocale
): string {
  return resolveRequiredLocalizedValue(organizer.description, locale);
}

export const organizers: readonly Organizer[] = [
  {
    titleLines: ['Hong Kong Python User Group'],
    description: {
      en: 'The Hong Kong Python User Group is a vibrant community of Python enthusiasts dedicated to promoting the use of Python programming language in Hong Kong. Through regular meetups, workshops, and events, they foster a collaborative environment for learning and sharing knowledge about Python.',
      'zh-hk':
        '香港 Python 用戶組是一個充滿活力的社群，致力於在香港推廣 Python 程式語言。透過定期聚會、工作坊與各類活動，他們為學習、交流與分享 Python 知識建立了協作而開放的環境。',
    },
    href: 'https://www.facebook.com/groups/hkpug',
    imageSrc: '/2025/organizers-volunteers/organizers/hkpug.webp',
    imageAlt: 'Hong Kong Python User Group',
  },
  {
    titleLines: ['Open Source Hong Kong (OSHK)', '開源香港'],
    description: {
      en: 'Open Source Hong Kong (OSHK) is a long-running local community that promotes open source culture, collaboration, and practical technology sharing. Its work has helped create space for developers, educators, and organizers to build sustainable open communities in Hong Kong.',
      'zh-hk':
        '開源香港（OSHK）是一個歷史悠久的本地社群，致力推動開源文化、協作精神與務實的技術交流。多年來，他們持續為開發者、教育工作者及社群組織者建立空間，讓香港的開放技術社群得以持續成長。',
    },
    href: 'https://opensource.hk/',
    imageSrc: '/2025/organizers-volunteers/organizers/oshk.webp',
    imageAlt: 'Open Source Hong Kong',
  },
  {
    titleLines: [
      'Hong Kong Creative Open Technology Association (HKCOTA)',
      '香港創意開放科技協會',
    ],
    description: {
      en: 'Founded in 2014, the Hong Kong Creative Open Technology Association (HKCOTA) is a non-profit, tax-exempt charitable organization. HKCOTA is dedicated to educating and promoting open standards, free and open-source software, open hardware, open data, and creative commons. By working closely with students and professionals, HKCOTA strives to advance the open technology movement in Hong Kong.',
      'zh-hk':
        '香港創意開放科技協會（HKCOTA）成立於 2014 年，是一個非牟利並獲豁免稅務的慈善組織。HKCOTA 致力推廣開放標準、自由及開源軟件、開源硬件、開放數據及創用 CC，並透過與學生及業界人士緊密合作，推動香港的開放科技發展。',
    },
    href: 'https://hkcota.org/',
    imageSrc: '/2025/organizers-volunteers/organizers/hkcota.webp',
    imageAlt: 'Hong Kong Creative Open Technology Association',
  },
] as const;
