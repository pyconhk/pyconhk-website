import fs from 'node:fs/promises';
import path from 'node:path';
import conferenceArchiveLinks from '../src/legacy/conference-archive-links.json' with { type: 'json' };

const crawlRoot = '/Users/alexau/Downloads/simply-static-1-1779119343';
const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, 'src', 'years', '2018', 'data');
const assetRoot = path.join(projectRoot, 'src', 'years', '2018', 'assets', 'live');

const staticAssetSources = [
  {
    path: '/wp-content/plugins/all-in-one-seo-pack/dist/Lite/assets/css/table-of-contents/global.e90f6d47.css',
    contentType: 'text/css; charset=utf-8',
    rewriteCss: true,
  },
  {
    path: '/wp-content/plugins/wpnextpreviouslink/assets/css/wpnextpreviouslink-public.css',
    contentType: 'text/css; charset=utf-8',
    rewriteCss: true,
  },
  {
    path: '/wp-content/plugins/wpnextpreviouslink/assets/js/wpnextpreviouslink-public.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-content/themes/marketingly/css/font-awesome.min.css',
    contentType: 'text/css; charset=utf-8',
    rewriteCss: true,
  },
  {
    path: '/wp-content/themes/marketingly/js/accessibility.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-content/themes/marketingly/js/jquery.flexslider.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-content/themes/marketingly/js/navigation.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-content/themes/marketingly/js/script.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-content/themes/marketingly/style.css',
    contentType: 'text/css; charset=utf-8',
    rewriteCss: true,
  },
  {
    path: '/wp-includes/css/dist/block-library/style.min.css',
    contentType: 'text/css; charset=utf-8',
    rewriteCss: true,
  },
  {
    path: '/wp-includes/js/jquery/jquery-migrate.min.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-includes/js/jquery/jquery.min.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
  {
    path: '/wp-includes/js/wp-emoji-release.min.js',
    contentType: 'application/javascript; charset=utf-8',
    rewriteCss: false,
  },
];

const monthArchiveSources = ['08', '09', '10', '11'].map((month) => ({
  route: `/2018/${month}/`,
  sourceUrl: `https://legacy.pycon.hk/2018/${month}/`,
}));

const archivePaginationSources = [
  {
    route: '/2018/10/page/2/',
    sourceUrl: 'https://legacy.pycon.hk/2018/10/page/2/',
  },
];

function decodeHtml(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    copy: '(c)',
    gt: '>',
    hellip: '...',
    laquo: '<<',
    lt: '<',
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
    quot: '"',
    raquo: '>>',
    rsquo: "'",
  };

  return value
    .replace(/&#x([0-9a-f]+);/giu, (_match, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16))
    )
    .replace(/&#(\d+);/gu, (_match, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 10))
    )
    .replace(/&([a-z]+);/giu, (match, entity) => namedEntities[entity] ?? match);
}

function normalizeText(value) {
  return decodeHtml(value)
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function extractTitle(html) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu);
  return titleMatch ? normalizeText(titleMatch[1]) : '';
}

