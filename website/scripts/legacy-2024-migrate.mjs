import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { decodeCloudflareProtectedEmails } from '../src/legacy/cloudflare-email.ts';

const sourceBaseUrl = process.env.LEGACY_2024_SOURCE_URL ?? 'https://pycon.hk';
const sourceRoot = process.env.LEGACY_2024_SOURCE_ROOT ?? '/Users/alexau/Downloads/pycon.hk';
const fallbackSourceRoot = process.env.LEGACY_2024_FALLBACK_ROOT ?? '/Users/alexau/Downloads/simply-static-1-1779119343';
const repoRoot = process.cwd();
const dataFile = path.join(repoRoot, 'src/years/2024/data/pages.ts');
const sourceUploadsRoot = path.join(sourceRoot, 'wp-content/uploads');
const publicUploadsRoot = path.join(repoRoot, 'public/legacy-wp/uploads');
const legacyNestedUploads = path.join(repoRoot, 'public/legacy-wp/2024');
const legacySharedAssetRoot = path.join(repoRoot, 'src/legacy/assets/legacy-assets');
const uploadYears = ['2024', '2025'];
const voyagoThemeAssets = [
  'https://pycon.hk/wp-content/themes/voyago/assets/css/block.css?ver=1.0',
  'https://pycon.hk/wp-content/themes/voyago/style.css?ver=1.0.2',
  'https://pycon.hk/wp-content/themes/voyago/assets/css/style.css?ver=1.0.2',
  'https://pycon.hk/wp-content/themes/voyago/assets/fonts/Montserrat.woff2',
  'https://pycon.hk/wp-content/themes/voyago/assets/js/custom-animations.js?ver=1.0.2',
];
const wordpressCoreAssets = [
  'https://pycon.hk/wp-includes/blocks/gallery/style.min.css?ver=6.8.2',
  'https://pycon.hk/wp-includes/blocks/image/style.min.css?ver=6.8.2',
  'https://pycon.hk/wp-includes/blocks/navigation/style.min.css?ver=6.8.2',
  'https://pycon.hk/wp-includes/blocks/social-links/style.min.css?ver=6.8.2',
  'https://pycon.hk/wp-includes/blocks/table/style.min.css?ver=6.8.2',
  'https://pycon.hk/wp-includes/js/dist/script-modules/block-library/navigation/view.min.js?ver=61572d447d60c0aa5240',
  'https://pycon.hk/wp-includes/js/dist/script-modules/interactivity/index.min.js?ver=55aebb6e0a16726baffb',
];
const wordpressPluginAssets = [
  'https://pycon.hk/wp-content/plugins/content-control/dist/style-block-editor.css',
  'https://pycon.hk/wp-content/plugins/duracelltomi-google-tag-manager/dist/js/analytics-talk-content-tracking.js',
  'https://pycon.hk/wp-content/plugins/mp-timetable/media/css/style.css',
  'https://pycon.hk/wp-content/plugins/wpnextpreviouslink/assets/images/l_arrow.png',
  'https://pycon.hk/wp-content/plugins/wpnextpreviouslink/assets/images/r_arrow.png',
];
const extraPagePaths = [
  '/2024/2024-code-of-conduct',
  '/2024/2024-staff-procedure',
  '/2024/2024-attendee-reporting',
];
const localSlugAliases = new Map([
  ['access-guide-conference-day', '2024-access-guide-conference-day'],
  ['access-guide-development-sprint-day', '2024-access-guide-development-sprint-day'],
  ['organizers', '2024-organizers'],
  ['patrons', '2024-patrons'],
  ['pycon-sprint-qna', '2024-pycon-sprint-qna'],
  ['sponsors', '2024-sponsors'],
  ['sprint', '2024-sprint'],
  ['supporting-organizations', '2024-supporting-organizations'],
  ['volunteers', '2024-volunteers'],
  ['2024-2024-about', '2024-about'],
  ['2024-2024-agenda', '2024-agenda'],
  ['2024-2024-booths', '2024-booths'],
  ['2024-discover-the-latest-in-python-at-our-recent-events-and-pycon-hk-2024', 'discover-the-latest-in-python-at-our-recent-events-and-pycon-hk-2024'],
  ['2024-important-notice-about-sprint-day', 'important-notice-about-sprint-day'],
  ['2024-pycon-hk-2024-call-for-proposal', 'pycon-hk-2024-call-for-proposal'],
  ['2024-pycon-hk-2024-celebrate-10-years-of-pycon-in-hong-kong-a-decade-of-achievements-recharged', 'pycon-hk-2024-celebrate-10-years-of-pycon-in-hong-kong-a-decade-of-achievements-recharged'],
  ['2024-pycon-hk-2024-join-us-on-november-16-for-an-exciting-python-community-event', 'pycon-hk-2024-join-us-on-november-16-for-an-exciting-python-community-event'],
  ['2024-pycon-hk-2024-pre-event-notice', 'pycon-hk-2024-pre-event-notice'],
  ['2024-python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup', 'python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-🎃🐍'],
  ['post-2563', '2024-agenda'],
  ['post-2582', '2024-organizers'],
  ['post-2683', '2024-supporting-organizations'],
  ['post-3232', '2024-sprint'],
  ['post-3597', '2024-patrons'],
  ['post-3601', '2024-access-guide-conference-day'],
  ['post-3620', '2024-access-guide-development-sprint-day'],
]);

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '...',
    laquo: '<<',
    ldquo: '"',
    lsquo: "'",
    mdash: '-',
    nbsp: ' ',
    ndash: '-',
    quot: '"',
    raquo: '>>',
    rdquo: '"',
    rsquo: "'",
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function matchFirst(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return '';
}

