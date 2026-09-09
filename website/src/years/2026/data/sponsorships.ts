import type { CfpLocale } from '@/years/2026/locales';

export type SponsorshipPageCopy = {
  title: string;
  subtitle: string;
  introParagraphs: readonly string[];
  whySponsorTitle: string;
  plansTitle: string;
  plansDescription: string;
  popularLabel: string;
  sponsorshipFeeLabel: string;
  visibilityHeading: string;
  logoHeading: string;
  promotionHeading: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
};

export type SponsorshipBenefit = {
  title: Record<CfpLocale, string>;
  description: Record<CfpLocale, string>;
  icon: 'eye' | 'users' | 'heart';
};

export type SponsorshipPlan = {
  name: Record<CfpLocale, string>;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  fee: string;
  maxSlots: 1 | 2 | 4 | 'unlimited';
  isPopular?: boolean;
  headerBg: string;
  headerText: string;
  features: {
    sponsoredTalks?: Record<CfpLocale, string>;
    boothTables?: Record<CfpLocale, string>;
    logoSpeakerPodium?: boolean;
    logoConferenceRollup?: Record<CfpLocale, string>;
    logoYouTubeFrame?: Record<CfpLocale, string>;
    logoWebsite?: Record<CfpLocale, string>;
    rollupBySponsor?: boolean;
    adDuringBreak?: Record<CfpLocale, string> | boolean;
    preEventEmails?: boolean;
    pressReleases?: boolean;
    socialNetworks?: boolean;
    openingClosing?: boolean;
  };
};

