import { archiveMonths } from '@/legacy/archive-months';
import { canonicalLegacyHref } from '@/legacy/legacy-html';
import {
  type LegacyArchiveItem,
  type LegacyArchiveRecord,
  type LegacyPaginationItem,
  legacyArchives,
} from '@/legacy/legacy-indexes';
import { canonicalLegacyHighlights } from '@/legacy/year-highlights';

const legacy2018PageTwoLiveExtraTitle = 'Code of Conduct – As of 2024';
const legacy2023PageTwoLiveInsertTitles = [
  'Enforcement Procedures – As of 2024',
  'Procedures for Reporting Incidents – As of 2024',
];
const legacy2023PageTwoHiddenTitles = [
  'Enforcement Procedures – As of 2023',
  'Code of Conduct – As of 2023',
];
const legacy2023PageThreeTitles = legacy2023PageTwoHiddenTitles;
const archivePageSize = 21;

function legacyCategoryPath(year: string, pageNumber: number) {
  return pageNumber === 1
    ? `/category/${year}/`
    : `/category/${year}/page/${pageNumber}/`;
}

function yearArchivePath(year: string, pageNumber: number) {
  return pageNumber === 1 ? `/${year}/` : `/${year}/page/${pageNumber}/`;
}

function yearArchivePaginationPath(year: string, pageNumber: number) {
  return `/${year}/page/${pageNumber}/`;
}

function editionArchivePath(edition: string, pageNumber: number) {
  return pageNumber === 1 ? `/${edition}/` : `/${edition}/page/${pageNumber}/`;
}

function normalizeYearHref(href: string | undefined, year: string) {
  return href
    ?.replace(`/category/${year}/page/`, `/${year}/page/`)
    .replace(`/category/${year}/`, `/${year}/page/1/`);
}

function normalizeEditionHref(href: string | undefined, edition: string) {
  return href
    ?.replace(`/category/${edition}/page/`, `/${edition}/page/`)
    .replace(`/category/${edition}/`, `/${edition}/`);
}

function archiveItemTimestamp(item: LegacyArchiveItem) {
  return new Date(item.isoDate).getTime();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}

function archiveItemFromHighlight(
  highlight: (typeof canonicalLegacyHighlights)[number]
): LegacyArchiveItem {
  return {
    title: highlight.page.title,
    href: highlight.path,
    date: highlight.page.date,
    isoDate: highlight.page.isoDate,
    excerptHtml: highlight.page.description
      ? `<p>${escapeHtml(highlight.page.description)}</p>`
      : '',
    image: highlight.page.featuredImage,
  };
}

function allLegacyArchiveItems() {
  const items = new Map<string, LegacyArchiveItem>();

  for (const item of [
    ...legacyArchives.flatMap((archive) => archive.items),
    ...canonicalLegacyHighlights.map(archiveItemFromHighlight),
  ]) {
    const href = canonicalLegacyHref(item.href);
    const key = href.endsWith('/') ? href.slice(0, -1) : href;

    items.set(key, {
      ...item,
      href,
    });
  }

  return [...items.values()].toSorted(
    (a, b) => archiveItemTimestamp(b) - archiveItemTimestamp(a)
  );
}

function paginationItem(
  label: string,
  href: string | undefined,
  current = false,
  rel?: 'prev' | 'next'
): LegacyPaginationItem {
  return { label, href, current, rel };
}

function combined2020Items() {
  const yearItems = legacyArchives
    .filter(
      (page) =>
        page.path.startsWith('/category/2020-fall/') ||
        page.path.startsWith('/category/2020-spring/')
    )
    .flatMap((page) => page.items);
  const conferenceHighlights = legacyArchives.find(
    (page) => page.path === '/category/conference-highlights/'
  );
  const coverage = conferenceHighlights?.items.find(
    (item) => item.title === 'Conference Coverage'
  );

  if (!coverage) {
    throw new Error('Missing live 2020 conference coverage archive item.');
  }

  return [...yearItems, coverage].toSorted(
    (a, b) => archiveItemTimestamp(b) - archiveItemTimestamp(a)
  );
}

