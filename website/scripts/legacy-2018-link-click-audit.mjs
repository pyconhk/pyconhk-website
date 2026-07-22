import fs from 'node:fs';
import { chromium } from '@playwright/test';

const routeContract = JSON.parse(
  fs.readFileSync(new URL('../src/years/2018/data/routes.json', import.meta.url), 'utf8')
);
const baseUrl = new URL(process.env.LEGACY_AUDIT_BASE_URL ?? 'http://127.0.0.1:4321');
const sourceRoutes = [
  ...routeContract.requiredRoutes,
  ...routeContract.wordpressAliases.map((alias) => alias.from),
];
const uniqueSourceRoutes = [...new Set(sourceRoutes)].sort((left, right) => left.localeCompare(right));
const linksByTarget = new Map();
const failures = [];

const browser = await chromium.launch();
const context = await browser.newContext();

try {
  for (const route of uniqueSourceRoutes) {
    const page = await context.newPage();
    await blockExternalRequests(page);

    try {
      await page.goto(routeUrl(route), { timeout: 30_000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const links = await page.$$eval('a[href]', (anchors) =>
        anchors.map((anchor) => ({
          absoluteHref: anchor.href,
          text: (anchor.textContent ?? '').trim().replace(/\s+/gu, ' ').slice(0, 100),
        }))
      );

      for (const link of links) {
        const target = normalizeLocalHref(link.absoluteHref);

        if (!target || linksByTarget.has(target)) {
          continue;
        }

        linksByTarget.set(target, {
          source: route,
          target,
          text: link.text,
        });
      }
    } finally {
      await page.close();
    }
  }

  for (const link of linksByTarget.values()) {
    const page = await context.newPage();
    await blockExternalRequests(page);

    const localFailures = [];
    page.on('response', (response) => {
      if (isSameOrigin(response.url()) && response.status() >= 400) {
        localFailures.push({
          type: 'response',
          status: response.status(),
          url: response.url(),
        });
      }
    });
    page.on('requestfailed', (request) => {
      if (isSameOrigin(request.url())) {
        localFailures.push({
          type: 'requestfailed',
          errorText: request.failure()?.errorText ?? 'unknown request failure',
          url: request.url(),
        });
      }
    });

    try {
      await page.goto(routeUrl(link.source), { timeout: 30_000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(200);

      const clicked = await page.evaluate((targetHref) => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        const anchor = anchors.find((candidate) => {
          try {
            const url = new URL(candidate.href);
            url.hash = '';
            return url.href === targetHref;
          } catch {
            return false;
          }
        });

        if (!anchor) {
          return false;
        }

        anchor.removeAttribute('target');
        anchor.click();
        return true;
      }, link.target);

      if (!clicked) {
        localFailures.push({
          type: 'missing-anchor',
          url: link.target,
        });
      }

      await page.waitForLoadState('domcontentloaded', { timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(300);
    } finally {
      await page.close();
    }

    if (localFailures.length > 0) {
      failures.push({
        source: link.source,
        target: link.target,
        text: link.text,
        failures: localFailures,
      });
    }
  }
} finally {
  await context.close();
  await browser.close();
}

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(
  `Clicked ${linksByTarget.size} unique same-origin links from ${uniqueSourceRoutes.length} PyCon HK 2018 routes without same-origin 4xx/5xx responses or request failures.`
);

function routeUrl(route) {
  return new URL(route, baseUrl).href;
}

function normalizeLocalHref(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    if (url.origin !== baseUrl.origin) {
      return undefined;
    }

    url.hash = '';
    return url.href;
  } catch {
    return undefined;
  }
}

function isSameOrigin(value) {
  try {
    return new URL(value).origin === baseUrl.origin;
  } catch {
    return false;
  }
}

async function blockExternalRequests(page) {
  await page.route('**/*', (routedRequest) => {
    if (isSameOrigin(routedRequest.request().url())) {
      routedRequest.continue();
      return;
    }

    routedRequest.abort();
  });
}
