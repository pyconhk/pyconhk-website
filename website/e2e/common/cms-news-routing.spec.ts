import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const siteOrigin = new URL(process.env.PUBLIC_SITE_URL || 'https://pycon.hk').origin;

const execFileAsync = promisify(execFile);
const websiteRoot = fileURLToPath(new URL('../..', import.meta.url));

const fixturePost = `---
title: Future-Year CMS Fixture
slug: cms-route-fixture
status: published
publishedAt: "2026-02-03T04:05:06.000Z"
description: A synthetic CMS post for year-owned routing coverage.
coverImage: /2025/landing-pages/open-graph.webp
author:
  name: PyCon HK
tags:
  - announcement
---

This future-year CMS post should build under its own localized year route.
`;

async function copyBuildInput(targetRoot: string): Promise<void> {
  for (const fileName of [
    'astro.config.ts',
    'bun.lock',
    'package.json',
    'tsconfig.json',
    'wrangler.toml',
  ]) {
    await cp(path.join(websiteRoot, fileName), path.join(targetRoot, fileName));
  }

  for (const directoryName of ['outstatic', 'public', 'src', 'integrations']) {
    await cp(
      path.join(websiteRoot, directoryName),
      path.join(targetRoot, directoryName),
      {
        recursive: true,
      }
    );
  }
  // Preserve the installed workspace graph locally. A dependency symlink outside
  // the fixture breaks Astro's virtual CSS module IDs; a fresh install would
  // unnecessarily require registry access in this content-routing test.
  const repositoryRoot = path.dirname(websiteRoot);
  const fixtureRoot = path.dirname(targetRoot);
  for (const fileName of ['package.json', 'bun.lock']) {
    await cp(path.join(repositoryRoot, fileName), path.join(fixtureRoot, fileName));
  }
  await mkdir(path.join(fixtureRoot, 'cms'));
  await cp(
    path.join(repositoryRoot, 'cms/package.json'),
    path.join(fixtureRoot, 'cms/package.json')
  );
  for (const [source, destination] of [
    [path.join(repositoryRoot, 'node_modules'), path.join(fixtureRoot, 'node_modules')],
    [path.join(websiteRoot, 'node_modules'), path.join(targetRoot, 'node_modules')],
  ]) {
    await cp(source, destination, {
      recursive: true,
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
    });
  }
}

async function buildFixtureSite(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'pyconhk-cms-routing-'));
  const tempWebsiteRoot = path.join(tempRoot, 'website');
  try {
    await mkdir(tempWebsiteRoot);
    await copyBuildInput(tempWebsiteRoot);

    // This scenario tests CMS routes, using public programme data without remote
    // portraits. The dedicated programme suite covers built speaker images.
    const snapshotPath = 'src/years/2026/data/programme/pyconhk2025.public.json';
    const snapshot = JSON.parse(
      await readFile(path.join(tempWebsiteRoot, snapshotPath), 'utf8')
    );
    for (const session of snapshot.sessions) {
      for (const speaker of session.speakerProfiles ?? []) speaker.avatar = '';
    }
    const content = { ...snapshot };
    delete content.hash;
    delete content.fetchedAt;
    snapshot.hash = createHash('sha256').update(JSON.stringify(content)).digest('hex');
    await writeFile(path.join(tempWebsiteRoot, snapshotPath), JSON.stringify(snapshot));

    const futurePostDirectory = path.join(
      tempWebsiteRoot,
      'outstatic',
      'content',
      '2026-posts'
    );
    await mkdir(futurePostDirectory, { recursive: true });
    for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      await writeFile(
        path.join(futurePostDirectory, `cms-route-fixture.${locale}.mdx`),
        fixturePost
      );
    }
    await writeFile(
      path.join(futurePostDirectory, 'incomplete-fixture.en.mdx'),
      fixturePost.replaceAll('cms-route-fixture', 'incomplete-fixture')
    );

    await execFileAsync('bun', ['run', 'build'], {
      cwd: tempWebsiteRoot,
      env: {
        ...process.env,
        PROGRAMME_ENVIRONMENT: 'test',
        PROGRAMME_SOURCE_EVENT: 'pyconhk2025',
        PROGRAMME_SNAPSHOT_PATH: snapshotPath,
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
        path.join(distRoot, '2026', 'en', 'news', 'cms-route-fixture.html'),
        'utf8'
      );
      const futureKoreanHtml = await readFile(
        path.join(distRoot, '2026', 'ko', 'news', 'cms-route-fixture.html'),
        'utf8'
      );
      const existingDefaultHtml = await readFile(
        path.join(distRoot, '2025', 'news', 'pre-event-notice.html'),
        'utf8'
      );
      const redirects = await readFile(path.join(distRoot, '_redirects'), 'utf8');
      const sitemapXml = await readFile(path.join(distRoot, 'sitemap.xml'), 'utf8');

      expect(futurePostHtml).toContain('Future-Year CMS Fixture');
      expect(futurePostHtml).toContain(
        'This future-year CMS post should build under its own localized year route.'
      );
      expect(futureKoreanHtml).toContain('Future-Year CMS Fixture');
      expect(futureKoreanHtml).toContain('뉴스로 돌아가기');
      expect(futurePostHtml).not.toContain('Register for your Ticket NOW!');
      await expect(
        readFile(path.join(distRoot, '2026/en/news/incomplete-fixture.html'))
      ).rejects.toThrow();
      expect(existingDefaultHtml).toContain('PyCon HK 2025 Pre-Event Essentials');
      expect(redirects).toMatch(/^\/news\/\* \/2025\/news\/:splat 308$/mu);
      expect(sitemapXml).toContain(
        `<loc>${siteOrigin}/2026/en/news/cms-route-fixture</loc>`
      );
      expect(sitemapXml).toContain(
        `<loc>${siteOrigin}/2026/zh-hk/news/cms-route-fixture</loc>`
      );
      expect(sitemapXml).toContain(
        `<loc>${siteOrigin}/2026/ko/news/cms-route-fixture</loc>`
      );
      expect(sitemapXml).not.toContain('incomplete-fixture');
      expect(sitemapXml).not.toContain('/2025/ko/');
      expect(sitemapXml).toContain(
        `<loc>${siteOrigin}/2025/news/pre-event-notice</loc>`
      );
      expect(sitemapXml).not.toContain(
        `<loc>${siteOrigin}/2025/en/news/pre-event-notice</loc>`
      );
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });
});
