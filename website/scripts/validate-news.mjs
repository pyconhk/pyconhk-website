import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const supportedLocales = new Set(['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja']);
const publishedStatuses = new Set(['draft', 'published']);
const maxDescriptionLength = 240;
const currentHomepagePattern = /^\/(?:en|zh-hk|zh-hant|zh-hans|ko|ja)\/?$/u;
const legacyArchivePattern =
  /^\/(?:author|category|conference-highlights|page|tag)(?:\/.*)?\/?$/u;
const legacyYearRoutePattern =
  /^\/(?:2015|2016|2017|2018|2020|2020-spring|2020-fall|2021|2022|2023|2024)(?:\/.*)?\/?$/u;
const known2025Sections = new Set([
  'about',
  'access-guide',
  'catering-guide',
  'code-of-conduct',
  'news',
  'organizers',
  'privacy-policy',
  'schedule',
  'sponsorships',
  'sprint',
  'supporting-organizations',
  'volunteers',
]);
const known2025RootAliases = new Set([
  'about',
  'access-guide',
  'catering-guide',
  'code-of-conduct',
  'news',
  'organizers',
  'privacy-policy',
  'schedule',
  'sponsors',
  'sponsorships',
  'sprint',
  'supporting-organizations',
  'volunteers',
]);
const sectionAliases = new Map([['sponsors', 'sponsorships']]);
const known2025Subpages = new Set([
  'code-of-conduct/attendee-reporting',
  'code-of-conduct/staff-procedures',
  'sponsorships/opportunities',
  'sponsorships/patrons',
  'sprint/qna',
]);
const known2025QnaLocales = new Set(['en', 'zh-hk']);

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function normalizeSlug(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseCollectionDirectoryName(name) {
  const match = name.match(/^(\d{4})-posts$/u);
  return match ? Number(match[1]) : null;
}

function parsePostFilename(name) {
  const match = name.match(/^(.+)\.(en|zh-hk|zh-hant|zh-hans|ja)\.mdx$/u);
  if (!match) {
    return null;
  }

  return {
    locale: match[2],
    slug: match[1],
  };
}

function normalizeCoverImage(imagePath) {
  if (typeof imagePath !== 'string') {
    return '';
  }

  if (imagePath.startsWith('/api/outstatic/media/')) {
    const publicIndex = imagePath.indexOf('/public/');

    if (publicIndex >= 0) {
      return imagePath.slice(publicIndex + '/public'.length);
    }
  }

  return imagePath;
}

function normalizeInternalUrl(rawUrl) {
  const value = rawUrl.trim().replace(/^<|>$/gu, '').split(/\s+/u)[0];

  if (!value || value.startsWith('#') || /^(mailto|tel):/iu.test(value)) {
    return null;
  }

  if (value.startsWith('/')) {
    return value.split(/[?#]/u)[0] || '/';
  }

  if (/^https?:\/\//iu.test(value)) {
    const url = new URL(value);

    if (url.hostname === 'pycon.hk' || url.hostname === 'www.pycon.hk') {
      return url.pathname || '/';
    }
  }

  return null;
}

function normalizeRoutePath(urlPath) {
  if (urlPath === '/') {
    return '/';
  }

  return `/${urlPath.replace(/^\/+|\/+$/gu, '')}/`;
}

function extractInternalLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu;
  const htmlAttributePattern = /\b(?:href|src)=["']([^"']+)["']/gu;

  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const normalized = normalizeInternalUrl(match[1]);

    if (normalized) {
      links.push(normalized);
    }
  }

  for (const match of markdown.matchAll(htmlAttributePattern)) {
    const normalized = normalizeInternalUrl(match[1]);

    if (normalized) {
      links.push(normalized);
    }
  }

  return links;
}

function isExistingPublicAsset(urlPath, publicRoot) {
  if (!urlPath.startsWith('/outstatic/') && !urlPath.startsWith('/legacy-wp/')) {
    return false;
  }

  return existsSync(path.join(publicRoot, urlPath));
}

function getRouteSegments(urlPath) {
  return normalizeRoutePath(urlPath)
    .replace(/^\/|\/$/gu, '')
    .split('/')
    .filter(Boolean);
}

function isKnown2025Route(urlPath, knownPostRoutes) {
  const segments = getRouteSegments(urlPath);

  if (known2025RootAliases.has(segments[0])) {
    return segments.length === 1;
  }

  if (segments[0] !== '2025') {
    return false;
  }

  if (supportedLocales.has(segments[1])) {
    return false;
  }

  const routeSegments = segments.slice(1);

  if (routeSegments.length === 0) {
    return true;
  }

  if (routeSegments[0] === 'news') {
    return routeSegments.length === 1 || knownPostRoutes.has(normalizeRoutePath(urlPath));
  }

  const section = sectionAliases.get(routeSegments[0]) ?? routeSegments[0];

  if (!known2025Sections.has(section)) {
    return false;
  }

  if (routeSegments.length === 1) {
    return true;
  }

  if (routeSegments.length === 2) {
    return known2025Subpages.has(`${section}/${routeSegments[1]}`);
  }

  if (
    routeSegments.length === 3 &&
    section === 'sprint' &&
    routeSegments[1] === 'qna'
  ) {
    return known2025QnaLocales.has(routeSegments[2]);
  }

  return false;
}

function isKnown2026Route(urlPath) {
  const segments = getRouteSegments(urlPath);

  return (
    segments[0] === '2026' &&
    (segments.length === 1 ||
      (segments.length === 2 &&
        (supportedLocales.has(segments[1]) || segments[1] === 'ko')))
  );
}

function isKnownInternalRoute(urlPath, knownPostRoutes) {
  if (urlPath === '/') {
    return true;
  }

  return (
    currentHomepagePattern.test(urlPath) ||
    knownPostRoutes.has(normalizeRoutePath(urlPath)) ||
    isKnown2025Route(urlPath, knownPostRoutes) ||
    isKnown2026Route(urlPath) ||
    legacyYearRoutePattern.test(urlPath) ||
    legacyArchivePattern.test(urlPath)
  );
}

async function listPostDirectories(contentRoot) {
  const entries = await readdir(contentRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: path.join(contentRoot, entry.name),
      year: parseCollectionDirectoryName(entry.name),
    }))
    .filter((entry) => entry.year !== null);
}

