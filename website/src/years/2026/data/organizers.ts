import type { CfpLocale } from '@/years/2026/locales';

export type OrganizerItem = {
  titleLines: Record<CfpLocale, string[]>;
  description: Record<CfpLocale, string>;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const pageCopyByLocale: Record<CfpLocale, { title: string; intro: string }> = {
  en: {
    title: 'Organizations',
    intro:
      'PyCon Hong Kong 2026 is organized by a dedicated group of passionate organizations committed to growing the Python community in Hong Kong.',
  },
  'zh-hk': {
    title: '主辦單位',
    intro:
      'PyCon Hong Kong 2026 由多個充滿熱誠的組織共同策劃，攜手推動香港 Python 社群持續成長。',
  },
  'zh-hant': {
    title: '主辦單位',
    intro:
      'PyCon Hong Kong 2026 由多個充滿熱忱的組織共同策劃，攜手推動香港 Python 社群持續成長。',
  },
  'zh-hans': {
    title: '主办单位',
    intro:
      'PyCon Hong Kong 2026 由多个充满热忱的组织共同策划，携手推动香港 Python 社区持续成长。',
  },
  ja: {
    title: '主催団体',
    intro:
      'PyCon Hong Kong 2026 は、香港の Python コミュニティの成長を支える複数の情熱的な団体によって企画・運営されています。',
  },
  ko: {
    title: '주최 단체',
    intro:
      'PyCon Hong Kong 2026은 홍콩의 파이썬 커뮤니티 성장을 위해 헌신하는 열정적인 단체들이 함께 주최합니다.',
  },
};

export const organizers: readonly OrganizerItem[] = [
  {
    titleLines: {
      en: ['Hong Kong Python User Group'],
      'zh-hk': ['Hong Kong Python User Group', '香港 Python 用戶組'],
      'zh-hant': ['Hong Kong Python User Group', '香港 Python 用戶組'],
      'zh-hans': ['Hong Kong Python User Group', '香港 Python 用户组'],
      ja: ['Hong Kong Python User Group', '香港 Python ユーザーグループ'],
      ko: ['Hong Kong Python User Group', '홍콩 파이썬 사용자 모임'],
    },
    description: {
      en: 'The Hong Kong Python User Group is a vibrant community of Python enthusiasts dedicated to promoting the use of Python programming language in Hong Kong. Through regular meetups, workshops, and events, they foster a collaborative environment for learning and sharing knowledge about Python.',
      'zh-hk':
        '香港 Python 用戶組是一個充滿活力的社群，致力於在香港推廣 Python 程式語言。透過定期聚會、工作坊與各類活動，他們為學習、交流與分享 Python 知識建立了協作而開放的環境。',
      'zh-hant':
        '香港 Python 用戶組是一個充滿活力的社群，致力於在香港推廣 Python 程式語言。透過定期聚會、工作坊與各類活動，他們為學習、交流與分享 Python 知識建立了協作而開放的環境。',
      'zh-hans':
        '香港 Python 用户组是一个充满活力的社区，致力于在香港推广 Python 编程语言。通过定期聚会、工作坊与各类活动，他们为学习、交流与分享 Python 知识建立了协作而开放的环境。',
      ja: '香港 Python ユーザーグループは、香港における Python プログラミング言語の普及と発展に取り組む熱心なコミュニティです。定期的な勉強会やワークショップを通じて、知識の共有と協力の場を提供しています。',
      ko: '홍콩 파이썬 사용자 모임은 홍콩 내 파이썬 프로그래밍 언어의 보급과 발전을 위해 활동하는 열정적인 커뮤니티입니다. 정기 모임과 워크숍을 통해 지식 공유와 협력의 장을 만들어가고 있습니다.',
    },
    href: 'https://www.facebook.com/groups/hkpug',
    imageSrc: '/2026/organizers-volunteers/organizers/hkpug.webp',
    imageAlt: 'Hong Kong Python User Group',
  },
  {
    titleLines: {
      en: ['Open Source Hong Kong (OSHK)', '開源香港'],
      'zh-hk': ['Open Source Hong Kong (OSHK)', '開源香港'],
      'zh-hant': ['Open Source Hong Kong (OSHK)', '開源香港'],
      'zh-hans': ['Open Source Hong Kong (OSHK)', '开源香港'],
      ja: ['Open Source Hong Kong (OSHK)', 'オープンソース香港'],
      ko: ['Open Source Hong Kong (OSHK)', '오픈소스 홍콩'],
    },
    description: {
      en: 'Open Source Hong Kong (OSHK) is a long-running local community that promotes open source culture, collaboration, and practical technology sharing. Its work has helped create space for developers, educators, and organizers to build sustainable open communities in Hong Kong.',
      'zh-hk':
        '開源香港（OSHK）是一個歷史悠久的本地社群，致力推動開源文化、協作精神與務實的技術交流。多年來，他們持續為開發者、教育工作者及社群組織者建立空間，讓香港的開放技術社群得以持續成長。',
      'zh-hant':
        '開源香港（OSHK）是一個歷史悠久的本地社群，致力推動開源文化、協作精神與務實的技術交流。多年來，他們持續為開發者、教育工作者及社群組織者建立空間，讓香港的開放技術社群得以持續成長。',
      'zh-hans':
        '开源香港（OSHK）是一个历史悠久的本地社区，致力推动开源文化、协作精神与务实的技术交流。多年来，他们持续为开发者、教育工作者及社区组织者建立空间，让香港的开放技术社区得以持续成长。',
      ja: 'オープンソース香港（OSHK）は、オープンソース文化の普及と実践的な技術共有を推進する歴史ある地域コミュニティです。開発者や教育者が持続可能なオープンコミュニティを築くための場を提供しています。',
      ko: '오픈소스 홍콩(OSHK)은 오픈소스 문화 확산과 실용적인 기술 공유를 장려하는 전통 있는 커뮤니티입니다. 개발자와 교육자가 지속 가능한 오픈 커뮤니티를 구축할 수 있도록 지원하고 있습니다.',
    },
    href: 'https://opensource.hk/',
    imageSrc: '/2026/organizers-volunteers/organizers/oshk.webp',
    imageAlt: 'Open Source Hong Kong',
  },
  {
    titleLines: {
      en: [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '香港創意開放科技協會',
      ],
      'zh-hk': [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '香港創意開放科技協會',
      ],
      'zh-hant': [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '香港創意開放科技協會',
      ],
      'zh-hans': [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '香港创意开放科技协会',
      ],
      ja: [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '香港クリエイティブ・オープン・テクノロジー協会',
      ],
      ko: [
        'Hong Kong Creative Open Technology Association (HKCOTA)',
        '홍콩 크리에이티브 오픈 테크놀로지 협회',
      ],
    },
    description: {
      en: 'Founded in 2014, the Hong Kong Creative Open Technology Association (HKCOTA) is a non-profit, tax-exempt charitable organization. HKCOTA is dedicated to educating and promoting open standards, free and open-source software, open hardware, open data, and creative commons. By working closely with students and professionals, HKCOTA strives to advance the open technology movement in Hong Kong.',
      'zh-hk':
        '香港創意開放科技協會（HKCOTA）成立於 2014 年，是一個非牟利並獲豁免稅務的慈善組織。HKCOTA 致力推廣開放標準、自由及開源軟件、開源硬件、開放數據及創用 CC，並透過與學生及業界人士緊密合作，推動香港的開放科技發展。',
      'zh-hant':
        '香港創意開放科技協會（HKCOTA）成立於 2014 年，是一個非牟利並獲豁免稅務的慈善組織。HKCOTA 致力推廣開放標準、自由及開源軟件、開源硬件、開放數據及創用 CC，並透過與學生及業界人士緊密合作，推動香港的開放科技發展。',
      'zh-hans':
        '香港创意开放科技协会（HKCOTA）成立于 2014 年，是一个非牟利并获豁免税务的慈善组织。HKCOTA 致力推广开放标准、自由及开源软件、开源硬件、开放数据及创用 CC，并透过与学生及业界人士紧密合作，推动香港的开放科技发展。',
      ja: '2014年に設立された香港クリエイティブ・オープン・テクノロジー協会（HKCOTA）は、非営利の免税慈善団体です。オープンスタンダード、OSS、オープンハードウェア、オープンデータの教育と普及に努め、香港のオープンテクノロジーの発展を牽引しています。',
      ko: '2014년에 설립된 HKCOTA는 비영리 면세 자선 단체로, 오픈 표준, 오픈소스 소프트웨어, 오픈 하드웨어 및 오픈 데이터의 교육과 보급에 힘쓰며 홍콩의 기술 생태계 발전을 이끌고 있습니다.',
    },
    href: 'https://hkcota.org/',
    imageSrc: '/2026/organizers-volunteers/organizers/hkcota.webp',
    imageAlt: 'Hong Kong Creative Open Technology Association',
  },
] as const;
