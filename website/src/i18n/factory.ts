import { getLocaleFallbackChain, type SiteLocale } from '@/config/site';

export type TranslationCatalog<TMessages> = Readonly<
  Partial<Record<SiteLocale, TMessages>>
>;

function getValueByPath(value: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((currentValue, part) => {
    if (typeof currentValue !== 'object' || currentValue === null) {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[part];
  }, value);
}

export function createI18nHelpers<
  TMessages extends Record<string, Record<string, unknown>>,
>(ui: TranslationCatalog<TMessages>, defaultLang: SiteLocale) {
  type TranslationNamespace = keyof TMessages;
  type TranslationKey<TNamespace extends TranslationNamespace> = Extract<
    keyof TMessages[TNamespace],
    string
  >;

  function getUiFromLang(lang: SiteLocale): TMessages {
    for (const candidate of getLocaleFallbackChain(lang)) {
      const match = ui[candidate];

      if (match) {
        return match;
      }
    }

    const fallbackMessages = ui[defaultLang];

    if (!fallbackMessages) {
      throw new Error(`Missing default translation catalog for locale: ${defaultLang}`);
    }

    return fallbackMessages;
  }

  function getMessages<TNamespace extends TranslationNamespace>(
    lang: SiteLocale,
    namespace: TNamespace
  ): TMessages[TNamespace] {
    return getUiFromLang(lang)[namespace];
  }

  function getTranslations<TNamespace extends TranslationNamespace>(
    lang: SiteLocale,
    namespace: TNamespace
  ): (key: TranslationKey<TNamespace>) => string {
    const messages = getMessages(lang, namespace);

    return (key: TranslationKey<TNamespace>): string => {
      const value = messages[key];

      if (typeof value !== 'string') {
        throw new Error(
          `Missing translation for ${lang}.${String(namespace)}.${String(key)}`
        );
      }

      return value;
    };
  }

  function useTranslations(lang: SiteLocale): (key: string) => string {
    const dictionary = getUiFromLang(lang);

    return (key: string): string => {
      const value = getValueByPath(dictionary, key);

      if (typeof value !== 'string') {
        throw new Error(`Missing translation for ${lang}.${key}`);
      }

      return value;
    };
  }

  return {
    getUiFromLang,
    getMessages,
    getTranslations,
    useTranslations,
  };
}
