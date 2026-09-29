import assert from 'node:assert/strict';
import { test } from 'node:test';
import matter from 'gray-matter';
import { stringify } from 'yaml';
import { defaultPublishedAt, normalizePublishedAt } from './news-date.ts';

test('normalizes a Decap timestamp after a YAML frontmatter roundtrip', () => {
  const source = `---\n${stringify({ publishedAt: '2026-09-30T00:43:00.000+08:00' })}---\nArticle body`;
  const { publishedAt } = matter(source).data;
  assert.ok(publishedAt instanceof Date);
  assert.equal(normalizePublishedAt(publishedAt), '2026-09-29T16:43:00.000Z');
});

test('continues accepting quoted timestamp strings with the same instant', () => {
  const { publishedAt } = matter(
    '---\npublishedAt: "2026-09-30T00:43:00.000+08:00"\n---\nArticle body'
  ).data;
  assert.equal(typeof publishedAt, 'string');
  assert.equal(normalizePublishedAt(publishedAt), '2026-09-29T16:43:00.000Z');
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
