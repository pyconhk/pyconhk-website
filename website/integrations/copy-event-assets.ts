import fs from 'node:fs/promises';
import path from 'node:path';

export async function copyEventAssets(projectRoot: string) {
  const distRoot = path.join(projectRoot, 'dist');
  const bundledLegacyAssetRoot = path.join(projectRoot, 'src', 'legacy', 'assets');
  const legacyWpRoot = path.join(bundledLegacyAssetRoot, 'legacy-wp');
  const legacySharedRoot = path.join(bundledLegacyAssetRoot, 'legacy-assets');
  const crawlRoot = process.env.LEGACY_SOURCE
    ? path.resolve(process.env.LEGACY_SOURCE)
    : undefined;

  const eventPrefixes = [
    '2020-spring',
    '2020-fall',
    '2015',
    '2016',
    '2017',
    '2018',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
  ];
  const textExtensions = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.map',
    '.svg',
    '.txt',
    '.xml',
  ]);
  const eventAssetPattern = new RegExp(
    String.raw`(?:https?:\/\/(?:www\.)?(?:legacy\.)?pycon\.hk)?\/(${eventPrefixes.join(
      '|'
    )})\/assets\/[^"'()<>\s,\\]+`,
    'giu'
  );
  const escapedEventAssetPattern = new RegExp(
    String.raw`\\\/(${eventPrefixes.join('|')})\\\/assets\\\/[^"'()<>\s,]+`,
    'giu'
  );

  async function pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async function* walkFiles(directory) {
    if (!(await pathExists(directory))) {
      return;
    }

    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        yield* walkFiles(filePath);
      } else if (entry.isFile()) {
        yield filePath;
      }
    }
  }

  function decodeUrlPath(urlPath) {
    try {
      return decodeURIComponent(urlPath);
    } catch {
      return urlPath;
    }
  }

  function sourceYearForEvent(event) {
    if (event === '2020-spring' || event === '2020-fall') {
      return '2020';
    }

    return event;
  }

  function liveAssetRootForEvent(event) {
    return path.join(
      projectRoot,
      'src',
      'years',
      sourceYearForEvent(event),
      'assets',
      'live'
    );
  }

  function safeJoin(root, relativePath) {
    const decodedPath = decodeUrlPath(relativePath);

    if (decodedPath.includes('\0')) {
      return undefined;
    }

    const absolutePath = path.resolve(root, decodedPath);

    if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
      return undefined;
    }

    return absolutePath;
  }

  function candidateSourcePaths(event, assetRelativePath) {
    const sourceYear = sourceYearForEvent(event);
    const liveRoot = liveAssetRootForEvent(event);
    const candidates = [];
    const add = (root, relativePath) => {
      if (!root) {
        return;
      }

      const filePath = safeJoin(root, relativePath);

      if (filePath) {
        candidates.push(filePath);
      }
    };

    if (assetRelativePath.startsWith('uploads/')) {
      const uploadPath = assetRelativePath.slice('uploads/'.length);

      add(legacyWpRoot, assetRelativePath);
      add(legacyWpRoot, `${event}/wp-content/uploads/${uploadPath}`);
      add(legacyWpRoot, `${sourceYear}/wp-content/uploads/${uploadPath}`);
      add(legacyWpRoot, `${event}/uploads/${uploadPath}`);
      add(legacyWpRoot, `${sourceYear}/uploads/${uploadPath}`);
      add(liveRoot, `wp-content/uploads/${uploadPath}`);
      add(crawlRoot, `wp-content/uploads/${uploadPath}`);
    } else if (assetRelativePath.startsWith('content/')) {
      const wpContentPath = assetRelativePath.slice('content/'.length);

      add(legacySharedRoot, assetRelativePath);
      add(liveRoot, `wp-content/${wpContentPath}`);
      add(crawlRoot, `wp-content/${wpContentPath}`);
    } else if (assetRelativePath.startsWith('includes/')) {
      const wpIncludesPath = assetRelativePath.slice('includes/'.length);

      add(legacySharedRoot, assetRelativePath);
      add(liveRoot, `wp-includes/${wpIncludesPath}`);
      add(crawlRoot, `wp-includes/${wpIncludesPath}`);
    }

    add(legacyWpRoot, assetRelativePath);
    add(legacyWpRoot, `${event}/${assetRelativePath}`);
    add(legacyWpRoot, `${sourceYear}/${assetRelativePath}`);
    add(liveRoot, assetRelativePath);
    add(crawlRoot, assetRelativePath);

    return [...new Set(candidates)];
  }

  async function firstExistingPath(filePaths) {
    for (const filePath of filePaths) {
      if (await pathExists(filePath)) {
        return filePath;
      }
    }

    return undefined;
  }

  async function copyFile(sourcePath, destinationPath) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  function pathnameFromEventAssetUrl(url) {
    let decodedUrl = url;

    try {
      decodedUrl = JSON.parse(`"${url.replace(/"/gu, '\\"')}"`);
    } catch {
      decodedUrl = url;
    }

    const normalizedUrl = decodedUrl
      .replace(/\\\//gu, '/')
      .replace(/\\u([0-9a-f]{4})/giu, (_match, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16))
      )
      .replace(/&amp;/giu, '&')
      .replace(/[),.;]+$/u, '');
    const parsed = new URL(normalizedUrl, 'https://pycon.hk');

    return parsed.pathname;
  }

  async function collectEventAssetUrls() {
    const assetUrls = new Set();

    for await (const filePath of walkFiles(distRoot)) {
      if (!textExtensions.has(path.extname(filePath).toLowerCase())) {
        continue;
      }

      const source = await fs.readFile(filePath, 'utf8');

      for (const match of source.matchAll(eventAssetPattern)) {
        assetUrls.add(pathnameFromEventAssetUrl(match[0]));
      }

      for (const match of source.matchAll(escapedEventAssetPattern)) {
        assetUrls.add(pathnameFromEventAssetUrl(match[0]));
      }
    }

    return [...assetUrls].sort();
  }

  async function copyDirectory(sourceRoot, destinationRoot) {
    if (!(await pathExists(sourceRoot))) {
      return 0;
    }

    let copied = 0;

    for await (const sourcePath of walkFiles(sourceRoot)) {
      const relativePath = path.relative(sourceRoot, sourcePath);
      await copyFile(sourcePath, path.join(destinationRoot, relativePath));
      copied += 1;
    }

    return copied;
  }

  async function copySharedWordPressAssets(events) {
    let copied = 0;

    for (const event of events) {
      const liveRoot = liveAssetRootForEvent(event);

      copied += await copyDirectory(
        path.join(legacySharedRoot, 'content'),
        path.join(distRoot, event, 'assets', 'content')
      );
      copied += await copyDirectory(
        path.join(legacySharedRoot, 'includes'),
        path.join(distRoot, event, 'assets', 'includes')
      );
      copied += await copyDirectory(
        path.join(liveRoot, 'wp-content', 'themes'),
        path.join(distRoot, event, 'assets', 'content', 'themes')
      );
      if (crawlRoot) {
        copied += await copyDirectory(
          path.join(crawlRoot, 'wp-content', 'themes'),
          path.join(distRoot, event, 'assets', 'content', 'themes')
        );
      }
    }

    return copied;
  }

  function eventScopedCssUrl(event, value) {
    if (/^(?:#|data:|mailto:|tel:|javascript:)/iu.test(value)) {
      return value;
    }

    let url;

    try {
      url = new URL(value, 'https://pycon.hk');
    } catch {
      return value;
    }

    if (
      value.startsWith('http') &&
      !/^(?:www\.)?(?:legacy\.)?pycon\.hk$/iu.test(url.hostname)
    ) {
      return value;
    }

    const eventAssetRoot = `/${event}/assets`;
    let pathname;

    if (url.pathname.startsWith('/wp-content/uploads/')) {
      pathname = `${eventAssetRoot}/uploads/${url.pathname.slice('/wp-content/uploads/'.length)}`;
    } else if (url.pathname.startsWith('/wp-content/')) {
      pathname = `${eventAssetRoot}/content/${url.pathname.slice('/wp-content/'.length)}`;
    } else if (url.pathname.startsWith('/wp-includes/')) {
      pathname = `${eventAssetRoot}/includes/${url.pathname.slice('/wp-includes/'.length)}`;
    } else if (url.pathname.startsWith('/legacy-wp/uploads/')) {
      pathname = `${eventAssetRoot}/uploads/${url.pathname.slice('/legacy-wp/uploads/'.length)}`;
    } else if (url.pathname.startsWith('/legacy-wp/')) {
      pathname = `${eventAssetRoot}/${url.pathname.slice('/legacy-wp/'.length)}`;
    } else if (url.pathname.startsWith('/legacy-assets/content/')) {
      pathname = `${eventAssetRoot}/content/${url.pathname.slice('/legacy-assets/content/'.length)}`;
    } else if (url.pathname.startsWith('/legacy-assets/includes/')) {
      pathname = `${eventAssetRoot}/includes/${url.pathname.slice('/legacy-assets/includes/'.length)}`;
    } else {
      return value;
    }

    return `${pathname}${url.search}${url.hash}`;
  }

  async function rewriteCopiedCssAssetUrls(events) {
    let rewrittenFiles = 0;

    for (const event of events) {
      const assetRoot = path.join(distRoot, event, 'assets');

      for await (const filePath of walkFiles(assetRoot)) {
        if (path.extname(filePath).toLowerCase() !== '.css') {
          continue;
        }

        const source = await fs.readFile(filePath, 'utf8');
        const rewritten = source.replace(
          /url\((["']?)([^"')]+)\1\)/giu,
          (match, quote, value) => {
            const nextValue = eventScopedCssUrl(event, value);

            return nextValue === value ? match : `url(${quote}${nextValue}${quote})`;
          }
        );

        if (rewritten !== source) {
          await fs.writeFile(filePath, rewritten);
          rewrittenFiles += 1;
        }
      }
    }

    return rewrittenFiles;
  }

  const assetUrls = await collectEventAssetUrls();
  const eventsWithAssets = new Set();
  const missingAssets = [];
  let copiedAssets = 0;

  for (const assetUrl of assetUrls) {
    const match = assetUrl.match(/^\/([^/]+)\/assets\/(.+)$/u);

    if (!match) {
      continue;
    }

    const [, event, assetRelativePath] = match;
    const sourcePath = await firstExistingPath(
      candidateSourcePaths(event, assetRelativePath)
    );
    const destinationPath = safeJoin(distRoot, assetUrl.slice(1));

    eventsWithAssets.add(event);

    if (!destinationPath || !sourcePath) {
      missingAssets.push(assetUrl);
      continue;
    }

    await copyFile(sourcePath, destinationPath);
    copiedAssets += 1;
  }

  const copiedSharedAssets = await copySharedWordPressAssets(eventsWithAssets);
  const rewrittenCssFiles = await rewriteCopiedCssAssetUrls(eventsWithAssets);

  if (missingAssets.length > 0) {
    throw new Error(`Missing event-scoped assets: ${missingAssets.join(", ")}`);
  }

  console.log(`Event asset URLs: ${assetUrls.length}`);
  console.log(`Copied referenced assets: ${copiedAssets}`);
  console.log(`Copied shared WordPress assets: ${copiedSharedAssets}`);
  console.log(`Rewritten copied CSS files: ${rewrittenCssFiles}`);

}
