import type { CfpLocale } from '@/years/2026/locales';

export type NavLinkItem = {
  kind: 'link';
  label: Record<CfpLocale, string>;
  href: (locale: CfpLocale) => string;
  isExternal?: boolean;
};

export type NavGroupItem = {
  kind: 'group';
  label: Record<CfpLocale, string>;
  children: {
    label: Record<CfpLocale, string>;
    href: (locale: CfpLocale) => string;
    isExternal?: boolean;
  }[];
};

export type NavigationItem = NavLinkItem | NavGroupItem;

export const headerNavigation: NavigationItem[] = [
  {
    kind: 'link',
    label: {
      en: 'News',
      'zh-hk': '最新消息',
      'zh-hant': '最新消息',
      'zh-hans': '最新消息',
      ja: 'ニュース',
      ko: '뉴스',
    },
    href: (locale) => `/2026/${locale}/#about`,
  },
  {
    kind: 'group',
    label: {
      en: 'Conference',
      'zh-hk': '會議資訊',
      'zh-hant': '會議資訊',
      'zh-hans': '会议信息',
      ja: 'カンファレンス',
      ko: '컨퍼런스',
    },
    children: [
      {
        label: {
          en: 'Conference Schedule',
          'zh-hk': '大會議程',
          'zh-hant': '大會議程',
          'zh-hans': '大会议程',
          ja: 'スケジュール',
          ko: '컨퍼런스 일정',
        },
        href: (locale) => `/2026/${locale}/#programme`,
      },
      {
        label: {
          en: 'Access Guide',
          'zh-hk': '交通指南',
          'zh-hant': '交通指南',
          'zh-hans': '交通指南',
          ja: 'アクセスガイド',
          ko: '오시는 길',
        },
        href: (locale) => `/2026/${locale}/#venue`,
      },
      {
        label: {
          en: 'Catering Guide',
          'zh-hk': '餐飲指南',
          'zh-hant': '餐飲指南',
          'zh-hans': '餐饮指南',
          ja: '食事ガイド',
          ko: '식사 안내',
        },
        href: (locale) => `/2026/${locale}/#venue`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Sprint',
      'zh-hk': 'Sprint 開發聚會',
      'zh-hant': 'Sprint 開發聚會',
      'zh-hans': 'Sprint 开发聚会',
      ja: 'スプリント',
      ko: '스프린트',
    },
    children: [
      {
        label: {
          en: 'Sprint Day',
          'zh-hk': 'Sprint 開發日',
          'zh-hant': 'Sprint 開發日',
          'zh-hans': 'Sprint 开发日',
          ja: 'スプリントデー',
          ko: '스프린트 데이',
        },
        href: (locale) => `/2026/${locale}/#programme`,
      },
      {
        label: {
          en: 'Sprint Q&A',
          'zh-hk': 'Sprint Q&A 常見問題',
          'zh-hant': 'Sprint Q&A 常見問題',
          'zh-hans': 'Sprint Q&A 常见问题',
          ja: 'スプリント Q&A',
          ko: '스프린트 Q&A',
        },
        href: (locale) => `/2026/${locale}/#programme`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Organizers',
      'zh-hk': '籌辦團隊',
      'zh-hant': '籌辦團隊',
      'zh-hans': '筹办团队',
      ja: '運営チーム',
      ko: '주최자',
    },
    children: [
      {
        label: {
          en: 'Organizations',
          'zh-hk': '主辦單位',
          'zh-hant': '主辦單位',
          'zh-hans': '主办单位',
          ja: '主催団体',
          ko: '주최 단체',
        },
        href: (locale) => `/2026/${locale}/#about`,
      },
      {
        label: {
          en: 'Volunteers',
          'zh-hk': '義工團隊',
          'zh-hant': '義工團隊',
          'zh-hans': '志愿者团队',
          ja: 'ボランティア',
          ko: '자원봉사자',
        },
        href: (locale) => `/2026/${locale}/#about`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Sponsorships',
      'zh-hk': '贊助合作',
      'zh-hant': '贊助合作',
      'zh-hans': '赞助合作',
      ja: 'スポンサーシップ',
      ko: '후원',
    },
    children: [
      {
        label: {
          en: 'Sponsors',
          'zh-hk': '贊助夥伴',
          'zh-hant': '贊助夥伴',
          'zh-hans': '赞助伙伴',
          ja: 'スポンサー',
          ko: '후원사',
        },
        href: (locale) => `/2026/${locale}/#sponsors`,
      },
      {
        label: {
          en: 'Patrons',
          'zh-hk': '鳴謝贊助人',
          'zh-hant': '鳴謝贊助人',
          'zh-hans': '鸣谢赞助人',
          ja: 'パトロン',
          ko: '개인 후원자',
        },
        href: (locale) => `/2026/${locale}/#sponsors`,
      },
      {
        label: {
          en: 'Opportunities',
          'zh-hk': '贊助機會',
          'zh-hant': '贊助機會',
          'zh-hans': '赞助机会',
          ja: '協賛募集',
          ko: '후원 기회',
        },
        href: (locale) => `/2026/${locale}/#sponsors`,
      },
    ],
  },
  {
    kind: 'link',
    label: {
      en: 'Communities',
      'zh-hk': '社群夥伴',
      'zh-hant': '社群夥伴',
      'zh-hans': '社区伙伴',
      ja: 'コミュニティ',
      ko: '커뮤니티',
    },
    href: (locale) => `/2026/${locale}/#sponsors`,
  },
  {
    kind: 'link',
    label: {
      en: 'About',
      'zh-hk': '關於大會',
      'zh-hant': '關於大會',
      'zh-hans': '关于大会',
      ja: '概要',
      ko: '소개',
    },
    href: (locale) => `/2026/${locale}/#about`,
  },
  {
    kind: 'group',
    label: {
      en: 'Code of Conduct',
      'zh-hk': '行為準則',
      'zh-hant': '行為準則',
      'zh-hans': '行为准则',
      ja: '行動規範',
      ko: '행동 강령',
    },
    children: [
      {
        label: {
          en: 'Overview',
          'zh-hk': '準則總覽',
          'zh-hant': '準則總覽',
          'zh-hans': '准则总览',
          ja: '概要',
          ko: '개요',
        },
        href: (locale) => `/2026/${locale}/code-of-conduct/`,
      },
      {
        label: {
          en: 'Enforcement Procedures',
          'zh-hk': '執行程序',
          'zh-hant': '執行程序',
          'zh-hans': '执行程序',
          ja: '執行手順',
          ko: '집행 절차',
        },
        href: (locale) => `/2026/${locale}/code-of-conduct/staff-procedures/`,
      },
      {
        label: {
          en: 'Procedures for Reporting Incidents',
          'zh-hk': '事件舉報程序',
          'zh-hant': '事件舉報程序',
          'zh-hans': '事件举报程序',
          ja: '報告手順',
          ko: '사건 보고 절차',
        },
        href: (locale) => `/2026/${locale}/code-of-conduct/attendee-reporting/`,
      },
    ],
  },
  {
    kind: 'link',
    label: {
      en: 'Contact Us',
      'zh-hk': '聯絡我們',
      'zh-hant': '聯絡我們',
      'zh-hans': '联系我们',
      ja: 'お問い合わせ',
      ko: '문의하기',
    },
    href: (_locale) => 'mailto:pycon@pycon.hk?cc=calvin@opensource.hk',
    isExternal: true,
  },
];
