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

describe('2016 pixel diff route mapping', () => {
  it('maps migrated visual samples to their live source routes by default', () => {
    const result = runScript('scripts/legacy-2016-pixel-diff.mjs', [
      '--dry-run',
      '--viewport',
      'desktop',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const dryRun = JSON.parse(result.stdout);
    const photoJob = dryRun.jobs.find(
      (job) => job.localPath === '/2016/photos/' && job.viewport === 'desktop'
    );
    const sponsorJob = dryRun.jobs.find(
      (job) => job.localPath === '/2016/sponsor/' && job.viewport === 'desktop'
    );

    assert.deepEqual(photoJob, {
      livePath: '/conference-highlights/2016-photos/',
      localPath: '/2016/photos/',
      viewport: 'desktop',
    });
    assert.deepEqual(sponsorJob, {
      livePath: '/2016/sponsor/',
      localPath: '/2016/sponsor/',
      viewport: 'desktop',
    });
  });

  it('does not add default visual samples when a path pair is provided', () => {
    const result = runScript('scripts/legacy-2016-pixel-diff.mjs', [
      '--dry-run',
      '--viewport',
      'desktop',
      '--path-pair',
      '/2016/photos/=/conference-highlights/2016-photos/',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const dryRun = JSON.parse(result.stdout);

    assert.deepEqual(dryRun.jobs, [
      {
        livePath: '/conference-highlights/2016-photos/',
        localPath: '/2016/photos/',
        viewport: 'desktop',
      },
    ]);
  });
});