export const pageCopyByLocale: Record<CfpLocale, SponsorshipPageCopy> = {
  en: {
    title: 'Sponsorship Opportunities',
    subtitle: 'Partner with PyCon HK 2026',
    introParagraphs: [
      "PyCon HK 2026 presents an exceptional opportunity to connect with Hong Kong's most passionate Python developers, innovative tech leaders, and forward-thinking organizations.",
      "As a sponsor, you'll be at the heart of Asia's premier Python conference, where cutting-edge ideas meet practical solutions. Join hundreds of enthusiastic developers, seasoned engineers, data scientists, and tech entrepreneurs who are shaping the future of technology in the region.",
      "Your sponsorship doesn't just showcase your brand - it demonstrates your commitment to fostering innovation, supporting the open-source community, and driving technological advancement in Hong Kong and beyond.",
    ],
    whySponsorTitle: 'Why Sponsor?',
    plansTitle: 'Sponsorship Plans',
    plansDescription:
      'Choose the perfect sponsorship package to support PyCon HK 2026 and showcase your brand to the Python community.',
    popularLabel: 'POPULAR',
    sponsorshipFeeLabel: 'Sponsorship Fee',
    visibilityHeading: 'Brand Visibility',
    logoHeading: 'Logo',
    promotionHeading: 'Social Media & Press',
    ctaTitle: 'Ready to Sponsor?',
    ctaDescription:
      'Contact us to discuss your sponsorship package and customization options.',
    ctaButtonLabel: 'Contact Us',
  },
  'zh-hk': {
    title: '贊助機會',
    subtitle: '成為 PyCon HK 2026 贊助夥伴',
    introParagraphs: [
      'PyCon HK 2026 是一個難得的機會，讓你接觸香港最投入的 Python 開發者、科技團隊與創新機構。',
      '作為贊助夥伴，你將置身亞洲其中一個具代表性的 Python 大會，與數百位開發者、資深工程師、資料科學家及科技創業者交流，見證新想法如何變成實際方案。',
      '你的贊助不只是品牌曝光，更代表你願意支持創新、開源社群，以及香港與區內的科技發展。',
    ],
    whySponsorTitle: '為什麼值得贊助？',
    plansTitle: '贊助方案',
    plansDescription:
      '選擇最適合你團隊的贊助方案，支持 PyCon HK 2026，並與 Python 社群建立連結。',
    popularLabel: '熱門',
    sponsorshipFeeLabel: '贊助費用',
    visibilityHeading: '品牌曝光',
    logoHeading: '標誌曝光',
    promotionHeading: '社交媒體與宣傳',
    ctaTitle: '準備成為贊助夥伴？',
    ctaDescription: '歡迎聯絡我們，討論最適合的贊助方案與可自訂的合作方式。',
    ctaButtonLabel: '聯絡我們',
  },
  'zh-hant': {
    title: '贊助機會',
    subtitle: '成為 PyCon HK 2026 贊助夥伴',
    introParagraphs: [
      'PyCon HK 2026 是一個難得的機會，讓你接觸香港最投入的 Python 開發者、科技團隊與創新機構。',
      '作為贊助夥伴，你將置身亞洲其中一個具代表性的 Python 大會，與數百位開發者、資深工程師、資料科學家及科技創業者交流，見證新想法如何變成實際方案。',
      '你的贊助不只是品牌曝光，更代表你願意支持創新、開源社群，以及香港與區內的科技發展。',
    ],
    whySponsorTitle: '為什麼值得贊助？',
    plansTitle: '贊助方案',
    plansDescription:
      '選擇最適合你團隊的贊助方案，支持 PyCon HK 2026，並與 Python 社群建立連結。',
    popularLabel: '熱門',
    sponsorshipFeeLabel: '贊助費用',
    visibilityHeading: '品牌曝光',
    logoHeading: '標誌曝光',
    promotionHeading: '社群媒體與宣傳',
    ctaTitle: '準備成為贊助夥伴？',
    ctaDescription: '歡迎聯絡我們，討論最適合的贊助方案與可自訂的合作方式。',
    ctaButtonLabel: '聯絡我們',
  },
  'zh-hans': {
    title: '赞助机会',
    subtitle: '成为 PyCon HK 2026 赞助伙伴',
    introParagraphs: [
      'PyCon HK 2026 是一个难得的机会，让你接触香港最投入的 Python 开发者、科技团队与创新机构。',
      '作为赞助伙伴，你将置身亚洲其中一个具代表性的 Python 大会，与数百位开发者、资深工程师、数据科学家及科技创业者交流，见证新想法如何变成实际方案。',
      '你的赞助不只是品牌曝光，更代表你愿意支持创新、开源社群，以及香港与区内的科技发展。',
    ],
    whySponsorTitle: '为什么值得赞助？',
    plansTitle: '赞助方案',
    plansDescription:
      '选择最适合你团队的赞助方案，支持 PyCon HK 2026，并与 Python 社群建立联系。',
    popularLabel: '热门',
    sponsorshipFeeLabel: '赞助费用',
    visibilityHeading: '品牌曝光',
    logoHeading: '标志曝光',
    promotionHeading: '社交媒体与宣传',
    ctaTitle: '准备成为赞助伙伴？',
    ctaDescription: '欢迎联系我们，讨论最适合的赞助方案与可自定义的合作方式。',
    ctaButtonLabel: '联系我们',
  },
  ja: {
    title: 'スポンサー募集',
    subtitle: 'PyCon HK 2026 協賛のご案内',
    introParagraphs: [
      'PyCon HK 2026 は、香港で最も熱量の高い Python 開発者、技術チーム、革新的な組織とつながる絶好の機会です。',
      'スポンサーとして参加することで、アジアを代表する Python カンファレンスの中心に立ち、数百名の開発者、経験豊富なエンジニア、データサイエンティスト、テック起業家と出会えます。',
      'スポンサーシップは単なるブランド露出ではありません。イノベーションを後押しし、オープンソースコミュニティを支え、香港と地域全体の技術発展に貢献する意思を示すものです。',
    ],
    whySponsorTitle: 'スポンサーになる理由',
    plansTitle: 'スポンサープラン',
    plansDescription:
      'PyCon HK 2026 を支え、Python コミュニティにブランドを届けるための最適なプランをお選びください。',
    popularLabel: 'おすすめ',
    sponsorshipFeeLabel: 'スポンサー費用',
    visibilityHeading: 'ブランド露出',
    logoHeading: 'ロゴ掲載',
    promotionHeading: 'SNS・広報',
    ctaTitle: 'スポンサーをご検討中ですか？',
    ctaDescription:
      'スポンサー内容やカスタマイズ可能な連携方法について、お気軽にご相談ください。',
    ctaButtonLabel: 'お問い合わせ',
  },
  ko: {
    title: '후원 안내',
    subtitle: 'PyCon HK 2026 파트너십',
    introParagraphs: [
      'PyCon HK 2026은 홍콩의 열정적인 파이썬 개발자, 혁신 기술 리더 및 기업들과 소통할 수 있는 특별한 기회입니다.',
      '아시아 최고의 파이썬 컨퍼런스 후원사가 되어 수백 명의 개발자, 엔지니어, 데이터 과학자 및 기술 기업가들과 교류하세요.',
      '스폰서십은 단순한 홍보를 넘어 오픈소스 생태계 발전과 혁신을 지원하는 의미 있는 참여입니다.',
    ],
    whySponsorTitle: '왜 후원해야 할까요?',
    plansTitle: '후원 패키지',
    plansDescription:
      'PyCon HK 2026을 후원하고 파이썬 커뮤니티에 브랜드를 알릴 수 있는 최적의 패키지를 선택하세요.',
    popularLabel: '인기',
    sponsorshipFeeLabel: '후원 금액',
    visibilityHeading: '브랜드 홍보',
    logoHeading: '로고 노출',
    promotionHeading: '소셜 미디어 및 홍보',
    ctaTitle: '후원사가 될 준비가 되셨나요?',
    ctaDescription: '맞춤형 스폰서십 패키지 상담을 원하시면 언제든 문의해 주세요.',
    ctaButtonLabel: '문의하기',
  },
};

