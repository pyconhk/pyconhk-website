import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import routes from '../src/years/2015/data/routes.json' with { type: 'json' };

const sourceRoot = new URL('../../output/legacy-2015-source/', import.meta.url);
const manifestUrl = new URL('manifest.json', sourceRoot);
const pagesOutputUrl = new URL(
  '../src/years/2015/data/pages.ts',
  import.meta.url
);
const liveBase = 'https://pycon.hk';

const compatibilityRoutes = new Set(routes.compatibilityRoutes);
const micrositeLinkPrefixes = new Set([
  'about',
  'schedule',
  'sponsor',
  'venue',
  'css',
  'js',
  'images',
  'speakers',
]);
const micrositeRootFiles = new Set(['jumbotron.css', 'style.css', 'style.js']);
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function normalizeText(value) {
  return decodeHtmlEntities(value)
    .replace(
      /([^\s>])((?:Date|Time|Venue|Website|Videos|Meeting ID|Passcode):)/gu,
      '$1 $2'
    )
    .replace(/([A-Za-z])(https?:\/\/)/gu, '$1 $2')
    .replace(/\s+/gu, ' ')
    .trim();
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '...',
    laquo: '<<',
    lt: '<',
    mdash: '-',
    nbsp: ' ',
    ndash: '-',
    copy: '(c)',
    raquo: '>>',
    quot: '"',
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

function escapeHtml(value) {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}

function stripHtml(value) {
  return normalizeText(
    value
      .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
      .replace(/<!--[\s\S]*?-->/gu, ' ')
      .replace(/<[^>]+>/gu, ' ')
  );
}

function parseAttributes(tag) {
  const attributes = new Map();
  const pattern =
    /\s([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/giu;

  for (const match of tag.matchAll(pattern)) {
    attributes.set(
      match[1].toLowerCase(),
      match[2] ?? match[3] ?? match[4] ?? ''
    );
  }

  return attributes;
}

function hasClass(tag, className) {
  return (parseAttributes(tag).get('class') ?? '')
    .split(/\s+/u)
    .includes(className);
}

function findStartTagWithClass(html, tagName, className) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'giu');

  for (const match of html.matchAll(pattern)) {
    if (hasClass(match[0], className)) {
      return match.index;
    }
  }

  return -1;
}

function sliceElement(html, startIndex) {
  const start = html.slice(startIndex).match(/^<([a-z][a-z0-9:-]*)\b[^>]*>/iu);

  if (!start) {
    throw new Error(`Expected an HTML element at byte offset ${startIndex}`);
  }

  const tagName = start[1].toLowerCase();

  if (voidElements.has(tagName) || /\/>\s*$/u.test(start[0])) {
    return html.slice(startIndex, startIndex + start[0].length);
  }

  const pattern = /<!--[\s\S]*?-->|<\/?([a-z][a-z0-9:-]*)\b[^>]*>/giu;
  let depth = 0;
  pattern.lastIndex = startIndex;

  for (const match of html.matchAll(pattern)) {
    const matchedTagName = match[1]?.toLowerCase();

    if (matchedTagName !== tagName) {
      continue;
    }

    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(startIndex, match.index + match[0].length);
      }
      continue;
    }

    if (!voidElements.has(tagName) && !/\/>\s*$/u.test(match[0])) {
      depth += 1;
    }
  }

  throw new Error(`Could not find closing </${tagName}>`);
}

function extractElementByClass(html, tagName, className) {
  const startIndex = findStartTagWithClass(html, tagName, className);
  return startIndex === -1 ? '' : sliceElement(html, startIndex);
}

function extractTitle(html) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu);
  return titleMatch ? normalizeText(titleMatch[1]) : '';
}

