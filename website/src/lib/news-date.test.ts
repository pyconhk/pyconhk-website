import assert from 'node:assert/strict';
import { test } from 'node:test';
import matter from 'gray-matter';
import { stringify } from 'yaml';
import { formatCompactDate, formatDate } from './date.ts';
import { defaultPublishedAt, normalizePublishedAt } from './news-date.ts';

test('normalizes a Decap timestamp after a YAML frontmatter roundtrip', () => {
  const source = `---\n${stringify({ publishedAt: '2026-09-30T00:43:00.000+08:00' })}---\nArticle body`;
  const { publishedAt } = matter(source).data;
  assert.ok(publishedAt instanceof Date);
  assert.equal(normalizePublishedAt(publishedAt), '2026-09-29T16:43:00.000Z');
});

test('current News keeps the Hong Kong publication day after UTC normalization', () => {
  const publishedAt = normalizePublishedAt('2026-09-30T00:43:00.000+08:00');
  assert.equal(formatDate(publishedAt, 'en', 'Asia/Hong_Kong'), 'September 30, 2026');
  for (const locale of ['zh-hk', 'zh-hant', 'zh-hans'] as const) {
    assert.equal(formatDate(publishedAt, locale, 'Asia/Hong_Kong'), '2026年9月30日');
  }
});

test('the Hong Kong publication day changes exactly at local midnight', () => {
  assert.equal(
    formatDate('2026-09-29T15:59:59.000Z', 'en', 'Asia/Hong_Kong'),
    'September 29, 2026'
  );
  assert.equal(
    formatDate('2026-09-29T16:00:00.000Z', 'en', 'Asia/Hong_Kong'),
    'September 30, 2026'
  );
});

test('archive date helpers retain their existing UTC day', () => {
  const publishedAt = '2025-10-08T16:00:00.000Z';
  assert.equal(formatDate(publishedAt, 'en'), 'October 8, 2025');
  assert.equal(formatCompactDate(publishedAt, 'zh-hk'), '2025年10月8日');
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
