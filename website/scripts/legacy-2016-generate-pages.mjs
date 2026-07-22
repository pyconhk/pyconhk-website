import fs from 'node:fs/promises';

const scheduleTalkSlugs = [
  'the-pandas-project-and-its-future',
  'developing-python-applications-on-cloud',
  'building-ai-chat-bot-using-python-3-and-tensorflow',
  'deepwhale-recognizing-and-localizing-endangered-right-whales-with-extremely-deep-neural-networks',
  'creating-python-application-with-mysql-using-mysql-connector-and-mysql-router',
  'reproducible-data-analysis-in-python',
  'unlocking-pdfs-by-machine-learning',
  'make-your-computer-see-listen-speak-and-predict-with-python',
  'using-python-to-work-with-document-in-mysql',
  'panel-discussion-hk-education-and-python',
  'a-girls-guide-to-growing-a-moustache',
  'how-to-use-coroutine-to-build-a-socket-server',
  'decorators-demystified',
  'analyze-camera-images-with-deep-learning-in-python',
  'massive-open-online-course-architecture-using-python-and-web-platform',
  'sci-kit-learn-babystep',
  'aIorchestra-lesson-learn-while-using-asyncio-coroutines-on-dynamic-sequenced-tasks',
];

const basePages = [
  { route: '/2016/', sourceUrl: 'https://legacy.pycon.hk/2016/' },
  { route: '/2016/about/', sourceUrl: 'https://legacy.pycon.hk/2016/about/' },
  {
    route: '/2016/code-of-conducts/',
    sourceUrl: 'https://legacy.pycon.hk/2016/code-of-conducts/',
  },
  {
    route: '/2016/dev-sprint/',
    sourceUrl: 'https://legacy.pycon.hk/2016/dev-sprint/',
  },
  {
    route: '/2016/participate/',
    sourceUrl: 'https://legacy.pycon.hk/2016/participate/',
  },
  { route: '/2016/program/', sourceUrl: 'https://legacy.pycon.hk/2016/program/' },
  { route: '/2016/sponsor/', sourceUrl: 'https://legacy.pycon.hk/2016/sponsor/' },
  { route: '/2016/venue/', sourceUrl: 'https://legacy.pycon.hk/2016/venue/' },
  { route: '/2016/volunteer/', sourceUrl: 'https://legacy.pycon.hk/2016/volunteer/' },
];

const pages = [
  ...basePages,
  ...scheduleTalkSlugs.map((slug) => ({
    route: `/2016/program/${slug}/`,
    sourceUrl: `https://legacy.pycon.hk/2016/program/${slug}/`,
  })),
];

const outputUrl = new URL('../src/years/2016/data/pages.ts', import.meta.url);
const pageRoutes = new Set(pages.map(({ route }) => normalizeRoute(route)));
const micrositeAssetPattern =
  /\.(?:css|js|png|jpe?g|gif|ico|svg|woff2?|woff|ttf|eot|pdf)$/iu;

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

function decodeCloudflareEmail(protectedEmail) {
  if (!/^(?:[0-9a-f]{2}){2,}$/iu.test(protectedEmail)) {
    return undefined;
  }

  const key = Number.parseInt(protectedEmail.slice(0, 2), 16);
  const bytes = [];

  for (let index = 2; index < protectedEmail.length; index += 2) {
    const byte = Number.parseInt(protectedEmail.slice(index, index + 2), 16);
    bytes.push(byte ^ key);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

function escapeHtmlText(value) {
  return value.replace(/[&<>]/gu, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return character;
    }
  });
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value).replace(/"/gu, '&quot;');
}

