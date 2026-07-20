import fs from 'node:fs/promises';
import conferenceArchiveLinks from '../src/legacy/conference-archive-links.json' with { type: 'json' };

const fixedPages = [
  { route: '/2017/', sourceUrl: 'https://legacy.pycon.hk/2017/' },
  { route: '/2017/about/', sourceUrl: 'https://legacy.pycon.hk/2017/about/' },
  {
    route: '/2017/about/coc.html',
    sourceUrl: 'https://legacy.pycon.hk/2017/about/coc.html',
  },
  {
    route: '/2017/about/staff.html',
    sourceUrl: 'https://legacy.pycon.hk/2017/about/staff.html',
  },
  { route: '/2017/cfp/', sourceUrl: 'https://legacy.pycon.hk/2017/cfp/' },
  { route: '/2017/schedule/', sourceUrl: 'https://legacy.pycon.hk/2017/schedule/' },
  { route: '/2017/sponsor/', sourceUrl: 'https://legacy.pycon.hk/2017/sponsor/' },
  { route: '/2017/venue/', sourceUrl: 'https://legacy.pycon.hk/2017/venue/' },
];

const staticTextSources = [
  { path: '/2017/0.js', sourceUrl: 'https://legacy.pycon.hk/2017/0.js' },
  { path: '/2017/app.css', sourceUrl: 'https://legacy.pycon.hk/2017/app.css' },
  { path: '/2017/app.js', sourceUrl: 'https://legacy.pycon.hk/2017/app.js' },
  { path: '/2017/data/langs.yml', sourceUrl: 'https://legacy.pycon.hk/2017/data/langs.yml' },
  {
    path: '/2017/data/sessions.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/sessions.yml',
  },
  {
    path: '/2017/data/speakers.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/speakers.yml',
  },
  {
    path: '/2017/data/sponsor.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/sponsor.yml',
  },
  { path: '/2017/data/staff.yml', sourceUrl: 'https://legacy.pycon.hk/2017/data/staff.yml' },
  {
    path: '/2017/data/timeslots.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/timeslots.yml',
  },
  {
    path: '/2017/data/topics.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/topics.yml',
  },
  {
    path: '/2017/data/venues.yml',
    sourceUrl: 'https://legacy.pycon.hk/2017/data/venues.yml',
  },
  { path: '/2017/manifest.json', sourceUrl: 'https://legacy.pycon.hk/2017/manifest.json' },
  { path: '/2017/staff.js', sourceUrl: 'https://legacy.pycon.hk/2017/staff.js' },
  { path: '/2017/sw.js', sourceUrl: 'https://legacy.pycon.hk/2017/sw.js' },
  {
    path: '/2017/timetable.js',
    sourceUrl: 'https://legacy.pycon.hk/2017/timetable.js',
  },
  { path: '/2017/venue.js', sourceUrl: 'https://legacy.pycon.hk/2017/venue.js' },
  {
    path: '/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js',
    sourceUrl:
      'https://legacy.pycon.hk/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js',
  },
];

const dataDirUrl = new URL('../src/years/2017/data/', import.meta.url);
const micrositeAssetPattern =
  /\.(?:css|js|png|jpe?g|gif|ico|svg|webp|woff2?|woff|ttf|eot|pdf|map|json|ya?ml)$/iu;
const venueMapEmbedUrl =
  'https://www.google.com/maps?q=City%20University%20of%20Hong%20Kong%2C%20Kowloon%20Tong%2C%20Hong%20Kong&amp;output=embed';
const venueMapLinkUrl =
  'https://www.google.com.hk/maps/place/City+University+of+Hong+Kong/';
const venueMapHtml = [
  '<div id="map" class="map">',
  `<iframe title="Map to City University of Hong Kong" src="${venueMapEmbedUrl}" width="100%" height="100%" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen>`,
  `<a href="${venueMapLinkUrl}" target="_blank" rel="noopener noreferrer">Open PyCon HK 2017 Venue in Google Maps</a>`,
  '</iframe>',
  '</div>',
].join('');

