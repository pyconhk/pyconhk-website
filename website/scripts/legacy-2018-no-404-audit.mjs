import fs from 'node:fs';
import { chromium } from '@playwright/test';

const routeContract = JSON.parse(
  fs.readFileSync(new URL('../src/years/2018/data/routes.json', import.meta.url), 'utf8')
);
const baseUrl = new URL(process.env.LEGACY_AUDIT_BASE_URL ?? 'http://127.0.0.1:4321');
const auditedRoutes = [
  ...routeContract.requiredRoutes,
  ...routeContract.wordpressAliases
    .filter((alias) => alias.from.startsWith('/2018/'))
    .map((alias) => alias.from),
];
const uniqueRoutes = [...new Set(auditedRoutes)].sort((left, right) => left.localeCompare(right));
const failures = [];

const browser = await chromium.launch();

try {
  for (const route of uniqueRoutes) {
    const page = await browser.newPage();

    await page.route('**/*', (routedRequest) => {
      if (isSameOrigin(routedRequest.request().url())) {
        routedRequest.continue();
        return;
      }

      routedRequest.abort();
    });

    page.on('response', (response) => {
      if (!isSameOrigin(response.url()) || response.status() < 400) {
        return;
      }

      failures.push({
        route,
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
        route,
        type: 'requestfailed',
        errorText: request.failure()?.errorText ?? 'unknown request failure',
        url: request.url(),
      });
    });

    const response = await page.goto(routeUrl(route), {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    });

    if (!response || response.status() >= 400) {
      failures.push({
        route,
        type: 'document',
        status: response?.status() ?? 0,
        url: routeUrl(route),
      });
    }

    await page.waitForTimeout(1_000);
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(
  `Audited ${uniqueRoutes.length} PyCon HK 2018 routes with no same-origin 4xx/5xx responses or request failures.`
);

function routeUrl(route) {
  return new URL(route.replace(/\/$/u, '') || '/', baseUrl).href;
}

function isSameOrigin(value) {
  try {
    return new URL(value).origin === baseUrl.origin;
  } catch {
    return false;
  }
}