function decodeCloudflareProtectedEmails(html) {
  return html
    .replace(
      /<a\b([^>]*?)\s+href=(["'])\/cdn-cgi\/l\/email-protection#([0-9a-f]+)\2([^>]*)>\s*<span\b[^>]*?\sdata-cfemail=(["'])([0-9a-f]+)\5[^>]*>[\s\S]*?<\/span>\s*<\/a>/giu,
      (match, beforeHref, _hrefQuote, hrefEmail, afterHref, _spanQuote, spanEmail) => {
        const email =
          decodeCloudflareEmail(spanEmail) ?? decodeCloudflareEmail(hrefEmail);

        if (!email) {
          return match;
        }

        return `<a${beforeHref} href="mailto:${escapeHtmlAttribute(email)}"${afterHref}>${escapeHtmlText(email)}</a>`;
      }
    )
    .replace(
      /href=(["'])\/cdn-cgi\/l\/email-protection#([0-9a-f]+)\1/giu,
      (match, quote, protectedEmail) => {
        const email = decodeCloudflareEmail(protectedEmail);

        return email
          ? `href=${quote}mailto:${escapeHtmlAttribute(email)}${quote}`
          : match;
      }
    );
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

function normalizeRoute(route) {
  if (route === '/2016') {
    return '/2016/';
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function routeOutputPath(pathname, hash) {
  const normalized = normalizeRoute(pathname);

  if (!pageRoutes.has(normalized)) {
    return `${pathname}${hash}`;
  }

  return `${normalized}${hash}`;
}

function safeDecodeUri(value) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
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

function routeFileName(route) {
  return route.replace(/^\/|\/$/gu, '').replace(/\//gu, '-') || '2016';
}

function isSkippableUrl(value) {
  return (
    !value ||
    value.startsWith('#') ||
    /^(?:data|javascript|mailto|tel):/iu.test(value)
  );
}

function rewriteUrl(value, sourceUrl) {
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

  if (url.hostname === 'legacy.pycon.hk' || url.hostname === 'pycon.hk') {
    if (url.pathname === '/2016') {
      return `/2016/${url.hash}`;
    }

    if (url.pathname.startsWith('/2016/')) {
      if (micrositeAssetPattern.test(url.pathname)) {
        return `${url.pathname}${url.search}`;
      }

      return routeOutputPath(url.pathname, url.hash);
    }

    if (url.pathname === '/js/ga.js') {
      return '/js/ga.js';
    }

    if (url.pathname.startsWith('/cdn-cgi/')) {
      return `${url.pathname}${url.hash}`;
    }
  }

  if (
    url.hostname === ['2015', 'pycon', 'hk'].join('.') &&
    url.pathname.startsWith('/images/')
  ) {
    return `/2016/remote/2015${safeDecodeUri(url.pathname)}`;
  }

  if (url.hostname === 'img.opensource.hk') {
    return `/2016/remote/img.opensource.hk${safeDecodeUri(url.pathname)}`;
  }

  return url.href;
}

function rewriteHtml(html, sourceUrl) {
  return html.replace(
    /(\s)(href|src)=(["'])([^"']+)\3/giu,
    (_attribute, prefix, name, quote, value) =>
      `${prefix}${name}=${quote}${rewriteUrl(value, sourceUrl)}${quote}`
  );
}

function extractBodyHtml(html) {
  const navEnd = html.search(/<\/nav>/iu);
  const scriptStart = html.search(/<script\b/iu);
  const bodyStart = html.search(/<body\b[^>]*>/iu);
  const bodyEnd = html.search(/<\/body>/iu);
  const start = navEnd === -1 ? bodyStart : navEnd + '</nav>'.length;
  const end = scriptStart === -1 ? bodyEnd : scriptStart;

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not extract 2016 page body');
  }

  return html.slice(start, end).trim();
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

const generatedPages = [];

for (const page of pages) {
  const response = await fetch(page.sourceUrl);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`${page.sourceUrl} returned ${response.status}`);
  }

  const bodyHtml = decodeCloudflareProtectedEmails(
    rewriteHtml(extractBodyHtml(html), page.sourceUrl)
  );
  const visibleText = normalizeText(bodyHtml);

  generatedPages.push({
    route: page.route,
    sourceRoute: new URL(page.sourceUrl).pathname,
    sourceUrl: page.sourceUrl,
    status: response.status,
    title: extractTitle(html),
    description: extractDescription(html, visibleText),
    kind: 'html',
    capturedFile: `${routeFileName(page.route)}.html`,
    bodyHtml,
    visibleText,
  });
}

const source = `import type { Legacy2016Page } from './types';

export const legacy2016Pages = ${serialize(generatedPages)} satisfies Legacy2016Page[];

const legacy2016PageByRoute = new Map(
  legacy2016Pages.map((page) => [page.route, page])
);

export function getLegacy2016Page(route: string): Legacy2016Page {
  const normalizedRoute = route.endsWith('/') ? route : \`\${route}/\`;
  const page = legacy2016PageByRoute.get(normalizedRoute);

  if (!page) {
    throw new Error(\`Missing PyCon HK 2016 page: \${route}\`);
  }

  return page;
}
`;

await fs.writeFile(outputUrl, source);
