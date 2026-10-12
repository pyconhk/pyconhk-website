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

const fixtureImage = '/2025/landing-pages/open-graph.webp';
const fixtureVariants = [
  ['en', '', 'September 30, 2026'],
  ['zh-hk', '  picture: null\n', '2026年9月30日'],
  ['zh-hant', '  picture: ""\n', '2026年9月30日'],
  ['zh-hans', '  picture: "   "\n', '2026年9月30日'],
  ['ja', `  picture: ${fixtureImage}\n`, '2026年9月30日'],
  ['ko', `  picture: "  ${fixtureImage}  "\n`, '2026년 9월 30일'],
] as const;

function fixturePost(locale: string, picture = ''): string {
  return `---
title: Future-Year CMS Fixture (${locale})
slug: cms-route-fixture
status: published
publishedAt: 2026-09-30T00:43:00.000+08:00
description: ${locale === 'zh-hk' ? 'null' : 'A synthetic CMS post for year-owned routing coverage.'}
coverImage: ${fixtureImage}
author:
  name: PyCon HK
${picture}${locale === 'zh-hk' ? 'tags: null' : 'tags:\n  - announcement'}
---

This future-year CMS post (${locale}) should build under its own localized year route.
`;
}

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
  await mkdir(path.join(fixtureRoot, 'cms/src/lib'), { recursive: true });
  await cp(
    path.join(repositoryRoot, 'cms/package.json'),
    path.join(fixtureRoot, 'cms/package.json')
  );
  await cp(
    path.join(repositoryRoot, 'cms/src/lib/news-frontmatter.ts'),
    path.join(fixtureRoot, 'cms/src/lib/news-frontmatter.ts')
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
    for (const [locale, picture] of fixtureVariants) {
      await writeFile(
        path.join(futurePostDirectory, `cms-route-fixture.${locale}.mdx`),
        fixturePost(locale, picture)
      );
    }
    await writeFile(
      path.join(futurePostDirectory, 'incomplete-fixture.en.mdx'),
      fixturePost('en').replaceAll('cms-route-fixture', 'incomplete-fixture')
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
  test('builds all localized CMS routes with optional avatars and year-owned sitemap entries', async () => {
    test.setTimeout(240_000);

    const tempRoot = await buildFixtureSite();

    try {
      const distRoot = path.join(tempRoot, 'website', 'dist');
      const existingDefaultHtml = await readFile(
        path.join(distRoot, '2025', 'news', 'pre-event-notice.html'),
        'utf8'
      );
      const redirects = await readFile(path.join(distRoot, '_redirects'), 'utf8');
      const sitemapXml = await readFile(path.join(distRoot, 'sitemap.xml'), 'utf8');

      for (const [locale, , dateLabel] of fixtureVariants) {
        for (const route of [
          `2026/${locale}/news/cms-route-fixture.html`,
          `2026/${locale}/news.html`,
        ]) {
          const html = await readFile(path.join(distRoot, route), 'utf8');
          expect(html).toContain(`Future-Year CMS Fixture (${locale})`);
          expect(html).toContain(
            `<time datetime="2026-09-29T16:43:00.000Z">${dateLabel}</time>`
          );
          if (route.endsWith('cms-route-fixture.html')) {
            expect(html).toContain(
              `This future-year CMS post (${locale}) should build under its own localized year route.`
            );
          } else if (locale === 'zh-hk') {
            expect(html).toContain('should build under its own localized year route.');
          }
          if (locale === 'ko' && route.endsWith('cms-route-fixture.html')) {
            expect(html).toContain('뉴스로 돌아가기');
          }
          expect(html).not.toContain('Register for your Ticket NOW!');
        }
        await expect(
          readFile(path.join(distRoot, `2026/${locale}/news/incomplete-fixture.html`))
        ).rejects.toThrow();
        expect(sitemapXml).toContain(
          `<loc>${siteOrigin}/2026/${locale}/news/cms-route-fixture</loc>`
        );
      }
      expect(existingDefaultHtml).toContain('PyCon HK 2025 Pre-Event Essentials');
      expect(redirects).toMatch(/^\/news\/\* \/2025\/news\/:splat 308$/mu);
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
