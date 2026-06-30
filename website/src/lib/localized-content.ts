import { isSupportedLocale, type SiteLocale } from '@/config/site';

export type LocalizedContentExtension = 'md' | 'mdx';

export type ParsedLocalizedContentFilename = {
  slug: string;
  locale: SiteLocale | null;
  extension: LocalizedContentExtension;
  explicitLocale: boolean;
};

const yearPostsDirectoryPattern = /^(\d{4})-posts$/;
const explicitLocaleFilenamePattern =
  /^(?<slug>.+)\.(?<locale>en|zh-hk|zh-hant|zh-hans|ja)\.(?<extension>md|mdx)$/;

export function parseCollectionYearFromDirectoryName(
  directoryName: string
): number | null {
  const match = yearPostsDirectoryPattern.exec(directoryName);

  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function parseLocalizedContentFilename(
  filename: string
): ParsedLocalizedContentFilename | null {
  const explicitMatch = explicitLocaleFilenamePattern.exec(filename);

  if (explicitMatch?.groups) {
    const slug = explicitMatch.groups.slug?.trim();
    const locale = explicitMatch.groups.locale;
    const extension = explicitMatch.groups.extension as LocalizedContentExtension;

    if (!slug || !isSupportedLocale(locale)) {
      return null;
    }

    return {
      slug,
      locale,
      extension,
      explicitLocale: true,
    };
  }

  return null;
}