function extractElementByClass(html, tagName, className) {
  const startPattern = new RegExp(`<${tagName}\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const startMatch = html.match(startPattern);
  if (startMatch?.index === undefined) {
    return '';
  }

  const bodyStart = startMatch.index + startMatch[0].length;
  const tagPattern = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = bodyStart;
  let depth = 1;
  let match;

  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(bodyStart, match.index).trim();
      }
    } else {
      depth += 1;
    }
  }

  return '';
}

function sourceUrl(pathname) {
  return new URL(pathname, sourceBaseUrl).toString();
}

function normalizeInternalUrl(url, baseUrl = sourceUrl('/2024/')) {
  if (!url || /^(?:#|data:|mailto:|tel:|javascript:)/iu.test(url)) {
    return url;
  }

  url = url.replace(/^\.\/\//u, '/');

  if (url.startsWith('/legacy-wp/uploads/')) {
    return url;
  }

  let parsed;

  try {
    parsed = new URL(url, baseUrl);
  } catch {
    return url;
  }

  const sourceHost = new URL(sourceBaseUrl).hostname;
  const localHosts = new Set([sourceHost, 'localhost', '127.0.0.1', 'pycon.hk', 'www.pycon.hk', 'legacy.pycon.hk']);

  if (!localHosts.has(parsed.hostname)) {
    return url;
  }

  const suffix = `${parsed.search}${parsed.hash}`;
  const pathname = parsed.pathname;

  if (pathname.startsWith('/2024/wp-content/uploads/')) {
    return `/legacy-wp/uploads/${pathname.slice('/2024/wp-content/uploads/'.length)}${suffix}`;
  }

  if (pathname.startsWith('/2024/wp-content/')) {
    return `/wp-content/${pathname.slice('/2024/wp-content/'.length)}${suffix}`;
  }

  if (pathname.startsWith('/2024/wp-includes/')) {
    return `/wp-includes/${pathname.slice('/2024/wp-includes/'.length)}${suffix}`;
  }

  if (pathname.startsWith('/wp-content/uploads/')) {
    return `/legacy-wp/uploads/${pathname.slice('/wp-content/uploads/'.length)}${suffix}`;
  }

  if (
    pathname.startsWith('/wp-content/themes/voyago/') ||
    pathname.startsWith('/wp-content/plugins/') ||
    pathname.startsWith('/wp-includes/')
  ) {
    return `${pathname}${suffix}`;
  }

  if (pathname === '/feed/' || pathname === '/comments/feed/') {
    return `https://pycon.hk${pathname}${suffix}`;
  }

  const canonicalRoute = canonicalRouteForPath(pathname);
  if (canonicalRoute) {
    return `${canonicalRoute}${suffix}`;
  }

  if (localArchivePath(pathname)) {
    return `${normalizeLocalPath(pathname)}${suffix}`;
  }

  return url;
}