function extractMetaContent(html, selectorName, selectorValue) {
  const metaPattern = /<meta\b[^>]*>/giu;

  for (const match of html.matchAll(metaPattern)) {
    const tag = match[0];
    const selectorPattern = new RegExp(`${selectorName}=(["'])${selectorValue}\\1`, 'iu');
    const contentMatch = tag.match(/\scontent=(["'])([\s\S]*?)\1/iu);

    if (selectorPattern.test(tag) && contentMatch) {
      return normalizeText(contentMatch[2]);
    }
  }

  return '';
}

function extractDescription(html, visibleText) {
  return (
    extractMetaContent(html, 'name', 'description') ||
    extractMetaContent(html, 'property', 'og:description') ||
    visibleText.slice(0, 180)
  );
}

function normalizeRoute(route) {
  return route.endsWith('/') ? route : `${route}/`;
}

function routeOutputPath(route) {
  return route.replace(/^\/|\/$/gu, '').replace(/\//gu, '-') || '2018';
}

function isSkippableUrl(value) {
  return (
    !value ||
    value.startsWith('#') ||
    /^(?:data|javascript|mailto|tel):/iu.test(value)
  );
}

function rootPath(pathname) {
  return pathname === '' || pathname === '/';
}

function conferenceArchiveHrefForUrl(url) {
  if (url.hostname === ['2015', 'pycon', 'hk'].join('.') && rootPath(url.pathname)) {
    return `/2015/${url.hash}`;
  }

  if (!['legacy.pycon.hk', 'pycon.hk', 'www.pycon.hk'].includes(url.hostname)) {
    return undefined;
  }

  const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const archiveLink = conferenceArchiveLinks.find((link) => link.href === pathname);

  return archiveLink ? `${archiveLink.href}${url.hash}` : undefined;
}

function removeDirectionalControlMarkers(value) {
  return value
    .replace(/[\u202a-\u202e]/gu, '')
    .replace(/%E2%80%A[ACE]/giu, '');
}

function localPathForSameSiteUrl(url, pageRoutes) {
  if (url.pathname === '/category/2018/' || url.pathname === '/category/2018/page/1/') {
    return `/2018/${url.hash}`;
  }

  if (url.pathname === '/category/2018/page/2/') {
    return `/2018/page/2/${url.hash}`;
  }

  if (url.pathname === '/conference-highlights/2018-photos/') {
    return `/2018/photos/${url.hash}`;
  }

  if (url.pathname === '/2018/sessions-2018/') {
    return `/2018/schedule-2018/${url.hash}`;
  }

  if (/^\/2018\/(?:0[89]|1[01])\/page\/1\/$/u.test(url.pathname)) {
    return `${url.pathname.replace(/page\/1\/$/u, '')}${url.hash}`;
  }

  if (url.pathname === '/2018') {
    return `/2018/${url.hash}`;
  }

  if (url.pathname.startsWith('/2018/')) {
    const normalizedPath = normalizeRoute(url.pathname);

    if (pageRoutes.has(normalizedPath)) {
      return `${normalizedPath}${url.hash}`;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  }

  if (
    url.pathname.startsWith('/wp-content/') ||
    url.pathname.startsWith('/wp-includes/') ||
    url.pathname.startsWith('/cdn-cgi/')
  ) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function rewriteUrl(value, sourceUrl, pageRoutes) {
  const trimmed = value.trim();
  const cleaned = removeDirectionalControlMarkers(trimmed);

  if (trimmed !== value || isSkippableUrl(cleaned)) {
    return value;
  }

  let url;

  try {
    url = new URL(cleaned, sourceUrl);
  } catch {
    return value;
  }

  const archiveHref = conferenceArchiveHrefForUrl(url);

  if (archiveHref) {
    return archiveHref;
  }

  if (
    url.hostname === 'legacy.pycon.hk' ||
    url.hostname === 'pycon.hk' ||
    url.hostname === 'www.pycon.hk'
  ) {
    return localPathForSameSiteUrl(url, pageRoutes);
  }

  return url.href;
}

function rewriteSrcset(value, sourceUrl, pageRoutes) {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      const parts = trimmed.match(/^(\S+)(.*)$/su);

      if (!parts) {
        return '';
      }

      const [, url, descriptor] = parts;
      return `${rewriteUrl(url, sourceUrl, pageRoutes)}${descriptor}`;
    })
    .filter(Boolean)
    .join(', ');
}

function rewriteAttributeUrls(html, sourceUrl, pageRoutes) {
  return html
    .replace(
      /(\s)(href|src|poster|data-src|data-image-src|action)=(["'])([^"']+)\3/giu,
      (_attribute, prefix, name, quote, value) =>
        `${prefix}${name}=${quote}${rewriteUrl(value, sourceUrl, pageRoutes)}${quote}`
    )
    .replace(
      /(\s)srcset=(["'])([^"']+)\2/giu,
      (_attribute, prefix, quote, value) =>
        `${prefix}srcset=${quote}${rewriteSrcset(value, sourceUrl, pageRoutes)}${quote}`
    );
}

function stripCloudflareChallenge(html) {
  return html.replace(
    /<script>\(function\(\)\{function c\(\)\{[\s\S]*?challenge-platform[\s\S]*?<\/script>/giu,
    ''
  );
}

function repairHistoryLinks(html) {
  return html.replace(
    /(<section\b[^>]*>\s*<h3>History<\/h3>\s*)<p>[\s\S]*?<\/p>(\s*<\/section>)/u,
    (_match, prefix, suffix) => `${prefix}${historyLinksHtml()}${suffix}`
  );
}

function sanitizeHtml(html, sourceUrl, pageRoutes) {
  return repairHistoryLinks(
    rewriteAttributeUrls(stripCloudflareChallenge(html), sourceUrl, pageRoutes)
  );
}

async function readTextFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function readSourceHtml(source) {
  if (source.filePath) {
    return readTextFile(source.filePath);
  }

  const response = await fetch(source.sourceUrl);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${source.sourceUrl} returned ${response.status}`);
  }

  return text;
}

async function listPostSources() {
  const editionRoot = path.join(crawlRoot, '2018');
  const entries = await fs.readdir(editionRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      route: `/2018/${entry.name}/`,
      sourceUrl: `https://legacy.pycon.hk/2018/${entry.name}/`,
      filePath: path.join(editionRoot, entry.name, 'index.html'),
    }))
    .sort((left, right) => left.route.localeCompare(right.route));
}

async function buildPageSources() {
  return [
    {
      route: '/2018/',
      sourceUrl: 'https://legacy.pycon.hk/category/2018/',
      filePath: path.join(crawlRoot, 'category', '2018', 'index.html'),
    },
    {
      route: '/2018/page/2/',
      sourceUrl: 'https://legacy.pycon.hk/category/2018/page/2/',
      filePath: path.join(crawlRoot, 'category', '2018', 'page', '2', 'index.html'),
    },
    ...monthArchiveSources,
    ...archivePaginationSources,
    ...(await listPostSources()),
    {
      route: '/2018/photos/',
      sourceUrl: 'https://legacy.pycon.hk/conference-highlights/2018-photos/',
      filePath: path.join(crawlRoot, 'conference-highlights', '2018-photos', 'index.html'),
    },
  ];
}

async function generatePages(sources) {
  const pageRoutes = new Set(sources.map((source) => normalizeRoute(source.route)));
  const pages = [];

  for (const source of sources) {
    const rawHtml = await readSourceHtml(source);
    const fullHtml = sanitizeHtml(rawHtml, source.sourceUrl, pageRoutes);
    const visibleText = normalizeText(fullHtml);

    pages.push({
      route: normalizeRoute(source.route),
      sourceRoute: new URL(source.sourceUrl).pathname,
      sourceUrl: source.sourceUrl,
      title: extractTitle(rawHtml),
      description: extractDescription(rawHtml, visibleText),
      kind: 'html',
      capturedFile: `${routeOutputPath(source.route)}.html`,
      fullHtml,
      visibleText,
    });
  }

  return pages;
}

function extractUploadPaths(pages) {
  const uploads = new Set();
  const uploadPattern = /\/wp-content\/uploads\/[^"'\s<>)]+/giu;

  for (const page of pages) {
    for (const match of page.fullHtml.matchAll(uploadPattern)) {
      uploads.add(match[0].replace(/[?#].*$/u, ''));
    }
  }

  return [...uploads].sort();
}

async function copyFileIfExists(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function copyTree(source, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true });
}

async function copyAssets(pages) {
  await fs.rm(assetRoot, { recursive: true, force: true });

  for (const uploadPath of extractUploadPaths(pages)) {
    const source = path.join(crawlRoot, uploadPath);
    const destination = path.join(assetRoot, uploadPath);
    await copyFileIfExists(source, destination);
  }

  await copyTree(
    path.join(crawlRoot, 'wp-content', 'themes', 'marketingly', 'fonts'),
    path.join(assetRoot, 'wp-content', 'themes', 'marketingly', 'fonts')
  );
  await copyTree(
    path.join(crawlRoot, 'wp-content', 'themes', 'marketingly', 'icons'),
    path.join(assetRoot, 'wp-content', 'themes', 'marketingly', 'icons')
  );
  await copyTree(
    path.join(crawlRoot, 'wp-content', 'themes', 'marketingly', 'img'),
    path.join(assetRoot, 'wp-content', 'themes', 'marketingly', 'img')
  );
  await copyTree(
    path.join(crawlRoot, 'wp-content', 'plugins', 'wpnextpreviouslink', 'assets', 'images'),
    path.join(assetRoot, 'wp-content', 'plugins', 'wpnextpreviouslink', 'assets', 'images')
  );
}

async function readStaticAsset(asset) {
  const body = await readTextFile(path.join(crawlRoot, asset.path));

  return {
    ...asset,
    body,
  };
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

function historyLinksHtml() {
  return `<p>${conferenceArchiveLinks
    .map(({ href, shortLabel }, index) => {
      const breakBefore = index === 6 ? '<br>' : '';
      const separator = index === conferenceArchiveLinks.length - 1 ? '' : '  ';

      return `${breakBefore}<a href="${escapeHtml(href)}">${escapeHtml(shortLabel)}</a>${separator}`;
    })
    .join('')}</p>`;
}

function escapeHtml(value) {
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

async function writeDataFiles(pages) {
  await fs.mkdir(dataDir, { recursive: true });

  const pagesSource = `import type { Legacy2018Page } from './types';

export const legacy2018Pages = ${serialize(pages)} satisfies Legacy2018Page[];

const legacy2018PageByRoute = new Map(
  legacy2018Pages.map((page) => [page.route, page])
);

export function getLegacy2018Page(route: string): Legacy2018Page {
  const normalizedRoute = route.endsWith('/') ? route : \`\${route}/\`;
  const page = legacy2018PageByRoute.get(normalizedRoute);

  if (!page) {
    throw new Error(\`Missing PyCon HK 2018 page: \${route}\`);
  }

  return page;
}
`;

  const staticAssets = await Promise.all(staticAssetSources.map(readStaticAsset));
  const staticSource = `export interface Legacy2018StaticAsset {
  path: string;
  contentType: string;
  rewriteCss: boolean;
  body: string;
}

export const legacy2018StaticAssets = ${serialize(staticAssets)} satisfies Legacy2018StaticAsset[];

const legacy2018StaticAssetByPath = new Map(
  legacy2018StaticAssets.map((asset) => [asset.path, asset])
);

export function getLegacy2018StaticAsset(path: string): Legacy2018StaticAsset {
  const asset = legacy2018StaticAssetByPath.get(path);

  if (!asset) {
    throw new Error(\`Missing PyCon HK 2018 static asset: \${path}\`);
  }

  return asset;
}

export function getLegacy2018StaticAssetPaths(prefix: string): Legacy2018StaticAsset[] {
  return legacy2018StaticAssets.filter((asset) => asset.path.startsWith(prefix));
}
`;

  const routesSource = `${serialize({
    requiredRoutes: pages.map((page) => page.route).sort(),
    compatibilityRoutes: staticAssetSources.map((asset) => asset.path).sort(),
    migratedTopLevelRoutes: [
      { from: '/conference-highlights/2018-photos/', to: '/2018/photos' },
    ],
    wordpressAliases: [
      { from: '/2018/organisers/', to: '/2018/organisers-and-partners-2018' },
      { from: '/2018/sponsor/', to: '/2018/sponsors-2018' },
      { from: '/2018/sponsors/', to: '/2018/sponsors-2018' },
    ],
  })}
`;

  const typesSource = `export type Legacy2018PageKind = 'html';

export interface Legacy2018Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2018PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
`;

  await fs.writeFile(path.join(dataDir, 'pages.ts'), pagesSource);
  await fs.writeFile(path.join(dataDir, 'routes.json'), routesSource);
  await fs.writeFile(path.join(dataDir, 'static.ts'), staticSource);
  await fs.writeFile(path.join(dataDir, 'types.ts'), typesSource);
}

const sources = await buildPageSources();
const pages = await generatePages(sources);

await copyAssets(pages);
await writeDataFiles(pages);

console.log(`2018: ${pages.length} pages`);
