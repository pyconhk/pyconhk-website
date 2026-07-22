# 2016 Parity Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the live PyCon HK 2016 microsite into Astro with route, shell, content, CSS, asset, redirect, and pixel-diff contracts comparable to the 2015 parity work.

**Architecture:** Add a year-specific `src/years/2016` microsite layer for the live Bootstrap 3 pages that return 200 on `legacy.pycon.hk/2016`. Keep `/2016/photos` as the canonicalized WordPress conference-highlight route, but add 2016-specific route contracts and visual sample mapping so it is validated with the same rigor.

**Tech Stack:** Astro static file output, Bun tests, Playwright pixel-diff wrapper, Bootstrap 3 legacy markup, Astro image imports via `import.meta.glob`.

---

### Task 1: Capture And Generate 2016 Microsite Data

**Files:**
- Create: `website/scripts/legacy-2016-generate-pages.mjs`
- Create: `website/src/years/2016/data/types.ts`
- Create: `website/src/years/2016/data/pages.ts`
- Create: `website/src/years/2016/data/routes.json`

- [ ] **Step 1: Write the generator script**

Create `website/scripts/legacy-2016-generate-pages.mjs` with:

```js
import fs from 'node:fs/promises';

const pages = [
  { route: '/2016/', sourceUrl: 'https://legacy.pycon.hk/2016/' },
  { route: '/2016/about/', sourceUrl: 'https://legacy.pycon.hk/2016/about' },
  { route: '/2016/code-of-conducts/', sourceUrl: 'https://legacy.pycon.hk/2016/code-of-conducts' },
  { route: '/2016/dev-sprint/', sourceUrl: 'https://legacy.pycon.hk/2016/dev-sprint' },
  { route: '/2016/participate/', sourceUrl: 'https://legacy.pycon.hk/2016/participate' },
  { route: '/2016/program/', sourceUrl: 'https://legacy.pycon.hk/2016/program' },
  { route: '/2016/sponsor/', sourceUrl: 'https://legacy.pycon.hk/2016/sponsor' },
  { route: '/2016/venue/', sourceUrl: 'https://legacy.pycon.hk/2016/venue' },
  { route: '/2016/volunteer/', sourceUrl: 'https://legacy.pycon.hk/2016/volunteer' },
];

const outputUrl = new URL('../src/years/2016/data/pages.ts', import.meta.url);

function decodeHtml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/giu, (_match, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 16)))
    .replace(/&#(\d+);/gu, (_match, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 10)))
    .replace(/&nbsp;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;/giu, "'");
}

function normalizeText(value) {
  return decodeHtml(value)
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function extractTitle(html) {
  return normalizeText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1] ?? '');
}

function extractDescription(html, visibleText) {
  return (
    normalizeText(html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/iu)?.[1] ?? '') ||
    normalizeText(html.match(/<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/iu)?.[1] ?? '') ||
    visibleText.slice(0, 180)
  );
}

function rewriteUrl(value, pageRoute) {
  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith('#') || /^(?:data|javascript|mailto|tel):/iu.test(trimmed)) {
    return value;
  }

  try {
    const url = new URL(trimmed, `https://legacy.pycon.hk${pageRoute}`);

    if (url.hostname === 'legacy.pycon.hk' || url.hostname === 'pycon.hk') {
      if (url.pathname === '/2016') {
        return `/2016/${url.hash}`;
      }

      if (url.pathname.startsWith('/2016/')) {
        const asset = /\.(?:css|js|png|jpe?g|gif|ico|svg|woff2?|woff|ttf|eot)$/iu.test(url.pathname);
        return `${url.pathname}${asset ? url.search : '/'.replace(/^\/$/u, '')}${url.hash}`.replace(/([^/])\/($|#)/u, '$1$2');
      }

      if (url.pathname === '/js/ga.js') {
        return '/js/ga.js';
      }
    }

    if (url.hostname === '/2015' && url.pathname.startsWith('/images/')) {
      return `/2016/remote/2015${url.pathname}`;
    }

    if (url.hostname === 'img.opensource.hk') {
      return `/2016/remote/img.opensource.hk${url.pathname}`;
    }

    return url.href;
  } catch {
    return value;
  }
}

function rewriteHtml(html, pageRoute) {
  return html.replace(/(\s)(href|src)=(["'])([^"']+)\3/giu, (attribute, prefix, name, quote, value) => {
    return `${prefix}${name}=${quote}${rewriteUrl(value, pageRoute)}${quote}`;
  });
}

function extractBodyHtml(html) {
  const navEnd = html.search(/<\/nav>/iu);
  const scriptStart = html.search(/<script\b/iu);
  const start = navEnd === -1 ? html.search(/<body\b[^>]*>/iu) : navEnd + '</nav>'.length;
  const end = scriptStart === -1 ? html.search(/<\/body>/iu) : scriptStart;

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not extract 2016 page body');
  }

  return html.slice(start, end).trim();
}

