import rawData from './legacy-indexes-data.json';

export interface LegacyImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface LegacyPaginationItem {
  label: string;
  href?: string;
  current: boolean;
  rel?: 'prev' | 'next';
}

export interface LegacyArchiveItem {
  title: string;
  href: string;
  date: string;
  isoDate: string;
  excerptHtml: string;
  image?: LegacyImage;
}

export interface LegacyHighlight {
  type: 'conference-highlight';
  path: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  isoDate: string;
  featuredImage?: LegacyImage;
  contentHtml: string;
}

export interface LegacyArchiveRecord {
  type: 'author' | 'category' | 'page' | 'tag';
  path: string;
  slug: string;
  title: string;
  label: string;
  pageNumber: number;
  description: string;
  items: LegacyArchiveItem[];
  pagination: LegacyPaginationItem[];
}

interface LegacyIndexesData {
  highlights: LegacyHighlight[];
  archives: LegacyArchiveRecord[];
}

const data = rawData as LegacyIndexesData;

export const legacyHighlights = data.highlights;
export const legacyArchives = data.archives;

export function pageTitle(title: string) {
  return `${title} | PyCon HK`;
}
