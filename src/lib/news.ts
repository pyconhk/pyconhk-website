import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { defaultLocale, getLocaleFallbackChain, type SiteLocale } from '@/config/site';
import {
  parseCollectionYearFromDirectoryName,
  parseLocalizedContentFilename,
} from '@/lib/localized-content';

type PostStatus = 'draft' | 'published';

type RawPostFrontmatter = {
  author?: {
    name?: string;
    picture?: string;
  };
  collectionYear?: number;
  coverImage?: string;
  locale?: string;
  publishedAt?: string;
  slug?: string;
  status?: string;
  title?: string;
};

type IndexedNewsVariant = {
  absolutePath: string;
  authorName: string;
  authorPicture?: string;
  body: string;
  collectionYear: number;
  coverImage: string;
  excerpt: string;
  locale: SiteLocale;
  publishedAt: string;
  slug: string;
  status: PostStatus;
  title: string;
};

type IndexedNewsGroup = {
  collectionYear: number;
  slug: string;
  variants: Partial<Record<SiteLocale, IndexedNewsVariant>>;
};

type IndexedNewsStore = {
  groupsByYear: Map<number, Map<string, IndexedNewsGroup>>;
};

type ResolvedNewsVariant = {
  isFallback: boolean;
  sourceLocale: SiteLocale;
  variant: IndexedNewsVariant;
};

export type NewsSummary = {
  authorName: string;
  authorPicture?: string;
  collectionYear: number;
  coverImage: string;
  excerpt: string;
  isFallback: boolean;
  publishedAt: string;
  slug: string;
  sourceLocale: SiteLocale;
  title: string;
};

export type NewsPost = NewsSummary & {
  html: string;
};

const contentRoot = path.join(process.cwd(), 'outstatic/content');
const defaultPublishedAt = '1970-01-01T00:00:00.000Z';
const defaultAuthorName = 'PyCon HK';

let indexedNewsStorePromise: Promise<IndexedNewsStore> | null = null;

function normalizeCoverImage(
  imagePath: string | undefined,
  collectionYear: number
): string {
  const fallbackPath = `/${collectionYear}/landing-pages/open-graph.webp`;

  if (!imagePath) {
    return fallbackPath;
  }

  if (imagePath.startsWith('/api/outstatic/media/')) {
    const publicIndex = imagePath.indexOf('/public/');

    if (publicIndex >= 0) {
      return imagePath.slice(publicIndex + '/public'.length);
    }

    return fallbackPath;
  }

  return imagePath;
}

function createExcerpt(markdown: string): string {
  const clean = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= 168) {
    return clean;
  }

  return `${clean.slice(0, 165).trimEnd()}...`;
}

function normalizeStatus(status: string | undefined): PostStatus {
  return status === 'published' ? 'published' : 'draft';
}

function comparePublishedAtDescending(left: string, right: string): number {
  return new Date(right).getTime() - new Date(left).getTime();
}

function getPublishedVariant(
  variant: IndexedNewsVariant | undefined
): IndexedNewsVariant | undefined {
  return variant?.status === 'published' ? variant : undefined;
}

function resolveLocalizedVariant(
  group: IndexedNewsGroup,
  locale: SiteLocale
): ResolvedNewsVariant | null {
  for (const candidateLocale of getLocaleFallbackChain(locale)) {
    const variant = getPublishedVariant(group.variants[candidateLocale]);

    if (variant) {
      return {
        variant,
        sourceLocale: candidateLocale,
        isFallback: candidateLocale !== locale,
      };
    }
  }

  return null;
}

function groupPostVariantsBySlug(variants: IndexedNewsVariant[]): IndexedNewsGroup[] {
  const groups = new Map<string, IndexedNewsGroup>();

  for (const variant of variants) {
    const groupKey = `${variant.collectionYear}:${variant.slug}`;
    const existingGroup = groups.get(groupKey) ?? {
      collectionYear: variant.collectionYear,
      slug: variant.slug,
      variants: {},
    };

    existingGroup.variants[variant.locale] = variant;
    groups.set(groupKey, existingGroup);
  }

  return [...groups.values()];
}

async function listYearPostDirectories(): Promise<
  {
    absolutePath: string;
    collectionYear: number;
  }[]
> {
  const entries = await fs.readdir(contentRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      absolutePath: path.join(contentRoot, entry.name),
      collectionYear: parseCollectionYearFromDirectoryName(entry.name),
    }))
    .filter(
      (entry): entry is { absolutePath: string; collectionYear: number } =>
        entry.collectionYear !== null
    )
    .sort((left, right) => left.collectionYear - right.collectionYear);
}

