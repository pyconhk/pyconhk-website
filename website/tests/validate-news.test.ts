import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNewsContent } from './news-validation.ts';

test('checked-in news meets publication and link requirements', async () => {
  assert.deepEqual((await validateNewsContent()).errors, []);
});

async function createFixture(files, year = 2025) {
  const root = await mkdtemp(path.join(tmpdir(), 'pyconhk-news-validation-'));
  const contentRoot = path.join(root, 'content');
  const publicRoot = path.join(root, 'public');
  const postsRoot = path.join(contentRoot, `${year}-posts`);

  await mkdir(postsRoot, { recursive: true });
  await mkdir(path.join(publicRoot, 'outstatic/images'), { recursive: true });
  await writeFile(path.join(publicRoot, 'outstatic/images/cover.webp'), '');

  for (const [name, source] of Object.entries(files)) {
    await writeFile(path.join(postsRoot, name), source.trimStart());
  }

  return {
    contentRoot,
    publicRoot,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

const validPost = `---
title: "Valid post"
description: "A useful short description for previews."
publishedAt: "2025-10-10T00:00:00.000Z"
status: "published"
author:
  name: "PyCon HK"
slug: "valid-post"
coverImage: "/outstatic/images/cover.webp"
tags:
  - announcement
---

Read the [schedule](/2025/schedule/).
`;

test('accepts complete localized news content', async () => {
  const fixture = await createFixture({
    'valid-post.en.mdx': validPost,
  });

  try {
    const result = await validateNewsContent(fixture);
    assert.deepEqual(result.errors, []);
  } finally {
    await fixture.cleanup();
  }
});

test('accepts partial drafts and Korean 2026 metadata and section links', async () => {
  const fixture = await createFixture(
    {
      'draft.en.mdx': '---\nstatus: draft\nslug: draft\ntags: []\n---\n',
      'valid-post.ko.mdx': validPost.replace(
        'Read the [schedule](/2025/schedule/).',
        'Read the [schedule](/2026/ko/schedule/) and [article](/2026/ko/news/valid-post/).'
      ),
    },
    2026
  );

  try {
    const result = await validateNewsContent(fixture);
    assert.deepEqual(result.errors, []);
  } finally {
    await fixture.cleanup();
  }
});

test('rejects Korean content in the five-locale 2025 archive', async () => {
  const fixture = await createFixture({ 'valid-post.ko.mdx': validPost });
  try {
    const result = await validateNewsContent(fixture);
    assert.match(result.errors.join('\n'), /supported locale for 2025/);
  } finally {
    await fixture.cleanup();
  }
});

test('reports malformed metadata, duplicate slugs, missing assets, and broken internal links', async () => {
  const fixture = await createFixture({
    'broken-post.en.mdx': `---
title: ""
publishedAt: "not-a-date"
status: "published"
slug: "broken-post"
coverImage: "/outstatic/images/missing.webp"
tags: []
---

Read the [missing page](/missing-page/).
`,
    'duplicate-one.en.mdx': validPost.replace(
      'slug: "valid-post"',
      'slug: "duplicate"'
    ),
    'duplicate-two.en.mdx': validPost.replace(
      'slug: "valid-post"',
      'slug: "duplicate"'
    ),
    'bad-description.en.mdx': validPost
      .replace('slug: "valid-post"', 'slug: "bad-description"')
      .replace(
        'description: "A useful short description for previews."',
        `description: "${'a'.repeat(241)}..."`
      ),
  });

  try {
    const result = await validateNewsContent(fixture);
    assert.match(result.errors.join('\n'), /missing required description/);
    assert.match(result.errors.join('\n'), /duplicate slug "duplicate"/);
    assert.match(result.errors.join('\n'), /missing local cover image/);
    assert.match(result.errors.join('\n'), /broken internal link \/missing-page\//);
    assert.match(result.errors.join('\n'), /invalid publishedAt/);
    assert.match(
      result.errors.join('\n'),
      /description must be 240 characters or fewer/
    );
    assert.match(result.errors.join('\n'), /description must not end with an ellipsis/);
  } finally {
    await fixture.cleanup();
  }
});

test('reports locale-prefixed 2025 routes that Astro does not emit', async () => {
  const fixture = await createFixture({
    'valid-post.en.mdx': validPost.replace(
      'Read the [schedule](/2025/schedule/).',
      'Read the [missing localized schedule](/2025/en/schedule/).'
    ),
  });

  try {
    const result = await validateNewsContent(fixture);
    assert.match(
      result.errors.join('\n'),
      /broken internal link \/2025\/en\/schedule\//
    );
  } finally {
    await fixture.cleanup();
  }
});

test('accepts known 2025 routes and emitted sprint Q&A locales', async () => {
  const fixture = await createFixture({
    'valid-post.en.mdx': validPost.replace(
      'Read the [schedule](/2025/schedule/).',
      [
        'Read the [default schedule](/2025/schedule/).',
        'Read the [live schedule alias](https://pycon.hk/schedule).',
        'Read the [live sprint alias](https://pycon.hk/sprint).',
        'Read the [English sprint Q&A](/2025/sprint/qna/en).',
        'Read the [Cantonese sprint Q&A](/2025/sprint/qna/zh-hk).',
        'Read the [default article](/2025/news/valid-post/).',
      ].join('\n')
    ),
  });

  try {
    const result = await validateNewsContent(fixture);
    assert.deepEqual(result.errors, []);
  } finally {
    await fixture.cleanup();
  }
});

test('reports raw HTML that is unsafe for CMS-authored markdown', async () => {
  const fixture = await createFixture({
    'valid-post.en.mdx': validPost.replace(
      'Read the [schedule](/2025/schedule/).',
      [
        '<script>alert("xss")</script>',
        '<img src="/outstatic/images/cover.webp" onerror="alert(1)">',
        '<a href="javascript:alert(1)">Unsafe link</a>',
      ].join('\n')
    ),
  });

  try {
    const result = await validateNewsContent(fixture);
    assert.match(result.errors.join('\n'), /raw HTML tag <script> is not allowed/);
    assert.match(
      result.errors.join('\n'),
      /raw HTML event handler onerror is not allowed/
    );
    assert.match(result.errors.join('\n'), /raw HTML javascript URL is not allowed/);
  } finally {
    await fixture.cleanup();
  }
});
