import fs from 'node:fs';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const defaultLocalBase = 'http://127.0.0.1:8790';
const defaultLiveBase = 'https://pycon.hk';
const redirectsFile = new URL('../dist/_redirects', import.meta.url);
const localBase = process.env.LOCAL_BASE || defaultLocalBase;
const liveBase = process.env.LIVE_BASE || defaultLiveBase;
const requestTimeoutMs = Number(process.env.PARITY_TIMEOUT_MS || 15_000);
const requestConcurrency = Number(process.env.PARITY_CONCURRENCY || 4);
const userAgent = 'pyconhk-2015-live-parity/1.0';
const compatibilityRoutes = new Set(routeContract.compatibilityRoutes);
const liveRouteByLocalRoute = new Map(
  routeContract.migratedTopLevelRoutes.map(({ from, to }) => [to, from])
);

function joinBase(base, urlPath) {
  return new URL(urlPath, `${base.replace(/\/$/, '')}/`).href;
}

function normalizeRoutePath(urlPath) {
  const pathname = urlPath.startsWith('http')
    ? new URL(urlPath).pathname
    : urlPath;
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/u, '');

  return withoutTrailingSlash || '/';
}

function isRedirectStatus(status) {
  return status >= 300 && status < 400;
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"');
}

function normalizeText(text) {
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

function normalizeTitle(title) {
  return normalizeText(title).replace(/\s+-\s+PyCon HK$/u, '');
}

function stripTags(source) {
  return normalizeText(
    source
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

function matchFirst(source, pattern) {
  const match = source.match(pattern);
  return match ? match[1] : '';
}

function extractPageInfo(body) {
  const title = stripTags(matchFirst(body, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const h1 = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
  const text = stripTags(body);

  return {
    h1,
    textSample: text.slice(0, 500),
    title,
  };
}

async function fetchRoute(base, route, redirect = 'follow') {
  const url = joinBase(base, route);

  try {
    const response = await fetch(url, {
      headers: { 'user-agent': userAgent },
      redirect,
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    const body = await response.text();

    return {
      body,
      error: '',
      headers: response.headers,
      redirected: response.redirected,
      status: response.status,
      url: response.url,
      ...extractPageInfo(body),
    };
  } catch (error) {
    return {
      body: '',
      error: error.message,
      h1: [],
      headers: new Headers(),
      redirected: false,
      status: 0,
      textSample: '',
      title: '',
      url,
    };
  }
}

function compareStatus(route, local, live, failures) {
  if (local.error) {
    failures.push(`${route}: local fetch failed: ${local.error}`);
    return false;
  }

  if (live.error) {
    failures.push(`${route}: live fetch failed: ${live.error}`);
    return false;
  }

  if (local.status !== live.status) {
    failures.push(
      `${route}: HTTP status differs: local ${local.status}, live ${live.status}`
    );
    return false;
  }

  if (local.status >= 400 || live.status >= 400) {
    failures.push(
      `${route}: required route returned an error status: local ${local.status}, live ${live.status}`
    );
    return false;
  }

  return true;
}

function compareCompatibilityRoute(route, local, live, failures) {
  if (local.body.trim().length === 0) {
    failures.push(`${route}: local compatibility body is empty`);
  }

  if (live.body.trim().length === 0 && !allowsEmptyLiveCompatibilityAsset(route, live)) {
    failures.push(`${route}: live compatibility body is empty`);
  }
}

function allowsEmptyLiveCompatibilityAsset(route, live) {
  const contentType = live.headers.get('content-type') || '';

  return (
    route.endsWith('.js/') &&
    live.status === 200 &&
    contentType.toLowerCase().includes('javascript')
  );
}

function compareVisibleRoute(route, local, live, failures) {
  if (local.textSample.length < 40) {
    failures.push(
      `${route}: local visible text sample is unexpectedly short: ${JSON.stringify(
        local.textSample
      )}`
    );
  }

  if (live.textSample.length < 40) {
    failures.push(
      `${route}: live visible text sample is unexpectedly short: ${JSON.stringify(
        live.textSample
      )}`
    );
  }

  const localTitle = normalizeTitle(local.title);
  const liveTitle = normalizeTitle(live.title);

  if (liveTitle && localTitle !== liveTitle) {
    failures.push(
      `${route}: title differs: local ${JSON.stringify(local.title)}, live ${JSON.stringify(
        live.title
      )}`
    );
  }

  if (live.h1.length > 0 && JSON.stringify(local.h1) !== JSON.stringify(live.h1)) {
    failures.push(
      `${route}: H1 differs: local ${JSON.stringify(local.h1)}, live ${JSON.stringify(
        live.h1
      )}`
    );
  }
}

async function compareRequiredRoute(route) {
  const liveRoute = liveRouteByLocalRoute.get(route) || route;
  const [local, live] = await Promise.all([
    fetchRoute(localBase, route),
    fetchRoute(liveBase, liveRoute),
  ]);
  const routeLabel = liveRoute === route ? route : `${route} (live ${liveRoute})`;
  const failures = [];

  if (!compareStatus(routeLabel, local, live, failures)) {
    return failures;
  }

  if (compatibilityRoutes.has(route)) {
    compareCompatibilityRoute(routeLabel, local, live, failures);
  } else {
    compareVisibleRoute(routeLabel, local, live, failures);
  }

  return failures;
}

async function traceManualRedirects(route) {
  const chain = [];
  let currentUrl = joinBase(localBase, route);

  for (let hop = 0; hop < 6; hop += 1) {
    const response = await fetchRoute(currentUrl, currentUrl, 'manual');
    const location = response.headers.get('location') || '';
    chain.push({
      location,
      status: response.status,
      url: currentUrl,
    });

    if (response.error || !isRedirectStatus(response.status) || !location) {
      return chain;
    }

    currentUrl = new URL(location, currentUrl).href;
  }

  return chain;
}

function chainReachesTarget(chain, targetRoute) {
  const normalizedTarget = normalizeRoutePath(targetRoute);

  return chain.some((step) => {
    if (step.location) {
      const targetUrl = new URL(step.location, step.url);

      if (normalizeRoutePath(targetUrl.pathname) === normalizedTarget) {
        return true;
      }
    }

    return normalizeRoutePath(new URL(step.url).pathname) === normalizedTarget;
  });
}

function summarizeChain(chain) {
  return chain
    .map((step) => {
      const pathname = new URL(step.url).pathname;
      return step.location
        ? `${pathname} -> ${step.status} ${step.location}`
        : `${pathname} -> ${step.status}`;
    })
    .join('; ');
}

function builtRedirectsInclude(sourceRoute, targetRoute) {
  if (!fs.existsSync(redirectsFile)) {
    return false;
  }

  const normalizedSource = normalizeRoutePath(sourceRoute);
  const normalizedTarget = normalizeRoutePath(targetRoute);
  const redirects = fs.readFileSync(redirectsFile, 'utf8');

  return redirects
    .split('\n')
    .map((line) => line.trim().split(/\s+/u))
    .some(([source, target, status]) => {
      return (
        normalizeRoutePath(source || '') === normalizedSource &&
        normalizeRoutePath(target || '') === normalizedTarget &&
        isRedirectStatus(Number(status))
      );
    });
}

async function checkRedirectSource(sourceRoute, targetRoute) {
  const chain = await traceManualRedirects(sourceRoute);
  const sawRedirect = chain.some((step) => isRedirectStatus(step.status));

  if (sawRedirect && chainReachesTarget(chain, targetRoute)) {
    return [];
  }

  const automatic = await fetchRoute(localBase, sourceRoute);
  const resolvedToTarget =
    automatic.redirected &&
    normalizeRoutePath(new URL(automatic.url).pathname) === normalizeRoutePath(targetRoute);

  if (resolvedToTarget) {
    return [];
  }

  if (builtRedirectsInclude(sourceRoute, targetRoute)) {
    return [];
  }

  return [
    `${sourceRoute}: expected local redirect to ${normalizeRoutePath(
      targetRoute
    )}; observed ${summarizeChain(chain)}`,
  ];
}

function migratedRouteSources() {
  return routeContract.migratedTopLevelRoutes.flatMap(({ from, to }) => {
    const withoutSlash = from.replace(/\/+$/u, '');
    const withSlash = `${withoutSlash}/`;

    return [
      { from: withoutSlash, to },
      { from: withSlash, to },
    ];
  });
}

async function runQueue(items, concurrency, worker) {
  const results = [];
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const itemIndex = nextIndex;
        nextIndex += 1;
        results[itemIndex] = await worker(items[itemIndex]);
      }
    })
  );

  return results;
}

if (!Number.isInteger(requestConcurrency) || requestConcurrency < 1) {
  throw new Error('PARITY_CONCURRENCY must be a positive integer.');
}

const routeFailures = (
  await runQueue(routeContract.requiredRoutes, requestConcurrency, compareRequiredRoute)
).flat();
const redirectChecks = migratedRouteSources();
const redirectFailures = (
  await runQueue(redirectChecks, 1, ({ from, to }) => checkRedirectSource(from, to))
).flat();
const failures = [...routeFailures, ...redirectFailures];

if (failures.length > 0) {
  console.error('2015 live parity failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(
  `2015 live parity passed: ${routeContract.requiredRoutes.length} required routes and ${redirectChecks.length} migrated redirects matched ${liveBase}.`
);
