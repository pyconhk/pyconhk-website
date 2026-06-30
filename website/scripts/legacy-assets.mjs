import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve(new URL('..', import.meta.url).pathname);
const sourceRoot = path.resolve(
  process.env.LEGACY_SOURCE ||
    path.join(os.homedir(), 'Downloads', 'simply-static-1-1779119343')
);
const sourceUploadsRoot = path.join(sourceRoot, 'wp-content', 'uploads');
const publicRoot = path.join(projectRoot, 'public');
const scanRoots = ['src'].map((scanRoot) => path.join(projectRoot, scanRoot));
const legacyPathPattern = /\/legacy-wp\/[^"'()<>\s,]+/g;
const optimizableExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function listTextFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listTextFiles(absolutePath);
      }

      if (!entry.isFile()) {
        return [];
      }

      return [absolutePath];
    })
  );

  return files.flat();
}

async function listSourceAssets(directory = sourceUploadsRoot) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listSourceAssets(absolutePath);
      }

      if (!entry.isFile()) {
        return [];
      }

      return [absolutePath];
    })
  );

  return files.flat();
}

function decodeUrlPath(urlPath) {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return urlPath;
  }
}

function sourcePathForLegacyUrl(urlPath) {
  const decodedPath = decodeUrlPath(urlPath);
  const relativePath = decodedPath.replace(/^\/legacy-wp\//, '');

  if (relativePath.startsWith('uploads/')) {
    return path.join(sourceUploadsRoot, relativePath.slice('uploads/'.length));
  }

  const yearWithWpContent = relativePath.match(
    /^\d{4}\/wp-content\/uploads\/(.+)$/
  );

  if (yearWithWpContent) {
    return path.join(sourceUploadsRoot, yearWithWpContent[1]);
  }

  const yearWithUploads = relativePath.match(/^\d{4}\/uploads\/(.+)$/);

  if (yearWithUploads) {
    return path.join(sourceUploadsRoot, yearWithUploads[1]);
  }

  if (/^\d{4}\/\d{2}\//.test(relativePath)) {
    return path.join(sourceUploadsRoot, relativePath);
  }

  return null;
}

async function pathExists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function copyOrOptimizeAsset(sourcePath, destinationPath) {
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });

  const extension = path.extname(destinationPath).toLowerCase();

  if (!optimizableExtensions.has(extension)) {
    await fs.copyFile(sourcePath, destinationPath);
    return 'copied';
  }

  const image = sharp(sourcePath, { animated: false }).rotate().resize({
    width: 1600,
    height: 1600,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (extension === '.jpg' || extension === '.jpeg') {
    await image.jpeg({ mozjpeg: true, quality: 78 }).toFile(destinationPath);
    return 'optimized';
  }

  if (extension === '.png') {
    await image.png({ compressionLevel: 9, palette: true }).toFile(destinationPath);
    return 'optimized';
  }

  await image.webp({ quality: 78 }).toFile(destinationPath);
  return 'optimized';
}

async function collectLegacyAssetUrls() {
  const files = (await Promise.all(scanRoots.map(listTextFiles))).flat();
  const assetUrls = new Set();

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    const matches = source.matchAll(legacyPathPattern);

    for (const match of matches) {
      assetUrls.add(match[0].replace(/[?#].*$/, '').replace(/\\+$/, ''));
    }
  }

  return [...assetUrls].sort();
}

async function createSourceBasenameIndex() {
  const assets = await listSourceAssets();
  const index = new Map();

  for (const asset of assets) {
    const basename = path.basename(asset);

    if (!index.has(basename)) {
      index.set(basename, asset);
    }
  }

  return index;
}

async function directorySize(directory) {
  if (!(await pathExists(directory))) {
    return 0;
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return directorySize(absolutePath);
      }

      if (!entry.isFile()) {
        return 0;
      }

      return (await fs.stat(absolutePath)).size;
    })
  );

  return sizes.reduce((total, size) => total + size, 0);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;

  for (const unit of units) {
    if (value < 1024 || unit === units.at(-1)) {
      return `${value.toFixed(1)} ${unit}`;
    }

    value /= 1024;
  }

  return `${bytes} B`;
}

const assetUrls = await collectLegacyAssetUrls();
const sourceBasenameIndex = await createSourceBasenameIndex();
const missingAssets = [];
let copiedCount = 0;
let optimizedCount = 0;

for (const assetUrl of assetUrls) {
  let sourcePath = sourcePathForLegacyUrl(assetUrl);
  const destinationPath = path.join(publicRoot, decodeUrlPath(assetUrl));

  if (!sourcePath || !(await pathExists(sourcePath))) {
    const fallbackSourcePath = sourceBasenameIndex.get(
      path.basename(decodeUrlPath(assetUrl))
    );

    if (fallbackSourcePath) {
      sourcePath = fallbackSourcePath;
    }
  }

  if (!sourcePath || !(await pathExists(sourcePath))) {
    missingAssets.push({ assetUrl, sourcePath });
    continue;
  }

  const action = await copyOrOptimizeAsset(sourcePath, destinationPath);

  if (action === 'optimized') {
    optimizedCount += 1;
  } else {
    copiedCount += 1;
  }
}

if (missingAssets.length > 0) {
  console.error('Missing legacy assets:');

  for (const missing of missingAssets) {
    console.error(`- ${missing.assetUrl} -> ${missing.sourcePath || 'unmapped'}`);
  }

  process.exitCode = 1;
}

const legacyAssetRoot = path.join(publicRoot, 'legacy-wp');
const totalSize = await directorySize(legacyAssetRoot);

console.log(`Legacy asset URLs: ${assetUrls.length}`);
console.log(`Optimized: ${optimizedCount}`);
console.log(`Copied: ${copiedCount}`);
console.log(`Missing: ${missingAssets.length}`);
console.log(`public/legacy-wp size: ${formatBytes(totalSize)}`);
