import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const defaultLocalBase = 'http://127.0.0.1:8790';
const defaultLiveBase = 'https://pycon.hk';
const localBase = process.env.LOCAL_BASE || defaultLocalBase;
const liveBase = process.env.LIVE_BASE || defaultLiveBase;
const websiteRoot = fileURLToPath(new URL('../', import.meta.url));
const defaultOutDir = fileURLToPath(
  new URL('../../output/playwright/2015-parity/', import.meta.url)
);
const flagsWithValues = new Set([
  '--concurrency',
  '--live-base',
  '--local-base',
  '--out',
  '--path',
  '--path-pair',
  '--path-pairs',
  '--paths',
  '--viewport',
  '--viewports',
]);
const liveRouteByLocalRoute = new Map(
  routeContract.migratedTopLevelRoutes.map(({ from, to }) => [
    normalizeRouteKey(to),
    from,
  ])
);

function normalizeRouteKey(route) {
  return route.endsWith('/') ? route : `${route}/`;
}

function hasFlag(argv, names) {
  return argv.some((arg) =>
    names.some((name) => arg === name || arg.startsWith(`${name}=`))
  );
}

function hasPositionalPath(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith('--')) {
      if (flagsWithValues.has(arg)) {
        index += 1;
      }

      continue;
    }

    return true;
  }

  return false;
}

function defaultArgs(passThroughArgs) {
  const args = [];

  if (
    !hasFlag(passThroughArgs, ['--path', '--paths', '--path-pair', '--path-pairs']) &&
    !hasPositionalPath(passThroughArgs)
  ) {
    args.push(
      '--path-pairs',
      routeContract.visualSampleRoutes.map(visualSamplePair).join(',')
    );
  }

  if (!hasFlag(passThroughArgs, ['--viewports', '--viewport'])) {
    args.push('--viewports', 'desktop,mobile');
  }

  if (!hasFlag(passThroughArgs, ['--out'])) {
    args.push('--out', path.normalize(defaultOutDir));
  }

  if (!hasFlag(passThroughArgs, ['--local-base'])) {
    args.push('--local-base', localBase);
  }

  if (!hasFlag(passThroughArgs, ['--live-base'])) {
    args.push('--live-base', liveBase);
  }

  if (!hasFlag(passThroughArgs, ['--concurrency'])) {
    args.push('--concurrency', '1');
  }

  return args;
}

function visualSamplePair(route) {
  return `${route}=${liveRouteByLocalRoute.get(normalizeRouteKey(route)) || route}`;
}

const passThroughArgs = process.argv.slice(2);
const uiDiffArgs = [
  'scripts/ui-diff.mjs',
  ...defaultArgs(passThroughArgs),
  ...passThroughArgs,
];
const child = spawn(process.execPath, uiDiffArgs, {
  cwd: websiteRoot,
  stdio: 'inherit',
});

child.on('close', (code, signal) => {
  if (signal) {
    console.error(`2015 pixel diff stopped by ${signal}`);
    process.exit(1);
  }

  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error(`Could not start 2015 pixel diff: ${error.message}`);
  process.exit(1);
});
