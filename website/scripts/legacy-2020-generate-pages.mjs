import fs from 'node:fs/promises';
import path from 'node:path';
import { decodeCloudflareProtectedEmails } from '../src/legacy/cloudflare-email.ts';
import conferenceArchiveLinks from '../src/legacy/conference-archive-links.json' with { type: 'json' };

const crawlRoot = '/Users/alexau/Downloads/simply-static-1-1779119343';
const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, 'src', 'years', '2020', 'data');
const assetRoot = path.join(projectRoot, 'src', 'years', '2020', 'assets', 'live');

const editions = [
  {
    slug: '2020-spring',
    categorySource: '/category/2020-spring/',
    photosSource: '/conference-highlights/2020-spring-photos/',
    photosFile: ['conference-highlights', '2020-spring-photos', 'index.html'],
    pathAliases: [
      {
        from: '/2020-spring/schedule-pycon-hk-2020-spring/',
        to: '/2020-spring/2020-spring-schedule/',
      },
    ],
  },
  {
    slug: '2020-fall',
    categorySource: '/category/2020-fall/',
    photosSource: '/conference-highlights/pycon-hk-2020-fall-photos/',
    photosFile: ['conference-highlights', 'pycon-hk-2020-fall-photos', 'index.html'],
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
  return route.replace(/^\/|\/$/gu, '').replace(/\//gu, '-') || '2020';
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

function decodePathname(pathname) {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

function conferenceArchiveHrefForUrl(url) {
  if (url.hostname === ['2015', 'pycon', 'hk'].join('.') && rootPath(url.pathname)) {
    return `/2015/${url.hash}`;
  }

  if (!['legacy.pycon.hk', 'pycon.hk', 'www.pycon.hk'].includes(url.hostname)) {
    return undefined;
  }

  const pathname = normalizeRoute(decodePathname(url.pathname));
  const archiveLink = conferenceArchiveLinks.find((link) => link.href === pathname);

  return archiveLink ? `${archiveLink.href}${url.hash}` : undefined;
}

function repairedMissingEditionSlashPath(pathname, pageRoutes) {
  for (const edition of editions) {
    const editionPrefix = `/${edition.slug}`;

    if (
      pathname.startsWith(editionPrefix) &&
      !pathname.startsWith(`${editionPrefix}/`)
    ) {
      const repairedPath = normalizeRoute(
        `${editionPrefix}/${pathname.slice(editionPrefix.length)}`
      );

      if (pageRoutes.has(repairedPath)) {
        return repairedPath;
      }
    }
  }

  return undefined;
}

function removeDirectionalControlMarkers(value) {
  return value
    .replace(/[\u202a-\u202e]/gu, '')
    .replace(/%E2%80%A[ACE]/giu, '');
}

function editionPathForSameSiteUrl(url, pageRoutes) {
  const pathname = decodePathname(url.pathname);
  const repairedPath = repairedMissingEditionSlashPath(pathname, pageRoutes);

  if (repairedPath) {
    return `${repairedPath}${url.search}${url.hash}`;
  }

  for (const edition of editions) {
    const category = edition.categorySource;
    const categoryPagePattern = new RegExp(
      `^/category/${edition.slug}/page/(\\d+)/$`,
      'u'
    );
    const categoryPage = pathname.match(categoryPagePattern);

    if (pathname === `/category/${edition.slug}/feed/`) {
      return `/${edition.slug}/${url.hash}`;
    }

    if (pathname === category || pathname === `/category/${edition.slug}/page/1/`) {
      return `/${edition.slug}/${url.hash}`;
    }

    if (categoryPage) {
      return `/${edition.slug}/page/${categoryPage[1]}/${url.hash}`;
    }

    if (pathname === edition.photosSource) {
      return `/${edition.slug}/photos/${url.hash}`;
    }

    const aliasPath = edition.pathAliases?.find(
      ({ from }) => normalizeRoute(from) === normalizeRoute(pathname)
    );

    if (aliasPath) {
      return `${normalizeRoute(aliasPath.to)}${url.hash}`;
    }

    if (pathname === `/${edition.slug}`) {
      return `/${edition.slug}/${url.hash}`;
    }

    if (pathname.startsWith(`/${edition.slug}/`)) {
      const normalizedPath = normalizeRoute(pathname);

      if (pageRoutes.has(normalizedPath)) {
        return `${normalizedPath}${url.hash}`;
      }

      return `${pathname}${url.search}${url.hash}`;
    }
  }

  return undefined;
}

function localPathForSameSiteUrl(url, pageRoutes) {
  const editionPath = editionPathForSameSiteUrl(url, pageRoutes);

  if (editionPath) {
    return editionPath;
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

function escapedPath(pathname) {
  return pathname.replaceAll('/', '\\/');
}

function repairEditionTextUrls(html) {
  let result = html;

  for (const edition of editions) {
    const replacements = [
      [`/category/${edition.slug}/feed/`, `/${edition.slug}/`],
      [`/category/${edition.slug}/page/1/`, `/${edition.slug}/`],
      [`/category/${edition.slug}/`, `/${edition.slug}/`],
      [edition.photosSource, `/${edition.slug}/photos/`],
      ...(edition.pathAliases ?? []).map(({ from, to }) => [from, to]),
    ];

    for (const [from, to] of replacements) {
      result = result.replaceAll(from, to).replaceAll(escapedPath(from), escapedPath(to));
    }
  }

  return result;
}

function isUrlLikeContentValue(value) {
  return /^(?:\/|https?:\/\/)/iu.test(value.trim());
}

function rewriteAttributeUrls(html, sourceUrl, pageRoutes) {
  return html
    .replace(
      /(\s)(href|src|poster|data-src|data-image-src|action)=(["'])([^"']+)\3/giu,
      (_attribute, prefix, name, quote, value) =>
        `${prefix}${name}=${quote}${rewriteUrl(value, sourceUrl, pageRoutes)}${quote}`
    )
    .replace(
      /(\s)content=(["'])([^"']+)\2/giu,
      (attribute, prefix, quote, value) =>
        isUrlLikeContentValue(value)
          ? `${prefix}content=${quote}${rewriteUrl(value, sourceUrl, pageRoutes)}${quote}`
          : attribute
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
  return decodeCloudflareProtectedEmails(
    repairHistoryLinks(
      repairEditionTextUrls(
        rewriteAttributeUrls(stripCloudflareChallenge(html), sourceUrl, pageRoutes)
      )
    )
  );
}

async function listPostSources(edition) {
  const editionRoot = path.join(crawlRoot, edition.slug);
  const entries = await fs.readdir(editionRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      route: `/${edition.slug}/${entry.name}/`,
      sourceUrl: `https://legacy.pycon.hk/${edition.slug}/${encodeURI(entry.name)}/`,
      filePath: path.join(editionRoot, entry.name, 'index.html'),
    }))
    .sort((left, right) => left.route.localeCompare(right.route));
}

async function buildEditionSources(edition) {
  return [
    {
      route: `/${edition.slug}/`,
      sourceUrl: `https://legacy.pycon.hk${edition.categorySource}`,
      filePath: path.join(crawlRoot, 'category', edition.slug, 'index.html'),
    },
    {
      route: `/${edition.slug}/page/2/`,
      sourceUrl: `https://legacy.pycon.hk/category/${edition.slug}/page/2/`,
      filePath: path.join(crawlRoot, 'category', edition.slug, 'page', '2', 'index.html'),
    },
    ...(await listPostSources(edition)),
    {
      route: `/${edition.slug}/photos/`,
      sourceUrl: `https://legacy.pycon.hk${edition.photosSource}`,
      filePath: path.join(crawlRoot, ...edition.photosFile),
    },
  ];
}

async function buildPageSources() {
  const nested = await Promise.all(editions.map(buildEditionSources));

  return nested.flat();
}

async function generatePages(sources) {
  const pageRoutes = new Set(sources.map((source) => normalizeRoute(source.route)));
  const pages = [];

  for (const source of sources) {
    const rawHtml = await fs.readFile(source.filePath, 'utf8');
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
    const searchableHtml = page.fullHtml.replace(/\\\//gu, '/');

    for (const match of searchableHtml.matchAll(uploadPattern)) {
      const uploadPath = match[0].replace(/[?#].*$/u, '');

      if (!uploadPath.includes('*')) {
        uploads.add(uploadPath);
      }
    }
  }

  return [...uploads].sort();
}

async function copyFileIfExists(source, destination) {
  try {
    await fs.access(source);
  } catch {
    return false;
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);

  return true;
}

async function copyAssets(pages) {
  await fs.rm(assetRoot, { recursive: true, force: true });

  const missing = [];

  for (const uploadPath of extractUploadPaths(pages)) {
    const source = path.join(crawlRoot, uploadPath);
    const destination = path.join(assetRoot, uploadPath);
    const copied = await copyFileIfExists(source, destination);

    if (!copied) {
      missing.push(uploadPath);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing 2020 upload assets:\n${missing.join('\n')}`);
  }
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

  const pagesSource = `import type { Legacy2020Page } from './types';

export const legacy2020Pages = ${serialize(pages)} satisfies Legacy2020Page[];

const legacy2020PageByRoute = new Map(
  legacy2020Pages.map((page) => [page.route, page])
);

export function getLegacy2020Page(route: string): Legacy2020Page {
  const normalizedRoute = route.endsWith('/') ? route : \`\${route}/\`;
  const page = legacy2020PageByRoute.get(normalizedRoute);

  if (!page) {
    throw new Error(\`Missing PyCon HK 2020 page: \${route}\`);
  }

  return page;
}
`;

  const routesSource = `${serialize({
    requiredRoutes: pages.map((page) => page.route).sort(),
    migratedTopLevelRoutes: [
      { from: '/conference-highlights/2020-spring-photos/', to: '/2020-spring/photos' },
      {
        from: '/conference-highlights/pycon-hk-2020-fall-photos/',
        to: '/2020-fall/photos',
      },
    ],
  })}
`;

  const typesSource = `export type Legacy2020PageKind = 'html';

export interface Legacy2020Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2020PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
`;

  await fs.writeFile(path.join(dataDir, 'pages.ts'), pagesSource);
  await fs.writeFile(path.join(dataDir, 'routes.json'), routesSource);
  await fs.writeFile(path.join(dataDir, 'types.ts'), typesSource);
}

const sources = await buildPageSources();
const pages = await generatePages(sources);

await copyAssets(pages);
await writeDataFiles(pages);

console.log(`2020: ${pages.length} pages`);
