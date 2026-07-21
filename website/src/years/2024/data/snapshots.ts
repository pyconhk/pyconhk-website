import archiveMonth04Html from './snapshots/archive-month-04.html?raw';
import archiveMonth07Html from './snapshots/archive-month-07.html?raw';
import archiveMonth09Html from './snapshots/archive-month-09.html?raw';
import archiveMonth10Html from './snapshots/archive-month-10.html?raw';
import archiveMonth11Html from './snapshots/archive-month-11.html?raw';
import archivePage1Html from './snapshots/archive-page-1.html?raw';
import photosHtml from './snapshots/photos.html?raw';

export interface Legacy2024SnapshotPage {
  fullHtml: string;
  title: string;
  url: string;
}

export const legacy2024ArchivePage: Legacy2024SnapshotPage = {
  fullHtml: archivePage1Html,
  title: '2024 News',
  url: '/2024/news/',
};

export const legacy2024SearchPage: Legacy2024SnapshotPage = {
  fullHtml: archivePage1Html,
  title: 'Search - PyCon HK 2024',
  url: '/2024/search/',
};

export const legacy2024MonthPages: Record<string, Legacy2024SnapshotPage> = {
  '04': {
    fullHtml: archiveMonth04Html,
    title: 'April, 2024',
    url: '/2024/04/',
  },
  '07': {
    fullHtml: archiveMonth07Html,
    title: 'July, 2024',
    url: '/2024/07/',
  },
  '09': {
    fullHtml: archiveMonth09Html,
    title: 'September, 2024',
    url: '/2024/09/',
  },
  '10': {
    fullHtml: archiveMonth10Html,
    title: 'October, 2024',
    url: '/2024/10/',
  },
  '11': {
    fullHtml: archiveMonth11Html,
    title: 'November, 2024',
    url: '/2024/11/',
  },
};

export const legacy2024PhotosPage: Legacy2024SnapshotPage = {
  fullHtml: photosHtml,
  title: 'PyCon HK 2024 Photos',
  url: '/2024/photos/',
};
