import test from 'node:test';
import assert from 'node:assert/strict';
import { stripLegacyScripts } from '../src/legacy/cloudflare-email.ts';
import {
  cleanLegacyHtml,
  cleanLegacyText,
  prepareLegacySearchableHtml,
} from '../src/legacy/legacy-html.ts';
import { legacy2024Pages } from '../src/years/2024/data/pages.ts';

test('legacy 2024 archive content does not execute script tags', () => {
  const pagesWithScripts = legacy2024Pages
    .filter((page) => /<script\b/iu.test(page.content))
    .map((page) => page.slug);

  assert.deepEqual(pagesWithScripts, []);
});

test('legacy HTML sanitizer strips hidden bidi controls from links and text', () => {
  const dirtyHtml =
    '<p>Submit your proposals: <a href="%E2%80%AAhttp://bit.ly/2AMNhfZ%E2%80%AC">‪http://bit.ly/2AMNhfZ‬</a></p>';

  assert.equal(
    cleanLegacyHtml(dirtyHtml),
    '<p>Submit your proposals: <a href="http://bit.ly/2AMNhfZ">http://bit.ly/2AMNhfZ</a></p>'
  );
  assert.equal(
    cleanLegacyText('Submit your proposals: ‪http://bit.ly/2AMNhfZ‬'),
    'Submit your proposals: http://bit.ly/2AMNhfZ'
  );
});

test('legacy page shells use the canonical production URL for their route', () => {
  const html =
    '<html><head><link rel="canonical" href="https://legacy.pycon.hk/photos/"></head><body><main>Photos</main></body></html>';

  assert.match(
    prepareLegacySearchableHtml(html, {
      route: '/2023/photos/',
      title: 'PyCon HK 2023 Photos',
    }),
    /<link rel="canonical" href="https:\/\/pycon\.hk\/2023\/photos">/u
  );
});

test('legacy page shells cannot execute archived scripts', () => {
  assert.equal(
    stripLegacyScripts(
      '<main>Archive</main><script src="/wp-includes/js/jquery.js"></script><script>alert(1)</script>'
    ),
    '<main>Archive</main>'
  );
});
