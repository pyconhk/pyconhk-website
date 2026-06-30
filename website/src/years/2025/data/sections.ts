import {
  type LocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';

export const siteSections = [
  {
    slug: 'news',
    title: {
      en: 'News',
      'zh-hk': '最新消息',
      'zh-hant': '最新消息',
      'zh-hans': '最新消息',
      ja: 'ニュース',
    },
    blurb: {
      en: 'Outstatic-backed announcements, sponsor updates, and event notices.',
      'zh-hk': '由 Outstatic 發佈的公告、贊助消息與活動通知。',
      'zh-hant': '由 Outstatic 發佈的公告、贊助消息與活動通知。',
      'zh-hans': '由 Outstatic 发布的公告、赞助消息与活动通知。',
      ja: 'Outstatic を通じて公開された告知、スポンサー情報、イベント案内。',
    },
  },
  {
    slug: 'schedule',
    title: {
      en: 'Conference Schedule',
      'zh-hk': '會議議程',
      'zh-hant': '會議議程',
      'zh-hans': '会议议程',
      ja: 'カンファレンス日程',
    },
    blurb: {
      en: 'Conference schedule, session flow, and daily planning information.',
      'zh-hk': '會議議程、場次安排與每日流程資訊。',
      'zh-hant': '會議議程、場次安排與每日流程資訊。',
      'zh-hans': '会议议程、场次安排与每日流程信息。',
      ja: 'カンファレンス日程、各セッションの流れ、当日の案内。',
    },
  },
  {
    slug: 'access-guide',
    title: {
      en: 'Access Guide',
      'zh-hk': '交通指南',
      'zh-hant': '交通指南',
      'zh-hans': '交通指南',
      ja: 'アクセスガイド',
    },
    blurb: {
      en: 'How to reach the venue, campus directions, and arrival guidance.',
      'zh-hk': '如何前往會場、校園路線與入場指引。',
      'zh-hant': '如何前往會場、校園路線與入場指引。',
      'zh-hans': '如何前往会场、校园路线与入场指引。',
      ja: '会場への行き方、キャンパス内の案内、到着時の情報。',
    },
  },
  {
    slug: 'catering-guide',
    title: {
      en: 'Catering Guide',
      'zh-hk': '餐飲指南',
      'zh-hant': '餐飲指南',
      'zh-hans': '餐饮指南',
      ja: '食事ガイド',
    },
    blurb: {
      en: 'Nearby food options, campus catering notes, and meal planning help.',
      'zh-hk': '附近餐飲選擇、校園餐飲資訊與用餐安排建議。',
      'zh-hant': '附近餐飲選擇、校園餐飲資訊與用餐安排建議。',
      'zh-hans': '附近餐饮选择、校园餐饮信息与用餐安排建议。',
      ja: '周辺の食事情報、キャンパス内の案内、食事計画の参考情報。',
    },
  },
  {
    slug: 'sprint',
    title: {
      en: 'Sprint Day',
      'zh-hk': 'Sprint Day',
      'zh-hant': 'Sprint Day',
      'zh-hans': 'Sprint Day',
      ja: 'スプリント開発デー',
    },
    blurb: {
      en: 'Community hacking, project collaboration, and workshop follow-up action.',
      'zh-hk': '社群協作、專案實作與工作坊延伸交流。',
      'zh-hant': '社群協作、專案實作與工作坊延伸交流。',
      'zh-hans': '社区协作、项目实作与工作坊延伸交流。',
      ja: 'コミュニティでの開発、プロジェクト協働、ワークショップ後の実践。',
    },
  },
  {
    slug: 'organizers',
    title: {
      en: 'Organizations',
      'zh-hk': '主辦單位',
      'zh-hant': '主辦單位',
      'zh-hans': '主办单位',
      ja: '主催団体',
    },
    blurb: {
      en: 'The organizations and communities coordinating PyCon HK 2025.',
      'zh-hk': '策劃與協調 PyCon HK 2025 的主辦組織與社群。',
      'zh-hant': '策劃與協調 PyCon HK 2025 的主辦組織與社群。',
      'zh-hans': '策划与协调 PyCon HK 2025 的主办组织与社区。',
      ja: 'PyCon HK 2025 を企画・運営する団体とコミュニティ。',
    },
  },
  {
    slug: 'volunteers',
    title: {
      en: 'Volunteers',
      'zh-hk': '義工團隊',
      'zh-hant': '義工團隊',
      'zh-hans': '志愿者团队',
      ja: 'ボランティア',
    },
    blurb: {
      en: 'The volunteers making the conference smooth, welcoming, and human.',
      'zh-hk': '讓會議順暢、友善而有人味的義工團隊。',
      'zh-hant': '讓會議順暢、友善而有人味的義工團隊。',
      'zh-hans': '让大会顺畅、友善且有人情味的志愿者团队。',
      ja: 'カンファレンスを円滑で温かい場にしているボランティアチーム。',
    },
  },
  {
    slug: 'supporting-organizations',
    title: {
      en: 'Supporting Organizations',
      'zh-hk': '支持組織',
      'zh-hant': '支持組織',
      'zh-hans': '支持组织',
      ja: '支援団体',
    },
    blurb: {
      en: 'Supporting organizations, partner communities, and ecosystem friends.',
      'zh-hk': '支持組織、合作社群與 Python 生態圈夥伴。',
      'zh-hant': '支持組織、合作社群與 Python 生態圈夥伴。',
      'zh-hans': '支持组织、合作社区与 Python 生态伙伴。',
      ja: '支援団体、パートナーコミュニティ、Python エコシステムの仲間たち。',
    },
  },
  {
    slug: 'about',
    title: {
      en: 'About',
      'zh-hk': '關於 PyCon HK',
      'zh-hant': '關於 PyCon HK',
      'zh-hans': '关于 PyCon HK',
      ja: 'PyCon HK について',
    },
    blurb: {
      en: 'Conference story, organizing principles, and the role of PyCon HK in the city.',
      'zh-hk': '會議背景、組織理念，以及 PyCon HK 在香港社群中的角色。',
      'zh-hant': '會議背景、組織理念，以及 PyCon HK 在香港社群中的角色。',
      'zh-hans': '大会背景、组织理念，以及 PyCon HK 在香港社区中的角色。',
      ja: 'カンファレンスの背景、運営方針、そして香港における PyCon HK の役割。',
    },
  },
  {
    slug: 'sponsorships',
    title: {
      en: 'Sponsors',
      'zh-hk': '贊助名單',
      'zh-hant': '贊助名單',
      'zh-hans': '赞助名单',
      ja: 'スポンサー一覧',
    },
    blurb: {
      en: 'Sponsor packages, partner visibility, and supporter-facing information.',
      'zh-hk': '贊助方案、合作夥伴曝光與對外合作資訊。',
      'zh-hant': '贊助方案、合作夥伴曝光與對外合作資訊。',
      'zh-hans': '赞助方案、合作伙伴曝光与对外合作信息。',
      ja: 'スポンサー枠、パートナー向け露出、協賛関連情報。',
    },
  },
  {
    slug: 'code-of-conduct',
    title: {
      en: 'Code of Conduct Overview',
      'zh-hk': '行為準則總覽',
      'zh-hant': '行為準則總覽',
      'zh-hans': '行为准则总览',
      ja: '行動規範概要',
    },
    blurb: {
      en: 'Participation standards, reporting guidance, and enforcement expectations.',
      'zh-hk': '參與準則、舉報指引與執行原則。',
      'zh-hant': '參與準則、舉報指引與執行原則。',
      'zh-hans': '参与准则、举报指引与执行原则。',
      ja: '参加基準、報告方法、運用方針。',
    },
  },
  {
    slug: 'privacy-policy',
    title: {
      en: 'Privacy Policy',
      'zh-hk': '私隱政策',
      'zh-hant': '隱私政策',
      'zh-hans': '隐私政策',
      ja: 'プライバシーポリシー',
    },
    blurb: {
      en: 'How PyCon Hong Kong collects, uses, and protects participant data.',
      'zh-hk': 'PyCon Hong Kong 如何收集、使用與保護參加者資料。',
      'zh-hant': 'PyCon Hong Kong 如何收集、使用與保護參加者資料。',
      'zh-hans': 'PyCon Hong Kong 如何收集、使用与保护参加者资料。',
      ja: 'PyCon Hong Kong が参加者データをどのように収集、利用、保護するか。',
    },
  },
] as const;

export type SiteSectionSlug = (typeof siteSections)[number]['slug'];

export function isSupportedSection(value: string): value is SiteSectionSlug {
  return siteSections.some((section) => section.slug === value);
}

export function getSectionCopy(section: SiteSectionSlug, locale: SiteLocale) {
  const match = siteSections.find((entry) => entry.slug === section);

  if (!match) {
    throw new Error(`Unsupported section: ${section}`);
  }

  return {
    title: resolveRequiredLocalizedValue(match.title as LocalizedValue<string>, locale),
    blurb: resolveRequiredLocalizedValue(match.blurb as LocalizedValue<string>, locale),
  };
}
