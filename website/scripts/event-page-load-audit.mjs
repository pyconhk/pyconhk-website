import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const distDir = new URL('../dist/', import.meta.url);
const baseUrl = new URL(process.env.EVENT_AUDIT_BASE_URL ?? 'http://127.0.0.1:8789');
const waitAfterLoadMs = Number(process.env.EVENT_AUDIT_WAIT_MS ?? 750);
const concurrency = Number(process.env.EVENT_AUDIT_CONCURRENCY ?? 4);
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

function* walkFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* walkFiles(filePath);
    } else if (entry.isFile()) {
      yield filePath;
    }
  }
}

function routeFromOutputFile(filePath) {
  const relativePath = path.relative(distDir.pathname, filePath);

  if (relativePath === 'index.html') {
    return '/';
  }

  return `/${relativePath.replace(/\.html$/u, '')}`;
}

function isEventRoute(route) {
  return eventPrefixes.some(
    (eventPrefix) => route === eventPrefix || route.startsWith(`${eventPrefix}/`)
  );
}

function eventRoutes() {
  return [...walkFiles(distDir.pathname)]
    .filter((filePath) => filePath.endsWith('.html'))
    .map(routeFromOutputFile)
    .filter(isEventRoute)
    .sort((left, right) => left.localeCompare(right));
}

function routeUrl(route) {
  return new URL(encodeURI(route), baseUrl).href;
}

function isSameOrigin(value) {
  try {
    return new URL(value).origin === baseUrl.origin;
  } catch {
    return false;
  }
}

async function auditRoute(context, route) {
  const page = await context.newPage();
  const failures = [];

  await page.route('**/*', (routedRequest) => {
    if (isSameOrigin(routedRequest.request().url())) {
      routedRequest.continue();
      return;
    }

    routedRequest.abort('blockedbyclient');
  });

  page.on('response', (response) => {
    if (!isSameOrigin(response.url()) || response.status() < 400) {
      return;
    }

    failures.push({
      type: 'response',
      status: response.status(),
      url: response.url(),
    });
  });

  page.on('requestfailed', (request) => {
    if (!isSameOrigin(request.url())) {
      return;
    }

    failures.push({
      type: 'requestfailed',
      errorText: request.failure()?.errorText ?? 'unknown request failure',
      url: request.url(),
    });
  });

  try {
    const response = await page.goto(routeUrl(route), {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    });

    if (!response || response.status() >= 400) {
      failures.push({
        type: 'document',
        status: response?.status() ?? 0,
        url: routeUrl(route),
      });
    }

    await page.waitForTimeout(waitAfterLoadMs);
  } catch (error) {
    failures.push({
      type: 'document-exception',
      errorText: error instanceof Error ? error.message : String(error),
      url: routeUrl(route),
    });
  } finally {
    await page.close();
  }

  return failures.length > 0 ? { route, failures } : undefined;
}

async function runQueue(items, workerCount, worker) {
  const failures = [];
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      const result = await worker(item);

      if (result) {
        failures.push(result);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, workerCount) }, () => runWorker())
  );

  return failures;
}

function failureKey(failure) {
  return JSON.stringify({
    type: failure.type,
    status: failure.status,
    errorText: failure.errorText,
    url: failure.url,
  });
}

function summarizeFailures(routeFailures) {
  const groups = new Map();

  for (const { route, failures } of routeFailures) {
    for (const failure of failures) {
      const key = failureKey(failure);
      const group = groups.get(key) ?? {
        ...failure,
        affectedRouteCount: 0,
        sampleRoutes: [],
      };

      group.affectedRouteCount += 1;

      if (group.sampleRoutes.length < 8) {
        group.sampleRoutes.push(route);
      }

      groups.set(key, group);
    }
  }

  return [...groups.values()].sort((left, right) => {
    const byCount = right.affectedRouteCount - left.affectedRouteCount;

    if (byCount !== 0) {
      return byCount;
    }

    return left.url.localeCompare(right.url);
  });
}

const routes = eventRoutes();
const browser = await chromium.launch();
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
});

try {
  const failures = await runQueue(routes, concurrency, (route) =>
    auditRoute(context, route)
  );

  if (failures.length > 0) {
    const summary = summarizeFailures(failures);

    console.error(
      JSON.stringify(
        {
          auditedRouteCount: routes.length,
          failingRouteCount: failures.length,
          distinctFailureCount: summary.length,
          failures: summary,
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  console.log(
    `Audited ${routes.length} event pages with no same-origin 4xx/5xx responses or request failures.`
  );
} finally {
  await context.close();
  await browser.close();
}