const archiveSidebarHtml = [
  '<li class="no-padding">',
  '<ul class="collapsible collapsible-accordion">',
  '<li>',
  '<a href="#" class="bold waves-effect collapsible-header">Archive</a>',
  '<div class="collapsible-body">',
  '<ul>',
  ...conferenceArchiveLinks.map(
    ({ href, label }) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
  ),
  '<li><a href="http://python.hk/" target="_blank" rel="noopener noreferrer">Python HK</a></li>',
  '</ul>',
  '</div>',
  '</li>',
  '</ul>',
  '</li>',
].join('');

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
    const selectorPattern = new RegExp(
      `${selectorName}=(["'])${selectorValue}\\1`,
      'iu'
    );
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
  if (route === '/2017') {
    return '/2017/';
  }

  if (route.endsWith('.html')) {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function routeOutputPath(pathname, hash, pageRoutes) {
  const normalized = normalizeRoute(pathname);

  if (!pageRoutes.has(normalized)) {
    return `${pathname}${hash}`;
  }

  return `${normalized}${hash}`;
}

function localAssetPathForUrl(url) {
  if (url.hostname === 'file.pycon.hk' && url.pathname.startsWith('/2017/')) {
    return `/2017/${url.pathname.slice('/2017/'.length)}`;
  }

  if (url.hostname === 'file.hkoscon.org' && url.pathname.startsWith('/organizer/')) {
    return `/2017/organizer/${url.pathname.slice('/organizer/'.length)}`;
  }

  if (url.hostname === 'file.hkoscon.org' && url.pathname === '/speakers/2017/unknown.png') {
    return '/2017/portraits/unknown.png';
  }

  if (url.hostname === 'file.hkoscon.org' && url.pathname === '/staff/claire.wong.jpg') {
    return '/2017/portraits/claire.wong.jpg';
  }

  if (
    url.hostname === 'licensebuttons.net' &&
    url.pathname === '/l/by-sa/3.0/hk/88x31.png'
  ) {
    return '/2017/licensebuttons/by-sa-3.0-hk-88x31.png';
  }

  return undefined;
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

function rewriteUrl(value, sourceUrl, pageRoutes) {
  const trimmed = value.trim();

  if (trimmed !== value || isSkippableUrl(trimmed)) {
    return value;
  }

  let url;

  try {
    url = new URL(trimmed, sourceUrl);
  } catch {
    return value;
  }

  const localAssetPath = localAssetPathForUrl(url);

  if (localAssetPath) {
    return localAssetPath;
  }

  const archiveHref = conferenceArchiveHrefForUrl(url);

  if (archiveHref) {
    return archiveHref;
  }

  if (url.hostname === 'legacy.pycon.hk' || url.hostname === 'pycon.hk') {
    if (url.pathname === '/2017') {
      return `/2017/${url.hash}`;
    }

    if (url.pathname.startsWith('/2017/')) {
      if (micrositeAssetPattern.test(url.pathname)) {
        return `${url.pathname}${url.search}`;
      }

      return routeOutputPath(url.pathname, url.hash, pageRoutes);
    }

    if (url.pathname === '/js/ga.js') {
      return '/2017/js/ga.js';
    }

    if (url.pathname.startsWith('/cdn-cgi/')) {
      return `${url.pathname}${url.hash}`;
    }
  }

  return url.href;
}

function rewriteAttributeUrls(html, sourceUrl, pageRoutes) {
  return html.replace(
    /(\s)(href|src|data-image-src)=(["'])([^"']+)\3/giu,
    (_attribute, prefix, name, quote, value) =>
      `${prefix}${name}=${quote}${rewriteUrl(value, sourceUrl, pageRoutes)}${quote}`
  );
}

function stripCloudflareChallenge(html) {
  return html.replace(
    /<script>\(function\(\)\{function c\(\)\{[\s\S]*?challenge-platform[\s\S]*?<\/script>/giu,
    ''
  );
}

function repairVenueMap(html, route) {
  if (normalizeRoute(route) !== '/2017/venue/') {
    return html;
  }

  return html
    .replace(/<div id="map" class="map"><\/div>/u, venueMapHtml)
    .replace(
      /<script src="https:\/\/maps\.googleapis\.com\/maps\/api\/js[^"]*" defer="defer"><\/script>/u,
      ''
    )
    .replace(/<script src="\/2017\/venue\.js" defer="defer"><\/script>/u, '');
}

function repairArchiveSidebar(html) {
  return html.replace(
    /<li class="no-padding">\s*<ul class="collapsible collapsible-accordion">\s*<li>\s*<a href="#" class="bold waves-effect collapsible-header">Archive<\/a>\s*<div class="collapsible-body">\s*<ul>[\s\S]*?<\/ul>\s*<\/div>\s*<\/li>\s*<\/ul>\s*<\/li>/u,
    archiveSidebarHtml
  );
}

function sanitizeHtml(html, sourceUrl, pageRoutes) {
  const rewrittenHtml = rewriteAttributeUrls(stripCloudflareChallenge(html), sourceUrl, pageRoutes);
  const route = new URL(sourceUrl).pathname;

  return repairVenueMap(repairArchiveSidebar(rewrittenHtml), route);
}

function rewriteStaticText(path, value) {
  const sourceUrl = `https://legacy.pycon.hk${path}`;

  let rewritten = value.replace(/https?:\/\/[^\s"'<>]+/giu, (match) => {
    try {
      const localAssetPath = localAssetPathForUrl(new URL(match));

      return localAssetPath ?? match;
    } catch {
      return match;
    }
  });

  if (path === '/2017/app.js') {
    rewritten = rewritten.replace(
      /navigator\.serviceWorker&&/u,
      'false&&navigator.serviceWorker&&'
    );
  }

  if (path === '/2017/manifest.json') {
    rewritten = rewriteAttributeUrls(
      rewritten
        .replace(
          /"http:\/\/pycon\.hk\/2017\/images\/pycon-logo-v2\.png"/gu,
          '"/2017/images/pycon-logo-v2.png"'
        )
        .replace(/"homepage_url": "http:\/\/pycon\.hk\/2017\/"/u, '"homepage_url": "/2017/"'),
      sourceUrl,
      new Set()
    );
  }

  return rewritten;
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
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

async function fetchText(sourceUrl) {
  const response = await fetch(sourceUrl);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${sourceUrl} returned ${response.status}`);
  }

  return { status: response.status, text };
}

const topicsText = (await fetchText('https://legacy.pycon.hk/2017/data/topics.yml')).text;
const topicRoutes = [
  ...new Set(
    [...topicsText.matchAll(/^\s+id:\s*([^\s]+)/gmu)].map(
      ([, topicId]) => `/2017/topics/${topicId}/`
    )
  ),
].sort();
const pages = [
  ...fixedPages,
  ...topicRoutes.map((route) => ({
    route,
    sourceUrl: `https://legacy.pycon.hk${route}`,
  })),
];
const pageRoutes = new Set(pages.map(({ route }) => normalizeRoute(route)));

const generatedPages = [];

for (const page of pages) {
  const { status, text } = await fetchText(page.sourceUrl);
  const fullHtml = sanitizeHtml(text, page.sourceUrl, pageRoutes);
  const visibleText = normalizeText(fullHtml);

  generatedPages.push({
    route: normalizeRoute(page.route),
    sourceRoute: new URL(page.sourceUrl).pathname,
    sourceUrl: page.sourceUrl,
    status,
    title: extractTitle(text),
    description: extractDescription(text, visibleText),
    kind: 'html',
    capturedFile: `${page.route.replace(/^\/|\/$/gu, '').replace(/\//gu, '-') || '2017'}.html`,
    fullHtml,
    visibleText,
  });
}

const generatedStaticTexts = {};

for (const source of staticTextSources) {
  const { text } = await fetchText(source.sourceUrl);
  generatedStaticTexts[source.path] = rewriteStaticText(source.path, text);
}

const pagesSource = `import type { Legacy2017Page } from './types';

export const legacy2017Pages = ${serialize(generatedPages)} satisfies Legacy2017Page[];

const legacy2017PageByRoute = new Map(
  legacy2017Pages.map((page) => [page.route, page])
);

export function getLegacy2017Page(route: string): Legacy2017Page {
  const normalizedRoute = route.endsWith('.html') || route.endsWith('/') ? route : \`\${route}/\`;
  const page = legacy2017PageByRoute.get(normalizedRoute);

  if (!page) {
    throw new Error(\`Missing PyCon HK 2017 page: \${route}\`);
  }

  return page;
}
`;

const staticSource = `// biome-ignore-all lint/suspicious/noTemplateCurlyInString: Legacy minified bundles contain literal parser tokens.
export const legacy2017StaticTexts = ${serialize(generatedStaticTexts)} as const;

export type Legacy2017StaticPath = keyof typeof legacy2017StaticTexts;

export function getLegacy2017StaticText(path: Legacy2017StaticPath): string {
  return legacy2017StaticTexts[path];
}
`;

const routesSource = `${serialize({
  requiredRoutes: [
    ...generatedPages.map((page) => page.route),
    '/2017/photos/',
    '/2017/recording/',
  ].sort(),
  compatibilityRoutes: staticTextSources.map((source) => source.path).sort(),
  migratedTopLevelRoutes: [
    { from: '/conference-highlights/2017-photos/', to: '/2017/photos' },
    { from: '/conference-highlights/2017-recording/', to: '/2017/recording' },
  ],
})}
`;

await fs.writeFile(new URL('pages.ts', dataDirUrl), pagesSource);
await fs.writeFile(new URL('static.ts', dataDirUrl), staticSource);
await fs.writeFile(new URL('routes.json', dataDirUrl), routesSource);
