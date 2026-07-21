import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertAllConferenceArchiveHrefs,
  assertNoExternalConferenceArchiveHrefs,
} from './legacy-archive-nav-contract.mjs';

const distDir = new URL('../dist/', import.meta.url);
const editions = [
  {
    slug: '2020-spring',
    label: '2020 Spring',
    firstTitle: 'PyCon HK 2020 Spring Photos',
    firstHref: '/2020-spring/photos',
  },
  {
    slug: '2020-fall',
    label: '2020 Fall',
    firstTitle: 'PyCon HK 2020 Fall Photos',
    firstHref: '/2020-fall/photos',
  },
];

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function outputFileForRoute(route) {
  const clean = decodeURI(route).replace(/^\/|\/$/gu, '');
  const fileName = clean.endsWith('.html') ? clean : `${clean}.html`;

  return path.join(distDir.pathname, fileName);
}

function readOutput(route) {
  return fs.readFileSync(outputFileForRoute(route), 'utf8');
}

describe('PyCon HK 2020 edition archive contract', () => {
  it('emits local archive index and pagination routes for Spring and Fall', () => {
    const missing = editions
      .flatMap(({ slug }) => [`/${slug}/`, `/${slug}/page/2/`])
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });

  it('renders 2020 Spring and Fall archives with the live Marketingly shell', () => {
    for (const edition of editions) {
      const home = readOutput(`/${edition.slug}/`);

      assert.match(home, new RegExp(`<title>${edition.label} - PyCon HK</title>`, 'u'));
      assert.match(home, /wp-theme-marketingly/u);
      assert.match(
        home,
        new RegExp(
          `<h1 class="page-title">Category: <span>${edition.label}</span></h1>`,
          'u'
        )
      );
      assert.match(home, /id="archives-dropdown-2"/u);
      assert.match(home, /class="search-submit" value="Search"/u);
      assert.match(home, /class="posts-entry fbox blogposts-list\b/u);
      assert.match(
        home,
        new RegExp(`href="${escapedPattern(edition.firstHref)}/?"[^>]*>`, 'u')
      );
      assert.match(home, new RegExp(`>${edition.firstTitle}</a>`, 'u'));
      assert.match(home, new RegExp(`href="/${edition.slug}/page/2/?`, 'u'));
      assert.match(home, /src="\/_astro\//u);
      assertAllConferenceArchiveHrefs(home, `${edition.label} history links`);
      assertNoExternalConferenceArchiveHrefs(home, `${edition.label} history links`);
      assert.doesNotMatch(home, /legacy-marketingly|LegacyArchiveLayout|legacy-archive/u);
      assert.doesNotMatch(home, /href="\/category\/2020-(?:spring|fall)/u);
      assert.doesNotMatch(home, /href="\/conference-highlights\/(?:2020-spring-photos|pycon-hk-2020-fall-photos)/u);
      assert.doesNotMatch(
        home,
        /\s(?:content|href|src|srcset)="(?:https:\/\/pycon\.hk)?\/wp-content\/uploads\//u
      );
      assert.doesNotMatch(home, /\/src\/years\//u);
    }
  });

  it('renders page 2 for 2020 Spring and Fall in the same archive shell', () => {
    for (const edition of editions) {
      const pageTwo = readOutput(`/${edition.slug}/page/2/`);

      assert.match(pageTwo, new RegExp(`<title>${edition.label} - PyCon HK - Page 2</title>`, 'u'));
      assert.match(pageTwo, /wp-theme-marketingly/u);
      assert.match(
        pageTwo,
        new RegExp(`href="/${edition.slug}/?"[^>]*>Previous</a>`, 'u')
      );
      assert.match(
        pageTwo,
        /<span\b(?=[^>]*\bclass="page-numbers current")(?=[^>]*\baria-current="page")[^>]*>2<\/span>/u
      );
      assert.doesNotMatch(pageTwo, /legacy-marketingly|LegacyArchiveLayout|legacy-archive/u);
      assert.doesNotMatch(pageTwo, /href="\/category\/2020-(?:spring|fall)/u);
      assert.doesNotMatch(
        pageTwo,
        /\s(?:content|href|src|srcset)="(?:https:\/\/pycon\.hk)?\/wp-content\/uploads\//u
      );
    }
  });

  it('emits individual 2020 edition posts under the public edition route', () => {
    for (const edition of editions) {
      const post = readOutput(edition.firstHref);

      assert.match(post, /single-post/u);
      assert.match(post, /wp-theme-marketingly/u);
      assert.match(post, new RegExp(`>${edition.firstTitle}<`, 'u'));
      assert.match(post, /src="\/_astro\//u);
      assert.doesNotMatch(post, /href="\/conference-highlights\/(?:2020-spring-photos|pycon-hk-2020-fall-photos)/u);
      assert.doesNotMatch(post, /content="\/conference-highlights\/(?:2020-spring-photos|pycon-hk-2020-fall-photos)/u);
      assert.doesNotMatch(
        post,
        /\s(?:content|href|src|srcset)="(?:https:\/\/pycon\.hk)?\/wp-content\/uploads\//u
      );
      assert.doesNotMatch(post, /\/src\/years\//u);
    }
  });

  it('rewrites the old 2020 Spring agenda schedule slug to the generated schedule route', () => {
    const agendaPost = readOutput(
      '/2020-spring/agenda-of-pycon-hk-2020-spring-is-released/'
    );

    assert.ok(fs.existsSync(outputFileForRoute('/2020-spring/2020-spring-schedule/')));
    assert.match(agendaPost, /href="\/2020-spring\/2020-spring-schedule\/"/u);
    assert.doesNotMatch(
      agendaPost,
      /href="\/2020-spring\/schedule-pycon-hk-2020-spring\/"/u
    );
  });

  it('repairs malformed 2020 Spring schedule links missing the edition slash', () => {
    const schedulePost = readOutput('/2020-spring/2020-spring-schedule/');

    assert.ok(
      fs.existsSync(
        outputFileForRoute(
          '/2020-spring/the-development-sprint-of-online-pycon-hk-2020-spring/'
        )
      )
    );
    assert.match(
      schedulePost,
      /href="\/2020-spring\/the-development-sprint-of-online-pycon-hk-2020-spring\/"/u
    );
    assert.doesNotMatch(schedulePost, /href="\/2020-springthe-development-sprint/u);
  });

  it('repairs the old nested 2020 Spring article links', () => {
    const announcement = readOutput(
      '/2020-spring/announcing-all-sessions-of-pycon-hk-2020-spring/'
    );

    for (const route of [
      '/2020-spring/sessions-2020-spring/',
      '/2020-spring/the-development-sprint-of-online-pycon-hk-2020-spring/',
      '/2020-spring/unconference/',
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83/',
      '/2020-spring/what-can-we-do-for-the-python-community-in-hong-kong-in-2020/',
    ]) {
      assert.ok(fs.existsSync(outputFileForRoute(route)));
      assert.match(announcement, new RegExp(`href="${escapedPattern(route)}"`, 'u'));
    }

    assert.doesNotMatch(announcement, /href="\/2020\/(?:2020-spring\/|sessions-2020-spring)/u);
  });

  it('links the shared highlights navigation to the published news route', () => {
    const coverage = readOutput('/2020-spring/conference-coverage/');

    assert.match(coverage, /href="\/2025\/news\/"[^>]*>News<\/a>/u);
    assert.doesNotMatch(coverage, /href="\/2025\/en\/news\//u);
  });
});