function validateFrontmatter({
  content,
  data,
  errors,
  fileLabel,
  filenameSlug,
  locale,
  publicRoot,
  seenSlugs,
  year,
}) {
  const slug = normalizeSlug(data.slug) || filenameSlug;
  const slugKey = `${year}:${locale}:${slug}`;

  if (seenSlugs.has(slugKey)) {
    errors.push(`${fileLabel}: duplicate slug "${slug}" for ${year}/${locale}`);
  } else {
    seenSlugs.add(slugKey);
  }

  if (slug !== filenameSlug) {
    errors.push(`${fileLabel}: slug "${slug}" does not match filename "${filenameSlug}"`);
  }

  if (isBlank(data.title)) {
    errors.push(`${fileLabel}: missing required title`);
  }

  if (isBlank(data.description)) {
    errors.push(`${fileLabel}: missing required description`);
  } else {
    const description = data.description.trim();

    if (description.length > maxDescriptionLength) {
      errors.push(
        `${fileLabel}: description must be ${maxDescriptionLength} characters or fewer`
      );
    }

    if (description.endsWith('...') || description.endsWith('…')) {
      errors.push(`${fileLabel}: description must not end with an ellipsis`);
    }
  }

  if (!publishedStatuses.has(data.status)) {
    errors.push(`${fileLabel}: status must be draft or published`);
  }

  if (data.status === 'published' && Number.isNaN(Date.parse(data.publishedAt ?? ''))) {
    errors.push(`${fileLabel}: invalid publishedAt`);
  }

  if (isBlank(data.coverImage)) {
    errors.push(`${fileLabel}: missing required coverImage`);
  } else {
    const coverImage = normalizeCoverImage(data.coverImage);

    if (
      coverImage.startsWith('/') &&
      !coverImage.startsWith('/legacy-wp/') &&
      !existsSync(path.join(publicRoot, coverImage))
    ) {
      errors.push(`${fileLabel}: missing local cover image ${coverImage}`);
    }
  }

  if (
    !Array.isArray(data.tags) ||
    data.tags.length === 0 ||
    data.tags.some((tag) => isBlank(tag))
  ) {
    errors.push(`${fileLabel}: missing required tags`);
  }

  if (isBlank(content)) {
    errors.push(`${fileLabel}: missing body content`);
  }
}

