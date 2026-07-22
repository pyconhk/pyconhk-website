import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertAllLegacyHighlightNavLinks,
  assertConferenceArchiveTargetsExist,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.mjs';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const distDir = new URL('../dist/', import.meta.url);
const internalRewriteBySourceRoute = new Map(
  routeContract.internalRouteRewrites.map(({ from, to }) => [from, to])
);
const validSpeakerImageSlugs = [
  'albert-au-yeung',
  'andrew-svetlov',
  'andy-li',
  'ayun-park',
  'chris-choy',
  'chung-hong-chan',
  'eric-ahn',
  'graham-dumpleton',
  'honza-kral',
  'joseph-wang',
  'marcelo-araujo',
  'mart-van-de-ven',
  'mosky-liu',
  'rick-mak',
  'samson-lee',
  'steven-mak',
  'younggun-kim',
];

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

function readDistFile(fileName) {
  return fs.readFileSync(new URL(fileName, distDir), 'utf8');
}

function outputFileForRoute(route) {
  const clean = decodeURI(internalRewriteBySourceRoute.get(route) || route).replace(
    /^\/|\/$/gu,
    ''
  );
  const fileName = /\.[^/]+$/u.test(clean) ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

function decodedOutputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');

  return path.join(distDir.pathname, `${clean}.html`);
}

function rawEncodedOutputFileForRoute(route) {
  const clean = route.replace(/^\/|\/$/gu, '');
  return path.join(distDir.pathname, `${clean}.html`);
}

