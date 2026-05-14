import type { Metadata } from 'next';

export const supportedLocales = [
  'en',
  'zh-hk',
  'zh-hant',
  'zh-hans',
  'ko',
  'ja',
] as const;

export type Locale = (typeof supportedLocales)[number];

export function resolveLocale(locale?: string): Locale {
  return supportedLocales.includes(locale as Locale)
    ? (locale as Locale)
    : 'en';
}

export const submitProposalUrl = 'https://cfp.pycon.hk/pyconhk2026/cfp';
export const editProposalUrl =
  'https://cfp.pycon.hk/pyconhk2026/me/submissions/';
export const sponsorshipUrl =
  process.env.NEXT_PUBLIC_CALL_FOR_SPONSORSHIPS_URL ??
  'mailto:pycon@pycon.hk?subject=PyCon%20Hong%20Kong%202026%20Sponsorship';

type LocaleMeta = {
  label: string;
  shortLabel: string;
  htmlLang: string;
};

type DateItem = {
  label: string;
  value: string;
  status?: string;
  note: string;
};

type ProposalType = {
  index: string;
  title: string;
  description: string;
  tone: 'yellow' | 'white' | 'lilac' | 'sky';
};

type GuidanceItem = {
  mark: string;
  text: string;
};

export type PageCopy = {
  metadata: Metadata;
  localeMeta: LocaleMeta;
  nav: {
    brand: string;
    tagline: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    body: string;
  };
  cta: {
    submit: string;
    edit: string;
    sponsorship: string;
  };
  programWall: {
    title: string;
    caption: string;
  };
  keyDates: {
    title: string;
    timezone: string;
    items: DateItem[];
  };
  proposals: {
    title: string;
    intro: string;
    types: ProposalType[];
  };
  guidance: {
    kicker: string;
    title: string;
    body: string;
    items: GuidanceItem[];
  };
  finalCta: {
    fragments: string;
    title: string;
    body: string;
  };
  decorativeFragments: string[];
};

export const localeMetadata: Record<Locale, LocaleMeta> = {
  en: { label: 'English', shortLabel: 'EN', htmlLang: 'en' },
  'zh-hk': { label: '香港粵語', shortLabel: '粵', htmlLang: 'zh-HK' },
  'zh-hant': { label: '繁體中文', shortLabel: '繁', htmlLang: 'zh-Hant' },
  'zh-hans': { label: '简体中文', shortLabel: '简', htmlLang: 'zh-Hans' },
  ko: { label: '한국어', shortLabel: 'KR', htmlLang: 'ko' },
  ja: { label: '日本語', shortLabel: 'JA', htmlLang: 'ja' },
};