function canonicalRouteForPath(pathname) {
  const normalizedPath = normalizePathname(pathname).replace(
    /^\/2024\/2024\//u,
    '/2024/'
  );

  if (
    normalizedPath === '/conference-highlights/pycon-hk-2024-photos' ||
    normalizedPath === '/2024/conference-highlights/pycon-hk-2024-photos'
  ) {
    return '/2024/photos/';
  }

  if (
    normalizedPath === '' ||
    normalizedPath === '/' ||
    normalizedPath === '/2024' ||
    normalizedPath === '/category/2024' ||
    normalizedPath === '/category/2024/page/1'
  ) {
    return '/2024/';
  }

  const encodedLocalSlug = normalizedPath.startsWith('/2024/')
    ? normalizedPath.slice('/2024/'.length)
    : normalizedPath.slice(1);
  const localSlug = decodeURIComponent(encodedLocalSlug);
  const canonicalSlug = localSlugAliases.get(localSlug) ?? localSlug;

  if (/^2024\/(?:04|07|09|10|11)$/u.test(canonicalSlug)) {
    return `/${canonicalSlug}/`;
  }

  if (!canonicalSlug || canonicalSlug.includes('/')) {
    return undefined;
  }

  if (canonicalSlug === '2024') {
    return '/2024/';
  }

  return `/2024/${canonicalSlug}/`;
}

function normalizePathname(pathname) {
  let next = pathname.replace(/\/index\.html$/iu, '');

  if (next.length > 1) {
    next = next.replace(/\/$/u, '');
  }

  return next;
}

function canonicalSlugForPath(pathname) {
  const route = canonicalRouteForPath(pathname);
  const match = route?.match(/^\/2024\/([^/]+)\/$/u);

  return match?.[1];
}

function localArchivePath(pathname) {
  return /^\/(?:2015|2016|2017|2018|2020|2020-spring|2020-fall|2021|2022|2023|2024|2025|2026)(?:\/|$)/u.test(
    pathname,
  );
}

function normalizeLocalPath(pathname) {
  if (pathname.endsWith('/') || /\/[^/]+\.[^/]+$/u.test(pathname)) {
    return pathname;
  }

  return `${pathname}/`;
}

function sourcePathForHref(href, baseUrl) {
  const parsed = new URL(href, baseUrl);
  return normalizePathname(parsed.pathname);
}

