import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertAllLegacyHighlightNavLinks,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.ts';

const distDir = new URL('../dist/', import.meta.url);
const routeContractPath = new URL('../src/years/2018/data/routes.json', import.meta.url);
const routeContract = JSON.parse(fs.readFileSync(routeContractPath, 'utf8'));

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');
  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

function readDistFile(fileName) {
  return fs.readFileSync(path.join(distDir.pathname, fileName), 'utf8');
}

describe('PyCon HK 2018 route contract', () => {
  it('tracks the full 2018 route inventory, including archive pagination and months', () => {
    assert.ok(routeContract.requiredRoutes.includes('/2018/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/page/2/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/08/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/09/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/10/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/11/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/schedule-2018/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/sponsors-2018/'));
    assert.ok(routeContract.requiredRoutes.includes('/2018/photos/'));
    assert.equal(routeContract.requiredRoutes.length, 46);
  });

  it('emits one file-format built output for every required 2018 route', () => {
    const missing = routeContract.requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('emits local compatibility pages for live 2018 year aliases', () => {
    for (const alias of routeContract.wordpressAliases.filter((item) =>
      item.from.startsWith('/2018/')
    )) {
      assert.ok(fs.existsSync(outputFileForRoute(alias.from)), alias.from);
    }

    assert.match(readOutput('/2018/sponsor/'), /Gold Sponsor . HK01/u);
    assert.match(readOutput('/2018/sponsors/'), /Gold Sponsor . HK01/u);
    assert.match(readOutput('/2018/organisers/'), /Organisers and Partners 2018/u);
  });

  it('renders the 2018 archive homepage with the live Marketingly WordPress shell', () => {
    const home = readOutput('/2018/');

    assert.match(home, /<title>2018 - PyCon HK<\/title>/u);
    assert.match(home, /wp-theme-marketingly/u);
    assert.match(home, /class="posts-entry fbox blogposts-list\b/u);
    assert.match(home, /id="archives-dropdown-2"/u);
    assert.match(home, /class="search-submit" value="Search"/u);
    assert.match(home, /href="\/2018\/assets\/content\/themes\/marketingly\/style\.css\?ver=6\.8\.2"/u);
    assert.match(home, /\/_astro\/pyconhk-logo-R\./u);
    assert.doesNotMatch(home, /LegacyYearLanding|legacy-year-landing|legacy-archive/u);
    assert.doesNotMatch(home, /\/category\/2018\/page\/2\//u);
  });

  it('renders all conference years as local 2018 history links', () => {
    const home = readOutput('/2018/');

    assertAllConferenceArchiveHrefs(home, '2018 history links');
    assertNoExternalConferenceArchiveHrefs(home, '2018 history links');
  });

  it('renders every migrated highlight entry in the Marketingly navigation dropdown', () => {
    const home = readOutput('/2018/');

    assertAllLegacyHighlightNavLinks(home, '2018 navigation');
  });

  it('renders 2018 single-post pages with the live WordPress post chrome', () => {
    const schedule = readOutput('/2018/schedule-2018/');
    const sponsors = readOutput('/2018/sponsors-2018/');
    const session = readOutput('/2018/python-community-and-pycon-in-hong-kong-and-apac/');

    assert.match(schedule, /single-post postid-34/u);
    assert.match(schedule, /id="wpnextpreviouslink-public-css"/u);
    assert.match(schedule, /PyCon Hong Kong 2018 Schedule is now published/u);
    assert.match(schedule, /archives-dropdown-2/u);
    assert.match(sponsors, /single-post postid-281/u);
    assert.match(sponsors, /Gold Sponsor . HK01/u);
    assert.match(session, /https:\/\/www\.youtube\.com\/embed\/xnvry3Sjudg/u);
    assert.doesNotMatch(schedule + sponsors + session, /LegacyArchiveLayout|legacy-archive/u);
  });

  it('keeps the top-level 2018 photos exception under the year route', () => {
    const photos = readOutput('/2018/photos/');

    assert.match(photos, /2018 Photos/u);
    assert.match(photos, /wp-theme-marketingly/u);
    assert.doesNotMatch(photos, /href="\/conference-highlights\/2018-photos\//u);
  });

  it('serves the WordPress theme compatibility assets with local font/image references', () => {
    const missing = routeContract.compatibilityRoutes
      .map((fileName) => [
        fileName,
        path.join(
          distDir.pathname,
          '2018',
          'assets',
          fileName
            .replace(/^\/legacy-assets\/content\//u, 'content/')
            .replace(/^\/legacy-assets\/includes\//u, 'includes/')
        ),
      ])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);

    const fontAwesome = readDistFile(
      '2018/assets/content/themes/marketingly/css/font-awesome.min.css'
    );
    const marketingly = readDistFile('2018/assets/content/themes/marketingly/style.css');
    const blockLibrary = readDistFile(
      '2018/assets/includes/css/dist/block-library/style.min.css'
    );
    const jquery = readDistFile('2018/assets/includes/js/jquery/jquery.min.js');

    assert.match(fontAwesome, /url\('\/2018\/assets\/content\/themes\/marketingly\/fonts\/fontawesome-webfont\.eot/u);
    assert.match(marketingly, /font-family: 'Lato'/u);
    assert.match(blockLibrary, /\.wp-block-image/u);
    assert.match(jquery, /jQuery\.noConflict/u);
  });
});
