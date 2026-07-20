import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.mjs';

const distDir = new URL('../dist/', import.meta.url);

const topicRoutes = [
  '/2017/topics/ai-learn-to-Drive-introduction-to-reinforcement-learning-with-python/',
  '/2017/topics/applying-serverless-architecture-pattern-to-distributed-data-processing/',
  '/2017/topics/boosting-command-line-data-manipulation-with-python-and-awk/',
  '/2017/topics/ha-capability-with-document-store-using-mysql-shell-running-python/',
  '/2017/topics/how-i-battle-with-hong-kong-open-data-in-python/',
  '/2017/topics/how-to-approach-a-machine-learning-problem-with-python-youtube-like-count-prediction/',
  '/2017/topics/how-to-reinvent-the-wheel-and-build-the-most-popular-JSON-RPC-library/',
  '/2017/topics/machine-learning-on-energy-consumption-prediction/',
  '/2017/topics/matplotlib-2-by-example/',
  '/2017/topics/micropython/',
  '/2017/topics/python-blockchain-application-in-less-than-24hrs/',
  '/2017/topics/python-for-data-analysis/',
  '/2017/topics/python-is-not-always-slow/',
  '/2017/topics/python-logging-in-production/',
  '/2017/topics/recurrent-neural-networks-in-python-keras-and-tensorFlow-for-time-series-analysis/',
  '/2017/topics/resurrecting-the-dead-with-deep-learning/',
  '/2017/topics/ticketing-chatbot/',
  '/2017/topics/using-gradient-boosting-machines-in-python/',
];

const requiredRoutes = [
  '/2017/',
  '/2017/about/',
  '/2017/about/coc.html',
  '/2017/about/staff.html',
  '/2017/cfp/',
  '/2017/photos/',
  '/2017/recording/',
  '/2017/schedule/',
  '/2017/sponsor/',
  '/2017/venue/',
  ...topicRoutes,
];

const compatibilityFiles = [
  '2017/0.js',
  '2017/app.css',
  '2017/app.js',
  '2017/data/langs.yml',
  '2017/data/sessions.yml',
  '2017/data/speakers.yml',
  '2017/data/sponsor.yml',
  '2017/data/staff.yml',
  '2017/data/timeslots.yml',
  '2017/data/topics.yml',
  '2017/data/venues.yml',
  '2017/manifest.json',
  '2017/staff.js',
  '2017/sw.js',
  '2017/timetable.js',
  '2017/venue.js',
];

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

function readDistFile(fileName) {
  return fs.readFileSync(new URL(fileName, distDir), 'utf8');
}

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');
  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

describe('PyCon HK 2017 route contract', () => {
  it('maps trailing-slash and .html routes to Astro file-format output paths', () => {
    assert.equal(outputFileForRoute('/2017/'), path.join(distDir.pathname, '2017.html'));
    assert.equal(
      outputFileForRoute('/2017/topics/python-for-data-analysis/'),
      path.join(distDir.pathname, '2017/topics/python-for-data-analysis.html')
    );
    assert.equal(
      outputFileForRoute('/2017/about/coc.html'),
      path.join(distDir.pathname, '2017/about/coc.html')
    );
  });

  it('emits one file-format built output for every required 2017 route', () => {
    const missing = requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('renders the 2017 homepage with the live Materialize shell', () => {
    const home = readOutput('/2017/');

    assert.match(home, /<title>PyCon 2017<\/title>/u);
    assert.match(home, /href="\/2017\/app\.css"/u);
    assert.match(home, /class="page-front"/u);
    assert.match(home, /id="sidebar" class="side-nav"/u);
    assert.match(home, /City University of Hong Kong/u);
    assert.doesNotMatch(home, /LegacyYearLanding|legacy-year-landing|legacy-archive/u);
  });

  it('renders all conference years as local 2017 sidebar archive links', () => {
    const home = readOutput('/2017/');

    assertAllConferenceArchiveHrefs(home, '2017 sidebar archive');
    assertNoExternalConferenceArchiveHrefs(home, '2017 sidebar archive');
  });

  it('renders 2017 CFP, schedule, staff, and topic pages from live microsite content', () => {
    const cfp = readOutput('/2017/cfp/');
    const schedule = readOutput('/2017/schedule/');
    const staff = readOutput('/2017/about/staff.html');
    const topic = readOutput('/2017/topics/python-for-data-analysis/');

    assert.match(cfp, /Call For Proposal Results/u);
    assert.match(cfp, /Python is not Always Slow/u);
    assert.match(schedule, /id="timetable-wrapper"/u);
    assert.match(schedule, /src="\/2017\/timetable\.js"/u);
    assert.match(staff, /data-team="Conference Chairman"/u);
    assert.match(staff, /src="\/2017\/staff\.js"/u);
    assert.match(topic, /Python for data analysis/u);
    assert.match(topic, /Michal Szczecinski/u);
  });

  it('serves 2017 compatibility files and data with local asset references', () => {
    const missing = compatibilityFiles
      .map((fileName) => [fileName, new URL(fileName, distDir).pathname])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);

    const css = readDistFile('2017/app.css');
    const manifest = readDistFile('2017/manifest.json');
    const topics = readDistFile('2017/data/topics.yml');
    const speakers = readDistFile('2017/data/speakers.yml');

    assert.match(css, /url\("\/_astro\/pycon-keyvisual-v2\./u);
    assert.match(css, /url\("\/_astro\/page-cfp-results-theme\./u);
    assert.match(manifest, /"src": "\/_astro\/pycon-logo-v2\./u);
    assert.match(topics, /Python is not Always Slow/u);
    assert.match(speakers, /\/_astro\/Albert_AuYeung\./u);
    assert.doesNotMatch(speakers, /https:\/\/file\.pycon\.hk\/2017\/portraits/u);
  });

  it('resolves visible 2017 images through Astro-managed assets', () => {
    const html = requiredRoutes
      .map((route) => readOutput(route))
      .join('\n');

    assert.match(readOutput('/2017/'), /\/_astro\/favicon-v2\./u);
    assert.match(readOutput('/2017/'), /\/_astro\/CityU_Logo_Standard_Signature\./u);
    assert.match(readOutput('/2017/sponsor/'), /\/_astro\/mysql-clr\./u);
    assert.match(readOutput('/2017/venue/'), /\/_astro\/floorplan\./u);
    assert.doesNotMatch(html, /src="https:\/\/file\.pycon\.hk\/2017\/logos/u);
    assert.doesNotMatch(html, /src="https:\/\/file\.hkoscon\.org\/organizer/u);
    assert.doesNotMatch(html, /src="https:\/\/licensebuttons\.net/u);
  });

  it('renders the 2017 venue map without Google Maps JavaScript API credentials', () => {
    const venue = readOutput('/2017/venue/');

    assert.match(venue, /<div id="map" class="map">/u);
    assert.match(venue, /<iframe\b[^>]+title="Map to City University of Hong Kong"/u);
    assert.match(
      venue,
      /src="https:\/\/www\.google\.com\/maps\?q=City%20University%20of%20Hong%20Kong%2C%20Kowloon%20Tong%2C%20Hong%20Kong&amp;output=embed"/u
    );
    assert.match(venue, /Open PyCon HK 2017 Venue in Google Maps/u);
    assert.doesNotMatch(venue, /maps\.googleapis\.com\/maps\/api\/js/u);
    assert.doesNotMatch(venue, /src="\/2017\/venue\.js"/u);
  });
});
