import {
  type LocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';
import type { SiteSectionSlug } from '@/years/2025/data/sections';

export const siteSubpages = [
  {
    section: 'sprint',
    subsection: 'qna',
    title: {
      en: 'Sprint Q&A',
      'zh-hk': 'Sprint Q&A',
      'zh-hant': 'Sprint Q&A',
      'zh-hans': 'Sprint Q&A',
      ja: 'スプリント開発 Q&A',
    },
    blurb: {
      en: 'Frequently asked questions for PyCon HK sprint participants and sprint leads.',
      'zh-hk': '給 PyCon HK Sprint 參加者與 Sprint Lead 的常見問題。',
      'zh-hant': '給 PyCon HK Sprint 參加者與 Sprint Lead 的常見問題。',
      'zh-hans': '给 PyCon HK Sprint 参加者与 Sprint Lead 的常见问题。',
      ja: 'PyCon HK スプリント開発の参加者と Sprint Lead 向けのよくある質問。',
    },
  },
  {
    section: 'sponsorships',
    subsection: 'opportunities',
    title: {
      en: 'Sponsorship Opportunities',
      'zh-hk': '贊助機會',
      'zh-hant': '贊助機會',
      'zh-hans': '赞助机会',
      ja: 'スポンサー募集',
    },
    blurb: {
      en: 'Sponsorship plans, benefits, and contact details for PyCon HK 2025.',
      'zh-hk': 'PyCon HK 2025 的贊助方案、合作效益與聯絡方式。',
      'zh-hant': 'PyCon HK 2025 的贊助方案、合作效益與聯絡方式。',
      'zh-hans': 'PyCon HK 2025 的赞助方案、合作效益与联系方式。',
      ja: 'PyCon HK 2025 のスポンサー枠、特典、連絡先情報。',
    },
  },
  {
    section: 'sponsorships',
    subsection: 'patrons',
    title: {
      en: 'Patrons',
      'zh-hk': '鳴謝贊助人',
      'zh-hant': '鳴謝贊助人',
      'zh-hans': '鸣谢赞助人',
      ja: 'Patrons',
    },
    blurb: {
      en: 'A thank-you page for the patrons supporting PyCon HK 2025.',
      'zh-hk': '鳴謝支持 PyCon HK 2025 的贊助人。',
      'zh-hant': '鳴謝支持 PyCon HK 2025 的贊助人。',
      'zh-hans': '鸣谢支持 PyCon HK 2025 的赞助人。',
      ja: 'PyCon HK 2025 を支援してくださる Patrons への感謝ページ。',
    },
  },
  {
    section: 'code-of-conduct',
    subsection: 'attendee-reporting',
    title: {
      en: 'Procedures for Reporting Incidents',
      'zh-hk': '事件舉報程序',
      'zh-hant': '事件舉報程序',
      'zh-hans': '事件举报程序',
      ja: 'インシデント報告手順',
    },
    blurb: {
      en: 'How attendees can report Code of Conduct incidents during PyCon HK.',
      'zh-hk': '參加者如何在 PyCon HK 期間舉報違反行為準則的事件。',
      'zh-hant': '參加者如何在 PyCon HK 期間舉報違反行為準則的事件。',
      'zh-hans': '参加者如何在 PyCon HK 期间举报违反行为准则的事件。',
      ja: 'PyCon HK 期間中に参加者が行動規範違反を報告する方法。',
    },
  },
  {
    section: 'code-of-conduct',
    subsection: 'staff-procedures',
    title: {
      en: 'Enforcement Procedures',
      'zh-hk': '執行程序',
      'zh-hant': '執行程序',
      'zh-hans': '执行程序',
      ja: '対応手順',
    },
    blurb: {
      en: 'Internal enforcement procedures for handling Code of Conduct reports.',
      'zh-hk': '處理行為準則舉報的內部執行程序。',
      'zh-hant': '處理行為準則舉報的內部執行程序。',
      'zh-hans': '处理行为准则举报的内部执行程序。',
      ja: '行動規範に関する報告を扱うための内部対応手順。',
    },
  },
] as const satisfies readonly {
  section: SiteSectionSlug;
  subsection: string;
  title: LocalizedValue<string>;
  blurb: LocalizedValue<string>;
}[];

export type SiteSubpage = (typeof siteSubpages)[number];

export function isSupportedSubpage(section: string, subsection: string): boolean {
  return siteSubpages.some(
    (entry) => entry.section === section && entry.subsection === subsection
  );
}

export function getSubpageCopy(
  section: SiteSectionSlug,
  subsection: string,
  locale: SiteLocale
) {
  const match = siteSubpages.find(
    (entry) => entry.section === section && entry.subsection === subsection
  );

  if (!match) {
    throw new Error(`Unsupported subpage: ${section}/${subsection}`);
  }

  return {
    title: resolveRequiredLocalizedValue(match.title as LocalizedValue<string>, locale),
    blurb: resolveRequiredLocalizedValue(match.blurb as LocalizedValue<string>, locale),
  };
}
