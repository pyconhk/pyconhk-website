import { type LegacyArchiveRecord, legacyArchives } from '@/legacy/legacy-indexes';

function legacyCategoryPath(year: string, pageNumber: number) {
  return pageNumber === 1
    ? `/category/${year}/`
    : `/category/${year}/page/${pageNumber}/`;
}

function yearArchivePath(year: string, pageNumber: number) {
  return pageNumber === 1 ? `/${year}/` : `/${year}/page/${pageNumber}/`;
}

function normalizeYearHref(href: string | undefined, year: string) {
  return href
    ?.replace(`/category/${year}/page/`, `/${year}/page/`)
    .replace(`/category/${year}/`, `/${year}/`);
}

export function getLegacyYearArchive(
  year: string,
  pageNumber = 1
): LegacyArchiveRecord {
  const path = legacyCategoryPath(year, pageNumber);
  const archive = legacyArchives.find((page) => page.path === path);

  if (!archive) {
    throw new Error(`Missing legacy year archive for ${path}`);
  }

  return {
    ...archive,
    label: year,
    path: yearArchivePath(year, pageNumber),
    title: year,
    pagination: archive.pagination
      .filter((item) => item.current || item.href)
      .map((item) => ({
        ...item,
        href: normalizeYearHref(item.href, year),
      })),
  };
}

export function getLegacyYearArchivePageNumbers(year: string) {
  const prefix = `/category/${year}/`;

  return legacyArchives
    .filter((page) => page.path === prefix || page.path.startsWith(`${prefix}page/`))
    .map((page) => page.pageNumber)
    .sort((a, b) => a - b);
}
