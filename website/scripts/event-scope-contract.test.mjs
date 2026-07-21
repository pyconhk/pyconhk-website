import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const distDir = new URL('../dist/', import.meta.url);

const eventPrefixes = [
  '/2015',
  '/2016',
  '/2017',
  '/2018',
  '/2020',
  '/2020-spring',
  '/2020-fall',
  '/2021',
  '/2022',
  '/2023',
  '/2024',
  '/2025',
  '/2026',
];
const allowedRootRoutes = new Set(['/', '/404', '/privacy-policy']);
const allowedAssetPrefixes = [
  '/_astro',
  '/favicon.ico',
  '/pagefind',
  '/robots.txt',
  '/sitemap.xml',
];

function* walkFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* walkFiles(filePath);
    } else if (entry.isFile()) {
      yield filePath;
    }
  }
}

function htmlFiles() {
  return [...walkFiles(distDir.pathname)].filter((filePath) =>
    filePath.endsWith('.html')
  );
}

function routeFromOutputFile(filePath) {
  const relativePath = path.relative(distDir.pathname, filePath);

  if (relativePath === 'index.html') {
    return '/';
  }

  return `/${relativePath.replace(/\.html$/u, '')}`;
}

function isEventScoped(pathname) {
  return eventPrefixes.some(
    (eventPrefix) => pathname === eventPrefix || pathname.startsWith(`${eventPrefix}/`)
  );
}

function isAllowedAssetPath(pathname) {
  return allowedAssetPrefixes.some(
    (assetPrefix) => pathname === assetPrefix || pathname.startsWith(`${assetPrefix}/`)
  );
}

function attributeValues(html, attributeName) {
  return [...html.matchAll(new RegExp(`\\b${attributeName}=["']([^"']+)["']`, 'giu'))]
    .map((match) => match[1]);
}

function localPathname(url) {
  const comparableUrl = url.startsWith('//') ? `https:${url}` : url;

  if (comparableUrl.startsWith('http://') || comparableUrl.startsWith('https://')) {
    const parsed = new URL(comparableUrl);

    if (!isPyConHostUrl(comparableUrl)) {
      return undefined;
    }

    return parsed.pathname;
  }

  return url.split('#', 1)[0].split('?', 1)[0];
}

function isPyConHostUrl(url) {
  const comparableUrl = url.startsWith('//') ? `https:${url}` : url;

  if (!comparableUrl.startsWith('http://') && !comparableUrl.startsWith('https://')) {
    return false;
  }

  const { hostname } = new URL(comparableUrl);

  return hostname === 'pycon.hk' || hostname === 'www.pycon.hk' || hostname === 'legacy.pycon.hk';
}

function isEventAssetPath(pathname) {
  return eventPrefixes.some((eventPrefix) =>
    pathname.startsWith(`${eventPrefix}/assets/`)
  );
}

function isResolvableRoute(pathname) {
  const cleanPathname = pathname.replace(/\/+$/u, '');
  const relativePath = decodeURIComponent(cleanPathname.replace(/^\//u, ''));

  return (
    fs.existsSync(path.join(distDir.pathname, relativePath)) ||
    fs.existsSync(path.join(distDir.pathname, `${relativePath}.html`)) ||
    fs.existsSync(path.join(distDir.pathname, relativePath, 'index.html'))
  );
}

function normalizeRedirectPath(value) {
  try {
    return encodeURI(decodeURI(value));
  } catch {
    return encodeURI(value);
  }
}

function redirects() {
  return fs.readFileSync(path.join(distDir.pathname, '_redirects'), 'utf8');
}

function redirectSources() {
  return new Map(
    redirects()
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [source, destination, status] = line.split(/\s+/u);

        return [normalizeRedirectPath(source), { destination, status }];
      })
  );
}