async function loadVariantsFromDirectory(
  directoryPath: string,
  collectionYear: number
): Promise<IndexedNewsVariant[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const supportedFiles = entries.filter((entry) => entry.isFile());

  return Promise.all(
    supportedFiles.flatMap(async (entry) => {
      const parsedFilename = parseLocalizedContentFilename(entry.name);

      if (!parsedFilename) {
        return [];
      }

      if (!parsedFilename.locale) {
        return [];
      }

      const absolutePath = path.join(directoryPath, entry.name);
      const source = await fs.readFile(absolutePath, 'utf8');
      const parsedSource = matter(source);
      const frontmatter = parsedSource.data as RawPostFrontmatter;
      const locale = parsedFilename.locale;
      const slug = frontmatter.slug?.trim() || parsedFilename.slug;
      const title = frontmatter.title?.trim() || slug;
      const publishedAt = frontmatter.publishedAt?.trim() || defaultPublishedAt;

      return [
        {
          absolutePath,
          authorName: frontmatter.author?.name?.trim() || defaultAuthorName,
          authorPicture: frontmatter.author?.picture?.trim() || undefined,
          body: parsedSource.content.trim(),
          collectionYear,
          coverImage: normalizeCoverImage(frontmatter.coverImage, collectionYear),
          excerpt: createExcerpt(parsedSource.content),
          locale,
          publishedAt,
          slug,
          status: normalizeStatus(frontmatter.status),
          title,
        } satisfies IndexedNewsVariant,
      ];
    })
  ).then((groups) => groups.flat());
}

async function buildIndexedNewsStore(): Promise<IndexedNewsStore> {
  const directories = await listYearPostDirectories();
  const groupsByYear = new Map<number, Map<string, IndexedNewsGroup>>();

  for (const directory of directories) {
    const variants = await loadVariantsFromDirectory(
      directory.absolutePath,
      directory.collectionYear
    );
    const groups = groupPostVariantsBySlug(variants);

    groupsByYear.set(
      directory.collectionYear,
      new Map(groups.map((group) => [group.slug, group]))
    );
  }

  return { groupsByYear };
}

async function getIndexedNewsStore(): Promise<IndexedNewsStore> {
  if (!indexedNewsStorePromise) {
    indexedNewsStorePromise = buildIndexedNewsStore();
  }

  return indexedNewsStorePromise;
}

function toSummary(resolved: ResolvedNewsVariant): NewsSummary {
  const { isFallback, sourceLocale, variant } = resolved;

  return {
    authorName: variant.authorName,
    authorPicture: variant.authorPicture,
    collectionYear: variant.collectionYear,
    coverImage: variant.coverImage,
    excerpt: variant.excerpt,
    isFallback,
    publishedAt: variant.publishedAt,
    slug: variant.slug,
    sourceLocale,
    title: variant.title,
  };
}

export async function getPublishedPosts(
  year: number,
  locale: SiteLocale = defaultLocale
): Promise<NewsSummary[]> {
  const store = await getIndexedNewsStore();
  const groups = [...(store.groupsByYear.get(year)?.values() ?? [])];

  return groups
    .map((group) => resolveLocalizedVariant(group, locale))
    .filter((resolved): resolved is ResolvedNewsVariant => resolved !== null)
    .sort((left, right) =>
      comparePublishedAtDescending(left.variant.publishedAt, right.variant.publishedAt)
    )
    .map((resolved) => toSummary(resolved));
}

export async function getLatestPosts(
  limit: number,
  year: number,
  locale: SiteLocale = defaultLocale
): Promise<NewsSummary[]> {
  const posts = await getPublishedPosts(year, locale);
  return posts.slice(0, limit);
}

export async function resolveLocalizedPostEntry(
  year: number,
  slug: string,
  locale: SiteLocale = defaultLocale
): Promise<ResolvedNewsVariant | null> {
  const store = await getIndexedNewsStore();
  const group = store.groupsByYear.get(year)?.get(slug);

  if (!group) {
    return null;
  }

  return resolveLocalizedVariant(group, locale);
}

export async function getPostBySlug(
  year: number,
  slug: string,
  locale: SiteLocale = defaultLocale
): Promise<NewsPost | null> {
  const resolved = await resolveLocalizedPostEntry(year, slug, locale);

  if (!resolved) {
    return null;
  }

  const html = String(await remark().use(remarkHtml).process(resolved.variant.body));

  return {
    ...toSummary(resolved),
    html,
  } satisfies NewsPost;
}

export async function getPublishedPostSlugs(year: number): Promise<string[]> {
  const store = await getIndexedNewsStore();
  const groups = [...(store.groupsByYear.get(year)?.values() ?? [])];

  return groups
    .filter(
      (group) =>
        getLocaleFallbackChain(defaultLocale).some((locale) =>
          Boolean(getPublishedVariant(group.variants[locale]))
        ) ||
        Object.values(group.variants).some((variant) =>
          Boolean(getPublishedVariant(variant))
        )
    )
    .sort((left, right) => {
      const leftResolved = resolveLocalizedVariant(left, defaultLocale);
      const rightResolved = resolveLocalizedVariant(right, defaultLocale);

      return comparePublishedAtDescending(
        leftResolved?.variant.publishedAt ?? defaultPublishedAt,
        rightResolved?.variant.publishedAt ?? defaultPublishedAt
      );
    })
    .map((group) => group.slug);
}

export async function getAvailablePostYears(): Promise<number[]> {
  const store = await getIndexedNewsStore();

  return [...store.groupsByYear.keys()].sort((left, right) => left - right);
}
