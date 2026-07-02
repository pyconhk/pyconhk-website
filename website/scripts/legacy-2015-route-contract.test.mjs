import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const distDir = new URL('../dist/', import.meta.url);
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

function outputFileForRoute(route) {
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
      { from: '/conference-highlights/2015-photos/', to: '/2015/photos/' },
    ]);
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

  it('rewrites visible legacy 2015 image URLs to Astro-managed assets', () => {
    const filesToCheck = [
      outputFileForRoute('/2015/'),
      ...routeContract.requiredRoutes
        .filter((route) => route.startsWith('/2015/schedule/topics/'))
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
    assert.match(html, /\/2015\/speakers\/austin-imperial\.jpg/u);
    assert.match(html, /\/2015\/speakers\/pili-hu\.jpg/u);
  });
});
