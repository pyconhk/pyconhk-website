import en from '../../outstatic/content/2026-conference/settings.en.json';
import ja from '../../outstatic/content/2026-conference/settings.ja.json';
import ko from '../../outstatic/content/2026-conference/settings.ko.json';
import zhHans from '../../outstatic/content/2026-conference/settings.zh-hans.json';
import zhHant from '../../outstatic/content/2026-conference/settings.zh-hant.json';
import zhHk from '../../outstatic/content/2026-conference/settings.zh-hk.json';
import {
  type ConferenceContent,
  type ConferenceLocale,
  conferenceLocales,
  parseConferenceContent,
  validateConferenceTranslations,
} from './conference-schema';

export type {
  ConferenceContent,
  ConferenceLocale,
  ConferenceSection,
} from './conference-schema';

const sources = { en, 'zh-hk': zhHk, 'zh-hant': zhHant, 'zh-hans': zhHans, ja, ko };
const contentByLocale = Object.fromEntries(
  conferenceLocales.map((locale) => [
    locale,
    parseConferenceContent(sources[locale], locale),
  ])
) as Record<ConferenceLocale, ConferenceContent>;

validateConferenceTranslations(contentByLocale);

export function getConferenceContent(locale: ConferenceLocale): ConferenceContent {
  return contentByLocale[locale];
}
