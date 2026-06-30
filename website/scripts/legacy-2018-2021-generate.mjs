import fs from 'node:fs';
import path from 'node:path';
import * as parse5 from 'parse5';

const crawlRoot = '/Users/alexau/Downloads/simply-static-1-1779119343';
const projectRoot = process.cwd();

const editions = [
  { slug: '2018', label: 'PyCon HK 2018' },
  { slug: '2020-spring', label: 'PyCon HK 2020 Spring' },
  { slug: '2020-fall', label: 'PyCon HK 2020 Fall' },
  { slug: '2021', label: 'PyCon HK 2021' },
];

const relevantEditionSlugs = new Set(editions.map((edition) => edition.slug));

function isElement(node, tagName) {
  return node.nodeName === tagName && node.tagName === tagName;
}

function getAttr(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function hasClass(node, className) {
  return (getAttr(node, 'class') ?? '').split(/\s+/).includes(className);
}

function walk(node, visitor) {
  visitor(node);
  for (const child of node.childNodes ?? []) {
    walk(child, visitor);
  }
}

function findFirst(node, predicate) {
  if (predicate(node)) {
    return node;
  }
  for (const child of node.childNodes ?? []) {
    const match = findFirst(child, predicate);
    if (match) {
      return match;
    }
  }
  return undefined;
}

function findAll(node, predicate, matches = []) {
  if (predicate(node)) {
    matches.push(node);
  }
  for (const child of node.childNodes ?? []) {
    findAll(child, predicate, matches);
  }
  return matches;
}

function textContent(node) {
  if (node.nodeName === '#text') {
    return node.value;
  }
  return (node.childNodes ?? []).map(textContent).join('');
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function htmlChildren(node) {
  return (node.childNodes ?? []).map((child) => parse5.serializeOuter(child)).join('').trim();
}

function stripSiteSuffix(title) {
  return title.replace(/\s+-\s+PyCon HK$/, '').trim();
}

function findMetaContent(document, selectorName, selectorValue) {
  const meta = findFirst(
    document,
    (node) =>
      isElement(node, 'meta') &&
      getAttr(node, selectorName) === selectorValue &&
      Boolean(getAttr(node, 'content')),
  );
  return meta ? getAttr(meta, 'content') : '';
}

function parseDocument(filePath) {
  return parse5.parse(fs.readFileSync(filePath, 'utf8'));
}

function rewriteUploadUrl(url) {
  return url
    .replace(
      /^(?:https?:)?\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\/(2018|2020|2021)\//,
      '/legacy-wp/$1/',
    )
    .replace(/^\/wp-content\/uploads\/(2018|2020|2021)\//, '/legacy-wp/$1/');
}

function stripPyconOrigin(url) {
  return url.replace(/^(?:https?:)?\/\/(?:www\.)?(?:legacy\.)?pycon\.hk(?=\/)/, '');
}

function rewriteInternalUrl(url) {
  if (!url || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }

  const uploadUrl = rewriteUploadUrl(url);
  if (uploadUrl !== url) {
    return uploadUrl;
  }

  const withoutOrigin = stripPyconOrigin(url);
  if (withoutOrigin !== url) {
    return rewriteInternalUrl(withoutOrigin);
  }

  const nested2020Match = withoutOrigin.match(/^\/2020\/(2020-spring|2020-fall)\/?([^?#]*)?([?#].*)?$/);
  if (nested2020Match) {
    const editionSlug = nested2020Match[1];
    const rest = nested2020Match[2] ?? '';
    const suffix = nested2020Match[3] ?? '';
    return `/${editionSlug}/${rest.replace(/\/?$/, '/')}${suffix}`;
  }

  const oldSpringPathMatch = withoutOrigin.match(/^\/2020\/(sessions-2020-spring|2020-spring-schedule)\/?([?#].*)?$/);
  if (oldSpringPathMatch) {
    return `/2020-spring/${oldSpringPathMatch[1]}/${oldSpringPathMatch[2] ?? ''}`;
  }

  const oldFallPathMatch = withoutOrigin.match(/^\/2020\/(2020-fall-schedule)\/?([?#].*)?$/);
  if (oldFallPathMatch) {
    return `/2020-fall/${oldFallPathMatch[1]}/${oldFallPathMatch[2] ?? ''}`;
  }

  if (withoutOrigin === '/2020-spring/schedule-pycon-hk-2020-spring/') {
    return '/2020-spring/2020-spring-schedule/';
  }

  if (withoutOrigin === '/2018/sessions-2018/') {
    return '/2018/schedule-2018/';
  }

  for (const editionSlug of relevantEditionSlugs) {
    if (withoutOrigin.startsWith(`/${editionSlug}`) && !withoutOrigin.startsWith(`/${editionSlug}/`)) {
      const rest = withoutOrigin.slice(editionSlug.length + 1);
      return `/${editionSlug}/${rest}`;
    }
  }

  const categoryMatch = withoutOrigin.match(/^\/category\/([^/?#]+)\/?(?:page\/\d+\/?)?([?#].*)?$/);
  if (categoryMatch && relevantEditionSlugs.has(categoryMatch[1])) {
    return `/${categoryMatch[1]}/`;
  }

  const pathMatch = withoutOrigin.match(/^\/([^/?#]+)(?:\/([^?#]*))?([?#].*)?$/);
  if (pathMatch && relevantEditionSlugs.has(pathMatch[1])) {
    const editionSlug = pathMatch[1];
    const rest = pathMatch[2] ?? '';
    const suffix = pathMatch[3] ?? '';
    if (!rest) {
      return `/${editionSlug}/${suffix}`;
    }
    return `/${editionSlug}/${rest.replace(/\/?$/, '/')}${suffix}`;
  }

  return url;
}

function rewriteSrcset(value) {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      const [url, ...descriptor] = trimmed.split(/\s+/);
      return [rewriteInternalUrl(url), ...descriptor].join(' ');
    })
    .join(', ');
}

function rewriteHtmlFragment(html) {
  const fragment = parse5.parseFragment(html);
  walk(fragment, (node) => {
    if (!node.attrs) {
      return;
    }
    for (const attr of node.attrs) {
      if (['href', 'src', 'poster', 'data-src'].includes(attr.name)) {
        attr.value = rewriteInternalUrl(attr.value);
      }
      if (attr.name === 'srcset') {
        attr.value = rewriteSrcset(attr.value);
      }
    }
  });
  return parse5.serialize(fragment);
}

function extractFeaturedImage(document) {
  const image = findFirst(
    document,
    (node) => isElement(node, 'img') && hasClass(node, 'wp-post-image') && Boolean(getAttr(node, 'src')),
  );
  return image ? rewriteInternalUrl(getAttr(image, 'src')) : '';
}

function extractPage(edition, pageDir) {
  const filePath = path.join(pageDir, 'index.html');
  const document = parseDocument(filePath);
  const entryContent = findFirst(document, (node) => isElement(node, 'div') && hasClass(node, 'entry-content'));
  const titleNode = findFirst(document, (node) => isElement(node, 'h1') && hasClass(node, 'entry-title'));
  const titleTag = findFirst(document, (node) => isElement(node, 'title'));
  const publishedTime = findFirst(
    document,
    (node) => isElement(node, 'time') && hasClass(node, 'entry-date') && Boolean(getAttr(node, 'datetime')),
  );
  const slug = path.basename(pageDir);
  const rawHtml = entryContent ? htmlChildren(entryContent) : '<p>Archived content was not available in the source crawl.</p>';
  const html = rewriteHtmlFragment(rawHtml);
  const description =
    findMetaContent(document, 'name', 'description') ||
    normalizeText(textContent(entryContent ?? document)).slice(0, 180);
  const title = normalizeText(textContent(titleNode ?? titleTag ?? document)) || slug;
  const excerpt = normalizeText(textContent(entryContent ?? document)).slice(0, 260);

  return {
    year: edition.slug,
    editionLabel: edition.label,
    slug,
    path: `/${edition.slug}/${slug}/`,
    title: stripSiteSuffix(title),
    date: publishedTime ? getAttr(publishedTime, 'datetime') : '',
    description: normalizeText(description),
    featuredImage: extractFeaturedImage(document),
    excerpt,
    html,
  };
}

function categoryOrder(edition) {
  const categoryRoot = path.join(crawlRoot, 'category', edition.slug);
  const files = [
    path.join(categoryRoot, 'index.html'),
    path.join(categoryRoot, 'page', '2', 'index.html'),
  ].filter((filePath) => fs.existsSync(filePath));
  const orderedSlugs = [];
  const seen = new Set();

  for (const file of files) {
    const document = parseDocument(file);
    const links = findAll(
      document,
      (node) => isElement(node, 'a') && hasClass(node, 'continuereading') && Boolean(getAttr(node, 'href')),
    );
    for (const link of links) {
      const href = rewriteInternalUrl(getAttr(link, 'href'));
      const match = href.match(new RegExp(`^/${edition.slug}/([^/?#]+)/?$`));
      if (match && !seen.has(match[1])) {
        seen.add(match[1]);
        orderedSlugs.push(match[1]);
      }
    }
  }

  return orderedSlugs;
}

function sortPages(edition, pages) {
  const orderedSlugs = categoryOrder(edition);
  const rank = new Map(orderedSlugs.map((slug, index) => [slug, index]));
  return [...pages].sort((left, right) => {
    const leftRank = rank.get(left.slug);
    const rightRank = rank.get(right.slug);
    if (leftRank !== undefined && rightRank !== undefined) {
      return leftRank - rightRank;
    }
    if (leftRank !== undefined) {
      return -1;
    }
    if (rightRank !== undefined) {
      return 1;
    }
    return right.date.localeCompare(left.date) || left.slug.localeCompare(right.slug);
  });
}

function escapeTemplateLiteral(value) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function writeDataFile(edition, pages) {
  const outputDir = path.join(projectRoot, 'src', 'years', edition.slug, 'data');
  fs.mkdirSync(outputDir, { recursive: true });
  const pageEntries = pages
    .map(
      (page) => `  {
    year: ${JSON.stringify(page.year)},
    editionLabel: ${JSON.stringify(page.editionLabel)},
    slug: ${JSON.stringify(page.slug)},
    path: ${JSON.stringify(page.path)},
    title: ${JSON.stringify(page.title)},
    date: ${JSON.stringify(page.date)},
    description: ${JSON.stringify(page.description)},
    featuredImage: ${JSON.stringify(page.featuredImage)},
    excerpt: ${JSON.stringify(page.excerpt)},
    html: \`${escapeTemplateLiteral(page.html)}\`,
  }`,
    )
    .join(',\n');

  const contents = `export interface LegacyArchivePage {
  year: string;
  editionLabel: string;
  slug: string;
  path: string;
  title: string;
  date: string;
  description: string;
  featuredImage: string;
  excerpt: string;
  html: string;
}

export const legacyArchivePages: LegacyArchivePage[] = [
${pageEntries}
];
`;

  fs.writeFileSync(path.join(outputDir, 'pages.ts'), contents);
}

function copyUploadAssets() {
  for (const uploadYear of ['2018', '2020', '2021']) {
    const source = path.join(crawlRoot, 'wp-content', 'uploads', uploadYear);
    const destination = path.join(projectRoot, 'public', 'legacy-wp', uploadYear);
    fs.rmSync(destination, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
  }
}

function migrate() {
  copyUploadAssets();

  for (const edition of editions) {
    const editionRoot = path.join(crawlRoot, edition.slug);
    const pageDirs = fs
      .readdirSync(editionRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(editionRoot, entry.name))
      .filter((pageDir) => fs.existsSync(path.join(pageDir, 'index.html')));
    const pages = sortPages(
      edition,
      pageDirs.map((pageDir) => extractPage(edition, pageDir)),
    );

    writeDataFile(edition, pages);
    console.log(`${edition.slug}: ${pages.length} pages`);
  }
}

migrate();