function rewriteUrls(html, baseUrl) {
  return decodeCloudflareProtectedEmails(html)
    .replace(/https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\//gi, '/legacy-wp/uploads/')
    .replace(/\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\//gi, '/legacy-wp/uploads/')
    .replace(/\/wp-content\/uploads\//g, '/legacy-wp/uploads/')
    .replace(/\b(href|src|poster)=["']([^"']+)["']/gi, (full, attribute, url) => {
      const normalized = normalizeInternalUrl(url, baseUrl);
      return `${attribute.toLowerCase()}="${normalized}"`;
    })
    .replace(/\bsrcset=["']([^"']+)["']/gi, (_, srcset) => {
      const rewritten = srcset
        .split(',')
        .map((candidate) => {
          const trimmed = candidate.trim();
          const parts = trimmed.split(/\s+/);
          if (parts[0]) {
            parts[0] = normalizeInternalUrl(parts[0], baseUrl);
          }
          return parts.join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    });
}

function summarizeContent(html) {
  return stripTags(html).slice(0, 180).replace(/\s+\S*$/, '').trim();
}

function stripScriptTags(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/giu, '');
}

function extractPage(slug, html, baseUrl) {
  const title = stripTags(
    matchFirst(html, [
      /<h[1-6][^>]*class=["'][^"']*\bwp-block-post-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i,
      /<h1[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
      /<title>([\s\S]*?)<\/title>/i,
    ]).replace(/\s+-\s+PyCon HK\s*$/i, ''),
  );
  const dateTime = matchFirst(html, [
    /<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*datetime=["']([^"']+)["']/i,
    /<meta property=["']article:published_time["'] content=["']([^"']+)["']/i,
  ]);
  const dateLabel = stripTags(
    matchFirst(html, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*>([\s\S]*?)<\/time>/i]),
  );
  const content = rewriteUrls(
    stripScriptTags(extractElementByClass(html, 'div', 'entry-content')),
    baseUrl,
  );

  return {
    slug,
    url: `/2024/${slug}/`,
    title,
    dateTime: dateTime || undefined,
    dateLabel: dateLabel || undefined,
    description: summarizeContent(content),
    content,
    fullHtml: rewriteUrls(html, baseUrl),
  };
}

function extractListingArticle(articleHtml, baseUrl) {
  const rawHref = matchFirst(articleHtml, [/<h2[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>\s*<a[^>]*href=["']([^"']+)["']/i]);
  const href = normalizeInternalUrl(rawHref, baseUrl);
  if (!href.startsWith('/2024/')) {
    return null;
  }

  const content = rewriteUrls(extractElementByClass(articleHtml, 'div', 'entry-content'), baseUrl);
  return {
    title: stripTags(matchFirst(articleHtml, [/<h2[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i])),
    url: href,
    sourcePath: sourcePathForHref(rawHref, baseUrl),
    slug: canonicalSlugForPath(href),
    dateTime: matchFirst(articleHtml, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*datetime=["']([^"']+)["']/i]) || undefined,
    dateLabel: stripTags(matchFirst(articleHtml, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*>([\s\S]*?)<\/time>/i])) || undefined,
    excerpt: summarizeContent(content),
  };
}

function extractBlockListingItem(itemHtml, baseUrl) {
  const rawHref = matchFirst(itemHtml, [
    /<h[1-6][^>]*class=["'][^"']*\bwp-block-post-title\b[^"']*["'][^>]*>\s*<a[^>]*href=["']([^"']+)["']/i,
  ]);

  if (!rawHref) {
    return null;
  }

  const href = normalizeInternalUrl(rawHref, baseUrl);

  if (!href.startsWith('/2024/')) {
    return null;
  }

  return {
    title: stripTags(matchFirst(itemHtml, [/<h[1-6][^>]*class=["'][^"']*\bwp-block-post-title\b[^"']*["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i])),
    url: href,
    sourcePath: sourcePathForHref(rawHref, baseUrl),
    slug: canonicalSlugForPath(href),
    dateTime: matchFirst(itemHtml, [/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i]) || undefined,
    dateLabel: stripTags(matchFirst(itemHtml, [/<time[^>]*datetime=["'][^"']+["'][^>]*>([\s\S]*?)<\/time>/i])) || undefined,
    excerpt: summarizeContent(matchFirst(itemHtml, [/<p[^>]*class=["'][^"']*\bwp-block-post-excerpt__excerpt\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i])),
  };
}

function extractListing(html, baseUrl) {
  const articles = [];
  const articlePattern = /<article\b[\s\S]*?<\/article>/gi;
  const blockItemPattern = /<li\b[^>]*class=["'][^"']*\bwp-block-post\b[^"']*["'][^>]*>[\s\S]*?<\/li>/gi;
  let match;

  while ((match = articlePattern.exec(html))) {
    const article = extractListingArticle(match[0], baseUrl);
    if (article) {
      articles.push(article);
    }
  }

  while ((match = blockItemPattern.exec(html))) {
    const article = extractBlockListingItem(match[0], baseUrl);
    if (article) {
      articles.push(article);
    }
  }

  return articles;
}

function uniqueByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
}

function sortByDateDesc(a, b) {
  return (Date.parse(b.dateTime ?? '') || 0) - (Date.parse(a.dateTime ?? '') || 0);
}

const archiveBaseUrl = sourceUrl('/2024/');
const archiveHtml = await fetchText(archiveBaseUrl);
const listingSources = uniqueByUrl(extractListing(archiveHtml, archiveBaseUrl)).sort(sortByDateDesc);
const pageSources = uniqueByUrl([
  ...listingSources.filter((item) => item.slug && item.url !== '/2024/photos/'),
  ...extraPagePaths.map((sourcePath) => ({
    sourcePath,
    slug: canonicalSlugForPath(sourcePath),
    url: canonicalRouteForPath(sourcePath),
  })),
]).filter((item) => item.slug && item.sourcePath);
const pages = (
  await Promise.all(
    pageSources.map(async ({ slug, sourcePath }) => {
      const { baseUrl, html } = await fetchPageSource(sourcePath);

      return extractPage(slug, html, baseUrl);
    }),
  )
).sort(sortByDateDesc);
const listing = listingSources
  .map(({ sourcePath, slug, ...item }) => item)
  .sort(sortByDateDesc);

mkdirSync(path.dirname(dataFile), { recursive: true });
writeFileSync(
  dataFile,
  `export interface Legacy2024Page {
  slug: string;
  url: string;
  title: string;
  dateTime?: string;
  dateLabel?: string;
  description: string;
  content: string;
  fullHtml: string;
}

export interface Legacy2024ListingItem {
  title: string;
  url: string;
  dateTime?: string;
  dateLabel?: string;
  excerpt: string;
}

export const legacy2024Pages: Legacy2024Page[] = ${JSON.stringify(pages, null, 2)};

export const legacy2024Listing: Legacy2024ListingItem[] = ${JSON.stringify(listing, null, 2)};
`,
);

rmSync(legacyNestedUploads, { force: true, recursive: true });
for (const year of uploadYears) {
  const sourceUploads = path.join(sourceUploadsRoot, year);
  const publicUploads = path.join(publicUploadsRoot, year);
  if (!existsSync(sourceUploads)) {
    continue;
  }

  rmSync(publicUploads, { force: true, recursive: true });
  mkdirSync(path.dirname(publicUploads), { recursive: true });
  cpSync(sourceUploads, publicUploads, { recursive: true });
}
await cachePublicAssets(voyagoThemeAssets);
await cachePublicAssets(wordpressCoreAssets);
await cachePublicAssets(wordpressPluginAssets);

console.log(`Migrated ${pages.length} pages and ${listing.length} listing items.`);
console.log(`Copied ${uploadYears.join(', ')} uploads to ${publicUploadsRoot}.`);
console.log('Cached Voyago theme, WordPress core, and plugin assets.');

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function fetchPageSource(sourcePath) {
  const url = sourceUrl(sourcePath);

  try {
    return {
      baseUrl: url,
      html: await fetchText(url),
    };
  } catch (error) {
    const fallbackFile = fallbackFileForSourcePath(sourcePath);

    if (!existsSync(fallbackFile)) {
      throw error;
    }

    console.warn(`Using fallback 2024 source for ${sourcePath}: ${fallbackFile}`);
    return {
      baseUrl: `https://pycon.hk${normalizeLocalPath(sourcePath)}`,
      html: readFileSync(fallbackFile, 'utf8'),
    };
  }
}

function fallbackFileForSourcePath(sourcePath) {
  return path.join(fallbackSourceRoot, sourcePath.replace(/^\/|\/$/gu, ''), 'index.html');
}

async function cachePublicAssets(assetUrls) {
  await Promise.all(
    assetUrls.map(async (assetUrl) => {
      const url = new URL(assetUrl);
      const response = await fetch(assetUrl);
      const destinations = cacheDestinationsForAsset(url);

      for (const destination of destinations) {
        mkdirSync(path.dirname(destination), { recursive: true });
      }

      if (response.status === 404) {
        for (const destination of destinations) {
          writeFileSync(destination, '');
        }
        console.warn(`Cached empty placeholder for missing live asset ${assetUrl}.`);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${assetUrl}: ${response.status} ${response.statusText}`);
      }

      const payload = Buffer.from(await response.arrayBuffer());

      for (const destination of destinations) {
        writeFileSync(destination, payload);
      }
    }),
  );
}

function cacheDestinationsForAsset(url) {
  const destinations = [path.join(repoRoot, 'public', url.pathname)];

  if (url.pathname.startsWith('/wp-content/')) {
    destinations.push(
      path.join(
        legacySharedAssetRoot,
        'content',
        url.pathname.slice('/wp-content/'.length),
      ),
    );
  } else if (url.pathname.startsWith('/wp-includes/')) {
    destinations.push(
      path.join(
        legacySharedAssetRoot,
        'includes',
        url.pathname.slice('/wp-includes/'.length),
      ),
    );
  }

  return [...new Set(destinations)];
}
