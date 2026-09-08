import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { access, glob, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
export async function validateProgrammeImages(dist = 'dist') {
  const root = resolve(dist);
  const images = new Set();
  let pages = 0;
  for await (const file of glob(['2026/*/schedule.html', '2026/*/speakers/*.html', '2026/*/speakers/*/index.html'], { cwd: root })) {
    pages += 1;
    const html = await readFile(resolve(root, file), 'utf8');
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
      if (!src?.startsWith('/') || src.startsWith('//')) {
        throw new Error(`Programme image must be bundled locally: ${file}: ${src}`);
      }
      const path = resolve(root, `.${decodeURIComponent(src.split(/[?#]/)[0])}`);
      if (!path.startsWith(`${root}${sep}`)) throw new Error(`Image escapes build directory: ${src}`);
      images.add(path);
    }
  }
  if (!pages) throw new Error('No built programme pages found.');
  await Promise.all([...images].map((image) => access(image)));
  return { pages, images: images.size };
}


test('programme build rejects remote or missing images and accepts shared bundled assets', async (t) => {
  const dist = await mkdtemp(join(tmpdir(), 'programme-images-'));
  t.after(() => rm(dist, { recursive: true, force: true }));
  await mkdir(join(dist, '2026/en/speakers/person'), { recursive: true });
  const schedule = join(dist, '2026/en/schedule.html');
  await writeFile(schedule, '<template><img src="https://pretalx.com/media/avatar.webp"></template>');
  await assert.rejects(validateProgrammeImages(dist), /must be bundled locally/);
  await writeFile(schedule, '<img src="/_astro/portrait.webp">');
  await assert.rejects(validateProgrammeImages(dist), /ENOENT/);
  await mkdir(join(dist, '_astro'));
  await writeFile(join(dist, '_astro/portrait.webp'), 'image fixture');
  await writeFile(join(dist, '2026/en/speakers/person/index.html'), '<img src="/_astro/portrait.webp">');
  assert.deepEqual(await validateProgrammeImages(dist), { pages: 2, images: 1 });
});
