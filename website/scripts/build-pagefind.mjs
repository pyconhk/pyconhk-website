import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = new URL('..', import.meta.url).pathname;
const binName = process.platform === 'win32' ? 'pagefind.cmd' : 'pagefind';
const localPagefind = path.join(projectRoot, 'node_modules', '.bin', binName);
const distPagefind = path.join(projectRoot, 'dist', 'pagefind');
const publicPagefind = path.join(projectRoot, 'public', 'pagefind');
const pagefindArgs = ['--site', 'dist', '--force-language', 'en'];
const candidates = [
  fs.existsSync(localPagefind) && {
    command: localPagefind,
    args: pagefindArgs,
  },
  { command: 'bunx', args: ['pagefind', ...pagefindArgs] },
  { command: 'npx', args: ['--yes', 'pagefind', ...pagefindArgs] },
  { command: 'pnpm', args: ['dlx', 'pagefind', ...pagefindArgs] },
].filter(Boolean);

fs.rmSync(distPagefind, { recursive: true, force: true });

for (const { command, args } of candidates) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error?.code === 'ENOENT') {
    continue;
  }

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  const status = result.status ?? 1;

  if (status === 0) {
    fs.rmSync(publicPagefind, { recursive: true, force: true });
    fs.cpSync(distPagefind, publicPagefind, { recursive: true });
  }

  process.exit(status);
}

console.error('Could not find a package runner for Pagefind. Install pagefind or run with Bun/npm/pnpm available.');
process.exit(1);
