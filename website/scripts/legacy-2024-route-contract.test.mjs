import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.mjs';
import { legacy2024Pages } from '../src/years/2024/data/pages.ts';

const distDir = new URL('../dist/', import.meta.url);

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');
  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

function readDistFile(filePath) {
  return fs.readFileSync(path.join(distDir.pathname, filePath), 'utf8');
}

function attributeValues(html, attributeName) {
  return [...html.matchAll(new RegExp(`\\b${attributeName}=["']([^"']+)["']`, 'giu'))]
    .map((match) => match[1]);
}

function srcsetUrls(html) {
  return attributeValues(html, 'srcset').flatMap((srcset) =>
    srcset.split(',').map((candidate) => candidate.trim().split(/\s+/u)[0])
  );
}

function stripHashAndQuery(url) {
  return url.split('#', 1)[0].split('?', 1)[0];
}

function localAssetPath(url) {
  const pathOnly = stripHashAndQuery(url);

  if (pathOnly.startsWith('/_astro/')) {
    return new URL(pathOnly.slice(1), distDir).pathname;
  }

  const eventAsset = pathOnly.match(/^\/(2024)\/assets\/(.+)$/u);

  if (eventAsset) {
    return path.join(distDir.pathname, eventAsset[1], 'assets', eventAsset[2]);
  }

  return undefined;
}

function linkedStylesheets(html) {
  return attributeValues(html, 'href')
    .filter((href) => stripHashAndQuery(href).startsWith('/_astro/'))
    .filter((href) => stripHashAndQuery(href).endsWith('.css'))
    .map((href) => fs.readFileSync(localAssetPath(href), 'utf8'))
    .join('\n');
}