export const sponsorBenefits: SponsorshipBenefit[] = [
  {
    title: {
      en: 'Brand Visibility',
      'zh-hk': '品牌曝光',
      'zh-hant': '品牌曝光',
      'zh-hans': '品牌曝光',
      ja: 'ブランド露出',
      ko: '브랜드 홍보',
    },
    description: {
      en: 'Increase visibility among tech professionals',
      'zh-hk': '提升品牌在科技界的知名度與影響力',
      'zh-hant': '提升品牌在科技界的知名度與影響力',
      'zh-hans': '提升品牌在科技界的知名度与影响力',
      ja: '技術コミュニティの中で認知を高める',
      ko: '전문 엔지니어 대상 브랜드 인지도 제고',
    },
    icon: 'eye',
  },
  {
    title: {
      en: 'Network',
      'zh-hk': '建立人脈',
      'zh-hant': '建立人脈',
      'zh-hans': '建立人脉',
      ja: 'ネットワーク形成',
      ko: '네트워킹',
    },
    description: {
      en: 'Connect with industry leaders and potential clients',
      'zh-hk': '接觸業界領袖、優秀人才與潛在合作夥伴',
      'zh-hant': '接觸業界領袖、優秀人才與潛在合作夥伴',
      'zh-hans': '接触业界领袖、优秀人才与潜在合作伙伴',
      ja: '業界リーダーや潜在的な顧客とつながる',
      ko: '업계 리더 및 잠재 고객과의 깊이 있는 네트워킹',
    },
    icon: 'users',
  },
  {
    title: {
      en: 'Community Support',
      'zh-hk': '支持社群',
      'zh-hant': '支持社群',
      'zh-hans': '支持社区',
      ja: 'コミュニティ支援',
      ko: '커뮤니티 지원',
    },
    description: {
      en: 'Support Python community growth in Hong Kong',
      'zh-hk': '支持香港及亞太區 Python 社群的長遠繁榮發展',
      'zh-hant': '支持香港及亞太區 Python 社群的長遠繁榮發展',
      'zh-hans': '支持香港及亚太区 Python 社区的长远繁荣发展',
      ja: '香港の Python コミュニティの成長を支える',
      ko: '홍콩 및 아시아 파이썬 생태계 성장 기여',
    },
    icon: 'heart',
  },
];

