import fs from 'node:fs/promises';
import path from 'node:path';
import { validateSnapshot } from './programme-snapshot.mjs';
import { createSpeakerDirectory, speakerRedirects } from './speaker-directory.mjs';

const projectRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distRoot = path.join(projectRoot, 'dist');
const redirectsPath = path.join(distRoot, '_redirects');
const eventPrefixes = [
  '/2020-spring',
  '/2020-fall',
  '/2015',
  '/2016',
  '/2017',
  '/2018',
  '/2020',
  '/2021',
  '/2022',
  '/2023',
  '/2024',
  '/2025',
  '/2026',
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function* walkFiles(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* walkFiles(filePath);
    } else if (entry.isFile()) {
      yield filePath;
    }
  }
}

function routeFromOutputFile(filePath) {
  const relativePath = path.relative(distRoot, filePath);

  if (relativePath === 'index.html') {
    return '/';
  }

  return `/${relativePath.replace(/\.html$/u, '')}`;
}

function isEventScopedRoute(route) {
  return eventPrefixes.some(
    (eventPrefix) => route === eventPrefix || route.startsWith(`${eventPrefix}/`)
  );
}

function redirectSourceForRoute(route) {
  if (route === '/' || route.endsWith('/')) {
    return undefined;
  }

  if (!isEventScopedRoute(route)) {
    return undefined;
  }

  return `${route}/`;
}

function parseRedirectSources(redirects) {
  return new Set(
    redirects
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => normalizeRedirectPath(line.split(/\s+/u, 1)[0]))
  );
}

function normalizeRedirectPath(value) {
  try {
    return encodeURI(decodeURI(value));
  } catch {
    return encodeURI(value);
  }
}

function firstDynamicRuleIndex(lines) {
  return lines.findIndex((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return false;
    }

    const [source] = trimmedLine.split(/\s+/u);

    return source.includes('*') || source.includes(':');
  });
}

function insertStaticRedirects(redirects, additions) {
  const lines = redirects.replace(/\n$/u, '').split(/\r?\n/u);
  const insertAt = firstDynamicRuleIndex(lines);
  const normalizedInsertAt = insertAt === -1 ? lines.length : insertAt;

  lines.splice(normalizedInsertAt, 0, ...additions);

  return `${lines.filter((line, index) => index === 0 || line !== '').join('\n')}\n`;
}

function normalizeExistingEventTrailingSlashRedirects(redirects, eventRoutes) {
  let changedRules = 0;
  const lines = redirects.replace(/\n$/u, '').split(/\r?\n/u);
  const normalizedLines = lines.map((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return line;
    }

    const [source, , status] = trimmedLine.split(/\s+/u);
    const sourceWithoutSlash = source.replace(/\/+$/u, '');

    if (
      status !== '308' ||
      !source.endsWith('/') ||
      !isEventScopedRoute(source) ||
      !eventRoutes.has(normalizeRedirectPath(sourceWithoutSlash))
    ) {
      return line;
    }

    changedRules += 1;

    return `${source} ${sourceWithoutSlash} 200`;
  });

  return {
    changedRules,
    redirects: `${normalizedLines.join('\n')}\n`,
  };
}

async function eventPageRoutes() {
  const routes = [];

  for await (const filePath of walkFiles(distRoot)) {
    if (filePath.endsWith('.html')) {
      routes.push(routeFromOutputFile(filePath));
    }
  }

  return routes.sort((left, right) => left.localeCompare(right));
}

async function main() {
  if (!(await pathExists(redirectsPath))) {
    await fs.writeFile(redirectsPath, '', 'utf8');
  }

  const redirects = await fs.readFile(redirectsPath, 'utf8');
  const routes = await eventPageRoutes();
  const eventRoutes = new Set(routes.map((route) => normalizeRedirectPath(route)));
  const {
    changedRules,
    redirects: normalizedRedirects,
  } = normalizeExistingEventTrailingSlashRedirects(redirects, eventRoutes);
  const existingSources = parseRedirectSources(normalizedRedirects);
  const additions = [];

  if (process.env.PROGRAMME_SNAPSHOT_PATH) {
    const snapshot = validateSnapshot(
      JSON.parse(await fs.readFile(path.resolve(process.env.PROGRAMME_SNAPSHOT_PATH), 'utf8')),
      process.env.PROGRAMME_SOURCE_EVENT ?? 'pyconhk2026',
      process.env.PROGRAMME_ENVIRONMENT ?? 'production'
    );
    const aliases = speakerRedirects(createSpeakerDirectory(snapshot.sessions, snapshot.event), ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']);
    additions.push(...aliases.filter((line) => !existingSources.has(line.split(' ')[0])));
  }

  for (const route of routes) {
    const source = redirectSourceForRoute(route);

    if (!source || existingSources.has(source)) {
      continue;
    }

    const normalizedSource = normalizeRedirectPath(source);

    if (existingSources.has(normalizedSource)) {
      continue;
    }

    additions.push(`${normalizedSource} ${normalizeRedirectPath(route)} 200`);
    existingSources.add(normalizedSource);
  }

  if (additions.length > 0 || changedRules > 0) {
    await fs.writeFile(
      redirectsPath,
      insertStaticRedirects(normalizedRedirects, additions),
      'utf8'
    );
  }

  console.log(`Generated event trailing-slash rewrites: ${additions.length}`);
  console.log(`Normalized existing event trailing-slash rewrites: ${changedRules}`);
}

await main();