function routeFileName(route) {
  return route.replace(/^\/|\/$/gu, '').replace(/\//gu, '-') || '2016';
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

const generatedPages = [];

for (const page of pages) {
  const response = await fetch(page.sourceUrl);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`${page.sourceUrl} returned ${response.status}`);
  }

  const bodyHtml = rewriteHtml(extractBodyHtml(html), page.route);
  const visibleText = normalizeText(bodyHtml);

  generatedPages.push({
    route: page.route,
    sourceRoute: new URL(page.sourceUrl).pathname,
    sourceUrl: page.sourceUrl,
    status: response.status,
    title: extractTitle(html),
    description: extractDescription(html, visibleText),
    kind: 'html',
    capturedFile: `${routeFileName(page.route)}.html`,
    bodyHtml,
    visibleText,
  });
}

const source = `import type { Legacy2016Page } from './types';

export const legacy2016Pages = ${serialize(generatedPages)} satisfies Legacy2016Page[];

const legacy2016PageByRoute = new Map(
  legacy2016Pages.map((page) => [page.route, page])
);

export function getLegacy2016Page(route: string): Legacy2016Page {
  const normalizedRoute = route.endsWith('/') ? route : \`\${route}/\`;
  const page = legacy2016PageByRoute.get(normalizedRoute);

  if (!page) {
    throw new Error(\`Missing PyCon HK 2016 page: \${route}\`);
  }

  return page;
}
`;

await fs.writeFile(outputUrl, source);
```

- [ ] **Step 2: Add the 2016 types**

Create `website/src/years/2016/data/types.ts`:

```ts
export type Legacy2016PageKind = 'html';

export interface Legacy2016Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  status: number;
  title: string;
  description: string;
  kind: Legacy2016PageKind;
  capturedFile: string;
  bodyHtml: string;
  visibleText: string;
}
```

- [ ] **Step 3: Add the 2016 route contract data**

Create `website/src/years/2016/data/routes.json`:

```json
{
  "requiredRoutes": [
    "/2016/",
    "/2016/about/",
    "/2016/code-of-conducts/",
    "/2016/dev-sprint/",
    "/2016/participate/",
    "/2016/program/",
    "/2016/sponsor/",
    "/2016/venue/",
    "/2016/volunteer/",
    "/2016/photos/"
  ],
  "visualSampleRoutes": [
    "/2016/",
    "/2016/program/",
    "/2016/sponsor/",
    "/2016/photos/"
  ],
  "migratedTopLevelRoutes": [
    { "from": "/conference-highlights/2016-photos/", "to": "/2016/photos" }
  ],
  "internalRouteRewrites": [],
  "compatibilityRoutes": []
}
```

- [ ] **Step 4: Run generation**

Run:

```sh
cd /Users/alexau/Project/pyconhk-website/website
MISE_EXPERIMENTAL=0 mise exec -- bun scripts/legacy-2016-generate-pages.mjs
```

Expected: `website/src/years/2016/data/pages.ts` is generated and contains nine `legacy2016Pages`.

### Task 2: Add 2016 Microsite Rendering And Asset Rewrites

**Files:**
- Create: `website/src/years/2016/data/navigation.ts`
- Create: `website/src/years/2016/data/assets.ts`
- Create: `website/src/years/2016/components/PageContent2016.astro`
- Create: `website/src/years/2016/components/BareMicrositePage2016.astro`
- Modify: `website/src/pages/2016/index.astro`
- Modify: `website/src/pages/2016/[slug]/index.astro`

- [ ] **Step 1: Add navigation data**

Create `navigation.ts` with `legacy2016Brand`, `legacy2016TicketHref`, and nav groups matching the live navbar: About, Program, Participate, Sponsor, Volunteer, Venue.

- [ ] **Step 2: Add asset resolver**

Create `assets.ts` that uses `import.meta.glob('../assets/live/**/*.{jpg,jpeg,png,gif,ico}')`, maps imported assets to legacy `/2016/...`, `/2016/remote/...`, and `/legacy-wp/uploads/...` paths, and rewrites `src`, `href`, and `srcset` in HTML.

- [ ] **Step 3: Add page content component**

Create `PageContent2016.astro` that calls `resolveLegacy2016HtmlAssets(page.bodyHtml)` and emits the result with `set:html`.

- [ ] **Step 4: Add microsite shell**

Create `BareMicrositePage2016.astro` with the live Bootstrap 3 head, fixed inverse navbar, dropdowns, CSS links, Roboto font, and the small inline dropdown/mobile script used in 2015.

- [ ] **Step 5: Route `/2016/` to the microsite home**

Modify `website/src/pages/2016/index.astro` to render `getLegacy2016Page('/2016/')` through `BareMicrositePage2016`.

- [ ] **Step 6: Route 2016 slugs to microsite pages or photos**

Modify `website/src/pages/2016/[slug]/index.astro` so `photos` still renders `LegacyHighlightPage`, while the eight microsite slugs render `BareMicrositePage2016`.

### Task 3: Cache 2016 Images With Astro

**Files:**
- Create binary assets under: `website/src/years/2016/assets/live/`
- Create: `website/src/pages/2016/css/style.css.ts`
- Create: `website/src/pages/2016/css/jumbotron.css.ts`

- [ ] **Step 1: Download live 2016 microsite assets**

Download the legacy assets referenced by the nine 2016 pages into `website/src/years/2016/assets/live`, preserving logical legacy paths:

```sh
cd /Users/alexau/Project/pyconhk-website/website
mkdir -p src/years/2016/assets/live/2016/images src/years/2016/assets/live/2016/remote/img.opensource.hk src/years/2016/assets/live/2016/remote/2015/images/sponsors src/years/2016/assets/live/2016/remote/2015/images
curl -L https://legacy.pycon.hk/2016/images/pyconhk-logo.jpg -o src/years/2016/assets/live/2016/images/pyconhk-logo.jpg
curl -L https://legacy.pycon.hk/2016/images/favicon.png -o src/years/2016/assets/live/2016/images/favicon.png
curl -L https://legacy.pycon.hk/2016/cyberport.jpg -o src/years/2016/assets/live/2016/cyberport.jpg
curl -L https://legacy.pycon.hk/2016/pycon.png -o src/years/2016/assets/live/2016/pycon.png
curl -L /2015/images/cyberport-back.jpg -o src/years/2016/assets/live/2016/remote/2015/images/cyberport-back.jpg
curl -L /2015/images/sponsors/hkcota.png -o src/years/2016/assets/live/2016/remote/2015/images/sponsors/hkcota.png
curl -L /2015/images/sponsors/opensourcehk.png -o src/years/2016/assets/live/2016/remote/2015/images/sponsors/opensourcehk.png
```

Download all `http://img.opensource.hk/...` logos into matching paths under `src/years/2016/assets/live/2016/remote/img.opensource.hk/`.

