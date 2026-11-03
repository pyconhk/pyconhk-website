import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parse } from 'yaml';

const workflow = parse(readFileSync(new URL('../workflows/deploy-website-reusable.yml', import.meta.url), 'utf8'));
const script = workflow.jobs.deploy.steps.find((step) => step.name === 'Stage only approved editorial content and uploaded media').run;
const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];

function fixture(t: { after: (callback: () => void) => void }, sprint = true) {
  const root = mkdtempSync(path.join(tmpdir(), 'pycon-editorial-stage-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'news-source');
  const write = (name: string, value = 'fixture') => {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, value);
  };
  write('news-source/website/outstatic/content/2025-posts/archive.en.mdx');
  if (sprint) for (const locale of locales) write(`news-source/website/outstatic/content/2026-sprint/settings.${locale}.json`, JSON.stringify({ locale, revision: 'CMS' }));
  write('website/outstatic/content/2026-sprint/settings.en.json', 'initial seed');
  write('website/outstatic/content/2026-sprint/stale.json', 'old seed');
  const git = (...args: string[]) => execFileSync('git', args, { cwd: source, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-q');
  const commit = () => {
    git('add', '.');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '-qm', 'Editorial fixture');
    return git('rev-parse', 'HEAD');
  };
  const stage = (sha = commit()) => execFileSync('bash', ['-e', '-o', 'pipefail', '-c', script], { cwd: root, env: { ...process.env, EXPECTED_NEWS_SHA: sha }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return { root, source, write, stage };
}

test('the deployment stages all six pinned Sprint files and removes stale seed content', (t) => {
  const { root, stage } = fixture(t);
  stage();
  for (const locale of locales) assert.deepEqual(JSON.parse(readFileSync(path.join(root, `website/outstatic/content/2026-sprint/settings.${locale}.json`), 'utf8')), { locale, revision: 'CMS' });
  assert.equal(existsSync(path.join(root, 'website/outstatic/content/2026-sprint/stale.json')), false);
});

test('the initial rollout keeps its approved seed until the singleton is initialized', (t) => {
  const { root, stage } = fixture(t, false);
  stage();
  assert.equal(readFileSync(path.join(root, 'website/outstatic/content/2026-sprint/settings.en.json'), 'utf8'), 'initial seed');
});

test('unsupported Sprint files and website source paths stop staging before any replacement', (t) => {
  for (const filename of ['website/outstatic/content/2026-sprint/other.en.json', 'website/outstatic/content/2026-sprint/nested/settings.en.json', 'website/src/injected.ts']) {
    const { root, write, stage } = fixture(t);
    write(`news-source/${filename}`);
    assert.throws(() => stage(), /unsupported website file/);
    assert.equal(readFileSync(path.join(root, 'website/outstatic/content/2026-sprint/settings.en.json'), 'utf8'), 'initial seed');
  }
});

test('a symlink with a canonical Sprint filename cannot enter the deployed site', (t) => {
  const { source, stage } = fixture(t);
  const file = path.join(source, 'website/outstatic/content/2026-sprint/settings.en.json');
  rmSync(file);
  symlinkSync('/dev/null', file);
  assert.throws(() => stage(), /must not contain symlinks/);
});

test('the content checkout must match the immutable preflight revision', (t) => {
  const { root, stage } = fixture(t);
  // Create its first revision, then reject a subsequent mismatched expectation.
  stage();
  assert.throws(() => stage('0'.repeat(40)), /does not match the pinned revision/);
  assert.equal(existsSync(path.join(root, 'website/outstatic/content/2026-sprint/settings.en.json')), true);
});
