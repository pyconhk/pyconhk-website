import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const sourceRoot =
  process.env.LEGACY_WP_CRAWL ?? '/Users/alexau/Downloads/simply-static-1-1779119343';
const repoRoot = process.cwd();
const publicUploadsRoot = path.join(repoRoot, 'public/legacy-wp/uploads');
const dataPath = path.join(repoRoot, 'src/legacy/legacy-indexes-data.json');

const scopes = ['conference-highlights', 'category', 'author', 'page', 'tag'];
const uploadPrefix = '/wp-content/uploads/';
const migratedUploadPrefix = '/legacy-wp/uploads/';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(absolute);
    }
    return absolute.endsWith('/index.html') ? [absolute] : [];
  });
}

function decodeHtml(value) {
  return cheerio.load(`<span>${value}</span>`, { decodeEntities: true })('span').text();
}

function textFrom($el) {
  return $el.text().replace(/\s+/g, ' ').trim();
}

function stripSiteTitle(title) {
  return title
    .replace(/\s+-\s+PyCon HK\s*$/u, '')
    .replace(/\s+-\s+The leading Python Conference in Hong Kong/u, '')
    .trim();
}

function normalizeInternalLink(href) {
  if (!href) {
    return href;
  }

  let next = href.trim();
  next = next.replace(/^https?:\/\/(?:www\.)?pycon\.hk/u, '');
  next = next.replace(/^https?:\/\/legacy\.pycon\.hk/u, '');

  if (next.includes(uploadPrefix)) {
    return rewriteAssetUrl(next);
  }

  if (next === '/page/1/' || next === '/page/1') {
    return '/';
  }

  next = next.replace(/^(\/(?:category|author)\/[^/?#]+)\/page\/1\/?($|[?#])/u, '$1/$2');
  next = next.replace(/\/index\.html($|[?#])/u, '/$1');

  return next;
}

function splitUrl(url) {
  const match = url.match(/^([^?#]*)([?#].*)?$/u);
  return {
    pathname: match?.[1] ?? url,
    suffix: match?.[2] ?? '',
  };
}

function copyUpload(assetPath) {
  const decodedPath = decodeURIComponent(assetPath);
  const relative = decodedPath.slice(uploadPrefix.length);
  const source = path.join(sourceRoot, uploadPrefix, relative);
  const destination = path.join(publicUploadsRoot, relative);

  if (!existsSync(source)) {
    return;
  }

  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function rewriteAssetUrl(url) {
  if (!url) {
    return url;
  }

  let next = url.trim();
  next = next.replace(/^https?:\/\/(?:www\.)?pycon\.hk/u, '');
  next = next.replace(/^https?:\/\/legacy\.pycon\.hk/u, '');

  const { pathname, suffix } = splitUrl(next);
  const uploadIndex = pathname.indexOf(uploadPrefix);
  if (uploadIndex < 0) {
    return normalizeInternalLink(next);
  }

  const uploadPath = pathname.slice(uploadIndex);
  copyUpload(uploadPath);
  return `${migratedUploadPrefix}${uploadPath.slice(uploadPrefix.length)}${suffix}`;
}

function rewriteSrcset(srcset) {
  if (!srcset) {
    return srcset;
  }

  return srcset
    .split(',')
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/u);
      if (!parts[0]) {
        return '';
      }
      return [rewriteAssetUrl(parts[0]), ...parts.slice(1)].join(' ');
    })
    .filter(Boolean)
    .join(', ');
}

function rewriteHtml(html) {
  const $ = cheerio.load(`<main>${html}</main>`, { decodeEntities: false });

  $('script, style, noscript').remove();
  $('img').each((_, element) => {
    const image = $(element);
    image.attr('src', rewriteAssetUrl(image.attr('src')));
    image.attr('srcset', rewriteSrcset(image.attr('srcset')));
    image.removeAttr('decoding');
    image.removeAttr('fetchpriority');
  });
  $('source').each((_, element) => {
    const source = $(element);
    source.attr('src', rewriteAssetUrl(source.attr('src')));
    source.attr('srcset', rewriteSrcset(source.attr('srcset')));
  });
  $('a').each((_, element) => {
    const anchor = $(element);
    anchor.attr('href', normalizeInternalLink(anchor.attr('href')));
  });

  return $('main').html()?.trim() ?? '';
}

function extractDescription($) {
  const metaDescription = $('meta[name="description"]').attr('content');
  if (metaDescription) {
    return decodeHtml(metaDescription).replace(/\s+/g, ' ').trim();
  }

  return stripSiteTitle($('title').first().text());
}

function featuredImageFrom($scope) {
  const image = $scope.find('img.wp-post-image, img').first();
  const src = rewriteAssetUrl(image.attr('src'));
  if (!src) {
    return undefined;
  }

  return {
    src,
    alt: image.attr('alt') ?? '',
    width: image.attr('width') ? Number(image.attr('width')) : undefined,
    height: image.attr('height') ? Number(image.attr('height')) : undefined,
  };
}

function extractHighlight(file, routePath) {
  const html = readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const article = $('main#main article').first();
  const title = textFrom(article.find('h1.entry-title').first()) || stripSiteTitle($('title').text());
  const published = article.find('time.entry-date.published').first();
  const contentHtml = rewriteHtml(article.find('.entry-content').first().html() ?? '');
  const featuredImage = featuredImageFrom($('main#main'));

  return {
    type: 'conference-highlight',
    path: `/${routePath}/`,
    slug: routePath.split('/').at(-1),
    title,
    description: extractDescription($),
    date: textFrom(published),
    isoDate: published.attr('datetime') ?? '',
    featuredImage,
    contentHtml,
  };
}

function archiveType(routePath) {
  if (routePath.startsWith('category/')) {
    return 'category';
  }
  if (routePath.startsWith('author/')) {
    return 'author';
  }
  if (routePath.startsWith('tag/')) {
    return 'tag';
  }
  return 'page';
}

function archivePageNumber(routePath) {
  const match = routePath.match(/(?:^|\/)page\/(\d+)$/u);
  if (match) {
    return Number(match[1]);
  }
  if (routePath.startsWith('page/')) {
    return Number(routePath.split('/')[1]);
  }
  return 1;
}

function archiveSlug(routePath, type) {
  if (type === 'page') {
    return routePath.split('/')[1];
  }

  return routePath
    .replace(new RegExp(`^${type}/`, 'u'), '')
    .replace(/\/page\/\d+$/u, '');
}

function archiveTitle($, routePath, type, pageNumber) {
  const pageTitle = $('h1.page-title').first();
  if (pageTitle.length) {
    return textFrom(pageTitle);
  }

  if (type === 'page') {
    return `Latest Posts - Page ${pageNumber}`;
  }

  return stripSiteTitle($('title').first().text()) || routePath;
}

function archiveLabel(title, type) {
  if (type === 'page') {
    return 'Latest Posts';
  }

  const match = title.match(/^(Category|Author|Tag):\s*(.+)$/u);
  return match?.[2] ?? title;
}

function extractPagination($) {
  return $('.page-numbers li > *, .page-numbers > *')
    .toArray()
    .map((element) => {
      const item = $(element);
      const isLink = element.tagName === 'a';
      return {
        label: textFrom(item),
        href: isLink ? normalizeInternalLink(item.attr('href')) : undefined,
        current: item.hasClass('current'),
        rel: item.hasClass('prev') ? 'prev' : item.hasClass('next') ? 'next' : undefined,
      };
    })
    .filter((item) => item.label);
}

function extractArchiveItem($, element) {
  const article = $(element);
  const titleLink = article.find('h2.entry-title a').first();
  const time = article.find('time.entry-date.published').first();
  const excerpt = article.find('.entry-content').first().clone();
  excerpt.find('.continuereading-wrap').remove();
  excerpt.find('a.continuereading').remove();

  return {
    title: textFrom(titleLink),
    href: normalizeInternalLink(titleLink.attr('href')),
    date: textFrom(time),
    isoDate: time.attr('datetime') ?? '',
    excerptHtml: rewriteHtml(excerpt.html() ?? ''),
    image: featuredImageFrom(article),
  };
}

function extractArchive(file, routePath) {
  const html = readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const type = archiveType(routePath);
  const pageNumber = archivePageNumber(routePath);
  const title = archiveTitle($, routePath, type, pageNumber);

  return {
    type,
    path: `/${routePath}/`,
    slug: archiveSlug(routePath, type),
    title,
    label: archiveLabel(title, type),
    pageNumber,
    description: extractDescription($),
    items: $('article.blogposts-list')
      .toArray()
      .map((element) => extractArchiveItem($, element))
      .filter((item) => item.title && item.href),
    pagination: extractPagination($),
  };
}

function routePathFor(file) {
  return path
    .relative(sourceRoot, file)
    .replace(/\\/gu, '/')
    .replace(/\/index\.html$/u, '');
}

const files = scopes
  .flatMap((scope) => walk(path.join(sourceRoot, scope)))
  .sort((a, b) => routePathFor(a).localeCompare(routePathFor(b)));

const highlights = [];
const archives = [];

for (const file of files) {
  const routePath = routePathFor(file);
  if (routePath.startsWith('conference-highlights/')) {
    highlights.push(extractHighlight(file, routePath));
    continue;
  }

  archives.push(extractArchive(file, routePath));
}

mkdirSync(path.dirname(dataPath), { recursive: true });
writeFileSync(
  dataPath,
  `${JSON.stringify({ highlights, archives }, null, 2)}\n`
);

console.log(
  `Migrated ${highlights.length} conference highlights and ${archives.length} archive pages.`
);
