import en from '../../outstatic/content/2026-sprint/settings.en.json';
import ja from '../../outstatic/content/2026-sprint/settings.ja.json';
import ko from '../../outstatic/content/2026-sprint/settings.ko.json';
import zhHans from '../../outstatic/content/2026-sprint/settings.zh-hans.json';
import zhHant from '../../outstatic/content/2026-sprint/settings.zh-hant.json';
import zhHk from '../../outstatic/content/2026-sprint/settings.zh-hk.json';
import {
  parseSprintContent,
  type SprintContent,
  type SprintLocale,
  sprintLocales,
  validateSprintTranslations,
} from './sprint-content';

const sources = { en, 'zh-hk': zhHk, 'zh-hant': zhHant, 'zh-hans': zhHans, ja, ko };
const contents = Object.fromEntries(
  sprintLocales.map((locale) => [locale, parseSprintContent(sources[locale], locale)])
) as Record<SprintLocale, SprintContent>;
validateSprintTranslations(contents);

export function getSprintContent(locale: SprintLocale): SprintContent {
  return contents[locale];
}
