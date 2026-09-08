import { execFileSync } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';

export async function buildPagefind(root: string) {
  const output = join(root, 'dist/pagefind');
  await rm(output, { recursive: true, force: true });
  execFileSync(join(root, 'node_modules/.bin/pagefind'), ['--site', 'dist', '--force-language', 'en'], { cwd: root, stdio: 'inherit' });
  const publicOutput = join(root, 'public/pagefind');
  await rm(publicOutput, { recursive: true, force: true });
  await cp(output, publicOutput, { recursive: true });
}
