import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const distDir = new URL('../dist/', import.meta.url);
const routeContract = JSON.parse(
  fs.readFileSync(new URL('../src/years/2018/data/routes.json', import.meta.url), 'utf8')
);
const auditedRoutes = [
  ...routeContract.requiredRoutes,
  ...routeContract.wordpressAliases.map((alias) => alias.from),
];

describe('PyCon HK 2018 link contract', () => {
  it('keeps every same-origin 2018 page link resolvable in the static build', () => {
    const brokenLinks = collectSameOriginLinks()
      .filter((link) => !isResolvablePath(link.pathname))
      .map((link) => ({
        href: link.href,
        pathname: link.pathname,
        source: link.source,
      }));

    assert.deepEqual(brokenLinks, []);
  });
});

function collectSameOriginLinks() {
  const links = [];

  for (const source of auditedRoutes) {
    const html = fs.readFileSync(outputFileForRoute(source), 'utf8');

    for (const match of html.matchAll(/<a\b[^>]*\shref=(["'])(.*?)\1/giu)) {
      const href = match[2].replace(/&amp;/gu, '&');
      const parsed = parseSameOriginHref(href);

      if (parsed) {
        links.push({ href, pathname: parsed.pathname, source });
      }
    }
  }

  return links;
}

function parseSameOriginHref(href) {
  if (!href || /^(?:#|mailto:|tel:|javascript:)/iu.test(href)) {
    return undefined;
  }

  try {
    const url = new URL(href, 'https://pycon.hk');

    if (url.origin !== 'https://pycon.hk') {
      return undefined;
    }

    return url;
  } catch {
    return undefined;
  }
}

function isResolvablePath(pathname) {
  if (pathname === '/') {
    return fs.existsSync(new URL('index.html', distDir));
  }

  if (pathname.startsWith('/_astro/')) {
    return fs.existsSync(new URL(pathname.replace(/^\//u, ''), distDir));
  }

  const clean = decodeURI(pathname).replace(/^\/|\/$/gu, '');
  const exactPath = path.join(distDir.pathname, clean);

  if (fs.existsSync(exactPath)) {
    return true;
  }

  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return fs.existsSync(path.join(distDir.pathname, fileName));
}

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');

  return path.join(distDir.pathname, `${clean}.html`);
}