function combined2020Pagination(pageNumber: number, totalPages: number) {
  const items: LegacyPaginationItem[] = [];

  if (pageNumber > 1) {
    items.push(
      paginationItem(
        'Previous',
        yearArchivePaginationPath('2020', pageNumber - 1),
        false,
        'prev'
      )
    );
  }

  for (let index = 1; index <= totalPages; index += 1) {
    items.push(
      paginationItem(
        String(index),
        index === pageNumber ? undefined : yearArchivePaginationPath('2020', index),
        index === pageNumber
      )
    );
  }

  if (pageNumber < totalPages) {
    items.push(
      paginationItem(
        'Next',
        yearArchivePaginationPath('2020', pageNumber + 1),
        false,
        'next'
      )
    );
  }

  return items;
}

function getCombined2020Archive(pageNumber: number): LegacyArchiveRecord {
  const items = combined2020Items();
  const totalPages = Math.ceil(items.length / archivePageSize);

  if (pageNumber < 1 || pageNumber > totalPages) {
    throw new Error(`Missing legacy year archive for /2020/page/${pageNumber}/`);
  }

  return {
    type: 'category',
    path: yearArchivePath('2020', pageNumber),
    slug: '2020',
    title: '2020',
    label: '2020',
    pageNumber,
    description: pageNumber > 1 ? `- Page ${pageNumber}` : '',
    items: items.slice(
      (pageNumber - 1) * archivePageSize,
      pageNumber * archivePageSize
    ),
    pagination: combined2020Pagination(pageNumber, totalPages),
  };
}

function live2023Pagination(pageNumber: number) {
  const totalPages = 3;
  const items: LegacyPaginationItem[] = [];

  if (pageNumber > 1) {
    items.push(
      paginationItem(
        'Previous',
        yearArchivePaginationPath('2023', pageNumber - 1),
        false,
        'prev'
      )
    );
  }

  for (let index = 1; index <= totalPages; index += 1) {
    items.push(
      paginationItem(
        String(index),
        index === pageNumber ? undefined : yearArchivePaginationPath('2023', index),
        index === pageNumber
      )
    );
  }

  if (pageNumber < totalPages) {
    items.push(
      paginationItem(
        'Next',
        yearArchivePaginationPath('2023', pageNumber + 1),
        false,
        'next'
      )
    );
  }

  return items;
}

function getLive2023PageThreeArchive(): LegacyArchiveRecord {
  return {
    type: 'category',
    path: yearArchivePath('2023', 3),
    slug: '2023',
    title: '2023',
    label: '2023',
    pageNumber: 3,
    description: '- Page 3',
    items: legacy2023PageThreeTitles.map(findArchiveItem),
    pagination: live2023Pagination(3),
  };
}

function findArchiveItem(title: string) {
  const item = legacyArchives
    .flatMap((page) => page.items)
    .find((item) => item.title === title);

  if (!item) {
    throw new Error(`Missing live archive item: ${title}`);
  }

  return item;
}

function live2018PageTwoItems(items: LegacyArchiveItem[]) {
  const hasLiveExtra = items.some(
    (item) => item.title === legacy2018PageTwoLiveExtraTitle
  );

  if (hasLiveExtra) {
    return items;
  }

  const liveExtra = findArchiveItem(legacy2018PageTwoLiveExtraTitle);
  const insertIndex = items.findIndex(
    (item) => item.title === 'Call for Sponsorship 2018'
  );
  const liveItems = [...items];
  liveItems.splice(insertIndex >= 0 ? insertIndex : liveItems.length, 0, liveExtra);

  return liveItems;
}