- [ ] **Step 2: Add CSS endpoints**

Create route handlers for `/2016/css/jumbotron.css` and `/2016/css/style.css` with the live CSS text. Rewrite `style.css` background URL for `cyberport-back.jpg` to its Astro-managed `/_astro/...` URL.

### Task 4: Add 2016 Route And Pixel-Diff Contracts

**Files:**
- Create: `website/scripts/legacy-2016-route-contract.test.mjs`
- Create: `website/scripts/legacy-2016-pixel-diff.mjs`
- Create: `website/scripts/legacy-2016-pixel-diff.test.mjs`
- Modify: `website/package.json`
- Modify: `website/src/pages/sitemap.xml.ts`

- [ ] **Step 1: Add route contract test**

Assert all required routes build, migrated photo source HTML is not emitted, redirects point to `/2016/photos`, sitemap includes all required 2016 route targets, `/2016/` renders the live Bootstrap jumbotron shell, and 2016 page HTML uses `/_astro/...` image URLs instead of remote HTTP image sources.

- [ ] **Step 2: Add pixel diff wrapper and tests**

Mirror the 2015 pixel-diff wrapper shape with 2016 route data and default output `output/playwright/2016-parity/`. Test default visual sample mapping and explicit `--path-pair` behavior.

- [ ] **Step 3: Add package scripts and sitemap entries**

Add `test:legacy-2016` and `diff:2016` scripts. Include required 2016 microsite routes in the sitemap, without re-adding `/conference-highlights/2016-photos/`.

### Task 5: Verify Runtime Parity

**Files:**
- No new files.

- [ ] **Step 1: Build and run focused tests**

Run:

```sh
cd /Users/alexau/Project/pyconhk-website/website
MISE_EXPERIMENTAL=0 mise exec -- bun run build
MISE_EXPERIMENTAL=0 mise exec -- bun test scripts/legacy-2016-route-contract.test.mjs scripts/legacy-2016-pixel-diff.test.mjs
```

- [ ] **Step 2: Browser-check the important pages**

Serve `dist` with Wrangler and use Playwright to load `/2016/`, `/2016/program/`, `/2016/sponsor/`, and `/2016/photos/`. Confirm no failed local assets, no remote HTTP image requests from the 2016 microsite, and Bootstrap dropdowns open.

- [ ] **Step 3: Run full project verification**

Run:

```sh
cd /Users/alexau/Project/pyconhk-website/website
MISE_EXPERIMENTAL=0 mise exec -- bun run format:check
MISE_EXPERIMENTAL=0 mise exec -- bun run check
cd /Users/alexau/Project/pyconhk-website
git diff --check
```

Expected: all commands exit 0.

---

**Self-review:** This plan covers the nine live 2016 microsite routes that return 200, the migrated `/conference-highlights/2016-photos/` route, 2016-specific images/CSS, tests, sitemap, and runtime browser validation. It intentionally does not create talk-detail pages because live 2016 talk-detail links currently return 404.