function extractMetaContent(html, selectorName, selectorValue) {
  for (const match of html.matchAll(/<meta\b[^>]*>/giu)) {
    const attributes = parseAttributes(match[0]);

    if (
      attributes.get(selectorName) === selectorValue &&
      attributes.has('content')
    ) {
      return normalizeText(attributes.get('content'));
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

function isSkippableUrl(value) {
  return (
    !value ||
    value.startsWith('#') ||
    /^(?:data|javascript|mailto|tel):/iu.test(value)
  );
}

function shouldResolveFromYearRoot(value) {
  return /^(?:\.\/)?(?:css|js|images|speakers)(?:\/|$)/iu.test(value);
}

function isTopLevelMicrositePath(pathname) {
  const [firstSegment] = pathname.replace(/^\/+/u, '').split('/');
  return (
    micrositeLinkPrefixes.has(firstSegment) ||
    micrositeRootFiles.has(firstSegment)
  );
}

function withTrailingSlashForRoute(pathname) {
  if (pathname === '/2015') {
    return '/2015/';
  }

  if (/^\/2015\/(?:images|speakers)\//iu.test(pathname)) {
    return pathname;
  }

  if (pathname.endsWith('/')) {
    return pathname;
  }

  const lastSegment = pathname.split('/').at(-1) ?? '';
  const looksLikeAsset = /\.[a-z0-9]{2,5}$/iu.test(lastSegment);
  const isCompatibilityResource =
    /^\/2015\/(?:css|js)\//iu.test(pathname) ||
    /^\/2015\/(?:jumbotron\.css|style\.css|style\.js)$/iu.test(pathname);

  return looksLikeAsset && !isCompatibilityResource
    ? pathname
    : `${pathname}/`;
}

function rewriteUrl(value, sourceUrl) {
  const trimmed = value.trim();

  if (trimmed !== value || isSkippableUrl(trimmed)) {
    return value;
  }

  const baseUrl = shouldResolveFromYearRoot(trimmed)
    ? new URL('/2015/', liveBase).href
    : sourceUrl;

  let parsed;
  try {
    parsed = new URL(trimmed, baseUrl);
  } catch {
    return value;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return value;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./u, '');
  let pathname = parsed.pathname;
  let shouldRewrite = false;

  if (hostname === '2015.pycon.hk') {
    pathname = `/2015${pathname === '/' ? '/' : pathname}`;
    shouldRewrite = true;
  } else if (hostname === 'pycon.hk' || hostname === 'legacy.pycon.hk') {
    if (pathname === '/2015' || pathname.startsWith('/2015/')) {
      shouldRewrite = true;
    } else if (isTopLevelMicrositePath(pathname)) {
      pathname = `/2015${pathname}`;
      shouldRewrite = true;
    }
  }

  if (!shouldRewrite) {
    return value;
  }

  return `${withTrailingSlashForRoute(pathname)}${parsed.search}${parsed.hash}`;
}

function rewriteSrcset(value, sourceUrl) {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();

      if (!trimmed) {
        return trimmed;
      }

      const [url, ...descriptor] = trimmed.split(/\s+/u);
      return [rewriteUrl(url, sourceUrl), ...descriptor].join(' ');
    })
    .join(', ');
}

function rewriteHtmlFragment(html, sourceUrl) {
  return html.replace(/<[a-z][a-z0-9:-]*(?:\s[^<>]*)?>/giu, (tag) =>
    tag.replace(
      /\b(href|src|poster|data-src|action|srcset)\s*=\s*(["'])([\s\S]*?)\2/giu,
      (match, name, quote, value) => {
        const rewritten =
          name.toLowerCase() === 'srcset'
            ? rewriteSrcset(value, sourceUrl)
            : rewriteUrl(value, sourceUrl);

        return `${name}=${quote}${rewritten}${quote}`;
      }
    )
  );
}

function extractMicrositeBodyHtml(html, sourceUrl) {
  const navCloseMatch = /<\/nav\s*>/iu.exec(html);
  const bodyStartMatch = /<body\b[^>]*>/iu.exec(html);
  const startIndex = navCloseMatch
    ? navCloseMatch.index + navCloseMatch[0].length
    : bodyStartMatch
      ? bodyStartMatch.index + bodyStartMatch[0].length
      : 0;
  const scriptStart = html.slice(startIndex).search(/<script\b/iu);
  const bodyClose = html.slice(startIndex).search(/<\/body\s*>/iu);
  const endIndex =
    scriptStart !== -1
      ? startIndex + scriptStart
      : bodyClose !== -1
        ? startIndex + bodyClose
        : html.length;

  return rewriteHtmlFragment(html.slice(startIndex, endIndex).trim(), sourceUrl);
}

function extractPhotosBodyHtml(html, sourceUrl) {
  const titleHtml = extractElementByClass(html, 'h1', 'entry-title');
  const contentHtml = extractElementByClass(html, 'div', 'entry-content');

  if (!titleHtml || !contentHtml) {
    throw new Error('Could not extract WordPress entry title/content for photos');
  }

  return rewriteHtmlFragment(
    `<article class="legacy-2015-photo-article">${titleHtml}${contentHtml}</article>`,
    sourceUrl
  );
}

function extractHtmlPage(page, html) {
  const sourceUrl = page.sourceUrl;
  const bodyHtml =
    page.route === '/2015/photos/'
      ? extractPhotosBodyHtml(html, sourceUrl)
      : extractMicrositeBodyHtml(html, sourceUrl);
  const visibleText = stripHtml(bodyHtml);
  const articleTitle =
    page.route === '/2015/photos/'
      ? stripHtml(extractElementByClass(html, 'h1', 'entry-title'))
      : '';
  const title = articleTitle || extractTitle(html) || visibleText.slice(0, 80);
  const description = extractDescription(html, visibleText) || title;

  return {
    bodyHtml,
    description,
    kind: 'html',
    title,
    visibleText,
  };
}

function extractCompatibilityPage(page, text) {
  const visibleText = normalizeText(text);
  const title = `Compatibility resource ${page.route}`;

  return {
    bodyHtml: `<pre class="legacy-2015-compatibility" data-source-route="${escapeHtml(
      page.sourceRoute
    )}"><code>${escapeHtml(text)}</code></pre>`,
    description: `Captured compatibility resource for ${page.route}`,
    kind: 'compatibility',
    title,
    visibleText: visibleText || title,
  };
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates].sort();
}

function validateRouteCoverage(label, requiredRoutes, entries) {
  const entryRoutes = entries.map((entry) => entry.route);
  const duplicateRoutes = findDuplicates(entryRoutes);
  const requiredSet = new Set(requiredRoutes);
  const entryRouteSet = new Set(entryRoutes);
  const missingRoutes = requiredRoutes.filter((route) => !entryRouteSet.has(route));
  const extraRoutes = entryRoutes
    .filter((route) => !requiredSet.has(route))
    .sort();

  if (
    duplicateRoutes.length > 0 ||
    missingRoutes.length > 0 ||
    extraRoutes.length > 0 ||
    entries.length !== requiredRoutes.length
  ) {
    throw new Error(
      [
        `${label} must contain exactly one entry for each required 2015 route.`,
        `Expected ${requiredRoutes.length}; received ${entries.length}.`,
        duplicateRoutes.length
          ? `Duplicate routes: ${duplicateRoutes.join(', ')}`
          : '',
        missingRoutes.length ? `Missing routes: ${missingRoutes.join(', ')}` : '',
        extraRoutes.length ? `Extra routes: ${extraRoutes.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
  }
}

function validateManifestPage(page) {
  for (const key of ['fileName', 'route', 'sourceRoute', 'sourceUrl', 'status']) {
    if (!(key in page)) {
      throw new Error(`Manifest page is missing ${key}: ${JSON.stringify(page)}`);
    }
  }
}

function escapeTemplateLiteral(value) {
  return value
    .replace(/\\/gu, '\\\\')
    .replace(/`/gu, '\\`')
    .replace(/\$\{/gu, '\\${');
}

function pageEntry(page) {
  return `  {
    route: ${JSON.stringify(page.route)},
    sourceRoute: ${JSON.stringify(page.sourceRoute)},
    sourceUrl: ${JSON.stringify(page.sourceUrl)},
    status: ${JSON.stringify(page.status)},
    title: ${JSON.stringify(page.title)},
    description: ${JSON.stringify(page.description)},
    kind: ${JSON.stringify(page.kind)},
    capturedFile: ${JSON.stringify(page.capturedFile)},
    bodyHtml: \`${escapeTemplateLiteral(page.bodyHtml)}\`,
    visibleText: \`${escapeTemplateLiteral(page.visibleText)}\`,
  }`;
}

function dataFileContents(pages) {
  return `import type { Legacy2015Page } from './types';

export const legacy2015Pages: Legacy2015Page[] = [
${pages.map(pageEntry).join(',\n')}
];

const pagesByRoute = new Map<string, Legacy2015Page>(
  legacy2015Pages.map((page) => [page.route, page])
);

export function getLegacy2015Page(route: string): Legacy2015Page {
  const page = pagesByRoute.get(route);

  if (!page) {
    throw new Error(\`Unknown PyCon HK 2015 route: \${route}\`);
  }

  return page;
}
`;
}

export async function generateLegacy2015Pages() {
  const manifest = JSON.parse(await fs.readFile(manifestUrl, 'utf8'));
  const manifestPages = manifest.pages ?? [];

  if (!Array.isArray(manifestPages)) {
    throw new Error('output/legacy-2015-source/manifest.json pages must be an array');
  }

  validateRouteCoverage('Manifest pages', routes.requiredRoutes, manifestPages);

  for (const page of manifestPages) {
    validateManifestPage(page);
  }

  const manifestPageByRoute = new Map(
    manifestPages.map((page) => [page.route, page])
  );
  const generatedPages = [];

  for (const route of routes.requiredRoutes) {
    const manifestPage = manifestPageByRoute.get(route);

    if (!manifestPage) {
      throw new Error(`No manifest page found for required route ${route}`);
    }

    const capturedHtmlUrl = new URL(`html/${manifestPage.fileName}`, sourceRoot);
    const capturedText = await fs.readFile(capturedHtmlUrl, 'utf8');
    const extracted = compatibilityRoutes.has(route)
      ? extractCompatibilityPage(manifestPage, capturedText)
      : extractHtmlPage(manifestPage, capturedText);

    generatedPages.push({
      route: manifestPage.route,
      sourceRoute: manifestPage.sourceRoute,
      sourceUrl: manifestPage.sourceUrl,
      status: manifestPage.status,
      title: extracted.title,
      description: extracted.description,
      kind: extracted.kind,
      capturedFile: manifestPage.fileName,
      bodyHtml: extracted.bodyHtml,
      visibleText: extracted.visibleText,
    });
  }

  validateRouteCoverage('Generated pages', routes.requiredRoutes, generatedPages);

  await fs.mkdir(new URL('.', pagesOutputUrl), { recursive: true });
  await fs.writeFile(pagesOutputUrl, dataFileContents(generatedPages));

  console.log(
    `generated ${generatedPages.length} pages: ${fileURLToPath(pagesOutputUrl)}`
  );

  return generatedPages;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateLegacy2015Pages();
}
