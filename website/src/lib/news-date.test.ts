import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stringify } from 'yaml';
import { defaultPublishedAt, normalizePublishedAt } from './news-date.ts';
import { parseNewsFrontmatter } from './news-frontmatter.ts';

test('normalizes a Decap timestamp after a YAML frontmatter roundtrip', () => {
  const source = `---\n${stringify({ publishedAt: '2026-09-30T00:43:00.000+08:00' })}---\nArticle body`;
  const { publishedAt } = parseNewsFrontmatter(source).data;
  assert.equal(typeof publishedAt, 'string');
  assert.equal(normalizePublishedAt(publishedAt as string), '2026-09-29T16:43:00.000Z');
});

test('continues accepting legacy Date values with the same instant', () => {
  const publishedAt = new Date('2026-09-30T00:43:00.000+08:00');
  assert.equal(normalizePublishedAt(publishedAt), '2026-09-29T16:43:00.000Z');
});

test('continues accepting quoted timestamp strings with the same instant', () => {
  const { publishedAt } = parseNewsFrontmatter(
    '---\npublishedAt: "2026-09-30T00:43:00.000+08:00"\n---\nArticle body'
  ).data;
  assert.equal(typeof publishedAt, 'string');
  assert.equal(normalizePublishedAt(publishedAt as string), '2026-09-29T16:43:00.000Z');
  assert.equal(
    normalizePublishedAt(' 2026-09-29T16:43:00.000Z '),
    '2026-09-29T16:43:00.000Z'
  );
});

test('preserves the fallback for missing dates in old content and drafts', () => {
  for (const value of [undefined, null, '', '  ']) {
    assert.equal(normalizePublishedAt(value), defaultPublishedAt);
  }
});

test('rejects invalid date strings and invalid Date objects', () => {
  for (const value of ['not a date', new Date(Number.NaN)]) {
    assert.throws(
      () => normalizePublishedAt(value),
      /publishedAt must be a valid date/
    );
  }
});

test('News frontmatter preserves YAML metadata and markdown with LF or CRLF', () => {
  for (const newline of ['\n', '\r\n']) {
    const body = '# Heading\n\nA [link](https://example.com/) and ---js as text.';
    const source = [
      '---',
      'title: Valid News',
      'status: draft',
      'tags: [community]',
      '---',
      body,
    ].join(newline);
    const parsed = parseNewsFrontmatter(source);
    assert.deepEqual(parsed.data, {
      title: 'Valid News',
      status: 'draft',
      tags: ['community'],
    });
    assert.equal(parsed.content, body);
  }
});

test('News parsing rejects executable engines, including drafts and malformed fences', () => {
  const state = globalThis as typeof globalThis & {
    __pyconNewsExecutionProbe?: boolean;
  };
  const payload =
    "({ status: 'draft', title: (globalThis.__pyconNewsExecutionProbe = true, 'probe') })";
  try {
    for (const opener of [
      '---js',
      '---javascript',
      '--- JS',
      '---\tJavaScript',
      '\uFEFF---js',
    ]) {
      for (const newline of ['\n', '\r\n']) {
        for (const closing of [`${newline}---${newline}Body`, '']) {
          assert.throws(() =>
            parseNewsFrontmatter(`${opener}${newline}${payload}${closing}`)
          );
          assert.equal(state.__pyconNewsExecutionProbe, undefined);
        }
      }
    }
    for (const source of [
      '---\nstatus: draft\ntitle: !!js/function "function () { globalThis.__pyconNewsExecutionProbe = true; }"\n---\nBody',
      '---\nstatus: draft\ntitle: [unterminated\n---\nBody',
      '---\n- not\n- a mapping\n---\nBody',
    ]) {
      assert.throws(() => parseNewsFrontmatter(source));
      assert.equal(state.__pyconNewsExecutionProbe, undefined);
    }
  } finally {
    delete state.__pyconNewsExecutionProbe;
  }
});
