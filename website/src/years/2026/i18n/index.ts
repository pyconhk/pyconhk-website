import type { SiteLocale } from '@/config/site';
import type { CfpLocale } from '@/years/2026/locales';
import { en } from './messages/en';
import { ja } from './messages/ja';
import { ko } from './messages/ko';
import { zhHans } from './messages/zh-hans';
import { zhHant } from './messages/zh-hant';
import { zhHk } from './messages/zh-hk';
import type { HomeMessages, TranslationMessages } from './schema';

export type AppLocale = SiteLocale | CfpLocale;

const translations: Record<AppLocale, TranslationMessages> = {
  en: { home: en },
  'zh-hk': { home: zhHk },
  'zh-hant': { home: zhHant },
  'zh-hans': { home: zhHans },
  ja: { home: ja },
  ko: { home: ko },
};

export function getTranslations(
  locale: string | undefined,
  _section: 'home' = 'home'
): HomeMessages {
  const normalized = (locale ?? 'en') as AppLocale;
  const match = translations[normalized]?.home;
  if (match) {
    return match;
  }
  if (normalized === 'zh-hant') return zhHant;
  if (normalized === 'zh-hans') return zhHans;
  if (normalized === 'zh-hk') return zhHk;
  if (normalized === 'ja') return ja;
  if (normalized === 'ko') return ko;
  return en;
}
