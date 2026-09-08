import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const legacy2015HostPattern = ['2015', 'pycon', 'hk'].join(String.raw`\.`);

export const conferenceArchiveHrefs = [
  '/2026/',
  '/2025/',
  '/2024/',
  '/2023/',
  '/2022/',
  '/2021/',
  '/2020-fall/',
  '/2020-spring/',
  '/2020/',
  '/2018/',
  '/2017/',
  '/2016/',
  '/2015/',
];

export const legacyHighlightNavItems = [
  { href: '/2024/photos', label: '2024 Photos' },
  { href: '/2023/photos', label: '2023 Photos' },
  { href: '/2022/photos', label: '2022 Photos' },
  { href: '/2021/photos', label: '2021 Photos' },
  { href: '/2020-fall/photos', label: '2020 Fall Photos' },
  { href: '/2020-spring/photos', label: '2020 Spring Photos' },
  {
    href: '/2020-spring/conference-coverage',
    label: '2020 Spring Conference Coverage',
  },
  { href: '/2018/photos', label: '2018 Photos' },
  { href: '/2017/recording', label: '2017 Recording' },
  { href: '/2017/photos', label: '2017 Photos' },
  { href: '/2016/photos', label: '2016 Photos' },
  { href: '/2015/photos', label: '2015 Photos' },
];

export function assertAllConferenceArchiveHrefs(html, context) {
  for (const href of conferenceArchiveHrefs) {
    assert.match(
      html,
      new RegExp(`<a\\b[^>]*href="${escapeRegExp(href)}"`, 'u'),
      `${context} should link to ${href}`
    );
  }
}

export function assertAllLegacyHighlightNavLinks(html, context) {
  const menuMatch = html.match(
    /<li\b(?=[^>]*\bmenu-item-has-children\b)[^>]*>\s*<a\b[^>]*href="\/2024\/photos\/?"[^>]*>\s*Conference Highlights\s*<\/a>\s*<ul class="sub-menu">(?<menu>[\s\S]*?)<\/ul>\s*<\/li>/u
  );
  const menuHtml = menuMatch?.groups?.menu;

  assert.ok(
    menuHtml,
    `${context} should render Conference Highlights as a dropdown menu`
  );

  for (const { href, label } of legacyHighlightNavItems) {
    assert.match(menuHtml, anchorPattern(href, label), `${context} should link to ${href}`);
  }

  assert.doesNotMatch(
    menuHtml,
    /href=["']\/conference-highlights\//u,
    `${context} should not link to compatibility-only conference highlight URLs`
  );
}

export function assertNoExternalConferenceArchiveHrefs(html, context) {
  assert.doesNotMatch(
    html,
    /<a\b[^>]*href=["']https?:\/\/(?:www\.)?pycon\.hk\/(?:201[5-8]|202[0-6]|2020-(?:fall|spring))\/?["']/iu,
    `${context} should not link to pycon.hk year archives externally`
  );
  assert.doesNotMatch(
    html,
    new RegExp(`<a\\b[^>]*href=["']https?:\\/\\/${legacy2015HostPattern}\\/?["']`, 'iu'),
    `${context} should not link to the legacy 2015 host externally`
  );
}

export function assertConferenceArchiveTargetsExist() {
  const missing = conferenceArchiveHrefs.filter((href) => !isResolvablePath(href));

  assert.deepEqual(missing, []);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function anchorPattern(href, label) {
  const normalizedHref = href.replace(/\/$/u, '');

  return new RegExp(
    `<a\\b[^>]*href="${escapeRegExp(normalizedHref)}\\/?">\\s*${escapeRegExp(label)}\\s*<\\/a>`,
    'u'
  );
}

function isResolvablePath(pathname) {
  if (pathname === '/') {
    return fs.existsSync(new URL('index.html', distDir));
  }

  const clean = decodeURI(pathname).replace(/^\/|\/$/gu, '');
  const exactPath = path.join(distDir.pathname, clean);

  if (fs.existsSync(exactPath)) {
    return true;
  }

  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return fs.existsSync(path.join(distDir.pathname, fileName));
}
