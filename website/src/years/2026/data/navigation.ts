import { getChineseTerms } from '@/years/2026/i18n/chinese-terms';
import type { CfpLocale } from '@/years/2026/locales';

const written = getChineseTerms('zh-hant');
const cantonese = getChineseTerms('zh-hk');

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
      'zh-hk': cantonese.news,
      'zh-hant': written.news,
      'zh-hans': '最新消息',
      ja: 'ニュース',
      ko: '뉴스',
    },
    href: (locale) => `/2026/${locale}/news/`,
  },
  {
    kind: 'group',
    label: {
      en: 'Conference',
      'zh-hk': cantonese.conference,
      'zh-hant': written.conference,
      'zh-hans': '会议信息',
      ja: 'カンファレンス',
      ko: '컨퍼런스',
    },
    children: [
      {
        label: {
          en: 'Conference Schedule',
          'zh-hk': cantonese.programme,
          'zh-hant': written.programme,
          'zh-hans': '大会议程',
          ja: 'スケジュール',
          ko: '컨퍼런스 일정',
        },
        href: (locale) => `/2026/${locale}/schedule/`,
      },
      {
        label: {
          en: 'Access Guide',
          'zh-hk': cantonese.accessGuide,
          'zh-hant': written.accessGuide,
          'zh-hans': '交通指南',
          ja: 'アクセスガイド',
          ko: '오시는 길',
        },
        href: (locale) => `/2026/${locale}/access-guide/`,
      },
      {
        label: {
          en: 'Catering Guide',
          'zh-hk': cantonese.cateringGuide,
          'zh-hant': written.cateringGuide,
          'zh-hans': '餐饮指南',
          ja: '食事ガイド',
          ko: '식사 안내',
        },
        href: (locale) => `/2026/${locale}/catering-guide/`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Sprint',
      'zh-hk': cantonese.sprint,
      'zh-hant': written.sprint,
      'zh-hans': '冲刺开发',
      ja: 'スプリント',
      ko: '스프린트',
    },
    children: [
      {
        label: {
          en: 'Sprint Day',
          'zh-hk': cantonese.sprintDay,
          'zh-hant': written.sprintDay,
          'zh-hans': '冲刺开发日',
          ja: 'スプリントデー',
          ko: '스프린트 데이',
        },
        href: (locale) => `/2026/${locale}/sprint/`,
      },
      {
        label: {
          en: 'Sprint Q&A',
          'zh-hk': cantonese.sprintQa,
          'zh-hant': written.sprintQa,
          'zh-hans': '冲刺开发常见问题',
          ja: 'スプリント Q&A',
          ko: '스프린트 Q&A',
        },
        href: (locale) => `/2026/${locale}/sprint/qna/`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Organizers',
      'zh-hk': cantonese.organizingTeam,
      'zh-hant': written.organizingTeam,
      'zh-hans': '筹办团队',
      ja: '運営チーム',
      ko: '주최자',
    },
    children: [
      {
        label: {
          en: 'Organizations',
          'zh-hk': cantonese.organizers,
          'zh-hant': written.organizers,
          'zh-hans': '主办单位',
          ja: '主催団体',
          ko: '주최 단체',
        },
        href: (locale) => `/2026/${locale}/organizers/`,
      },
      {
        label: {
          en: 'Volunteers',
          'zh-hk': cantonese.volunteers,
          'zh-hant': written.volunteers,
          'zh-hans': '志愿者团队',
          ja: 'ボランティア',
          ko: '자원봉사자',
        },
        href: (locale) => `/2026/${locale}/volunteers/`,
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Sponsorships',
      'zh-hk': cantonese.sponsorships,
      'zh-hant': written.sponsorships,
      'zh-hans': '赞助合作',
      ja: 'スポンサーシップ',
      ko: '후원',
    },
    children: [
      {
        label: {
          en: 'Sponsors',
          'zh-hk': cantonese.sponsors,
          'zh-hant': written.sponsors,
          'zh-hans': '赞助伙伴',
          ja: 'スポンサー',
          ko: '후원사',
        },
        href: (locale) => `/2026/${locale}/sponsorships/`,
      },
      {
        label: {
          en: 'Patrons',
          'zh-hk': cantonese.patrons,
          'zh-hant': written.patrons,
          'zh-hans': '个人赞助',
          ja: 'パトロン',
          ko: '개인 후원자',
        },
        href: (locale) => `/2026/${locale}/sponsorships/patrons/`,
      },
      {
        label: {
          en: 'Opportunities',
          'zh-hk': cantonese.sponsorshipOpportunities,
          'zh-hant': written.sponsorshipOpportunities,
          'zh-hans': '赞助机会',
          ja: '協賛募集',
          ko: '후원 기회',
        },
        href: (locale) => `/2026/${locale}/sponsorships/opportunities/`,
      },
    ],
  },
  {
    kind: 'link',
    label: {
      en: 'Communities',
      'zh-hk': cantonese.communities,
      'zh-hant': written.communities,
      'zh-hans': '社区伙伴',
      ja: 'コミュニティ',
      ko: '커뮤니티',
    },
    href: (locale) => `/2026/${locale}/supporting-organizations/`,
  },
  {
    kind: 'link',
    label: {
      en: 'About',
      'zh-hk': cantonese.aboutConference,
      'zh-hant': written.aboutConference,
      'zh-hans': '关于大会',
      ja: '概要',
      ko: '소개',
    },
    href: (locale) => `/2026/${locale}/about/`,
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
      'zh-hk': cantonese.contactUs,
      'zh-hant': written.contactUs,
      'zh-hans': '联系我们',
      ja: 'お問い合わせ',
      ko: '문의하기',
    },
    href: (_locale) => 'mailto:pycon@pycon.hk?cc=calvin@opensource.hk',
    isExternal: true,
  },
];