describe('PyCon HK 2015 route contract', () => {
  it('maps trailing-slash routes to Astro file-format output paths', () => {
    assert.equal(
      outputFileForRoute('/2015/'),
      path.join(distDir.pathname, '2015.html')
    );
    assert.equal(
      outputFileForRoute('/2015/schedule/'),
      path.join(distDir.pathname, '2015/schedule.html')
    );
  });

  it('has no duplicate required routes', () => {
    assert.equal(
      new Set(routeContract.requiredRoutes).size,
      routeContract.requiredRoutes.length
    );
  });

  it('includes the year-scoped photos route instead of top-level-only photos', () => {
    assert.ok(routeContract.requiredRoutes.includes('/2015/photos/'));
    assert.deepEqual(routeContract.migratedTopLevelRoutes, [
      { from: '/conference-highlights/2015-photos/', to: '/2015/photos' },
    ]);
  });

  it('renders every migrated highlight entry in the 2015 photos navigation dropdown', () => {
    const photos = readOutput('/2015/photos/');

    assertAllLegacyHighlightNavLinks(photos, '2015 photos navigation');
  });

  it('emits one file-format built output for every required 2015 route', () => {
    const missing = routeContract.requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('does not emit duplicate raw percent-encoded files for encoded routes', () => {
    const encodedDuplicates = routeContract.requiredRoutes
      .filter((route) => route.includes('%'))
      .map((route) => [route, rawEncodedOutputFileForRoute(route)])
      .filter(([, filePath]) => fs.existsSync(filePath));

    assert.deepEqual(encodedDuplicates, []);
  });

  it('serves encoded 2015 routes from internal ASCII output files', () => {
    const redirects = readDistFile('_redirects');

    for (const { from, to } of routeContract.internalRouteRewrites) {
      const outputFile = outputFileForRoute(from);
      const decodedPublicFile = decodedOutputFileForRoute(from);
      const relativeOutputFile = path.relative(distDir.pathname, outputFile);
      const fromWithoutSlash = from.replace(/\/$/u, '');

      assert.ok(fs.existsSync(outputFile), `${outputFile} should exist`);
      assert.ok(!fs.existsSync(decodedPublicFile), `${decodedPublicFile} should not exist`);
      assert.doesNotMatch(relativeOutputFile, /[^\x00-\x7F]/u);
      assert.match(redirects, new RegExp(`^${fromWithoutSlash} ${to} 200$`, 'mu'));
      assert.match(redirects, new RegExp(`^${from} ${to} 200$`, 'mu'));
    }
  });

  it('does not emit stale HTML for migrated top-level 2015 routes', () => {
    const emittedMigratedSources = routeContract.migratedTopLevelRoutes
      .map(({ from }) => [from, outputFileForRoute(from)])
      .filter(([, filePath]) => fs.existsSync(filePath));

    assert.deepEqual(emittedMigratedSources, []);
  });

  it('redirects migrated top-level 2015 routes to their year-scoped routes', () => {
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

  it('lists migrated 2015 routes in the sitemap under the year scope', () => {
    const sitemap = readDistFile('sitemap.xml');

    for (const { from, to } of routeContract.migratedTopLevelRoutes) {
      assert.ok(!sitemap.includes(`https://pycon.hk${from}`));
      assert.ok(sitemap.includes(`https://pycon.hk${to}`));
    }
  });

  it('renders nested 2015 microsite pages with event-scoped legacy stylesheets', () => {
    const schedule = readOutput('/2015/schedule/');

    assert.match(schedule, /<title>Schedule \| PyCON Hong Kong 2015<\/title>/u);
    assert.match(schedule, /Toggle navigation/u);
    assert.match(schedule, /<link href="\/2015\/css\/bootstrap\.min\.css" rel="stylesheet"/u);
    assert.match(schedule, /<link href="\/2015\/jumbotron\.css" rel="stylesheet"/u);
    assert.match(schedule, /<link href="\/2015\/style\.css" rel="stylesheet"/u);
    assert.match(schedule, /<h2>Schedule<\/h2>/u);
    assert.doesNotMatch(schedule, /legacy-2015-site/u);
  });

  it('removes the duplicated live-site staff entry from the 2015 staff page', () => {
    const staff = readOutput('/2015/about/staffs/');
    const haggenSoEntries = staff.match(/Dr\. Haggen So/gu) || [];

    assert.equal(haggenSoEntries.length, 1);
    assert.match(staff, /<td rowspan="4">Team<\/td>/u);
    assert.doesNotMatch(staff, /<td rowspan="5">Team<\/td>/u);
  });

  it('renders the 2015 homepage with the live Bootstrap jumbotron shell', () => {
    const home = readOutput('/2015/');

    assert.match(home, /<title>PyCON Hong Kong 2015<\/title>/u);
    assert.match(home, /<link href="\/2015\/css\/bootstrap\.min\.css" rel="stylesheet"/u);
    assert.match(home, /<link href="\/2015\/jumbotron\.css" rel="stylesheet"/u);
    assert.match(home, /<link href="\/2015\/style\.css" rel="stylesheet"/u);
    assert.match(home, /class="navbar navbar-inverse navbar-fixed-top"/u);
    assert.match(home, /<div class="jumbotron" id="introjumbo">/u);
    assert.doesNotMatch(home, /legacy-2015-site/u);
  });

  it('decodes Cloudflare-protected 2015 contact links at render time', () => {
    const home = readOutput('/2015/');
    const prospectus = readOutput('/2015/sponsor/prospectus/');

    assert.match(
      home,
      /<a class="btn btn-default" href="mailto:pycon@pycon\.hk" role="button">Contact Us &raquo;<\/a>/u
    );
    assert.match(prospectus, /mailto:pycon@pycon\.hk/u);
    assert.match(prospectus, />pycon@pycon\.hk</u);

    for (const html of [home, prospectus]) {
      assert.doesNotMatch(html, /\/cdn-cgi\/l\/email-protection/iu);
      assert.doesNotMatch(
        html,
        /__cf_email__|data-cfemail|\[email(?:&#160;|\s)protected\]/iu
      );
    }
  });

  it('does not emit direct Cloudflare email-protection routes', () => {
    assert.equal(
      fs.existsSync(path.join(distDir.pathname, 'cdn-cgi/l/email-protection.html')),
      false
    );
  });

  it('renders Bootstrap-compatible 2015 dropdown controls', () => {
    const home = readOutput('/2015/');

    for (const label of ['About', 'Events', 'Sponsors', 'Venue', 'Attend', 'Archive']) {
      assert.match(
        home,
        new RegExp(
          `<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">\\s*${label} <span class="caret"`,
          'u'
        )
      );
    }

    assert.match(home, /<ul class="dropdown-menu" role="menu">/u);
    assert.match(home, /data-legacy-2015-dropdowns/u);
  });

  it('renders all conference years as local 2015 archive dropdown links', () => {
    const home = readOutput('/2015/');

    assertAllConferenceArchiveHrefs(home, '2015 archive dropdown');
    assertNoExternalConferenceArchiveHrefs(home, '2015 archive dropdown');
    assertConferenceArchiveTargetsExist();
  });

  it('resolves 2015 sponsor-page logos through Astro-managed assets', () => {
    const sponsor = readOutput('/2015/sponsor/');

    for (const sponsorName of [
      'elastic',
      'cyberport',
      'm-labs',
      'microsoft',
      'odd-e',
      'oursky',
      'gandi',
      'jetbrains',
      'hkcota',
      'opensourcehk',
    ]) {
      assert.match(sponsor, new RegExp(`/_astro/${sponsorName}\\.`, 'u'));
    }

    assert.doesNotMatch(sponsor, /src="\/images\/sponsors\//u);
  });

  it('serves event-scoped 2015 CSS compatibility files used by the live shell', () => {
    const bootstrap = readDistFile('2015/css/bootstrap.min.css');
    const jumbotron = readDistFile('2015/jumbotron.css');
    const style = readDistFile('2015/style.css');

    assert.match(bootstrap, /Bootstrap v3\.3\.2/u);
    assert.match(jumbotron, /body\s*\{/u);
    assert.match(style, /Alegreya Sans/u);
    assert.match(style, /#introjumbo/u);
    assert.match(style, /url\("\/_astro\/cyberport-back\./u);
    assert.doesNotMatch(style, /url\("images\/cyberport-back\.jpg"\)/u);
  });

  it('serves event-scoped 2015 JS compatibility files used by the live shell', () => {
    const bootstrap = readDistFile('2015/js/bootstrap.min.js');
    const style = readDistFile('2015/style.js');
    const ga = readDistFile('2015/js/ga.js');

    assert.match(bootstrap, /Bootstrap v3\.3\.4/u);
    assert.doesNotMatch(bootstrap, /<!doctype html|<html/iu);
    assert.equal(style.trim(), '');
    assert.match(ga, /GoogleAnalyticsObject/u);
    assert.doesNotMatch(ga, /<!doctype html|<html/iu);
  });

  it('renders compatibility routes as real static assets', () => {
    for (const route of routeContract.compatibilityRoutes) {
      const output = fs.readFileSync(outputFileForRoute(route), 'utf8');

      assert.doesNotMatch(output, /<!doctype html|<html|<pre/iu, route);
    }
  });

  it('renders migrated 2015 photos with its live WordPress-style shell', () => {
    const photos = readOutput('/2015/photos/');

    assert.match(photos, /<title>PyCon HK 2015 Photos - PyCon HK<\/title>/u);
    assert.match(photos, /legacy-2015-wordpress/u);
    assert.match(photos, /class="featured-thumbnail"/u);
    assert.match(photos, /Posted on/u);
    assert.match(photos, /\/_astro\/12182818_/u);
    assert.doesNotMatch(photos, /legacy-2015-site/u);
  });

  it('rewrites visible legacy 2015 image URLs to Astro-managed assets', () => {
    const filesToCheck = [
      ...routeContract.requiredRoutes
        .filter((route) => !route.match(/\.(css|js)\/$/u))
        .map(outputFileForRoute),
    ];
    const html = filesToCheck
      .map((filePath) => fs.readFileSync(filePath, 'utf8'))
      .join('\n');
    const rawValidSpeakerPattern = new RegExp(
      String.raw`/2015/speakers/(?:${validSpeakerImageSlugs.join('|')})\.jpg`,
      'u'
    );

    assert.match(readOutput('/2015/'), /\/_astro\/pyconhk-logo\./u);
    assert.match(html, /\/_astro\/(?:albert-au-yeung|honza-kr[aá]l)\./u);
    assert.doesNotMatch(html, /\/2015\/images\//u);
    assert.doesNotMatch(html, /\/legacy-wp\/uploads\//u);
    assert.doesNotMatch(html, rawValidSpeakerPattern);
    assert.doesNotMatch(html, /\/2015\/speakers\/honza-kr(?:%C3%A1|á)l\.jpg/u);
    assert.doesNotMatch(html, /\/2015\/speakers\/s%C3%A9bastien-bourdeauducq\.jpg/u);
    assert.doesNotMatch(html, /\/2015\/speakers\/sébastien-bourdeauducq\.jpg/u);
    assert.doesNotMatch(html, /\/2015\/speakers\/austin-imperial\.jpg/u);
    assert.doesNotMatch(html, /\/2015\/speakers\/pili-hu\.jpg/u);
  });
});
