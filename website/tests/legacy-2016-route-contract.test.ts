import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertAllLegacyHighlightNavLinks,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.ts';
import routeContract from '../src/years/2016/data/routes.json' with { type: 'json' };

const distDir = new URL('../dist/', import.meta.url);
const projectDir = new URL('../', import.meta.url);
const legacy2015HostPattern = ['2015', 'pycon', 'hk'].join(String.raw`\.`);
const scheduleTalkRoutes = [
  '/2016/program/the-pandas-project-and-its-future/',
  '/2016/program/developing-python-applications-on-cloud/',
  '/2016/program/building-ai-chat-bot-using-python-3-and-tensorflow/',
  '/2016/program/deepwhale-recognizing-and-localizing-endangered-right-whales-with-extremely-deep-neural-networks/',
  '/2016/program/creating-python-application-with-mysql-using-mysql-connector-and-mysql-router/',
  '/2016/program/reproducible-data-analysis-in-python/',
  '/2016/program/unlocking-pdfs-by-machine-learning/',
  '/2016/program/make-your-computer-see-listen-speak-and-predict-with-python/',
  '/2016/program/using-python-to-work-with-document-in-mysql/',
  '/2016/program/panel-discussion-hk-education-and-python/',
  '/2016/program/a-girls-guide-to-growing-a-moustache/',
  '/2016/program/how-to-use-coroutine-to-build-a-socket-server/',
  '/2016/program/decorators-demystified/',
  '/2016/program/analyze-camera-images-with-deep-learning-in-python/',
  '/2016/program/massive-open-online-course-architecture-using-python-and-web-platform/',
  '/2016/program/sci-kit-learn-babystep/',
  '/2016/program/aIorchestra-lesson-learn-while-using-asyncio-coroutines-on-dynamic-sequenced-tasks/',
];

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

function readDistFile(fileName) {
  return fs.readFileSync(new URL(fileName, distDir), 'utf8');
}

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');

  return path.join(distDir.pathname, `${clean}.html`);
}