describe('PyCon HK 2024 archive contract', () => {
  it('keeps the Pages root owned by the current-year locale redirect, not 2024', () => {
    const redirects = readDistFile('_redirects');

    assert.doesNotMatch(redirects, /^\/\s+\/2026\/en\s+30[128]$/mu);
    assert.doesNotMatch(redirects, /^\/ \/2024 200$/mu);
    assert.doesNotMatch(redirects, /^\/ \/2024 308$/mu);
  });

  it('emits the 2024 archive route and every migrated 2024 page', () => {
    const routes = ['/', ...legacy2024Pages.map((page) => page.url)];
    const missing = routes
      .map((route) => [`/2024${route === '/' ? '/' : route.replace(/^\/2024/u, '')}`, outputFileForRoute(route === '/' ? '/2024/' : route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('renders the live 2024 archive at the year root', () => {
    const home = readOutput('/2024/');
    const postTitles = home.match(/class="wp-block-post-title"/gu);

    assert.match(home, /<title>2024 - PyCon HK<\/title>/u);
    assert.match(home, /wp-theme-voyago/u);
    assert.match(home, /class="wp-site-blocks"/u);
    assert.match(home, /wp-block-navigation__container/u);
    assert.match(home, /wp-block-post-template/u);
    assert.match(home, /PyCon HK 2024 Photos/u);
    assert.match(home, /PyCon HK 2024 Pre-Event Notice/u);
    assert.match(home, /PyCon HK 2024 (?:-|–) Call For Proposal/u);
    assert.equal(postTitles?.length, 21);
    assert.doesNotMatch(home, /https:\/\/legacy\.pycon\.hk/u);
    assert.doesNotMatch(home, /href="\/feed\/"/u);
    assertAllConferenceArchiveHrefs(home, '2024 history links');
    assertNoExternalConferenceArchiveHrefs(home, '2024 history links');
  });

  it('routes every 2024 News control to the live archive root', () => {
    const newsLink = /href="\/2024\/"[^>]*>(?:\s*<span\b[^>]*>)?\s*News(?:\s*<\/span>)?/u;
    const pages = [
      readOutput('/2024/'),
      readOutput('/2024/2024-volunteers/'),
      readOutput('/2024/11/'),
      readOutput('/2024/search/'),
      readOutput('/2024/photos/'),
    ];

    for (const page of pages) {
      assert.match(page, newsLink);
    }

    const redirects = readDistFile('_redirects');
    const sitemap = readDistFile('sitemap.xml');

    assert.match(redirects, /^\/2024\/news\/? \/2024 308$/mu);
    assert.match(sitemap, /<loc>https:\/\/pycon\.hk\/2024<\/loc>/u);
    assert.doesNotMatch(sitemap, /<loc>https:\/\/pycon\.hk\/2024\/news<\/loc>/u);
  });

  it('renders 2024 articles with the exact Voyago block-theme shell', () => {
    const page = readOutput('/2024/2024-volunteers/');

    assert.match(page, /<body class="[^"]*\bwp-theme-voyago\b/u);
    assert.match(page, /class="wp-site-blocks"/u);
    assert.match(page, /wp-block-navigation__container/u);
    assert.match(page, /\/2024\/assets\/content\/themes\/voyago\/style\.css/u);
    assert.match(page, /Volunteers (?:-|–) PyCon HK/u);
    assert.doesNotMatch(page, /voyago-article-page/u);
  });

  it('normalizes 2024 WordPress uploads to the shared local upload route', () => {
    const html = [readOutput('/2024/'), ...legacy2024Pages.map((page) => readOutput(page.url))].join('\n');

    assert.doesNotMatch(html, /\/2024\/2024\/assets\//u);
    assert.match(html, /\/2024\/assets\/uploads\/2024\/09\/logo_1200px-150x150\.gif/u);
    assert.doesNotMatch(html, /\/legacy-wp\//u);
    assert.doesNotMatch(html, /\s(?:content|href|src|srcset)="(?:https:\/\/pycon\.hk)?\/wp-content\//u);
    assert.doesNotMatch(html, /\/src\/years\//u);
    assert.doesNotMatch(html, /\bsrc="\.\/\//u);
    assert.match(
      html,
      /src="\/2024\/assets\/uploads\/2025\/07\/6178999587549856536\.jpg"/u
    );
  });

  it('keeps 2024 Sprint links in the year scope', () => {
    const html = legacy2024Pages.map((page) => readOutput(page.url)).join('\n');
    const redirects = readDistFile('_redirects');

    assert.match(html, /href="\/2024\/2024-sprint\/?"/u);
    assert.doesNotMatch(html, /\/2024\/2024\/2024-sprint/u);
    assert.match(
      redirects,
      /^\/2024\/2024\/2024-sprint\/? \/2024\/2024-sprint 308$/mu
    );
  });

  it('lists the 2024 photos card once in the November archive', () => {
    const archive = readOutput('/2024/11/');
    const photoHeadings = archive.match(
      /<h3\b[^>]*>\s*<a\b[^>]*href="\/2024\/photos\/"[^>]*>PyCon HK 2024 Photos<\/a>\s*<\/h3>/gu
    );

    assert.equal(photoHeadings?.length, 1);
  });

  it('decodes Cloudflare-protected 2024 email links before rendering', () => {
    const cfp = readOutput('/2024/pycon-hk-2024-join-us-on-november-16-for-an-exciting-python-community-event/');
    const conduct = readOutput('/2024/2024-code-of-conduct/');
    const reporting = readOutput('/2024/2024-attendee-reporting/');

    assert.match(cfp, /mailto:pyconhk2024@pycon\.hk/u);
    assert.match(conduct, /mailto:pycon@pycon\.hk/u);
    assert.match(reporting, /mailto:pycon@pycon\.hk/u);

    for (const html of [cfp, conduct, reporting]) {
      assert.doesNotMatch(html, /__cf_email__|data-cfemail|email-protection|\[email(?:&#160;|\s)protected\]/iu);
    }
  });

  it('does not leave 2024 page-local links pointing at the site root', () => {
    const page = readOutput('/2024/pycon-hk-2024-celebrate-10-years-of-pycon-in-hong-kong-a-decade-of-achievements-recharged/');

    assert.match(page, /<a href="\/2024\/">PyCon Hong Kong \(PyCon HK\)<\/a>/u);
    assert.match(page, /The full schedule is available on(?:\s|&nbsp;)*<a href="\/2024\/">pycon\.hk<\/a>/u);
    assert.doesNotMatch(page, /\shref="\/"/u);
  });

  it('normalizes live 2024 archive links to canonical 2024 routes', () => {
    const home = readOutput('/2024/');

    assert.match(home, /\shref="\/2024\/2024-access-guide-conference-day\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-access-guide-development-sprint-day\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-about\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-code-of-conduct\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-organizers\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-sponsors\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-sprint\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-patrons\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-supporting-organizations\/?"/u);
    assert.match(home, /\shref="\/2024\/2024-volunteers\/?"/u);
    assert.match(home, /\shref="\/2024\/schedule\/?"/u);
    assert.doesNotMatch(home, /\shref="\/2024\/(?:post-\d+|about|code-of-conduct)\/?"/u);
    assert.doesNotMatch(home, /\shref="(?:2024-|schedule"|sprint"|sponsors"|volunteers"|[^"]+\/index\.html)/u);
  });

  it('keeps the live 2024 archive dropdown and spaces navigation from the brand', () => {
    const home = readOutput('/2024/');

    assert.match(home, /id="pyconhk-legacy-2024-nav-fix"/u);
    assert.match(home, /\.wp-block-site-title\s*\{/u);
    assert.match(home, /margin-left:\s*clamp\(36px,\s*4vw,\s*72px\)\s*!important/u);
    assert.match(home, /--wp--preset--color--custom-background-secondary:\s*#002020/u);
    assert.match(
      home,
      /wp-block-navigation__submenu-container has-text-color has-white-color has-background has-custom-background-secondary-background-color/u
    );
    assert.doesNotMatch(home, /background:\s*rgba\(255,\s*255,\s*255,\s*\.96\)\s*!important/u);
  });

  it('ships static mobile navigation controls for the 2024 archive header', () => {
    const home = readOutput('/2024/');

    assert.match(home, /id="pyconhk-legacy-2024-nav-script"/u);
    assert.match(home, /wp-block-navigation__responsive-container-open/u);
    assert.match(home, /\.wp-block-navigation__responsive-container\.is-menu-open/u);
    assert.match(home, /background:\s*#fff\s*!important/u);
    assert.match(home, /classList\.add\('is-menu-open', 'has-modal-open'\)/u);
    assert.match(home, /setAttribute\('aria-expanded', 'true'\)/u);
    assert.match(home, /addEventListener\('keydown'/u);
    assert.match(home, /event\.key === 'Escape'/u);
  });

  it('runs only the local navigation script in archived page shells', () => {
    const page = readOutput('/2024/2024-volunteers/');
    const scriptTags = [...page.matchAll(/<script\b[^>]*>/giu)].map(
      (match) => match[0]
    );

    assert.deepEqual(scriptTags, [
      '<script id="pyconhk-legacy-2024-nav-script">',
    ]);
  });

  it('loads the explicit Pretalx widget only on the 2024 schedule', () => {
    const schedule = readOutput('/2024/schedule/');

    assert.match(schedule, /id="pyconhk-legacy-2024-nav-script"/u);
    assert.match(schedule, /id="pyconhk-legacy-2024-schedule-script"/u);
    assert.match(
      schedule,
      /src="https:\/\/pretalx\.com\/democon\/schedule\/widget\/v2\.en\.js"/u
    );
  });

  it('references only local 2024 assets that exist on disk', () => {
    const pages = ['/2024/', ...legacy2024Pages.map((page) => page.url)];
    const missing = [];

    for (const route of pages) {
      const html = readOutput(route);
      const urls = [
        ...attributeValues(html, 'src'),
        ...attributeValues(html, 'poster'),
        ...srcsetUrls(html),
      ];

      for (const url of urls) {
        const filePath = localAssetPath(url);

        if (filePath && !fs.existsSync(filePath)) {
          missing.push([route, url]);
        }
      }
    }

    assert.deepEqual(missing, []);
  });
});