export const contentByLocale: Record<Locale, PageCopy> = {
  en: {
    metadata: {
      title: 'PyCon HK 2026 CFP | Many Voices, One Python Story',
      description:
        'Submit a proposal for PyCon Hong Kong 2026. The call for proposals closes on June 20, 2026 at 23:59 Asia/Hong_Kong.',
    },
    localeMeta: localeMetadata.en,
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: 'Many Voices, One Python Story',
    },
    hero: {
      badge: 'Speaker-friendly CFP',
      headline: 'Many Voices,\nOne Python Story',
      subheadline: 'PyCon Hong Kong 2026 Call for Proposals',
      body: 'Bring the idea you keep explaining in hallways. A lesson, a tool, a story, a demo, a question worth sharing.',
    },
    cta: {
      submit: 'Submit a proposal',
      edit: 'Edit or view proposals',
      sponsorship: 'Sponsor Us',
    },
    programWall: {
      title: 'Program notes, pinned for review',
      caption:
        'A good proposal is clear about the audience, the takeaway, and the shape of the session.',
    },
    keyDates: {
      title: 'Key dates, circled twice',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: 'CFP deadline',
          value: 'June 20, 2026',
          note: 'last-call energy',
        },
        {
          label: 'Conference',
          value: 'November 14,\n2026',
          status: '(Tentative)',
          note: 'conference day',
        },
        {
          label: 'Sprint',
          value: 'November 15,\n2026',
          status: '(Tentative)',
          note: 'build something together',
        },
      ],
    },
    proposals: {
      title: 'Open program slots',
      intro: 'Choose the shape that makes your idea easiest to hear.',
      types: [
        {
          index: '01',
          title: 'Lightning Talk',
          description: 'A sharp idea, demo, or lesson in a tiny burst.',
          tone: 'yellow',
        },
        {
          index: '02',
          title: 'Short Talk',
          description: 'A focused walkthrough with one clear point.',
          tone: 'white',
        },
        {
          index: '03',
          title: 'Talk',
          description:
            'Deeper stories, systems, projects, and practical lessons.',
          tone: 'lilac',
        },
        {
          index: '04',
          title: 'Posters',
          description: 'Research, tooling, diagrams, and work-in-progress.',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: 'Bring people together around an open-source task.',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: 'submission guidance',
      title: 'Speak from where you are.',
      body: 'First-time speakers, local stories, multilingual sessions, practical lessons, and honest experiments are all welcome.',
      items: [
        {
          mark: '+',
          text: 'Explain who your talk is for and what they can use afterwards.',
        },
        {
          mark: '?',
          text: 'Draft in the language that makes the idea strongest.',
        },
        {
          mark: '!',
          text: 'Name the problem, the audience, and the shape of the session.',
        },
      ],
    },
    finalCta: {
      fragments: 'many voices / one Python story',
      title: 'Your Python story belongs in the program.',
      body: 'Submit before June 20, 2026 at 23:59 HKT and help shape PyCon Hong Kong 2026.',
    },
    decorativeFragments: [
      'First-time speakers welcome',
      'Local lessons and stories',
      'Tools, systems, and demos',
      'Questions worth discussing',
    ],
  },
  'zh-hk': {
    metadata: {
      title: 'PyCon HK 2026 CFP | 多元聲音，同一個 Python 故事',
      description:
        'PyCon Hong Kong 2026 正徵集提案。提案截止時間為 2026 年 6 月 20 日 23:59 香港時間。',
    },
    localeMeta: localeMetadata['zh-hk'],
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: '多元聲音，同一個 Python 故事',
    },
    hero: {
      badge: '以講者為本',
      headline: '多元聲音，\n同一個 Python 故事',
      subheadline: 'PyCon Hong Kong 2026 徵集提案',
      body: '分享你嘅想法、專案、經驗同社群故事，讓更多人聽見你嘅 Python 觀點。',
    },
    cta: {
      submit: '提交提案',
      edit: '編輯或查看提案',
      sponsorship: '贊助合作',
    },
    programWall: {
      title: '節目筆記板',
      caption: '好嘅提案會清楚講明受眾、聽眾可以帶走咩，以及議程會點樣進行。',
    },
    keyDates: {
      title: '重要日期',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: '提案截止',
          value: '2026年6月20日',
          note: '最後提醒',
        },
        {
          label: '會議日期',
          value: '2026年11月14日',
          status: '（暫定）',
          note: '會議日',
        },
        {
          label: 'Sprint',
          value: '2026年11月15日',
          status: '（暫定）',
          note: '一齊動手實作',
        },
      ],
    },
    proposals: {
      title: '開放徵集形式',
      intro: '選擇最能清楚傳達想法嘅形式。',
      types: [
        {
          index: '01',
          title: '閃電演講',
          description: '用短時間分享一個清楚嘅想法、展示或經驗。',
          tone: 'yellow',
        },
        {
          index: '02',
          title: '短講',
          description: '聚焦說明一個重點，令聽眾容易帶走。',
          tone: 'white',
        },
        {
          index: '03',
          title: '演講',
          description: '深入分享故事、系統、專案同實務經驗。',
          tone: 'lilac',
        },
        {
          index: '04',
          title: '海報展示',
          description: '展示研究、工具、圖解或進行中嘅作品。',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: '邀請大家一齊投入一個開源任務。',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: '提交建議',
      title: '由你所在嘅位置開始講起。',
      body: '我哋歡迎第一次上台嘅講者、本地故事、多語言議程、實用經驗，以及誠實嘅實驗。',
      items: [
        {
          mark: '+',
          text: '講明你嘅分享適合邊個，以及聽眾可以帶走咩。',
        },
        {
          mark: '?',
          text: '用最能展現想法嘅語言撰寫草稿。',
        },
        {
          mark: '!',
          text: '清楚講明問題、受眾，以及議程形式。',
        },
      ],
    },
    finalCta: {
      fragments: '多元聲音 / 同一個 Python 故事',
      title: '你嘅 Python 故事值得出現喺節目入面。',
      body: '請於 2026 年 6 月 20 日 23:59 HKT 前提交，一齊塑造 PyCon Hong Kong 2026。',
    },
    decorativeFragments: [
      '歡迎第一次投稿',
      '本地經驗同社群故事',
      '工具、系統同展示',
      '值得一齊討論嘅問題',
    ],
  },
  'zh-hant': {
    metadata: {
      title: 'PyCon HK 2026 CFP | 多元聲音，同一個 Python 故事',
      description:
        'PyCon Hong Kong 2026 正在徵求提案。提案截止時間為 2026 年 6 月 20 日 23:59 香港時間。',
    },
    localeMeta: localeMetadata['zh-hant'],
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: '多元聲音，同一個 Python 故事',
    },
    hero: {
      badge: '以講者為本',
      headline: '多元聲音，\n同一個 Python 故事',
      subheadline: 'PyCon Hong Kong 2026 徵求提案',
      body: '分享你的想法、專案、經驗與社群故事，讓更多人聽見你的 Python 觀點。',
    },
    cta: {
      submit: '提交提案',
      edit: '編輯或查看提案',
      sponsorship: '贊助合作',
    },
    programWall: {
      title: '節目筆記板',
      caption: '好的提案會清楚說明受眾、聽眾能帶走什麼，以及議程會如何進行。',
    },
    keyDates: {
      title: '重要日期',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: '提案截止',
          value: '2026年6月20日',
          note: '最後提醒',
        },
        {
          label: '會議日期',
          value: '2026年11月14日',
          status: '（暫定）',
          note: '會議日',
        },
        {
          label: 'Sprint',
          value: '2026年11月15日',
          status: '（暫定）',
          note: '一起動手實作',
        },
      ],
    },
    proposals: {
      title: '開放徵求形式',
      intro: '選擇最能清楚傳達想法的形式。',
      types: [
        {
          index: '01',
          title: '閃電演講',
          description: '用短時間分享一個清楚的想法、展示或經驗。',
          tone: 'yellow',
        },
        {
          index: '02',
          title: '短講',
          description: '聚焦說明一個重點，讓聽眾容易帶走。',
          tone: 'white',
        },
        {
          index: '03',
          title: '演講',
          description: '深入分享故事、系統、專案與實務經驗。',
          tone: 'lilac',
        },
        {
          index: '04',
          title: '海報展示',
          description: '展示研究、工具、圖解或進行中的作品。',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: '邀請大家一起投入一個開源任務。',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: '提交建議',
      title: '從你所在的位置開始說起。',
      body: '我們歡迎第一次上台的講者、本地故事、多語言議程、實用經驗，以及誠實的實驗。',
      items: [
        {
          mark: '+',
          text: '說明你的分享適合誰，以及聽眾能帶走什麼。',
        },
        {
          mark: '?',
          text: '用最能展現想法的語言撰寫草稿。',
        },
        {
          mark: '!',
          text: '清楚說明問題、受眾，以及議程形式。',
        },
      ],
    },
    finalCta: {
      fragments: '多元聲音 / 同一個 Python 故事',
      title: '你的 Python 故事值得出現在節目中。',
      body: '請於 2026 年 6 月 20 日 23:59 HKT 前提交，一起塑造 PyCon Hong Kong 2026。',
    },
    decorativeFragments: [
      '歡迎第一次投稿',
      '本地經驗與社群故事',
      '工具、系統與展示',
      '值得一起討論的問題',
    ],
  },
  'zh-hans': {
    metadata: {
      title: 'PyCon HK 2026 CFP | 多元声音，同一个 Python 故事',
      description:
        'PyCon Hong Kong 2026 正在征集提案。提案截止时间为 2026 年 6 月 20 日 23:59 香港时间。',
    },
    localeMeta: localeMetadata['zh-hans'],
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: '多元声音，同一个 Python 故事',
    },
    hero: {
      badge: '以讲者为本',
      headline: '多元声音，\n同一个 Python 故事',
      subheadline: 'PyCon Hong Kong 2026 征集提案',
      body: '分享你的想法、项目、经验和社区故事，让更多人听见你的 Python 视角。',
    },
    cta: {
      submit: '提交提案',
      edit: '编辑或查看提案',
      sponsorship: '赞助合作',
    },
    programWall: {
      title: '节目笔记板',
      caption: '好的提案会清楚说明受众、听众能带走什么，以及议程会如何进行。',
    },
    keyDates: {
      title: '重要日期',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: '提案截止',
          value: '2026年6月20日',
          note: '最后提醒',
        },
        {
          label: '会议日期',
          value: '2026年11月14日',
          status: '（暂定）',
          note: '会议日',
        },
        {
          label: 'Sprint',
          value: '2026年11月15日',
          status: '（暂定）',
          note: '一起动手实践',
        },
      ],
    },
    proposals: {
      title: '开放征集形式',
      intro: '选择最能清楚传达想法的形式。',
      types: [
        {
          index: '01',
          title: '闪电演讲',
          description: '用短时间分享一个清楚的想法、展示或经验。',
          tone: 'yellow',
        },
        {
          index: '02',
          title: '短讲',
          description: '聚焦说明一个重点，让听众容易带走。',
          tone: 'white',
        },
        {
          index: '03',
          title: '演讲',
          description: '深入分享故事、系统、项目与实践经验。',
          tone: 'lilac',
        },
        {
          index: '04',
          title: '海报展示',
          description: '展示研究、工具、图解或进行中的作品。',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: '邀请大家一起投入一个开源任务。',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: '提交建议',
      title: '从你所在的位置开始讲起。',
      body: '我们欢迎第一次上台的讲者、本地故事、多语言议程、实用经验，以及诚实的实验。',
      items: [
        {
          mark: '+',
          text: '说明你的分享适合谁，以及听众能带走什么。',
        },
        {
          mark: '?',
          text: '用最能展现想法的语言撰写草稿。',
        },
        {
          mark: '!',
          text: '清楚说明问题、受众，以及议程形式。',
        },
      ],
    },
    finalCta: {
      fragments: '多元声音 / 同一个 Python 故事',
      title: '你的 Python 故事值得出现在节目中。',
      body: '请于 2026 年 6 月 20 日 23:59 HKT 前提交，一起塑造 PyCon Hong Kong 2026。',
    },
    decorativeFragments: [
      '欢迎第一次投稿',
      '本地经验与社区故事',
      '工具、系统与演示',
      '值得一起讨论的问题',
    ],
  },
  ko: {
    metadata: {
      title: 'PyCon HK 2026 CFP | 여러 목소리, 하나의 Python 이야기',
      description:
        'PyCon Hong Kong 2026 발표 제안을 모집합니다. 제안 마감은 2026년 6월 20일 23:59 홍콩 시간입니다.',
    },
    localeMeta: localeMetadata.ko,
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: '여러 목소리, 하나의 Python 이야기',
    },
    hero: {
      badge: '발표자를 위한 CFP',
      headline: '여러 목소리, 하나의\nPython 이야기',
      subheadline: 'PyCon Hong Kong 2026 발표 제안 모집',
      body: '아이디어, 프로젝트, 배운 점, 커뮤니티 이야기를 홍콩 Python 커뮤니티와 나눠 주세요.',
    },
    cta: {
      submit: '제안 제출하기',
      edit: '제안 수정 또는 보기',
      sponsorship: '스폰서십',
    },
    programWall: {
      title: '프로그램 메모 보드',
      caption:
        '좋은 제안서는 대상, 취득 가능한 사항, 세션 진행 방식을 분명히 보여 줍니다.',
    },
    keyDates: {
      title: '중요 일정',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: '제안 마감',
          value: '2026년 6월 20일',
          note: '마지막 알림',
        },
        {
          label: '컨퍼런스',
          value: '2026년 11월 14일',
          status: '(예정)',
          note: '컨퍼런스 데이',
        },
        {
          label: 'Sprint',
          value: '2026년 11월 15일',
          status: '(예정)',
          note: '함께 만들어 봅시다',
        },
      ],
    },
    proposals: {
      title: '열려 있는 프로그램 형식',
      intro: '아이디어가 가장 잘 들리는 형식을 선택해 주세요.',
      types: [
        {
          index: '01',
          title: '라이트닝 토크',
          description: '짧은 시간에 전하는 명확한 아이디어, 데모, 경험.',
          tone: 'yellow',
        },
        {
          index: '02',
          title: '짧은 발표',
          description: '하나의 핵심을 중심으로 한 집중적인 설명.',
          tone: 'white',
        },
        {
          index: '03',
          title: '발표',
          description: '프로젝트, 시스템, 실무 경험과 커뮤니티 이야기.',
          tone: 'lilac',
        },
        {
          index: '04',
          title: '포스터',
          description: '연구, 도구, 다이어그램, 진행 중인 작업을 보여 주세요.',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: '오픈소스 과제를 중심으로 사람들을 모아 주세요.',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: '제안 작성 안내',
      title: '지금 서 있는 자리에서 이야기해 주세요.',
      body: '첫 발표자, 지역 이야기, 다국어 세션, 실용적인 경험, 솔직한 실험을 모두 환영합니다.',
      items: [
        {
          mark: '+',
          text: '누구를 위한 발표인지, 무엇을 가져갈 수 있는지 설명해 주세요.',
        },
        {
          mark: '?',
          text: '아이디어가 가장 강하게 전달되는 언어로 작성해 주세요.',
        },
        {
          mark: '!',
          text: '문제, 청중, 세션 형식을 구체적으로 적어 주세요.',
        },
      ],
    },
    finalCta: {
      fragments: '여러 목소리 / 하나의 Python 이야기',
      title: '당신의 Python 이야기가 프로그램에 필요합니다.',
      body: '2026년 6월 20일 23:59 HKT 전에 제출하고 PyCon Hong Kong 2026을 함께 만들어 주세요.',
    },
    decorativeFragments: [
      '첫 발표자도 환영합니다',
      '지역 경험과 커뮤니티 이야기',
      '도구, 시스템, 데모',
      '함께 나눌 만한 질문',
    ],
  },
  ja: {
    metadata: {
      title: 'PyCon HK 2026 CFP | 多くの声、ひとつの Python ストーリー',
      description:
        'PyCon Hong Kong 2026 のプロポーザルを募集しています。締切は 2026 年 6 月 20 日 23:59 香港時間です。',
    },
    localeMeta: localeMetadata.ja,
    nav: {
      brand: 'PyCon HK 2026 CFP',
      tagline: '多くの声、ひとつの Python ストーリー',
    },
    hero: {
      badge: '登壇者歓迎',
      headline: '多くの声、ひとつの\nPython ストーリー',
      subheadline: 'PyCon Hong Kong 2026 プロポーザル募集',
      body: 'アイデア、プロジェクト、学び、コミュニティの物語を香港の Python コミュニティと共有してください。',
    },
    cta: {
      submit: 'プロポーザルを提出',
      edit: '編集または確認',
      sponsorship: 'スポンサー募集',
    },
    programWall: {
      title: 'プログラムメモボード',
      caption:
        'よいプロポーザルは、対象者、持ち帰れること、セッションの進め方がはっきりしています。',
    },
    keyDates: {
      title: '重要な日程',
      timezone: 'Asia/Hong_Kong',
      items: [
        {
          label: 'CFP 締切',
          value: '2026年6月20日',
          note: '最後のお知らせ',
        },
        {
          label: 'カンファレンス',
          value: '2026年11月14日',
          status: '（予定）',
          note: 'カンファレンスの日',
        },
        {
          label: 'Sprint',
          value: '2026年11月15日',
          status: '（予定）',
          note: '一緒に手を動かす日',
        },
      ],
    },
    proposals: {
      title: '募集する形式',
      intro: 'アイデアがもっとも伝わりやすい形を選んでください。',
      types: [
        {
          index: '01',
          title: 'ライトニングトーク',
          description: '短い時間で伝えるアイデア、デモ、学び。',
          tone: 'yellow',
        },
        {
          index: '02',
          title: 'ショートトーク',
          description: 'ひとつの要点に集中した発表。',
          tone: 'white',
        },
        {
          index: '03',
          title: 'トーク',
          description: 'プロジェクト、システム、実践経験、コミュニティの物語。',
          tone: 'lilac',
        },
        {
          index: '04',
          title: 'ポスター',
          description:
            '研究、ツール、図解、進行中の取り組みを紹介してください。',
          tone: 'sky',
        },
        {
          index: '05',
          title: 'Sprint',
          description: 'オープンソースの課題を中心に人を集めてください。',
          tone: 'white',
        },
      ],
    },
    guidance: {
      kicker: '提出のヒント',
      title: 'あなたの場所から話してください。',
      body: '初めての登壇者、ローカルな話、多言語セッション、実践的な学び、正直な実験を歓迎します。',
      items: [
        {
          mark: '+',
          text: '誰のための発表か、参加者が何を持ち帰れるかを書いてください。',
        },
        {
          mark: '?',
          text: 'アイデアがもっとも強く伝わる言語で書いてください。',
        },
        {
          mark: '!',
          text: '問題、対象者、セッション形式を具体的に書いてください。',
        },
      ],
    },
    finalCta: {
      fragments: '多くの声 / ひとつの Python ストーリー',
      title: 'あなたの Python ストーリーをプログラムへ。',
      body: '2026 年 6 月 20 日 23:59 HKT までに提出し、PyCon Hong Kong 2026 を一緒につくりましょう。',
    },
    decorativeFragments: [
      '初めての登壇も歓迎',
      'ローカルな経験とコミュニティの話',
      'ツール、システム、デモ',
      '一緒に考えたい問い',
    ],
  },
};
