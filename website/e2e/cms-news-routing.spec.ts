import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const execFileAsync = promisify(execFile);
const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

const fixturePost = `---
title: Future-Year CMS Fixture
slug: cms-route-fixture
status: published
publishedAt: "2026-02-03T04:05:06.000Z"
description: A synthetic CMS post for year-owned routing coverage.
coverImage: /2025/landing-pages/open-graph.webp
author:
  name: PyCon HK
---

This future-year CMS post should build under its own localized year route.
`;

async function copyBuildInput(targetRoot: string): Promise<void> {
  for (const fileName of [
    'astro.config.mjs',
    'bun.lock',
    'package.json',
    'tsconfig.json',
    'wrangler.toml',
  ]) {
    await cp(path.join(websiteRoot, fileName), path.join(targetRoot, fileName));
  }

  for (const directoryName of ['outstatic', 'public', 'src']) {
    await cp(path.join(websiteRoot, directoryName), path.join(targetRoot, directoryName), {
      recursive: true,
    });
  }

}

async function buildFixtureSite(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'pyconhk-cms-routing-'));
  const tempWebsiteRoot = path.join(tempRoot, 'website');
  await mkdir(tempWebsiteRoot);
  await copyBuildInput(tempWebsiteRoot);

  const futurePostDirectory = path.join(
    tempWebsiteRoot,
    'outstatic',
    'content',
    '2026-posts'
  );
  await mkdir(futurePostDirectory, { recursive: true });
  await writeFile(path.join(futurePostDirectory, 'cms-route-fixture.en.mdx'), fixturePost);

  try {
    await execFileAsync('bun', ['install'], {
      cwd: tempWebsiteRoot,
      env: process.env,
      maxBuffer: 20 * 1024 * 1024,
      timeout: 120_000,
    });
    await execFileAsync('bun', ['run', 'build'], {
      cwd: tempWebsiteRoot,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: '1',
        PUBLIC_IS_TEST_ENV: 'true',
      },
      maxBuffer: 20 * 1024 * 1024,
      timeout: 120_000,
    });
  } catch (error) {
    await rm(tempRoot, { force: true, recursive: true });
    throw error;
  }

  return tempRoot;
}

test.describe('CMS news routing', () => {
  test('builds year-owned localized routes and sitemap entries for CMS post years', async () => {
    test.setTimeout(240_000);

    const tempRoot = await buildFixtureSite();

    try {
      const distRoot = path.join(tempRoot, 'website', 'dist');
      const futurePostHtml = await readFile(
        path.join(distRoot, '2026', 'en', 'news', 'cms-route-fixture', 'index.html'),
        'utf8'
      );
      const futureFallbackHtml = await readFile(
        path.join(distRoot, '2026', 'zh-hk', 'news', 'cms-route-fixture', 'index.html'),
        'utf8'
      );
      const existingLocalizedHtml = await readFile(
        path.join(distRoot, '2025', 'en', 'news', 'pre-event-notice', 'index.html'),
        'utf8'
      );
      const existingCompatibilityHtml = await readFile(
        path.join(distRoot, 'news', 'pre-event-notice', 'index.html'),
        'utf8'
      );
      const sitemapXml = await readFile(path.join(distRoot, 'sitemap.xml'), 'utf8');

      expect(futurePostHtml).toContain('Future-Year CMS Fixture');
      expect(futurePostHtml).toContain(
        'This future-year CMS post should build under its own localized year route.'
      );
      expect(futureFallbackHtml).toContain('Future-Year CMS Fixture');
      expect(existingLocalizedHtml).toContain('PyCon HK 2025 Pre-Event Essentials');
      expect(existingCompatibilityHtml).toContain('PyCon HK 2025 Pre-Event Essentials');
      expect(sitemapXml).toContain(
        '<loc>https://pycon.hk/2026/en/news/cms-route-fixture/</loc>'
      );
      expect(sitemapXml).toContain(
        '<loc>https://pycon.hk/2026/zh-hk/news/cms-route-fixture/</loc>'
      );
      expect(sitemapXml).toContain(
        '<loc>https://pycon.hk/2025/en/news/pre-event-notice/</loc>'
      );
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });
});