function live2023PageTwoItems(items: LegacyArchiveItem[]) {
  const visibleItems = items.filter(
    (item) => !legacy2023PageTwoHiddenTitles.includes(item.title)
  );
  const insertIndex =
    visibleItems.findIndex((item) => item.title === 'COVID Policy') + 1;
  const liveItems = [...visibleItems];

  liveItems.splice(
    insertIndex > 0 ? insertIndex : liveItems.length,
    0,
    ...legacy2023PageTwoLiveInsertTitles.map(findArchiveItem)
  );

  return liveItems;
}

function liveYearArchiveItems(archive: LegacyArchiveRecord, year: string) {
  if (year === '2018' && archive.pageNumber === 2) {
    return live2018PageTwoItems(archive.items);
  }

  if (year === '2023' && archive.pageNumber === 2) {
    return live2023PageTwoItems(archive.items);
  }

  return archive.items;
}

function liveYearArchivePagination(archive: LegacyArchiveRecord, year: string) {
  if (year === '2023') {
    return live2023Pagination(archive.pageNumber);
  }

  if (year === '2024') {
    return [];
  }

  return archive.pagination
    .filter((item) => item.current || item.href)
    .map((item) => ({
      ...item,
      href: normalizeYearHref(item.href, year),
    }));
}

export function getLegacyYearArchive(
  year: string,
  pageNumber = 1
): LegacyArchiveRecord {
  if (year === '2020') {
    return getCombined2020Archive(pageNumber);
  }

  if (year === '2023' && pageNumber === 3) {
    return getLive2023PageThreeArchive();
  }

  if (year === '2024' && pageNumber > 1) {
    throw new Error(`Missing live legacy year archive for /2024/page/${pageNumber}/`);
  }

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
    items: liveYearArchiveItems(archive, year),
    pagination: liveYearArchivePagination(archive, year),
  };
}

export function getLegacyYearArchivePageNumbers(year: string) {
  if (year === '2020') {
    const totalPages = Math.ceil(combined2020Items().length / archivePageSize);

    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (year === '2023') {
    return [1, 2, 3];
  }

  if (year === '2024') {
    return [1];
  }

  const prefix = `/category/${year}/`;

  return legacyArchives
    .filter((page) => page.path === prefix || page.path.startsWith(`${prefix}page/`))
    .map((page) => page.pageNumber)
    .sort((a, b) => a - b);
}

export function getLegacyArchiveMonth(
  year: string,
  month: string
): LegacyArchiveRecord {
  const archiveMonth = archiveMonths.find(
    (item) => item.year === year && item.month === month
  );

  if (!archiveMonth) {
    throw new Error(`Missing configured archive month for /${year}/${month}/`);
  }

  const items = allLegacyArchiveItems().filter((item) =>
    item.isoDate.startsWith(`${year}-${month}-`)
  );

  if (items.length === 0) {
    throw new Error(`Missing legacy archive items for /${year}/${month}/`);
  }

  return {
    type: 'category',
    path: `/${year}/${month}/`,
    slug: `${year}-${month}`,
    title: archiveMonth.label,
    label: archiveMonth.label,
    pageNumber: 1,
    description: `PyCon HK ${archiveMonth.label} archive.`,
    items,
    pagination: [],
  };
}

export function getLegacyEditionArchive(
  edition: string,
  pageNumber = 1
): LegacyArchiveRecord {
  const path = legacyCategoryPath(edition, pageNumber);
  const archive = legacyArchives.find((page) => page.path === path);

  if (!archive) {
    throw new Error(`Missing legacy edition archive for ${path}`);
  }

  return {
    ...archive,
    path: editionArchivePath(edition, pageNumber),
    pagination: archive.pagination
      .filter((item) => item.current || item.href)
      .map((item) => ({
        ...item,
        href: normalizeEditionHref(item.href, edition),
      })),
  };
}

export function getLegacyEditionArchivePageNumbers(edition: string) {
  const prefix = `/category/${edition}/`;

  return legacyArchives
    .filter((page) => page.path === prefix || page.path.startsWith(`${prefix}page/`))
    .map((page) => page.pageNumber)
    .sort((a, b) => a - b);
}