export const featureLabels: Record<string, Record<CfpLocale, string>> = {
  sponsoredTalks: {
    en: 'Sponsored Talk(s)',
    'zh-hk': '贊助演講',
    'zh-hant': '贊助演講',
    'zh-hans': '赞助演讲',
    ja: 'スポンサー講演',
    ko: '스폰서 세션',
  },
  boothTables: {
    en: 'Booth Tables',
    'zh-hk': '展覽攤位',
    'zh-hant': '展覽攤位',
    'zh-hans': '展览摊位',
    ja: 'ブース展示',
    ko: '부스 테이블',
  },
  logoSpeakerPodium: {
    en: 'Speaker Podium',
    'zh-hk': '講台標誌',
    'zh-hant': '講台標誌',
    'zh-hans': '讲台标志',
    ja: '登壇台ロゴ',
    ko: '강연대 로고',
  },
  logoConferenceRollup: {
    en: 'Conference Rollup',
    'zh-hk': '會場易拉架標誌',
    'zh-hant': '會場易拉架標誌',
    'zh-hans': '会场易拉架标志',
    ja: '会場ロールアップ',
    ko: '컨퍼런스 배너',
  },
  logoYouTubeFrame: {
    en: 'YouTube Frame',
    'zh-hk': 'YouTube 影片標誌',
    'zh-hant': 'YouTube 影片標誌',
    'zh-hans': 'YouTube 视频标志',
    ja: 'YouTube 録画フレーム',
    ko: '유튜브 영상 프레임',
  },
  logoWebsite: {
    en: 'Website',
    'zh-hk': '網站標誌',
    'zh-hant': '網站標誌',
    'zh-hans': '网站标志',
    ja: 'ウェブサイト掲載',
    ko: '웹사이트 로고',
  },
  rollupBySponsor: {
    en: 'Rollup by Sponsor',
    'zh-hk': '擺放自備易拉架',
    'zh-hant': '擺放自備易拉架',
    'zh-hans': '摆放自备易拉架',
    ja: '自社ロールアップ持参可',
    ko: '자체 배너 설치',
  },
  adDuringBreak: {
    en: 'Ad During Break',
    'zh-hk': '休息時段影片廣告',
    'zh-hant': '休息時段影片廣告',
    'zh-hans': '休息时段视频广告',
    ja: '休憩中広告',
    ko: '휴식 시간 광고',
  },
  preEventEmails: {
    en: 'Pre-event Emails',
    'zh-hk': '會前電郵宣傳',
    'zh-hant': '會前電郵宣傳',
    'zh-hans': '会前邮件宣传',
    ja: '事前メール告知',
    ko: '사전 이메일 홍보',
  },
  pressReleases: {
    en: 'Press Releases',
    'zh-hk': '新聞稿及媒體通知',
    'zh-hant': '新聞稿及媒體通知',
    'zh-hans': '新闻稿及媒体通知',
    ja: 'プレスリリース',
    ko: '보도자료 배포',
  },
  socialNetworks: {
    en: 'Social Networks',
    'zh-hk': '社交平台宣傳',
    'zh-hant': '社交平台宣傳',
    'zh-hans': '社交平台宣传',
    ja: 'SNS 告知',
    ko: '소셜 미디어 홍보',
  },
  openingClosing: {
    en: 'Opening & Closing',
    'zh-hk': '開幕及閉幕鳴謝',
    'zh-hant': '開幕及閉幕鳴謝',
    'zh-hans': '开幕及闭幕鸣谢',
    ja: '開会・閉会での謝辞',
    ko: '개회 및 폐회 감사 발표',
  },
};

