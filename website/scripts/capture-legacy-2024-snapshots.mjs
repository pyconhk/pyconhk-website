import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceBaseUrl = process.env.LEGACY_2024_SOURCE_URL ?? 'https://pycon.hk';
const outputDirectory = path.resolve('src/years/2024/data/snapshots');
const snapshots = [
  ['archive-page-1.html', '/2024/', '<title>2024 - PyCon HK</title>'],
  ['archive-month-04.html', '/2024/04/', '<title>April, 2024 - PyCon HK</title>'],
  ['archive-month-07.html', '/2024/07/', '<title>July, 2024 - PyCon HK</title>'],
  ['archive-month-09.html', '/2024/09/', '<title>September, 2024 - PyCon HK</title>'],
  ['archive-month-10.html', '/2024/10/', '<title>October, 2024 - PyCon HK</title>'],
  ['archive-month-11.html', '/2024/11/', '<title>November, 2024 - PyCon HK</title>'],
  [
    'photos.html',
    '/conference-highlights/pycon-hk-2024-photos/',
    '<title>PyCon HK 2024 Photos - PyCon HK</title>',
  ],
];

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  snapshots.map(async ([filename, pathname, expectedTitle]) => {
    const url = new URL(pathname, sourceBaseUrl);
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      throw new Error(`Failed to capture ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    if (!html.includes(expectedTitle)) {
      throw new Error(`Unexpected document captured from ${url}; missing ${expectedTitle}`);
    }

    await writeFile(path.join(outputDirectory, filename), html.replace(/[ \t]+$/gmu, ''));
    console.log(`Captured ${url} as ${filename}`);
  }),
);
