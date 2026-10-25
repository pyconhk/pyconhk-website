import { getSocialImagePath, type SiteLocale } from '@/config/site';

export function normalizeNewsCoverImage(
  imagePath: string | undefined,
  collectionYear: number,
  locale: SiteLocale
): string {
  const fallbackPath =
    collectionYear === 2026
      ? getSocialImagePath(locale)
      : `/${collectionYear}/landing-pages/open-graph.webp`;

  if (!imagePath) {
    return fallbackPath;
  }

  if (imagePath.startsWith('/api/outstatic/media/')) {
    const publicIndex = imagePath.indexOf('/public/');

    if (publicIndex >= 0) {
      return imagePath.slice(publicIndex + '/public'.length);
    }

    return fallbackPath;
  }

  return imagePath;
}