export const sponsorshipPlans: SponsorshipPlan[] = [
  {
    name: {
      en: 'Diamond',
      'zh-hk': '鑽石級贊助',
      'zh-hant': '鑽石級贊助',
      'zh-hans': '钻石级赞助',
      ja: 'ダイヤモンド',
      ko: '다이아몬드',
    },
    tier: 'diamond',
    fee: 'HKD 68,640+',
    maxSlots: 1,
    headerBg: 'bg-[#2f559a]',
    headerText: 'text-white',
    features: {
      sponsoredTalks: {
        en: '2 x 30-minute talks',
        'zh-hk': '30 分鐘 × 2',
        'zh-hant': '30 分鐘 × 2',
        'zh-hans': '30 分钟 × 2',
        ja: '2 × 30分 講演',
        ko: '30분 강연 2회',
      },
      boothTables: {
        en: 'Double-Sized',
        'zh-hk': '雙倍大小',
        'zh-hant': '雙倍大小',
        'zh-hans': '双倍大小',
        ja: 'ダブルサイズ',
        ko: '더블 사이즈 부스',
      },
      logoSpeakerPodium: true,
      logoConferenceRollup: {
        en: 'Extra Large',
        'zh-hk': '特大標誌',
        'zh-hant': '特大標誌',
        'zh-hans': '特大标志',
        ja: '特大サイズ',
        ko: '특대형 로고',
      },
      logoYouTubeFrame: {
        en: 'Extra Large',
        'zh-hk': '特大標誌',
        'zh-hant': '特大標誌',
        'zh-hans': '特大标志',
        ja: '特大サイズ',
        ko: '특대형 로고',
      },
      logoWebsite: {
        en: 'Extra Large with write-up',
        'zh-hk': '特大標誌（附簡介）',
        'zh-hant': '特大標誌（附簡介）',
        'zh-hans': '特大标志（附简介）',
        ja: '特大（紹介文付き）',
        ko: '특대형 (소개글 포함)',
      },
      rollupBySponsor: true,
      adDuringBreak: true,
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: {
      en: 'Platinum',
      'zh-hk': '白金級贊助',
      'zh-hant': '白金級贊助',
      'zh-hans': '白金级赞助',
      ja: 'プラチナ',
      ko: '플래티넘',
    },
    tier: 'platinum',
    fee: 'HKD 46,800',
    maxSlots: 2,
    headerBg: 'bg-[#475569]',
    headerText: 'text-white',
    features: {
      sponsoredTalks: {
        en: '30-minute talk',
        'zh-hk': '30 分鐘 × 1',
        'zh-hant': '30 分鐘 × 1',
        'zh-hans': '30 分钟 × 1',
        ja: '1 × 30分 講演',
        ko: '30분 강연 1회',
      },
      boothTables: {
        en: 'Normal Size',
        'zh-hk': '標準大小',
        'zh-hant': '標準大小',
        'zh-hans': '标准大小',
        ja: '通常サイズ',
        ko: '기본 부스',
      },
      logoConferenceRollup: {
        en: 'Large',
        'zh-hk': '大型標誌',
        'zh-hant': '大型標誌',
        'zh-hans': '大型标志',
        ja: '大サイズ',
        ko: '대형 로고',
      },
      logoYouTubeFrame: {
        en: 'Large',
        'zh-hk': '大型標誌',
        'zh-hant': '大型標誌',
        'zh-hans': '大型标志',
        ja: '大サイズ',
        ko: '대형 로고',
      },
      logoWebsite: {
        en: 'Large with write-up',
        'zh-hk': '大型標誌（附簡介）',
        'zh-hant': '大型標誌（附簡介）',
        'zh-hans': '大型标志（附简介）',
        ja: '大（紹介文付き）',
        ko: '대형 (소개글 포함)',
      },
      rollupBySponsor: true,
      adDuringBreak: true,
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: {
      en: 'Gold',
      'zh-hk': '黃金級贊助',
      'zh-hant': '黃金級贊助',
      'zh-hans': '黄金级赞助',
      ja: 'ゴールド',
      ko: '골드',
    },
    tier: 'gold',
    fee: 'HKD 27,300',
    maxSlots: 4,
    isPopular: true,
    headerBg: 'bg-[#d97706]',
    headerText: 'text-white',
    features: {
      sponsoredTalks: {
        en: '15-minute talk',
        'zh-hk': '15 分鐘 × 1',
        'zh-hant': '15 分鐘 × 1',
        'zh-hans': '15 分钟 × 1',
        ja: '1 × 15分 講演',
        ko: '15분 강연 1회',
      },
      boothTables: {
        en: 'Normal Size',
        'zh-hk': '標準大小',
        'zh-hant': '標準大小',
        'zh-hans': '标准大小',
        ja: '通常サイズ',
        ko: '기본 부스',
      },
      logoConferenceRollup: {
        en: 'Medium',
        'zh-hk': '中型標誌',
        'zh-hant': '中型標誌',
        'zh-hans': '中型标志',
        ja: '中サイズ',
        ko: '중형 로고',
      },
      logoYouTubeFrame: {
        en: 'Medium',
        'zh-hk': '中型標誌',
        'zh-hant': '中型標誌',
        'zh-hans': '中型标志',
        ja: '中サイズ',
        ko: '중형 로고',
      },
      logoWebsite: {
        en: 'Medium',
        'zh-hk': '中型標誌',
        'zh-hant': '中型標誌',
        'zh-hans': '中型标志',
        ja: '中サイズ',
        ko: '중형 로고',
      },
      adDuringBreak: {
        en: '+ HKD 3,100',
        'zh-hk': '+ HKD 3,100',
        'zh-hant': '+ HKD 3,100',
        'zh-hans': '+ HKD 3,100',
        ja: '+ HKD 3,100',
        ko: '+ HKD 3,100',
      },
      preEventEmails: true,
      pressReleases: true,
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: {
      en: 'Silver',
      'zh-hk': '白銀級贊助',
      'zh-hant': '白銀級贊助',
      'zh-hans': '白银级赞助',
      ja: 'シルバー',
      ko: '실버',
    },
    tier: 'silver',
    fee: 'HKD 13,650',
    maxSlots: 4,
    isPopular: true,
    headerBg: 'bg-[#0d9488]',
    headerText: 'text-white',
    features: {
      boothTables: {
        en: 'Normal Size',
        'zh-hk': '標準大小',
        'zh-hant': '標準大小',
        'zh-hans': '标准大小',
        ja: '通常サイズ',
        ko: '기본 부스',
      },
      logoConferenceRollup: {
        en: 'Regular',
        'zh-hk': '標準標誌',
        'zh-hant': '標準標誌',
        'zh-hans': '标准标志',
        ja: 'レギュラー',
        ko: '일반 로고',
      },
      logoYouTubeFrame: {
        en: 'Regular',
        'zh-hk': '標準標誌',
        'zh-hant': '標準標誌',
        'zh-hans': '标准标志',
        ja: 'レギュラー',
        ko: '일반 로고',
      },
      logoWebsite: {
        en: 'Regular',
        'zh-hk': '標準標誌',
        'zh-hant': '標準標誌',
        'zh-hans': '标准标志',
        ja: 'レギュラー',
        ko: '일반 로고',
      },
      adDuringBreak: {
        en: '+ HKD 3,100',
        'zh-hk': '+ HKD 3,100',
        'zh-hant': '+ HKD 3,100',
        'zh-hans': '+ HKD 3,100',
        ja: '+ HKD 3,100',
        ko: '+ HKD 3,100',
      },
      socialNetworks: true,
      openingClosing: true,
    },
  },
  {
    name: {
      en: 'Bronze',
      'zh-hk': '青銅級贊助',
      'zh-hant': '青銅級贊助',
      'zh-hans': '青铜级赞助',
      ja: 'ブロンズ',
      ko: '브론즈',
    },
    tier: 'bronze',
    fee: 'HKD 6,240',
    maxSlots: 'unlimited',
    headerBg: 'bg-[#b45309]',
    headerText: 'text-white',
    features: {
      logoConferenceRollup: {
        en: 'Small',
        'zh-hk': '小型標誌',
        'zh-hant': '小型標誌',
        'zh-hans': '小型标志',
        ja: '小サイズ',
        ko: '소형 로고',
      },
      logoYouTubeFrame: {
        en: 'Small',
        'zh-hk': '小型標誌',
        'zh-hant': '小型標誌',
        'zh-hans': '小型标志',
        ja: '小サイズ',
        ko: '소형 로고',
      },
      logoWebsite: {
        en: 'Small',
        'zh-hk': '小型標誌',
        'zh-hant': '小型標誌',
        'zh-hans': '小型标志',
        ja: '小サイズ',
        ko: '소형 로고',
      },
      adDuringBreak: {
        en: '+ HKD 3,100',
        'zh-hk': '+ HKD 3,100',
        'zh-hant': '+ HKD 3,100',
        'zh-hans': '+ HKD 3,100',
        ja: '+ HKD 3,100',
        ko: '+ HKD 3,100',
      },
      openingClosing: true,
    },
  },
];

export const featureSections = [
  {
    headingKey: 'visibilityHeading' as const,
    items: [
      { key: 'sponsoredTalks', highlight: true },
      { key: 'boothTables', highlight: false },
      { key: 'rollupBySponsor', highlight: false },
      { key: 'adDuringBreak', highlight: false },
    ],
  },
  {
    headingKey: 'logoHeading' as const,
    items: [
      { key: 'logoSpeakerPodium', highlight: false },
      { key: 'logoConferenceRollup', highlight: false },
      { key: 'logoYouTubeFrame', highlight: false },
      { key: 'logoWebsite', highlight: false },
    ],
  },
  {
    headingKey: 'promotionHeading' as const,
    items: [
      { key: 'preEventEmails', highlight: false },
      { key: 'pressReleases', highlight: false },
      { key: 'socialNetworks', highlight: false },
      { key: 'openingClosing', highlight: false },
    ],
  },
];

export function maxSlotsLabel(
  maxSlots: SponsorshipPlan['maxSlots'],
  locale: CfpLocale
): string {
  if (locale === 'zh-hk' || locale === 'zh-hant') {
    return maxSlots === 'unlimited' ? '名額不限' : `最多 ${maxSlots} 個名額`;
  }
  if (locale === 'zh-hans') {
    return maxSlots === 'unlimited' ? '名额不限' : `最多 ${maxSlots} 个名额`;
  }
  if (locale === 'ja') {
    return maxSlots === 'unlimited' ? '枠数無制限' : `最大 ${maxSlots} 枠`;
  }
  if (locale === 'ko') {
    return maxSlots === 'unlimited' ? '제한 없음' : `최대 ${maxSlots}개 슬롯`;
  }

  return maxSlots === 'unlimited'
    ? 'Unlimited slots'
    : `Max ${maxSlots} slot${maxSlots === 1 ? '' : 's'}`;
}