function addKnownPostRoutes(knownPostRoutes, { slug, year }) {
  if (year !== 2025) {
    return;
  }

  knownPostRoutes.add(normalizeRoutePath(`/news/${slug}`));
  knownPostRoutes.add(normalizeRoutePath(`/2025/news/${slug}`));
}

function validateInternalLinks({ content, errors, fileLabel, knownPostRoutes, publicRoot }) {
  for (const link of extractInternalLinks(content)) {
    if (
      isExistingPublicAsset(link, publicRoot) ||
      isKnownInternalRoute(link, knownPostRoutes)
    ) {
      continue;
    }

    errors.push(`${fileLabel}: broken internal link ${link}`);
  }
}

function validateRawHtmlPolicy({ content, errors, fileLabel }) {
  const rawHtmlTagPattern =
    /<\/?([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*|\/?)>/gu;
  const eventHandlerPattern = /\son[A-Za-z]+\s*=/gu;
  const javascriptUrlPattern = /\b(?:href|src)\s*=\s*["']?\s*javascript:/giu;
  const seenTags = new Set();
  const seenEventHandlers = new Set();

  for (const match of content.matchAll(rawHtmlTagPattern)) {
    if (match[0].startsWith('</')) {
      continue;
    }

    const tagName = match[1].toLowerCase();

    if (!seenTags.has(tagName)) {
      errors.push(`${fileLabel}: raw HTML tag <${tagName}> is not allowed`);
      seenTags.add(tagName);
    }
  }

  for (const match of content.matchAll(eventHandlerPattern)) {
    const handlerName = match[0].trim().replace(/\s*=.*$/u, '').toLowerCase();

    if (!seenEventHandlers.has(handlerName)) {
      errors.push(`${fileLabel}: raw HTML event handler ${handlerName} is not allowed`);
      seenEventHandlers.add(handlerName);
    }
  }

  if (javascriptUrlPattern.test(content)) {
    errors.push(`${fileLabel}: raw HTML javascript URL is not allowed`);
  }
}

export async function validateNewsContent({
  contentRoot = path.join(process.cwd(), 'outstatic/content'),
  publicRoot = path.join(process.cwd(), 'public'),
} = {}) {
  const errors = [];
  const knownPostRoutes = new Set();
  const postRecords = [];
  const seenSlugs = new Set();
  const postDirectories = await listPostDirectories(contentRoot);

  for (const directory of postDirectories) {
    const entries = await readdir(directory.path, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) {
        continue;
      }

      const parsedFilename = parsePostFilename(entry.name);
      const filePath = path.join(directory.path, entry.name);
      const fileLabel = path.relative(process.cwd(), filePath);

      if (!parsedFilename || !supportedLocales.has(parsedFilename.locale)) {
        errors.push(`${fileLabel}: filename must be slug.locale.mdx`);
        continue;
      }

      const source = await readFile(filePath, 'utf8');
      const parsed = matter(source);

      validateFrontmatter({
        content: parsed.content.trim(),
        data: parsed.data,
        errors,
        fileLabel,
        filenameSlug: parsedFilename.slug,
        locale: parsedFilename.locale,
        publicRoot,
        seenSlugs,
        year: directory.year,
      });

      addKnownPostRoutes(knownPostRoutes, {
        slug: normalizeSlug(parsed.data.slug) || parsedFilename.slug,
        year: directory.year,
      });
      postRecords.push({
        content: parsed.content,
        fileLabel,
      });
    }
  }

  for (const record of postRecords) {
    validateInternalLinks({
      ...record,
      errors,
      knownPostRoutes,
      publicRoot,
    });
    validateRawHtmlPolicy({
      ...record,
      errors,
    });
  }

  return { errors };
}

async function runCli() {
  const result = await validateNewsContent();

  if (result.errors.length === 0) {
    console.log('News content validation passed.');
    return;
  }

  for (const error of result.errors) {
    console.error(error);
  }

  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCli();
}
