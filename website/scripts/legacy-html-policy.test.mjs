import test from 'node:test';
import assert from 'node:assert/strict';
import { legacy2024Pages } from '../src/years/2024/data/pages.ts';

test('legacy 2024 archive content does not execute script tags', () => {
  const pagesWithScripts = legacy2024Pages
    .filter((page) => /<script\b/iu.test(page.content))
    .map((page) => page.slug);

  assert.deepEqual(pagesWithScripts, []);
});
