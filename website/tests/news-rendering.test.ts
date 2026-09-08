import test from 'node:test';
import assert from 'node:assert/strict';
import { renderNewsMarkdown } from '../src/lib/news.ts';

test('sanitizes markdown HTML before it reaches set:html rendering', async () => {
  const html = await renderNewsMarkdown(`
# Safe title

<script>alert("xss")</script>
<img src="/outstatic/images/cover.webp" onerror="alert(1)">
<a href="javascript:alert(1)" onclick="alert(1)">Unsafe link</a>
`);

  assert.match(html, /<h1>Safe title<\/h1>/);
  assert.doesNotMatch(html, /<script/);
  assert.doesNotMatch(html, /onerror/);
  assert.doesNotMatch(html, /onclick/);
  assert.doesNotMatch(html, /javascript:/);
});
