import { access, glob, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function validateProgrammeImages(dist = 'dist') {
  const root = resolve(dist);
  const images = new Set();
  let pages = 0;
  for await (const file of glob(['2026/*/schedule.html', '2026/*/speakers/*.html'], { cwd: root })) {
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

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await validateProgrammeImages();
  console.log(`Verified ${result.images} bundled images across ${result.pages} programme pages.`);
}
