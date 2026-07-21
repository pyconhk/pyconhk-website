import { canonicalLegacyHighlightPath } from '@/legacy/year-highlights';
import { buildCanonicalPath, toAbsoluteSiteUrl } from '@/lib/seo';

const legacyFormatControls = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;
const encodedLegacyFormatControls =
  /%(?:e2%80%8e|e2%80%8f|e2%80%a[abcde]|e2%81%a[6-9])/giu;
const legacy2015Host = `2015.${'pycon.hk'}`;
const internalLegacyHosts = new Set([
  legacy2015Host,
  'legacy.pycon.hk',
  'pycon.hk',
  'www.pycon.hk',
]);
const eventPathPattern =
  /^\/(?:2015|2016|2017|2018|2020|2020-spring|2020-fall|2021|2022|2023|2024|2025|2026)(?:\/|$)/u;
const eventPrefixes = [
  '2020-spring',
  '2020-fall',
  '2015',
  '2016',
  '2017',
  '2018',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
] as const;

interface LegacyHrefContext {
  event?: string;
  route?: string;
}

function stripLegacyFormatControls(value: string) {
  return value
    .replace(encodedLegacyFormatControls, '')
    .replace(legacyFormatControls, '')
    .trim();
}

export function cleanLegacyText(text: string) {
  return stripLegacyFormatControls(text)
    .replace(
      /([^\s>])((?:Date|Time|Venue|Website|Videos|Meeting ID|Passcode):)/g,
      '$1 $2'
    )
    .replace(/([A-Za-z])(https?:\/\/)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalLegacyHref(href: string, context: LegacyHrefContext = {}) {
  const cleanHref = stripLegacyFormatControls(href);

  return canonicalLegacyUrlValue(cleanHref, context);
}

export function cleanLegacyHtml(html: string, context: LegacyHrefContext = {}) {
  return stripLegacyWordPressArtifacts(
    rewriteLegacyHtmlUrls(
      stripLegacyWordPressArtifacts(stripLegacyFormatControls(html))
        .replace(
          /([^\s>])((?:Date|Time|Venue|Website|Videos|Meeting ID|Passcode):)/g,
          '$1 $2'
        )
        .replace(/([A-Za-z])(https?:\/\/)/g, '$1 $2'),
      context
    )
  );
}

export function stableLegacyAssetPath(pathname: string, event = '2024') {
  const eventAssetRoot = `/${event}/assets`;
  const eventPathRoot = `/${event}`;

  if (pathname.startsWith(`${eventAssetRoot}/`)) {
    return pathname;
  }

  if (pathname.startsWith(`${eventPathRoot}/wp-content/uploads/`)) {
    return `${eventAssetRoot}/uploads/${pathname.slice(`${eventPathRoot}/wp-content/uploads/`.length)}`;
  }

  if (pathname.startsWith(`${eventPathRoot}/wp-content/`)) {
    return `${eventAssetRoot}/content/${pathname.slice(`${eventPathRoot}/wp-content/`.length)}`;
  }

  if (pathname.startsWith(`${eventPathRoot}/wp-includes/`)) {
    return `${eventAssetRoot}/includes/${pathname.slice(`${eventPathRoot}/wp-includes/`.length)}`;
  }

  if (pathname.startsWith('/legacy-wp/uploads/')) {
    return `${eventAssetRoot}/uploads/${pathname.slice('/legacy-wp/uploads/'.length)}`;
  }

  if (pathname.startsWith('/legacy-wp/')) {
    return `${eventAssetRoot}/${pathname.slice('/legacy-wp/'.length)}`;
  }

  if (pathname.startsWith('/legacy-assets/content/')) {
    return `${eventAssetRoot}/content/${pathname.slice('/legacy-assets/content/'.length)}`;
  }

  if (pathname.startsWith('/legacy-assets/includes/')) {
    return `${eventAssetRoot}/includes/${pathname.slice('/legacy-assets/includes/'.length)}`;
  }

  if (pathname.startsWith('/wp-content/uploads/')) {
    return `${eventAssetRoot}/uploads/${pathname.slice('/wp-content/uploads/'.length)}`;
  }

  if (pathname.startsWith('/wp-content/')) {
    return `${eventAssetRoot}/content/${pathname.slice('/wp-content/'.length)}`;
  }

  if (pathname.startsWith('/wp-includes/')) {
    return `${eventAssetRoot}/includes/${pathname.slice('/wp-includes/'.length)}`;
  }

  return undefined;
}

function requiredStableLegacyAssetPath(pathname: string, event: string) {
  return stableLegacyAssetPath(pathname, event) ?? pathname;
}

export function rewriteLegacyHtmlUrls(html: string, context: LegacyHrefContext = {}) {
  return html
    .replace(
      /\b(href|src|poster|data-src|data-image-src|content|action)=(["'])([^"']*)\2/giu,
      (match, attribute: string, quote: string, value: string) => {
        const rewritten = canonicalLegacyUrlValue(value, context);

        return rewritten === value
          ? match
          : `${attribute.toLowerCase()}=${quote}${rewritten}${quote}`;
      }
    )
    .replace(
      /\bsrcset=(["'])([^"']*)\1/giu,
      (_match, quote: string, srcset: string) =>
        `srcset=${quote}${rewriteLegacySrcset(srcset, context)}${quote}`
    )
    .replace(/url\((["']?)([^"')]+)\1\)/giu, (match, quote: string, value: string) => {
      const rewritten = canonicalLegacyUrlValue(value, context);

      return rewritten === value ? match : `url(${quote}${rewritten}${quote})`;
    })
    .replace(
      /\\\/wp-content\\\/uploads\\\/([^"'<>)\s]+)/giu,
      (_match, suffix: string) =>
        escapeJsonPath(
          requiredStableLegacyAssetPath(
            `/wp-content/uploads/${unescapeJsonPath(suffix)}`,
            eventFromContext(context)
          )
        )
    )
    .replace(/\\\/wp-content\\\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      escapeJsonPath(
        requiredStableLegacyAssetPath(
          `/wp-content/${unescapeJsonPath(suffix)}`,
          eventFromContext(context)
        )
      )
    )
    .replace(/\\\/wp-includes\\\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      escapeJsonPath(
        requiredStableLegacyAssetPath(
          `/wp-includes/${unescapeJsonPath(suffix)}`,
          eventFromContext(context)
        )
      )
    )
    .replace(
      /https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\/([^"'<>)\s]+)/giu,
      (_match, suffix: string) =>
        requiredStableLegacyAssetPath(
          `/wp-content/uploads/${suffix}`,
          eventFromContext(context)
        )
    )
    .replace(
      /https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/([^"'<>)\s]+)/giu,
      (_match, suffix: string) =>
        requiredStableLegacyAssetPath(
          `/wp-content/${suffix}`,
          eventFromContext(context)
        )
    )
    .replace(
      /https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-includes\/([^"'<>)\s]+)/giu,
      (_match, suffix: string) =>
        requiredStableLegacyAssetPath(
          `/wp-includes/${suffix}`,
          eventFromContext(context)
        )
    )
    .replace(/\/legacy-wp\/uploads\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(
        `/legacy-wp/uploads/${suffix}`,
        eventFromContext(context)
      )
    )
    .replace(/\/legacy-wp\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(`/legacy-wp/${suffix}`, eventFromContext(context))
    )
    .replace(/\/legacy-assets\/content\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(
        `/legacy-assets/content/${suffix}`,
        eventFromContext(context)
      )
    )
    .replace(/\/legacy-assets\/includes\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(
        `/legacy-assets/includes/${suffix}`,
        eventFromContext(context)
      )
    )
    .replace(/\/wp-content\/uploads\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(
        `/wp-content/uploads/${suffix}`,
        eventFromContext(context)
      )
    )
    .replace(/\/wp-content\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(`/wp-content/${suffix}`, eventFromContext(context))
    )
    .replace(/\/wp-includes\/([^"'<>)\s]+)/giu, (_match, suffix: string) =>
      requiredStableLegacyAssetPath(`/wp-includes/${suffix}`, eventFromContext(context))
    )
    .replace(
      /https?:\\\/\\\/(?:www\\\.)?(?:legacy\\\.)?pycon\\\.hk\\\/([^"'<>)\s]+)/giu,
      (_match, suffix: string) => `\\/${suffix}`
    );
}

interface LegacyPagefindOptions {
  route: string;
  title?: string;
}

export function prepareLegacySearchableHtml(
  html: string,
  { route, title }: LegacyPagefindOptions
) {
  const year = legacyPagefindYearFromRoute(route);
  const repairedHtml = repairLegacyCanonical(
    repairLegacySearchForms(cleanLegacyHtml(html, { route }), { route }),
    route
  );

  return addLegacyPagefindAttributes(repairedHtml, { title, year });
}

function repairLegacyCanonical(html: string, route: string) {
  const canonicalUrl = toAbsoluteSiteUrl(buildCanonicalPath(route));

  return html.replace(/<link\b(?=[^>]*\brel=(['"])canonical\1)[^>]*>/iu, (link) =>
    /\bhref=(['"])[^'"]*\1/iu.test(link)
      ? link.replace(/\bhref=(['"])[^'"]*\1/iu, `href="${canonicalUrl}"`)
      : link.replace(/\s*\/?>(?:\s*)$/u, ` href="${canonicalUrl}" />`)
  );
}

export function legacyPagefindYearFromRoute(route: string) {
  if (route.startsWith('/2020-spring/')) {
    return '2020 Spring';
  }

  if (route.startsWith('/2020-fall/')) {
    return '2020 Fall';
  }

  const match = route.match(/^\/(\d{4})(?:\/|$)/u);

  return match?.[1] ?? 'Archive';
}

export function repairLegacySearchForms(html: string, context: LegacyHrefContext = {}) {
  const action = searchActionForContext(context);

  return html.replace(/<form\b[\s\S]*?<\/form>/giu, (form) => {
    if (!isLegacySearchForm(form)) {
      return form;
    }

    if (/\baction\s*=\s*(["'])[^"']*\1/iu.test(form)) {
      return form.replace(/\baction\s*=\s*(["'])[^"']*\1/iu, `action="${action}"`);
    }

    return form.replace(/<form\b/iu, `<form action="${action}"`);
  });
}

function canonicalLegacyUrlValue(value: string, context: LegacyHrefContext) {
  const cleanValue = stripLegacyFormatControls(value).replace(/^\.\/\//u, '/');

  if (!cleanValue || skippableUrl(cleanValue)) {
    return cleanValue;
  }

  const sourceAssetUpload = cleanValue.match(
    /\/src\/years\/\d{4}\/assets\/live\/wp-content\/uploads\/(.+)$/u
  );

  if (sourceAssetUpload) {
    return `${eventHome(eventFromContext(context)).replace(/\/$/u, '')}/assets/uploads/${sourceAssetUpload[1]}`;
  }

  const protocolRelative = cleanValue.startsWith('//')
    ? `https:${cleanValue}`
    : cleanValue;
  let url: URL;

  try {
    url = new URL(protocolRelative, 'https://pycon.hk');
  } catch {
    return cleanValue;
  }

  if (!internalLegacyHosts.has(url.hostname)) {
    return cleanValue;
  }

  if (url.hostname === legacy2015Host && rootPath(url.pathname)) {
    return `/2015/${url.hash}`;
  }

  const suffix = `${url.search}${url.hash}`;

  if (url.pathname.startsWith('/cdn-cgi/l/email-protection')) {
    return 'mailto:pycon@pycon.hk';
  }

  if (
    url.pathname === '/wp-json' ||
    url.pathname.startsWith('/wp-json/') ||
    url.pathname === '/xmlrpc.php' ||
    url.pathname === '/wp-login.php'
  ) {
    return `${eventHome(eventFromContext(context))}${url.hash}`;
  }

  const assetPath = stableLegacyAssetPath(url.pathname, eventFromContext(context));

  if (assetPath) {
    return `${assetPath}${suffix}`;
  }

  const highlightedPath = canonicalLegacyHighlightPath(url.pathname);

  if (highlightedPath) {
    return `${highlightedPath}${suffix}`;
  }

  const event = eventFromContext(context);
  const alias = localLegacyAlias(url.pathname, event);

  if (alias) {
    return `${alias}${suffix}`;
  }

  if (
    rootPath(url.pathname) ||
    url.pathname === '/feed/' ||
    url.pathname === '/comments/feed/' ||
    /^\/(?:2015|2016|2017|2018|2020|2020-spring|2020-fall|2021|2022|2023|2024|2025|2026)\/(?:feed|comments\/feed)(?:\/index\.html)?\/?$/u.test(
      url.pathname
    )
  ) {
    return `${eventHome(event)}${url.hash}`;
  }

  if (eventPathPattern.test(url.pathname)) {
    return `${normalizeLocalPath(url.pathname)}${suffix}`;
  }

  if (/^\/(?:author|category|tag)(?:\/|$)/u.test(url.pathname)) {
    return `${eventHome(event)}${suffix}`;
  }

  return cleanValue.startsWith('http') || cleanValue.startsWith('//')
    ? `${normalizeLocalPath(url.pathname)}${suffix}`
    : cleanValue;
}

function rewriteLegacySrcset(srcset: string, context: LegacyHrefContext) {
  return srcset
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      const parts = trimmed.match(/^(\S+)(.*)$/su);

      if (!parts) {
        return '';
      }

      const [, url, descriptor] = parts;
      const rewritten = canonicalLegacyUrlValue(url, context);

      return `${rewritten}${descriptor}`;
    })
    .filter(Boolean)
    .join(', ');
}

function eventFromContext({ event, route }: LegacyHrefContext) {
  if (event) {
    return event;
  }

  const normalizedRoute = route ?? '';
  const match = eventPrefixes.find(
    (prefix) =>
      normalizedRoute === `/${prefix}` || normalizedRoute.startsWith(`/${prefix}/`)
  );

  return match ?? '2024';
}

function eventHome(event: string) {
  return `/${event}/`;
}

function searchActionForContext(context: LegacyHrefContext) {
  return `/${eventFromContext(context)}/search/`;
}

function localLegacyAlias(pathname: string, event: string) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const byEvent = eventAliasMap[event]?.[normalized];

  if (byEvent) {
    return byEvent;
  }

  const springSession = normalized.match(/^\/sessions-2020-spring\/(.+)$/u);

  if (springSession) {
    return `/2020-spring/${springSession[1]}`;
  }

  const categoryYear = normalized.match(
    /^\/category\/(2015|2016|2017|2018|2020|2020-spring|2020-fall|2021|2022|2023|2024|2025|2026)(?:\/page\/(\d+)\/)?$/u
  );

  if (categoryYear) {
    return categoryYear[2]
      ? `/${categoryYear[1]}/page/${categoryYear[2]}/`
      : `/${categoryYear[1]}/`;
  }

  const rootPagination = normalized.match(/^\/page\/(\d+)\/$/u);

  if (rootPagination) {
    return `/${event}/page/${rootPagination[1]}/`;
  }

  return genericAliasMap[normalized];
}

function normalizeLocalPath(pathname: string) {
  if (pathname.endsWith('/') || /\/[^/]+\.[^/]+$/u.test(pathname)) {
    return pathname;
  }

  return `${pathname}/`;
}

function skippableUrl(value: string) {
  return /^(?:#|data:|mailto:|tel:|javascript:)/iu.test(value);
}

function escapeJsonPath(value: string) {
  return value.replace(/\//gu, '\\/');
}

function unescapeJsonPath(value: string) {
  return value.replace(/\\\//gu, '/');
}

function stripLegacyWordPressArtifacts(html: string) {
  return html
    .replace(
      /<link\b[^>]*\bhref=(["'])(?:https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk)?\/(?:wp-json(?:\/[^"']*)?|xmlrpc\.php[^"']*)\1[^>]*>\s*/giu,
      ''
    )
    .replace(/<link\b[^>]*\brel=(["'])https:\/\/api\.w\.org\/\1[^>]*>\s*/giu, '')
    .replace(/<link\b[^>]*\brel=(["'])EditURI\1[^>]*>\s*/giu, '')
    .replace(
      /<link\b[^>]*\bhref=(["'])(?:https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk)?\/feed\/?\1[^>]*>\s*/giu,
      ''
    )
    .replace(
      /<link\b[^>]*\bhref=(["'])(?:https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk)?\/comments\/feed\/?\1[^>]*>\s*/giu,
      ''
    )
    .replace(
      /<script\b[^>]*\bsrc=(["'])(?:https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk)?\/cdn-cgi\/scripts\/5c5dd728\/cloudflare-static\/email-decode\.min\.js\1[^>]*>\s*<\/script>\s*/giu,
      ''
    )
    .replace(
      /<script\b[^>]*type=(["'])speculationrules\1[^>]*>[\s\S]*?<\/script>\s*/giu,
      ''
    )
    .replace(
      /<script\b[^>]*>[\s\S]*?challenge-platform\/scripts\/jsd\/main\.js[\s\S]*?<\/script>\s*/giu,
      ''
    );
}

function rootPath(pathname: string) {
  return pathname === '' || pathname === '/';
}

const genericAliasMap: Record<string, string> = {
  '/access-guide-conference-day/': '/2024/2024-access-guide-conference-day/',
  '/access-guide-development-sprint-day/':
    '/2024/2024-access-guide-development-sprint-day/',
  '/booths/': '/2024/2024-booths/',
  '/communities/': '/2024/2024-supporting-organizations/',
  '/conference-highlights/': '/2024/photos/',
  '/news/': '/2025/news/',
  '/organizers/': '/2024/2024-organizers/',
  '/schedule/': '/2024/schedule/',
  '/sponsors/': '/2024/2024-sponsors/',
  '/sprint/': '/2024/2024-sprint/',
  '/volunteers/': '/2024/2024-volunteers/',
};

const legacy2024AliasMap: Record<string, string> = {
  ...genericAliasMap,
  '/news/': '/2024/news/',
};

const eventAliasMap: Record<string, Record<string, string>> = {
  '2015': {
    '/conference-highlights/': '/2015/photos/',
    '/schedule/': '/2015/schedule/',
  },
  '2016': {
    '/conference-highlights/': '/2016/photos/',
    '/schedule/': '/2016/program/',
    '/sponsor/': '/2016/sponsor/',
    '/venue/': '/2016/venue/',
    '/volunteer/': '/2016/volunteer/',
  },
  '2017': {
    '/conference-highlights/': '/2017/photos/',
    '/schedule/': '/2017/schedule/',
    '/sponsor/': '/2017/sponsor/',
    '/venue/': '/2017/venue/',
  },
  '2018': {
    '/conference-highlights/': '/2018/photos/',
    '/organisers/': '/2018/organisers-and-partners-2018/',
    '/organizers/': '/2018/organisers-and-partners-2018/',
    '/schedule/': '/2018/schedule-2018/',
    '/sponsor/': '/2018/sponsors-2018/',
    '/sponsors/': '/2018/sponsors-2018/',
    '/volunteers/': '/2018/volunteers-2018/',
  },
  '2020-spring': {
    '/2020/sessions-2020-spring/': '/2020-spring/sessions-2020-spring/',
    '/2020/2020-spring/the-development-sprint-of-online-pycon-hk-2020-spring/':
      '/2020-spring/the-development-sprint-of-online-pycon-hk-2020-spring/',
    '/2020/2020-spring/unconference/': '/2020-spring/unconference/',
    '/2020/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83/':
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83/',
    '/2020/2020-spring/what-can-we-do-for-the-python-community-in-hong-kong-in-2020/':
      '/2020-spring/what-can-we-do-for-the-python-community-in-hong-kong-in-2020/',
    '/conference-highlights/': '/2020-spring/photos/',
    '/schedule/': '/2020-spring/2020-spring-schedule/',
  },
  '2020-fall': {
    '/conference-highlights/': '/2020-fall/photos/',
    '/schedule/': '/2020-fall/2020-fall-schedule/',
    '/sponsors/': '/2020-fall/sponsors-2020-fall/',
    '/volunteers/': '/2020-fall/staff/',
  },
  '2020': {
    '/conference-highlights/': '/2020-fall/photos/',
  },
  '2021': {
    '/conference-highlights/': '/2021/photos/',
    '/schedule/': '/2021/2021-schedule/',
    '/sponsors/': '/2021/2021-sponsors/',
    '/volunteers/': '/2021/2021-staff/',
  },
  '2022': {
    '/communities/': '/2022/2022-supporting-organizations/',
    '/conference-highlights/': '/2022/photos/',
    '/organizers/': '/2022/2022-organizers/',
    '/schedule/': '/2022/2022-schedule/',
    '/sponsors/': '/2022/2022-sponsors/',
    '/volunteers/': '/2022/2022-volunteers/',
  },
  '2023': {
    '/booths/': '/2023/2023-booths/',
    '/communities/': '/2023/2023-supporting-organizations/',
    '/conference-highlights/': '/2023/photos/',
    '/organizers/': '/2023/2023-organizers/',
    '/schedule/': '/2023/2023-schedule/',
    '/sponsors/': '/2023/2023-sponsors/',
    '/volunteers/': '/2023/2023-volunteers/',
  },
  '2024': legacy2024AliasMap,
  '2025': {
    '/access-guide/': '/2025/access-guide/',
    '/catering-guide/': '/2025/catering-guide/',
    '/conference-highlights/': '/2025/',
    '/news/': '/2025/news/',
    '/schedule/': '/2025/schedule/',
    '/sponsors/': '/2025/sponsorships/',
    '/sponsorships/': '/2025/sponsorships/',
    '/sprint/': '/2025/sprint/',
    '/volunteers/': '/2025/volunteers/',
  },
  '2026': {
    '/news/': '/2026/en/',
    '/schedule/': '/2026/en/',
    '/sponsors/': '/2026/en/',
    '/sprint/': '/2026/en/',
  },
};

function addLegacyPagefindAttributes(
  html: string,
  { title, year }: { title?: string; year: string }
) {
  return markLegacyPagefindBody(addLegacyPagefindHeadMetadata(html, { title, year }));
}

function addLegacyPagefindHeadMetadata(
  html: string,
  { title, year }: { title?: string; year: string }
) {
  if (
    !/<\/head>/iu.test(html) ||
    html.includes(`data-pagefind-filter="year:${year}"`)
  ) {
    return html;
  }

  const metadata = [
    `<meta data-pagefind-filter="year:${escapeHtmlAttribute(year)}">`,
    `<meta data-pagefind-meta="year:${escapeHtmlAttribute(year)}">`,
    title && `<meta data-pagefind-meta="title:${escapeHtmlAttribute(title)}">`,
  ]
    .filter(Boolean)
    .join('\n\t');

  return html.replace(/<\/head>/iu, `\t${metadata}\n</head>`);
}

function markLegacyPagefindBody(html: string) {
  if (html.includes('data-pagefind-body')) {
    return html;
  }

  if (/<main\b/iu.test(html)) {
    return html.replace(/<main\b([^>]*)>/iu, (_match, attributes: string) => {
      return `<main${attributes} data-pagefind-body>`;
    });
  }

  return html.replace(/<body\b([^>]*)>/iu, (_match, attributes: string) => {
    return `<body${attributes} data-pagefind-body>`;
  });
}

function isLegacySearchForm(form: string) {
  return (
    /\bmethod\s*=\s*["']get["']/iu.test(form) &&
    /\bname\s*=\s*["']s["']/iu.test(form) &&
    (/\btype\s*=\s*["']search["']/iu.test(form) ||
      /\bclass\s*=\s*["'][^"']*\bsearch-form\b/iu.test(form) ||
      /\brole\s*=\s*["']search["']/iu.test(form))
  );
}

function escapeHtmlAttribute(value: string) {
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
