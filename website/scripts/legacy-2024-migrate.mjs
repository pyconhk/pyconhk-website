import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const sourceRoot = '/Users/alexau/Downloads/simply-static-1-1779119343';
const repoRoot = process.cwd();
const pageRoot = path.join(sourceRoot, '2024');
const categoryPages = [
  path.join(sourceRoot, 'category/2024/index.html'),
  path.join(sourceRoot, 'category/2024/page/2/index.html'),
];
const dataFile = path.join(repoRoot, 'src/years/2024/data/pages.ts');
const sourceUploads = path.join(sourceRoot, 'wp-content/uploads/2024');
const publicUploads = path.join(repoRoot, 'public/legacy-wp/2024/wp-content/uploads/2024');

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '...',
    laquo: '<<',
    ldquo: '"',
    lsquo: "'",
    mdash: '-',
    nbsp: ' ',
    ndash: '-',
    quot: '"',
    raquo: '>>',
    rdquo: '"',
    rsquo: "'",
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function matchFirst(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return '';
}

function extractElementByClass(html, tagName, className) {
  const startPattern = new RegExp(`<${tagName}\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const startMatch = html.match(startPattern);
  if (startMatch?.index === undefined) {
    return '';
  }

  const bodyStart = startMatch.index + startMatch[0].length;
  const tagPattern = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = bodyStart;
  let depth = 1;
  let match;

  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(bodyStart, match.index).trim();
      }
    } else {
      depth += 1;
    }
  }

  return '';
}

function normalizeInternalUrl(url) {
  let next = url
    .replace(/^https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk(?=\/)/i, '')
    .replace(/^\/\/(?:www\.)?(?:legacy\.)?pycon\.hk(?=\/)/i, '');

  if (next === '/category/2024' || next === '/category/2024/') {
    return '/2024/';
  }

  next = next.replace(/^\/2024\/[^/?#]+\/(2024\/[^?#]+\/?)([?#].*)?$/, '/$1$2');

  if (next.startsWith('/2024') && !next.includes('?') && !next.includes('#') && !path.extname(next)) {
    next = next.endsWith('/') ? next : `${next}/`;
  }

  return next;
}

function rewriteUrls(html) {
  return html
    .replace(/https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\/2024\//gi, '/legacy-wp/2024/wp-content/uploads/2024/')
    .replace(/\/\/(?:www\.)?(?:legacy\.)?pycon\.hk\/wp-content\/uploads\/2024\//gi, '/legacy-wp/2024/wp-content/uploads/2024/')
    .replace(/\/wp-content\/uploads\/2024\//g, '/legacy-wp/2024/wp-content/uploads/2024/')
    .replace(/\b(href|src|poster)=["']([^"']+)["']/gi, (full, attribute, url) => {
      const normalized = normalizeInternalUrl(url);
      return `${attribute.toLowerCase()}="${normalized}"`;
    })
    .replace(/\bsrcset=["']([^"']+)["']/gi, (_, srcset) => {
      const rewritten = srcset
        .split(',')
        .map((candidate) => {
          const trimmed = candidate.trim();
          const parts = trimmed.split(/\s+/);
          if (parts[0]) {
            parts[0] = normalizeInternalUrl(parts[0]);
          }
          return parts.join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    });
}

function summarizeContent(html) {
  return stripTags(html).slice(0, 180).replace(/\s+\S*$/, '').trim();
}

function extractPage(slug, html) {
  const title = stripTags(
    matchFirst(html, [
      /<h[1-6][^>]*class=["'][^"']*\bwp-block-post-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i,
      /<h1[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
      /<title>([\s\S]*?)<\/title>/i,
    ]).replace(/\s+-\s+PyCon HK\s*$/i, ''),
  );
  const dateTime = matchFirst(html, [
    /<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*datetime=["']([^"']+)["']/i,
    /<meta property=["']article:published_time["'] content=["']([^"']+)["']/i,
  ]);
  const dateLabel = stripTags(
    matchFirst(html, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*>([\s\S]*?)<\/time>/i]),
  );
  const content = rewriteUrls(extractElementByClass(html, 'div', 'entry-content'));

  return {
    slug,
    url: `/2024/${slug}/`,
    title,
    dateTime: dateTime || undefined,
    dateLabel: dateLabel || undefined,
    description: summarizeContent(content),
    content,
  };
}

function extractListingArticle(articleHtml) {
  const href = normalizeInternalUrl(matchFirst(articleHtml, [/<h2[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>\s*<a[^>]*href=["']([^"']+)["']/i]));
  if (!href.startsWith('/2024/')) {
    return null;
  }

  const content = rewriteUrls(extractElementByClass(articleHtml, 'div', 'entry-content'));
  return {
    title: stripTags(matchFirst(articleHtml, [/<h2[^>]*class=["'][^"']*\bentry-title\b[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i])),
    url: href,
    dateTime: matchFirst(articleHtml, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*datetime=["']([^"']+)["']/i]) || undefined,
    dateLabel: stripTags(matchFirst(articleHtml, [/<time[^>]*class=["'][^"']*\bpublished\b[^"']*["'][^>]*>([\s\S]*?)<\/time>/i])) || undefined,
    excerpt: summarizeContent(content),
  };
}

function extractListing(html) {
  const articles = [];
  const articlePattern = /<article\b[\s\S]*?<\/article>/gi;
  let match;

  while ((match = articlePattern.exec(html))) {
    const article = extractListingArticle(match[0]);
    if (article) {
      articles.push(article);
    }
  }

  return articles;
}

function uniqueByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
}

function sortByDateDesc(a, b) {
  return (Date.parse(b.dateTime ?? '') || 0) - (Date.parse(a.dateTime ?? '') || 0);
}

const pages = readdirSync(pageRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name;
    return extractPage(slug, readFileSync(path.join(pageRoot, slug, 'index.html'), 'utf8'));
  })
  .sort(sortByDateDesc);

const listing = uniqueByUrl(
  categoryPages.flatMap((file) => extractListing(readFileSync(file, 'utf8'))),
).sort(sortByDateDesc);

mkdirSync(path.dirname(dataFile), { recursive: true });
writeFileSync(
  dataFile,
  `export interface Legacy2024Page {
  slug: string;
  url: string;
  title: string;
  dateTime?: string;
  dateLabel?: string;
  description: string;
  content: string;
}

export interface Legacy2024ListingItem {
  title: string;
  url: string;
  dateTime?: string;
  dateLabel?: string;
  excerpt: string;
}

export const legacy2024Pages: Legacy2024Page[] = ${JSON.stringify(pages, null, 2)};

export const legacy2024Listing: Legacy2024ListingItem[] = ${JSON.stringify(listing, null, 2)};
`,
);

rmSync(publicUploads, { force: true, recursive: true });
mkdirSync(path.dirname(publicUploads), { recursive: true });
cpSync(sourceUploads, publicUploads, { recursive: true });

console.log(`Migrated ${pages.length} pages and ${listing.length} listing items.`);
console.log(`Copied ${sourceUploads} to ${publicUploads}.`);
