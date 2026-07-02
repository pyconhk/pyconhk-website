import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';

const websiteRoot = new URL('..', import.meta.url);

function runScript(scriptPath, args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: websiteRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
    },
    timeout: 2_000,
  });
}

describe('2015 pixel diff route mapping', () => {
  it('lets ui-diff compare different local and live routes', () => {
    const result = runScript('scripts/ui-diff.mjs', [
      '--dry-run',
      '--path-pair',
      '/2015/photos/=/conference-highlights/2015-photos/',
      '--viewport',
      'desktop',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const dryRun = JSON.parse(result.stdout);

    assert.deepEqual(dryRun.jobs, [
      {
        livePath: '/conference-highlights/2015-photos/',
        localPath: '/2015/photos/',
        viewport: 'desktop',
      },
    ]);
  });

  it('maps migrated visual samples to their live source routes by default', () => {
    const result = runScript('scripts/legacy-2015-pixel-diff.mjs', [
      '--dry-run',
      '--viewport',
      'desktop',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const dryRun = JSON.parse(result.stdout);
    const photoJob = dryRun.jobs.find(
      (job) => job.localPath === '/2015/photos/' && job.viewport === 'desktop'
    );

    assert.deepEqual(photoJob, {
      livePath: '/conference-highlights/2015-photos/',
      localPath: '/2015/photos/',
      viewport: 'desktop',
    });
  });

  it('does not add default visual samples when a path pair is provided', () => {
    const result = runScript('scripts/legacy-2015-pixel-diff.mjs', [
      '--dry-run',
      '--viewport',
      'desktop',
      '--path-pair',
      '/2015/photos/=/conference-highlights/2015-photos/',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const dryRun = JSON.parse(result.stdout);

    assert.deepEqual(dryRun.jobs, [
      {
        livePath: '/conference-highlights/2015-photos/',
        localPath: '/2015/photos/',
        viewport: 'desktop',
      },
    ]);
  });
});