describe('PyCon HK 2016 route contract', () => {
  it('maps trailing-slash routes to Astro file-format output paths', () => {
    assert.equal(
      outputFileForRoute('/2016/'),
      path.join(distDir.pathname, '2016.html')
    );
    assert.equal(
      outputFileForRoute('/2016/program/'),
      path.join(distDir.pathname, '2016/program.html')
    );
  });

  it('has no duplicate required routes', () => {
    assert.equal(
      new Set(routeContract.requiredRoutes).size,
      routeContract.requiredRoutes.length
    );
  });

  it('includes the year-scoped photos route instead of top-level-only photos', () => {
    assert.ok(routeContract.requiredRoutes.includes('/2016/photos/'));
    assert.deepEqual(routeContract.migratedTopLevelRoutes, [
      { from: '/conference-highlights/2016-photos/', to: '/2016/photos' },
    ]);
  });

  it('renders every migrated highlight entry in the 2016 photos navigation dropdown', () => {
    const photos = readOutput('/2016/photos/');

    assertAllLegacyHighlightNavLinks(photos, '2016 photos navigation');
  });

  it('emits one file-format built output for every required 2016 route', () => {
    const missing = routeContract.requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('does not emit stale HTML for migrated top-level 2016 routes', () => {
    const emittedMigratedSources = routeContract.migratedTopLevelRoutes
      .map(({ from }) => [from, outputFileForRoute(from)])
      .filter(([, filePath]) => fs.existsSync(filePath));

    assert.deepEqual(emittedMigratedSources, []);
  });

  it('redirects migrated top-level 2016 routes to their year-scoped routes', () => {
    const redirects = readDistFile('_redirects');

    for (const { from, to } of routeContract.migratedTopLevelRoutes) {
      const fromWithoutSlash = from.replace(/\/$/u, '');
      const toWithoutSlash = to.replace(/\/$/u, '');

      assert.match(
        redirects,
        new RegExp(`^${fromWithoutSlash} ${toWithoutSlash} 308$`, 'mu')
      );
      assert.match(redirects, new RegExp(`^${from} ${toWithoutSlash} 308$`, 'mu'));
    }
  });

  it('lists migrated 2016 routes in the sitemap under the year scope', () => {
    const sitemap = readDistFile('sitemap.xml');

    for (const { from, to } of routeContract.migratedTopLevelRoutes) {
      assert.ok(!sitemap.includes(`https://pycon.hk${from}`));
      assert.ok(sitemap.includes(`https://pycon.hk${to}`));
    }
  });

  it('lists every 2016 microsite route in the sitemap', () => {
    const sitemap = readDistFile('sitemap.xml');

    for (const route of routeContract.requiredRoutes) {
      assert.ok(
        sitemap.includes(`https://pycon.hk${route.replace(/\/$/u, '')}`),
        `${route} should be in sitemap`
      );
    }
  });

  it('renders the 2016 homepage with the live Bootstrap jumbotron shell', () => {
    const home = readOutput('/2016/');

    assert.match(home, /<title>PyCon HK 2016<\/title>/u);
    assert.match(home, /twitter-bootstrap\/3\.3\.7\/css\/bootstrap\.min\.css/u);
    assert.match(home, /<link href="\/2016\/css\/jumbotron\.css" rel="stylesheet"/u);
    assert.match(home, /<link href="\/2016\/css\/style\.css" rel="stylesheet"/u);
    assert.match(home, /class="navbar navbar-inverse navbar-fixed-top"/u);
    assert.match(home, /class="jumbotron pycon_background"/u);
    assert.match(home, /<h1>PyCon HK 2016<\/h1>/u);
    assert.doesNotMatch(home, /legacy-year-landing|legacy-archive/u);
  });

  it('renders Bootstrap-compatible 2016 dropdown controls', () => {
    const home = readOutput('/2016/');

    for (const label of [
      'About',
      'Program',
      'Participate',
      'Sponsor',
      'Volunteer',
      'Venue',
      'Archive',
    ]) {
      assert.match(
        home,
        new RegExp(
          `<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">\\s*${label} <span class="caret"`,
          'u'
        )
      );
    }

    assert.match(home, /<ul class="dropdown-menu" role="menu">/u);
    assert.match(home, /data-legacy-2016-dropdowns/u);
  });

  it('renders all conference years as local 2016 archive dropdown links', () => {
    const home = readOutput('/2016/');

    assertAllConferenceArchiveHrefs(home, '2016 archive dropdown');
    assertNoExternalConferenceArchiveHrefs(home, '2016 archive dropdown');
  });

  it('decodes Cloudflare-protected 2016 contact email addresses at build time', () => {
    for (const route of [
      '/2016/about/',
      '/2016/participate/',
      '/2016/sponsor/',
      '/2016/volunteer/',
    ]) {
      const html = readOutput(route);

      assert.match(html, /mailto:pycon@pycon\.hk/u, route);
      assert.match(html, />pycon@pycon\.hk</u, route);
      assert.doesNotMatch(html, /\[email(?:&#160;|\s)protected\]/iu, route);
      assert.doesNotMatch(html, /__cf_email__|data-cfemail|email-protection/iu, route);
    }
  });

  it('renders 2016 program and sponsor pages with live microsite content', () => {
    const program = readOutput('/2016/program/');
    const sponsor = readOutput('/2016/sponsor/');

    assert.match(program, /<title>Program \| PyCon HK 2016<\/title>/u);
    assert.match(program, /Schedule \(Day 1\)/u);
    assert.match(program, /Development Sprint/u);
    assert.match(sponsor, /<title>Sponsor \| PyCon HK 2016<\/title>/u);
    assert.match(sponsor, /Platinum/u);
    assert.match(sponsor, /Gold/u);
    assert.match(sponsor, /General Assembly/u);
  });

  it('keeps 2016 schedule talk links under the live /2016/program route scope', () => {
    const program = readOutput('/2016/program/');

    for (const route of scheduleTalkRoutes) {
      assert.ok(routeContract.requiredRoutes.includes(route), `${route} missing`);
      assert.match(program, new RegExp(`href="${route}"`, 'u'), route);
      assert.ok(fs.existsSync(outputFileForRoute(route)), `${route} output missing`);
    }

    assert.doesNotMatch(
      program,
      /href="\/2016\/(?:the-pandas-project-and-its-future|developing-python-applications-on-cloud|building-ai-chat-bot-using-python-3-and-tensorflow)"/u
    );
  });

  it('keeps Astro automatic locale routing out of legacy year routes', async () => {
    const astroConfig = (await import(new URL('astro.config.ts', projectDir))).default;

    assert.equal(astroConfig.i18n.routing, 'manual');
    assert.ok(
      fs.existsSync(new URL('src/middleware.ts', projectDir)),
      'manual i18n routing requires an explicit middleware file'
    );
  });

  it('resolves visible 2016 logos and remote images through Astro-managed assets', () => {
    const filesToCheck = routeContract.requiredRoutes.map(outputFileForRoute);
    const html = filesToCheck
      .map((filePath) => fs.readFileSync(filePath, 'utf8'))
      .join('\n');
    const sponsor = readOutput('/2016/sponsor/');
    const venue = readOutput('/2016/venue/');

    assert.match(readOutput('/2016/'), /\/_astro\/pyconhk-logo\./u);
    assert.match(sponsor, /\/_astro\/cyberport_master_brand_logo_500\./u);
    assert.match(sponsor, /\/_astro\/ibmpos_blue_500\./u);
    assert.match(sponsor, /\/_astro\/psf-logo-narrow-256x84-alpha\./u);
    assert.match(venue, /\/_astro\/cyberport\./u);
    assert.match(venue, /\/_astro\/pycon\./u);
    assert.doesNotMatch(html, /src="https?:\/\/img\.opensource\.hk/u);
    assert.doesNotMatch(
      html,
      new RegExp(`src="https?:\\/\\/${legacy2015HostPattern}`, 'u')
    );
    assert.doesNotMatch(html, /(?:src|href)="\/2016\/(?:cyberport\.jpg|pycon\.png)"/u);
    assert.doesNotMatch(html, /src="\/2016\/images\//u);
    assert.doesNotMatch(html, /src="\/2016\/remote\//u);
  });

  it('serves 2016 CSS compatibility files with cached image references', () => {
    const jumbotron = readDistFile('2016/css/jumbotron.css');
    const style = readDistFile('2016/css/style.css');

    assert.match(jumbotron, /body\s*\{/u);
    assert.match(style, /Roboto/u);
    assert.match(style, /\.pycon_background/u);
    assert.match(style, /url\("\/_astro\/cyberport-back\./u);
    assert.doesNotMatch(
      style,
      new RegExp(`http:\\/\\/${legacy2015HostPattern}`, 'u')
    );
    assert.doesNotMatch(style, /<!doctype html|<html/iu);
  });

  it('renders migrated 2016 photos with its live WordPress-style shell', () => {
    const photos = readOutput('/2016/photos/');

    assert.match(photos, /<title>PyCon HK 2016 Photos - PyCon HK<\/title>/u);
    assert.match(photos, /legacy-2015-wordpress/u);
    assert.match(photos, /class="featured-thumbnail"/u);
    assert.match(photos, /Posted on/u);
    assert.match(photos, /post-1024/u);
    assert.doesNotMatch(photos, /legacy-archive|LegacyHighlightPage/u);
  });
});
