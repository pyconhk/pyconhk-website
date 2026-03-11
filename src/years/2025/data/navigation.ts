import type { LocalizedValue } from '@/config/site';
import type { SiteSectionSlug } from '@/years/2025/data/sections';

type LocalizedLabel = LocalizedValue<string>;

export type SiteNavigationLink = {
  kind: 'link';
  label: LocalizedLabel;
  path: string;
  activeSection: SiteSectionSlug;
};

export type SiteNavigationGroup = {
  kind: 'group';
  label: LocalizedLabel;
  children: SiteNavigationLink[];
};

export type SiteNavigationItem = SiteNavigationLink | SiteNavigationGroup;

export const navigationItems = [
  {
    kind: 'link',
    label: {
      en: 'News',
      'zh-hk': '最新消息',
      'zh-hant': '最新消息',
      'zh-hans': '最新消息',
      ja: 'ニュース',
    },
    path: 'news',
    activeSection: 'news',
  },
  {
    kind: 'group',
    label: {
      en: 'Conference',
      'zh-hk': '會議資訊',
      'zh-hant': '會議資訊',
      'zh-hans': '会议信息',
      ja: 'カンファレンス',
    },
    children: [
      {
        kind: 'link',
        label: {
          en: 'Schedule',
          'zh-hk': '議程',
          'zh-hant': '議程',
          'zh-hans': '议程',
          ja: 'スケジュール',
        },
        path: 'schedule',
        activeSection: 'schedule',
      },
      {
        kind: 'link',
        label: {
          en: 'Access Guide',
          'zh-hk': '交通指南',
          'zh-hant': '交通指南',
          'zh-hans': '交通指南',
          ja: 'アクセスガイド',
        },
        path: 'access-guide',
        activeSection: 'access-guide',
      },
      {
        kind: 'link',
        label: {
          en: 'Catering Guide',
          'zh-hk': '餐飲指南',
          'zh-hant': '餐飲指南',
          'zh-hans': '餐饮指南',
          ja: '食事ガイド',
        },
        path: 'catering-guide',
        activeSection: 'catering-guide',
      },
    ],
  },
  {
    kind: 'group',
    label: {
      en: 'Sprint',
      'zh-hk': 'Sprint',
      'zh-hant': 'Sprint',
      'zh-hans': 'Sprint',
      ja: 'スプリント開発',
    },
    children: [
      {
        kind: 'link',
        label: {
          en: 'Sprint Day',
          'zh-hk': 'Sprint Day',
          'zh-hant': 'Sprint Day',
          'zh-hans': 'Sprint Day',
          ja: 'スプリント開発デー',
        },
        path: 'sprint',
        activeSection: 'sprint',
      },
      {
        kind: 'link',
        label: {
          en: 'Sprint Q&A',
          'zh-hk': 'Sprint Q&A',
          'zh-hant': 'Sprint Q&A',
          'zh-hans': 'Sprint Q&A',
          ja: 'スプリント開発 Q&A',
        },
        path: 'sprint/qna',
        activeSection: 'sprint',
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
    },
    children: [
      {
        kind: 'link',
        label: {
          en: 'Organizations',
          'zh-hk': '主辦單位',
          'zh-hant': '主辦單位',
          'zh-hans': '主办单位',
          ja: '主催団体',
        },
        path: 'organizers',
        activeSection: 'organizers',
      },
      {
        kind: 'link',
        label: {
          en: 'Volunteers',
          'zh-hk': '義工團隊',
          'zh-hant': '義工團隊',
          'zh-hans': '志愿者团队',
          ja: 'ボランティア',
        },
        path: 'volunteers',
        activeSection: 'volunteers',
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
      ja: 'スポンサー',
    },
    children: [
      {
        kind: 'link',
        label: {
          en: 'Sponsors',
          'zh-hk': '贊助名單',
          'zh-hant': '贊助名單',
          'zh-hans': '赞助名单',
          ja: 'スポンサー一覧',
        },
        path: 'sponsorships',
        activeSection: 'sponsorships',
      },
      {
        kind: 'link',
        label: {
          en: 'Patrons',
          'zh-hk': '鳴謝贊助人',
          'zh-hant': '鳴謝贊助人',
          'zh-hans': '鸣谢赞助人',
          ja: 'Patrons',
        },
        path: 'sponsorships/patrons',
        activeSection: 'sponsorships',
      },
      {
        kind: 'link',
        label: {
          en: 'Opportunities',
          'zh-hk': '贊助機會',
          'zh-hant': '贊助機會',
          'zh-hans': '赞助机会',
          ja: 'スポンサー募集',
        },
        path: 'sponsorships/opportunities',
        activeSection: 'sponsorships',
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
    },
    path: 'supporting-organizations',
    activeSection: 'supporting-organizations',
  },
  {
    kind: 'link',
    label: {
      en: 'About',
      'zh-hk': '關於 PyCon HK',
      'zh-hant': '關於 PyCon HK',
      'zh-hans': '关于 PyCon HK',
      ja: 'PyCon HK について',
    },
    path: 'about',
    activeSection: 'about',
  },
  {
    kind: 'group',
    label: {
      en: 'Code of Conduct',
      'zh-hk': '行為準則',
      'zh-hant': '行為準則',
      'zh-hans': '行为准则',
      ja: '行動規範',
    },
    children: [
      {
        kind: 'link',
        label: {
          en: 'Overview',
          'zh-hk': '總覽',
          'zh-hant': '總覽',
          'zh-hans': '总览',
          ja: '概要',
        },
        path: 'code-of-conduct',
        activeSection: 'code-of-conduct',
      },
      {
        kind: 'link',
        label: {
          en: 'Reporting Incidents',
          'zh-hk': '事件舉報',
          'zh-hant': '事件舉報',
          'zh-hans': '事件举报',
          ja: '報告方法',
        },
        path: 'code-of-conduct/attendee-reporting',
        activeSection: 'code-of-conduct',
      },
      {
        kind: 'link',
        label: {
          en: 'Enforcement Procedures',
          'zh-hk': '執行程序',
          'zh-hant': '執行程序',
          'zh-hans': '执行程序',
          ja: '対応手順',
        },
        path: 'code-of-conduct/staff-procedures',
        activeSection: 'code-of-conduct',
      },
    ],
  },
] satisfies SiteNavigationItem[];