describe('event-scoped archive contract', () => {
  it('emits no root-level document routes except the root redirect and 404 page', () => {
    const rootRoutes = htmlFiles()
      .map(routeFromOutputFile)
      .filter((route) => !isEventScoped(route) && !allowedRootRoutes.has(route))
      .sort();

    assert.deepEqual(rootRoutes, []);
  });

  it('does not render WordPress compatibility asset paths in HTML', () => {
    const references = [];

    for (const filePath of htmlFiles()) {
      const route = routeFromOutputFile(filePath);
      const html = fs.readFileSync(filePath, 'utf8');

      if (/\/(?:wp-(?:content|includes)|legacy-(?:wp|assets))\b/iu.test(html)) {
        references.push(route);
      }
    }

    assert.deepEqual(references, []);
  });

  it('does not render pycon.hk or legacy.pycon.hk navigation links', () => {
    const links = [];

    for (const filePath of htmlFiles()) {
      const route = routeFromOutputFile(filePath);
      const html = fs.readFileSync(filePath, 'utf8');

      for (const [tag] of html.matchAll(/<(?:a|form)\b[^>]*>/giu)) {
        for (const attributeName of ['href', 'action']) {
          for (const url of attributeValues(tag, attributeName)) {
            if (isPyConHostUrl(url)) {
              links.push([route, attributeName, url]);
            }
          }
        }
      }
    }

    assert.deepEqual(links, []);
  });

  it('does not render root-level local href/action links for site pages', () => {
    const links = [];

    for (const filePath of htmlFiles()) {
      const route = routeFromOutputFile(filePath);
      const html = fs.readFileSync(filePath, 'utf8');

      for (const attributeName of ['href', 'action']) {
        for (const url of attributeValues(html, attributeName)) {
          if (!url.startsWith('/')) {
            continue;
          }

          const pathname = localPathname(url);

          if (
            pathname &&
            !isEventScoped(pathname) &&
            !isAllowedAssetPath(pathname) &&
            pathname !== route
          ) {
            links.push([route, attributeName, url]);
          }
        }
      }
    }

    assert.deepEqual(links, []);
  });

  it('materializes every event-scoped asset referenced by rendered HTML', () => {
    const missingAssets = [];

    for (const filePath of htmlFiles()) {
      const route = routeFromOutputFile(filePath);
      const html = fs.readFileSync(filePath, 'utf8');

      for (const attributeName of ['href', 'src', 'poster', 'data-src', 'data-image-src']) {
        for (const url of attributeValues(html, attributeName)) {
          const pathname = localPathname(url);

          if (!pathname || !isEventAssetPath(pathname)) {
            continue;
          }

          const assetPath = path.join(distDir.pathname, decodeURIComponent(pathname));

          if (!fs.existsSync(assetPath)) {
            missingAssets.push([route, attributeName, pathname]);
          }
        }
      }
    }

    assert.deepEqual(missingAssets, []);
  });

  it('rewrites every event page trailing-slash route to a resolvable event route', () => {
    const sources = redirectSources();
    let missingRewriteCount = 0;
    const missingRewriteExamples = [];

    for (const filePath of htmlFiles()) {
      const route = routeFromOutputFile(filePath);

      if (!isEventScoped(route) || route.endsWith('/')) {
        continue;
      }

      const slashRoute = `${route}/`;
      const redirect = sources.get(normalizeRedirectPath(slashRoute));

      if (!redirect) {
        missingRewriteCount += 1;

        if (missingRewriteExamples.length < 20) {
          missingRewriteExamples.push([slashRoute, route]);
        }
        continue;
      }

      if (
        redirect.status !== '200' ||
        !isEventScoped(redirect.destination) ||
        !isResolvableRoute(redirect.destination)
      ) {
        missingRewriteCount += 1;

        if (missingRewriteExamples.length < 20) {
          missingRewriteExamples.push([slashRoute, route, redirect]);
        }
      }
    }

    assert.equal(
      missingRewriteCount,
      0,
      `Found ${missingRewriteCount} missing event trailing-slash rewrites. Examples: ${JSON.stringify(missingRewriteExamples)}`
    );
  });
});
