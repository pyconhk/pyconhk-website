import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const liveBase = 'https://pycon.hk';
const outputRoot = new URL('../../output/legacy-2015-source/', import.meta.url);
const assetRoot = new URL('../src/years/2015/assets/live/', import.meta.url);
const tagPattern = /<([a-z][a-z0-9:-]*)(\s[^>]*)?>/giu;
const attributePattern = /\b(src|href|rel)\s*=\s*["']([^"']*)["']/giu;
const imageUrlPattern = /\.(?:png|jpe?g|gif|webp|svg)(?:[?#].*)?$/iu;

function decodeUrlPath(urlPath) {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return urlPath;
  }
}

function normalizePathSegment(segment) {
  const clean = segment
    .replace(/[^a-z0-9._-]+/giu, '-')
    .replace(/^-+|-+$/gu, '');

  if (!clean || clean === '.' || clean === '..') {
    return '_';
  }

  return clean;
}

export function routeSlug(route) {
  const slug = route
    .replace(/^\/|\/$/gu, '')
    .replace(/[^a-z0-9]+/giu, '-')
    .replace(/^-+|-+$/gu, '')
    .toLowerCase();

  return slug || 'index';
}

export function sourceRouteForTarget(route) {
  const mapping = routeContract.migratedTopLevelRoutes.find(
    (candidate) => candidate.to === route
  );

  return mapping ? mapping.from : route;
}

export function assetFileName(url) {
  const parsed = new URL(url);
  const segments = decodeUrlPath(parsed.pathname)
    .split('/')
    .filter(Boolean)
    .map(normalizePathSegment);

  if (segments.length === 0) {
    throw new Error(`Asset URL has no pathname: ${url}`);
  }

  return segments.join('/');
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'pyconhk-2015-capture/1.0' },
  });
  const text = await response.text();
  return { status: response.status, text };
}

async function fetchAsset(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'pyconhk-2015-capture/1.0' },
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    buffer,
    contentType: response.headers.get('content-type') || '',
    status: response.status,
  };
}

export function shouldWriteAsset({ bodyStart, contentType }) {
  const normalizedContentType = contentType.toLowerCase().split(';')[0].trim();

  if (
    normalizedContentType === 'text/html' ||
    normalizedContentType === 'application/xhtml+xml'
  ) {
    return false;
  }

  return !/^\s*<(?:!doctype\s+html|html\b|head\b|body\b)/iu.test(bodyStart);
}

export function collectAssetUrls(html, route) {
  const urls = [];
  const base = new URL(route, liveBase);

  for (const tagMatch of html.matchAll(tagPattern)) {
    const tagName = tagMatch[1].toLowerCase();
    const attributes = [];
    let rel = '';

    for (const attributeMatch of tagMatch[2]?.matchAll(attributePattern) ?? []) {
      const name = attributeMatch[1].toLowerCase();
      const value = attributeMatch[2];

      if (name === 'rel') {
        rel = value;
      }

      attributes.push({ name, value });
    }

    for (const { name, value } of attributes) {
      if (!['src', 'href'].includes(name)) {
        continue;
      }

      if (
        tagName === 'link' &&
        name === 'href' &&
        /\b(?:apple-touch-icon|icon)\b/iu.test(rel)
      ) {
        continue;
      }

      if (/^data:/iu.test(value) || !imageUrlPattern.test(value)) {
        continue;
      }

      urls.push(new URL(value, base).href);
    }
  }

  return urls;
}

export async function captureLegacy2015Source() {
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.mkdir(new URL('html/', outputRoot), { recursive: true });
  await fs.mkdir(assetRoot, { recursive: true });

  const pages = [];
  const assetUrls = new Set();

  for (const route of routeContract.requiredRoutes) {
    const sourceRoute = sourceRouteForTarget(route);
    const sourceUrl = new URL(sourceRoute, liveBase).href;
    const { status, text } = await fetchText(sourceUrl);
    const fileName = `${routeSlug(route)}.html`;

    await fs.writeFile(new URL(`html/${fileName}`, outputRoot), text);

    for (const assetUrl of collectAssetUrls(text, sourceRoute)) {
      assetUrls.add(assetUrl);
    }

    pages.push({ fileName, route, sourceRoute, sourceUrl, status });
  }

  const assets = [];
  const skippedAssets = [];
  const assetRootPath = fileURLToPath(assetRoot);

  for (const assetUrl of [...assetUrls].sort()) {
    const fileName = assetFileName(assetUrl);

    try {
      const asset = await fetchAsset(assetUrl);
      const bodyStart = asset.buffer.subarray(0, 512).toString('utf8');

      if (
        !shouldWriteAsset({
          bodyStart,
          contentType: asset.contentType,
        })
      ) {
        skippedAssets.push({
          contentType: asset.contentType,
          fileName,
          reason: 'html-response',
          status: asset.status,
          url: assetUrl,
        });
        continue;
      }

      const target = path.join(assetRootPath, fileName);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, asset.buffer);
      assets.push({
        contentType: asset.contentType,
        fileName,
        status: asset.status,
        url: assetUrl,
      });
    } catch (error) {
      skippedAssets.push({
        fileName,
        reason: 'fetch-error',
        url: assetUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const manifestUrl = new URL('manifest.json', outputRoot);
  await fs.writeFile(
    manifestUrl,
    JSON.stringify(
      { assets, generatedAt: new Date().toISOString(), pages, skippedAssets },
      null,
      2
    )
  );

  console.log(`captured ${pages.length} routes and ${assets.length} assets`);
  console.log(`manifest: ${fileURLToPath(manifestUrl)}`);

  return {
    assets,
    manifestPath: fileURLToPath(manifestUrl),
    pages,
    skippedAssets,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await captureLegacy2015Source();
}
