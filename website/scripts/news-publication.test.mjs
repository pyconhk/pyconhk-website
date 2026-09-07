import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const moduleUrl = new URL('../src/lib/news.ts', import.meta.url).href;
const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];

function post(
  locale,
  { status = 'published', title = `News in ${locale}`, body = `Body in ${locale}` } = {}
) {
  return `---\ntitle: ${JSON.stringify(title)}\nstatus: ${status}\npublishedAt: "2026-09-08T00:00:00Z"\n---\n${body}\n`;
}

async function readFixture(year, files) {
  const root = await mkdtemp(path.join(tmpdir(), 'pyconhk-news-publication-'));
  const directory = path.join(root, 'outstatic/content', `${year}-posts`);
  await mkdir(directory, { recursive: true });

  try {
    await Promise.all(
      Object.entries(files).map(([locale, source]) =>
        writeFile(path.join(directory, `notice.${locale}.mdx`), source)
      )
    );
    // Each process owns its loader cache and reads only temporary fixture files.
    const script = `
      const news = await import(${JSON.stringify(moduleUrl)});
      const results = {};
      for (const locale of ${JSON.stringify(locales)}) {
        results[locale] = {
          posts: await news.getPublishedPosts(${year}, locale),
          latest: await news.getLatestPosts(3, ${year}, locale),
          article: await news.getPostBySlug(${year}, 'notice', locale),
        };
      }
      console.log(JSON.stringify({ slugs: await news.getPublishedPostSlugs(${year}), results }));
    `;
    const { stdout } = await execFileAsync('bun', ['--eval', script], { cwd: root });
    return JSON.parse(stdout);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('2026 articles require every translation on lists, homepage and direct URLs', async () => {
  for (const missingOrDraft of [
    undefined,
    post('ko', { status: 'draft' }),
    post('ko', { title: '' }),
    post('ko', { body: '' }),
  ]) {
    const files = Object.fromEntries(
      locales
        .filter((locale) => locale !== 'ko')
        .map((locale) => [locale, post(locale)])
    );
    if (missingOrDraft !== undefined) files.ko = missingOrDraft;
    const result = await readFixture(2026, files);
    assert.deepEqual(result.slugs, []);
    for (const locale of locales) {
      assert.deepEqual(result.results[locale], {
        posts: [],
        latest: [],
        article: null,
      });
    }
  }
});

test('complete 2026 articles publish in all six locales without fallback', async () => {
  const result = await readFixture(
    2026,
    Object.fromEntries(locales.map((locale) => [locale, post(locale)]))
  );
  assert.deepEqual(result.slugs, ['notice']);
  for (const locale of locales) {
    const { posts, latest, article } = result.results[locale];
    assert.equal(posts[0].title, `News in ${locale}`);
    assert.equal(posts[0].isFallback, false);
    assert.equal(posts[0].sourceLocale, locale);
    assert.equal(posts[0].coverImage, '/2026/open-graph.webp');
    assert.deepEqual(posts, latest);
    assert.match(article.html, new RegExp(`Body in ${locale}`));
  }
});

test('2025 keeps its existing localized fallback and ignores unsupported Korean files', async () => {
  const result = await readFixture(2025, { en: post('en'), ko: post('ko') });
  assert.deepEqual(result.slugs, ['notice']);
  assert.equal(result.results['zh-hk'].article.isFallback, true);
  assert.equal(result.results['zh-hk'].article.title, 'News in en');
  assert.equal(result.results.ko.article.sourceLocale, 'en');
});
