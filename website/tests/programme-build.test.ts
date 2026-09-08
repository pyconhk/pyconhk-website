import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateProgrammeImages } from './validate-programme-images.test.ts';

test('built programme and speaker portraits are bundled locally', async () => {
  const result = await validateProgrammeImages();
  assert.ok(result.pages >= 6);
});
