import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const distDir = new URL('../dist/', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
const packageJsonPath = new URL('../package.json', import.meta.url);
const buildPagefindPath = new URL('./build-pagefind.mjs', import.meta.url);

const searchableEditions = [
  { route: '/2018/', year: '2018' },
  { route: '/2020/', year: '2020' },
  { route: '/2020-spring/', year: '2020 Spring' },
  { route: '/2020-fall/', year: '2020 Fall' },
  { route: '/2021/', year: '2021' },
  { route: '/2022/', year: '2022' },
  { route: '/2023/', year: '2023' },
  { route: '/2024/', year: '2024' },
  { route: '/2024/2024-volunteers/', year: '2024' },
  { route: '/2025/', year: '2025' },
  { route: '/2025/schedule/', year: '2025' },
  { route: '/2025/news/sailing-together/', year: '2025' },
  { route: '/2026/en/', year: '2026' },
];
const searchFormRoutes = searchableEditions.filter(
  ({ route }) =>
    !route.startsWith('/2025/') &&
    !route.startsWith('/2026/') &&
    route !== '/2024/' &&
    route !== '/2024/2024-volunteers/'
);
const archiveMonthRoutes = [
  '/2024/11/',
  '/2024/10/',
  '/2024/09/',
  '/2024/07/',
  '/2024/04/',
  '/2023/12/',
  '/2023/10/',
  '/2023/09/',
  '/2023/07/',
  '/2023/04/',
  '/2022/11/',
  '/2022/10/',
  '/2022/08/',
  '/2021/10/',
  '/2021/09/',
  '/2021/05/',
  '/2020/11/',
  '/2020/10/',
  '/2020/09/',
  '/2020/05/',
  '/2020/04/',
  '/2018/11/',
  '/2018/10/',
  '/2018/09/',
  '/2018/08/',
  '/2017/11/',
  '/2016/10/',
  '/2015/11/',
];

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');
  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

describe('legacy WordPress-style search contract', () => {
  it('runs Pagefind after Astro build', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    assert.match(packageJson.scripts.build, /astro build/u);
    assert.match(packageJson.scripts.build, /build-pagefind\.mjs|pagefind/u);
  });

  it('builds Pagefind as one English index for legacy and modern archive pages', () => {
    const buildPagefind = fs.readFileSync(buildPagefindPath, 'utf8');

    assert.match(buildPagefind, /--force-language/u);
    assert.match(buildPagefind, /['"]en['"]/u);
  });

  it('emits event-scoped static search pages wired to the Pagefind browser bundle', () => {
    const html = readOutput('/2024/search/');

    assert.match(html, /<html lang="en">/u);
    assert.match(html, /<title>Search - PyCon HK 2024<\/title>/u);
    assert.match(html, /\bclass="[^"]*\bvoyago-archive\b/u);
    assert.match(html, /\bclass="[^"]*\bvoyago-header\b/u);
    assert.match(html, /\bclass="[^"]*\bvoyago-sidebar\b/u);
    assert.match(html, /\bclass="[^"]*\bvoyago-search-results-column\b/u);
    assert.doesNotMatch(html, /\bclass="[^"]*\blegacy-search-page\b/u);
    assert.match(html, /href="\/pagefind\/pagefind-ui\.css"/u);
    assert.match(html, /src="\/pagefind\/pagefind-ui\.js"/u);
    assert.match(html, /new PagefindUI\(\{\s*element: '#legacy-search'/u);
    assert.match(html, /astro:page-load/u);
    assert.match(html, /typeof PagefindUI/u);
    assert.match(html, /searchParams\.get\('s'\)/u);
    assert.match(html, /searchParams\.get\('q'\)/u);
    assert.match(html, /#legacy-search \.pagefind-ui__search-input/u);
    assert.doesNotMatch(html, /#legacy-search input\[type="search"\]/u);
    assert.doesNotMatch(html, /data-pagefind-body/u);
  });

  it('emits the Pagefind static browser bundle next to the built site', () => {
    assert.ok(fs.existsSync(path.join(distDir.pathname, 'pagefind', 'pagefind-ui.js')));
    assert.ok(fs.existsSync(path.join(distDir.pathname, 'pagefind', 'pagefind-ui.css')));
    assert.ok(fs.existsSync(path.join(distDir.pathname, 'pagefind', 'pagefind.js')));
  });

  it('makes the Pagefind browser bundle available to the Astro dev server', () => {
    const buildPagefind = fs.readFileSync(buildPagefindPath, 'utf8');

    assert.match(buildPagefind, /public/u);
    assert.match(buildPagefind, /pagefind/u);
    assert.match(buildPagefind, /cpSync/u);
    assert.ok(fs.existsSync(path.join(publicDir.pathname, 'pagefind', 'pagefind-ui.js')));
    assert.ok(fs.existsSync(path.join(publicDir.pathname, 'pagefind', 'pagefind-ui.css')));
    assert.ok(fs.existsSync(path.join(publicDir.pathname, 'pagefind', 'pagefind.js')));
  });

  it('does not publish stale Pagefind metadata shards to the dev-server bundle', () => {
    const metadataFiles = fs
      .readdirSync(path.join(publicDir.pathname, 'pagefind'))
      .filter((file) => file.endsWith('.pf_meta'));

    assert.equal(metadataFiles.length, 1);
    assert.match(metadataFiles[0], /^pagefind\.en_[a-z0-9]+\.pf_meta$/u);
  });

  it('rewrites every 2018-2024 legacy search widget to the local search route', () => {
    for (const { route } of searchFormRoutes) {
      const html = readOutput(route);
      const searchForms = [
        ...html.matchAll(/<form\b(?=[^>]*\bmethod=["']get["'])(?=[\s\S]*?name=["']s["'])[\s\S]*?<\/form>/giu),
      ];

      assert.ok(searchForms.length > 0, `${route} should keep a WordPress search form`);

      for (const [form] of searchForms) {
        const event = route.match(/^\/([^/]+)/u)?.[1];

        assert.match(
          form,
          new RegExp(`\\baction=["']/${event}/search/["']`, 'u'),
          `${route} search form should submit to its event search page`
        );
        assert.doesNotMatch(form, /\baction=["']\/["']/u, `${route} search form should not submit to root`);
        assert.doesNotMatch(form, /\baction=["']https:\/\/pycon\.hk\/["']/u);
      }
    }
  });

  it('emits every archive-month route linked from legacy archive dropdowns', () => {
    const html = readOutput('/2024/search/');
    const linkedArchiveMonths = [
      ...html.matchAll(/<option value="(\/\d{4}\/\d{2}\/)">/gu),
    ].map((match) => match[1]);
    const missing = archiveMonthRoutes
      .filter((route) => linkedArchiveMonths.includes(route))
      .filter((route) => !fs.existsSync(outputFileForRoute(route)));

    assert.deepEqual(missing, []);
  });

  it('marks 2018-2026 pages as Pagefind-searchable with year filters', () => {
    for (const { route, year } of searchableEditions) {
      const html = readOutput(route);

      assert.match(html, /data-pagefind-body/u, `${route} should expose searchable body content`);
      assert.match(
        html,
        new RegExp(`data-pagefind-filter=["']year:${year.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']`, 'u'),
        `${route} should expose a year filter`
      );
    }
  });
});
