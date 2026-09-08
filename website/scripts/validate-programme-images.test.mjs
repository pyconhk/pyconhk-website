import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateProgrammeImages } from './validate-programme-images.mjs';

test('programme build rejects remote or missing images and accepts shared bundled assets', async (t) => {
  const dist = await mkdtemp(join(tmpdir(), 'programme-images-'));
  t.after(() => rm(dist, { recursive: true, force: true }));
  await mkdir(join(dist, '2026/en/speakers'), { recursive: true });
  const schedule = join(dist, '2026/en/schedule.html');
  await writeFile(schedule, '<template><img src="https://pretalx.com/media/avatar.webp"></template>');
  await assert.rejects(validateProgrammeImages(dist), /must be bundled locally/);
  await writeFile(schedule, '<img src="/_astro/portrait.webp">');
  await assert.rejects(validateProgrammeImages(dist), /ENOENT/);
  await mkdir(join(dist, '_astro'));
  await writeFile(join(dist, '_astro/portrait.webp'), 'image fixture');
  await writeFile(join(dist, '2026/en/speakers/person.html'), '<img src="/_astro/portrait.webp">');
  assert.deepEqual(await validateProgrammeImages(dist), { pages: 2, images: 1 });
});
