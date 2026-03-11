import type { SiteLocale } from '@/config/site';
import { createI18nHelpers, type TranslationCatalog } from '@/i18n/factory';
import enMessages from '@/years/2025/i18n/messages/en';
import jaMessages from '@/years/2025/i18n/messages/ja';
import type { TranslationMessages } from '@/years/2025/i18n/messages/schema';
import zhHansMessages from '@/years/2025/i18n/messages/zh-hans';
import zhHantMessages from '@/years/2025/i18n/messages/zh-hant';
import zhHkMessages from '@/years/2025/i18n/messages/zh-hk';

export const languages = {
  en: 'English',
  'zh-hk': '廣東話',
  'zh-hant': '繁體中文',
  'zh-hans': '简体中文',
  ja: '日本語',
} as const satisfies Record<SiteLocale, string>;

export const defaultLang = 'en' satisfies SiteLocale;

export const ui = {
  en: enMessages,
  ja: jaMessages,
  'zh-hans': zhHansMessages,
  'zh-hant': zhHantMessages,
  'zh-hk': zhHkMessages,
} as const satisfies TranslationCatalog<TranslationMessages>;

export const { getUiFromLang, getMessages, getTranslations, useTranslations } =
  createI18nHelpers(ui, defaultLang);

export type { TranslationMessages };
