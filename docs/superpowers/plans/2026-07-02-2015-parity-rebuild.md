# 2015 Parity Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the PyCon HK 2015 microsite as Astro-native pages that match the live `https://pycon.hk/2015/` route contract, visual styling, content, and mobile behavior, with Playwright pixel-diff verification.

**Architecture:** Build a dedicated `website/src/years/2015/` module with typed route/data files, scoped 2015 components, a compact Bootstrap-compatible stylesheet, and Astro-managed image assets. Use a catch-all `/2015/[...path]` page to render all strict 2015 subroutes, including CSS/JS-looking compatibility routes, while keeping `/2015/` as the homepage. Capture live HTML as implementation source material, but render through Astro components and optimized image handling instead of copying a static tree into `public/`.

**Tech Stack:** Astro 7, Bun 1.3.10 via mise, TypeScript, Astro assets, Playwright Chromium screenshots, Sharp-based `website/scripts/ui-diff.mjs`, Biome.

---

## File Structure

Create or modify these files only for the 2015 slice:

- Create `website/src/years/2015/data/routes.json`: strict route inventory and visual-diff sample list.
- Create `website/src/years/2015/data/types.ts`: typed page, route, asset, and compatibility data interfaces.
- Create `website/src/years/2015/data/navigation.ts`: exact 2015 navbar/dropdown/ticket links.
- Create `website/src/years/2015/data/pages.ts`: generated or curated page data keyed by route.
- Create `website/src/years/2015/data/assets.ts`: imported Astro image asset map and resolver helpers.
- Create `website/src/years/2015/components/Layout2015.astro`: page shell, metadata, stylesheet inclusion, footer.
- Create `website/src/years/2015/components/Navbar2015.astro`: Bootstrap-era navbar/dropdowns and mobile toggle.
- Create `website/src/years/2015/components/PageContent2015.astro`: renders sanitized 2015 page content and rewrites legacy image paths to Astro-generated image URLs.
- Create `website/src/years/2015/components/CompatibilityAsset2015.astro`: renders CSS/JS-looking routes with live-equivalent text content inside the 2015 shell.
- Create `website/src/years/2015/styles/legacy2015.css`: compact Bootstrap-compatible styling scoped to 2015 pages.
- Modify `website/src/pages/2015/index.astro`: replace generic highlight landing with 2015 homepage renderer.
- Delete `website/src/pages/2015/[slug]/index.astro`: replaced by catch-all routing.
- Create `website/src/pages/2015/[...path].astro`: render all non-home 2015 routes from the data map.
- Create `website/scripts/legacy-2015-capture.mjs`: capture live 2015 HTML and assets into `output/legacy-2015-source/` and source image files under `website/src/years/2015/assets/live/`.
- Create `website/scripts/legacy-2015-generate-pages.mjs`: convert captured live HTML into `website/src/years/2015/data/pages.ts`.
- Create `website/scripts/legacy-2015-route-contract.test.mjs`: build-output route contract test.
- Create `website/scripts/legacy-2015-live-parity.mjs`: preview-vs-live status/title/text parity check.
- Create `website/scripts/legacy-2015-pixel-diff.mjs`: wrapper around `website/scripts/ui-diff.mjs` writing to `output/playwright/2015-parity/`.
- Modify `website/package.json`: add 2015 test/diff scripts and include the route contract test in `check` after the implementation passes.

Keep generated crawl output under `output/`; do not commit it unless the user explicitly asks for audit artifacts.

## Task 1: Route Contract And Failing Test

**Files:**
- Create: `website/src/years/2015/data/routes.json`
- Create: `website/scripts/legacy-2015-route-contract.test.mjs`
- Modify: `website/package.json`

- [ ] **Step 1: Create the route inventory**

Create `website/src/years/2015/data/routes.json` with this exact content:

```json
{
  "requiredRoutes": [
    "/2015/",
    "/2015/about/code-of-conducts/",
    "/2015/about/staffs/",
    "/2015/about/what-is-pycon/",
    "/2015/css/bootstrap.min.css/",
    "/2015/js/bootstrap.min.js/",
    "/2015/js/ga.js/",
    "/2015/jumbotron.css/",
    "/2015/schedule/",
    "/2015/schedule/topics/",
    "/2015/schedule/topics/%E7%B6%B2%E5%AA%92%E4%B9%8B%E9%96%93%E6%96%87%E7%AB%A0%E6%9C%89%E4%B9%9C%E5%88%86%E5%88%A5/",
    "/2015/schedule/topics/artiq-the-advanced-real-time-infrastructure-for-quantum-physics/",
    "/2015/schedule/topics/better-type-at-python/",
    "/2015/schedule/topics/beyond-the-style-guides/",
    "/2015/schedule/topics/building-an-adaptive-learning-system-using-bayesian-modelling-in-python/",
    "/2015/schedule/topics/chinese-nlp-with-open-source-tools-in-python/",
    "/2015/schedule/topics/decoding-the-language-of-cereal-box-design-with-scikit-learn/",
    "/2015/schedule/topics/dont-be-afraid-to-search/",
    "/2015/schedule/topics/explore-your-data-with-elasticsearch/",
    "/2015/schedule/topics/financial-technology/",
    "/2015/schedule/topics/functional-and-scale-performance-tests-using-zopkio/",
    "/2015/schedule/topics/haxe-a-statically-typed-language-that-compiles-to-python-and-more/",
    "/2015/schedule/topics/heading-towards-continuous-delivery/",
    "/2015/schedule/topics/introduction-to-aiohttp-asyncio-based-web-framework/",
    "/2015/schedule/topics/keep-it-simple-web-development-stack/",
    "/2015/schedule/topics/lets-break-some-stupid-captchas/",
    "/2015/schedule/topics/microsoft-and-python/",
    "/2015/schedule/topics/monitoring-the-performance-of-python-web-applications/",
    "/2015/schedule/topics/my-personal-take/",
    "/2015/schedule/topics/scrape-more-with-less-codes/",
    "/2015/schedule/topics/the-changing-landscape-of-python-web-application-deployment/",
    "/2015/schedule/topics/use-all-the-logs/",
    "/2015/schedule/topics/using-python-for-data-mining-projects/",
    "/2015/schedule/topics/web-backends-development-using-python/",
    "/2015/schedule/topics/what-exactly-is-plastics-on-hong-kong-golden-forum-a-text-mining-analysis/",
    "/2015/schedule/topics/writing-fast-code/",
    "/2015/sponsor/",
    "/2015/sponsor/prospectus/",
    "/2015/style.css/",
    "/2015/style.js/",
    "/2015/venue/",
    "/2015/venue/hotels/",
    "/2015/photos/"
  ],
  "htmlRoutes": [
    "/2015/",
    "/2015/about/code-of-conducts/",
    "/2015/about/staffs/",
    "/2015/about/what-is-pycon/",
    "/2015/schedule/",
    "/2015/schedule/topics/",
    "/2015/sponsor/",
    "/2015/sponsor/prospectus/",
    "/2015/venue/",
    "/2015/venue/hotels/",
    "/2015/photos/"
  ],
  "compatibilityRoutes": [
    "/2015/css/bootstrap.min.css/",
    "/2015/js/bootstrap.min.js/",
    "/2015/js/ga.js/",
    "/2015/jumbotron.css/",
    "/2015/style.css/",
    "/2015/style.js/"
  ],
  "visualSampleRoutes": [
    "/2015/",
    "/2015/schedule/",
    "/2015/schedule/topics/better-type-at-python/",
    "/2015/schedule/topics/%E7%B6%B2%E5%AA%92%E4%B9%8B%E9%96%93%E6%96%87%E7%AB%A0%E6%9C%89%E4%B9%9C%E5%88%86%E5%88%A5/",
    "/2015/sponsor/",
    "/2015/venue/",
    "/2015/photos/",
    "/2015/style.css/",
    "/2015/js/bootstrap.min.js/"
  ],
  "migratedTopLevelRoutes": [
    {
      "from": "/conference-highlights/2015-photos/",
      "to": "/2015/photos/"
    }
  ]
}
```

- [ ] **Step 2: Write the failing route contract test**

Create `website/scripts/legacy-2015-route-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const distDir = new URL('../dist/', import.meta.url);

function outputFileForRoute(route) {
  const clean = route.replace(/^\/|\/$/gu, '');
  return path.join(distDir.pathname, clean, 'index.html');
}

describe('PyCon HK 2015 route contract', () => {
  it('has no duplicate required routes', () => {
    assert.equal(
      new Set(routeContract.requiredRoutes).size,
      routeContract.requiredRoutes.length
    );
  });

  it('includes the year-scoped photos route instead of top-level-only photos', () => {
    assert.ok(routeContract.requiredRoutes.includes('/2015/photos/'));
    assert.deepEqual(routeContract.migratedTopLevelRoutes, [
      { from: '/conference-highlights/2015-photos/', to: '/2015/photos/' },
    ]);
  });

  it('emits one built HTML file for every required 2015 route', () => {
    const missing = routeContract.requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });
});
```

- [ ] **Step 3: Add an isolated package script**

Modify `website/package.json` scripts:

```json
"test:legacy-2015": "bun test scripts/legacy-2015-route-contract.test.mjs"
```

Do not add it to `check` until Task 7, because it is intentionally failing before the routes exist.

- [ ] **Step 4: Run the failing test**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:build
cd website && bun run test:legacy-2015
```

Expected: build may succeed, then `test:legacy-2015` fails with missing files such as `dist/2015/schedule/index.html`. This confirms the contract test catches the current gap.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add website/src/years/2015/data/routes.json website/scripts/legacy-2015-route-contract.test.mjs website/package.json
git commit -m "test: add 2015 route contract"
```

## Task 2: Capture Live 2015 Source HTML And Assets

**Files:**
- Create: `website/scripts/legacy-2015-capture.mjs`
- Generate: `output/legacy-2015-source/**`
- Generate: `website/src/years/2015/assets/live/**`

- [ ] **Step 1: Write the capture script**

Create `website/scripts/legacy-2015-capture.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const liveBase = 'https://pycon.hk';
const outputRoot = new URL('../../output/legacy-2015-source/', import.meta.url);
const assetRoot = new URL('../src/years/2015/assets/live/', import.meta.url);
const assetPattern = /\b(?:src|href)=["']([^"']+\.(?:png|jpe?g|gif|webp|svg))["']/giu;

function routeSlug(route) {
  return route.replace(/^\/|\/$/gu, '').replace(/[^a-z0-9]+/giu, '-');
}

function assetFileName(url) {
  const parsed = new URL(url);
  const cleanPath = decodeURIComponent(parsed.pathname)
    .replace(/^\/+/u, '')
    .replace(/[^a-z0-9._/-]+/giu, '-');
  return cleanPath;
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
  return { buffer, contentType: response.headers.get('content-type') || '', status: response.status };
}

function collectAssetUrls(html, route) {
  const urls = [];
  const base = new URL(route, liveBase);
  for (const match of html.matchAll(assetPattern)) {
    const raw = match[1];
    if (raw.startsWith('data:')) {
      continue;
    }
    urls.push(new URL(raw, base).href);
  }
  return urls;
}

await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(assetRoot, { recursive: true });

const manifest = [];
const assetUrls = new Set();

for (const route of routeContract.requiredRoutes) {
  const url = new URL(route, liveBase).href;
  const { status, text } = await fetchText(url);
  const fileName = `${routeSlug(route)}.html`;
  await fs.writeFile(new URL(`html/${fileName}`, outputRoot), text);
  for (const assetUrl of collectAssetUrls(text, route)) {
    assetUrls.add(assetUrl);
  }
  manifest.push({ fileName, route, status, url });
}

const assets = [];
for (const assetUrl of [...assetUrls].sort()) {
  const fileName = assetFileName(assetUrl);
  const target = new URL(fileName, assetRoot);
  await fs.mkdir(path.dirname(target.pathname), { recursive: true });
  const asset = await fetchAsset(assetUrl);
  await fs.writeFile(target, asset.buffer);
  assets.push({ contentType: asset.contentType, fileName, status: asset.status, url: assetUrl });
}

await fs.writeFile(
  new URL('manifest.json', outputRoot),
  JSON.stringify({ assets, generatedAt: new Date().toISOString(), pages: manifest }, null, 2)
);

console.log(`captured ${manifest.length} routes and ${assets.length} assets`);
console.log(`manifest: ${new URL('manifest.json', outputRoot).pathname}`);
```

- [ ] **Step 2: Run the capture**

Run:

```bash
cd website && bun scripts/legacy-2015-capture.mjs
```

Expected: prints `captured 43 routes` or more if the route contract has been extended, writes `output/legacy-2015-source/manifest.json`, and downloads only referenced 2015 assets into `website/src/years/2015/assets/live/`.

- [ ] **Step 3: Inspect asset scope**

Run:

```bash
find website/src/years/2015/assets/live -type f | wc -l
find website/src/years/2015/assets/live -type f | sort | sed -n '1,120p'
```

Expected: a bounded list of 2015 logos, photos, speaker images, and referenced assets. If this downloads unrelated current-site HTML or tracking assets, delete those unrelated files before committing.

- [ ] **Step 4: Commit Task 2 source files and selected assets**

Run:

```bash
git add website/scripts/legacy-2015-capture.mjs website/src/years/2015/assets/live
git commit -m "chore: capture 2015 source assets"
```

Do not add `output/legacy-2015-source`.

## Task 3: Generate Typed 2015 Page Data

**Files:**
- Create: `website/src/years/2015/data/types.ts`
- Create: `website/scripts/legacy-2015-generate-pages.mjs`
- Create: `website/src/years/2015/data/pages.ts`

- [ ] **Step 1: Create the data types**

Create `website/src/years/2015/data/types.ts`:

```ts
export type Legacy2015PageKind = 'html' | 'compatibility';

export type Legacy2015Page = {
  route: string;
  title: string;
  description: string;
  kind: Legacy2015PageKind;
  bodyHtml: string;
};

export type Legacy2015NavItem = {
  label: string;
  href: string;
};

export type Legacy2015NavGroup = {
  label: string;
  items: readonly Legacy2015NavItem[];
};
```

- [ ] **Step 2: Write the page generator**

Create `website/scripts/legacy-2015-generate-pages.mjs`:

```js
import fs from 'node:fs/promises';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const sourceRoot = new URL('../../output/legacy-2015-source/html/', import.meta.url);
const target = new URL('../src/years/2015/data/pages.ts', import.meta.url);

function routeSlug(route) {
  return route.replace(/^\/|\/$/gu, '').replace(/[^a-z0-9]+/giu, '-');
}

function matchFirst(source, pattern) {
  return source.match(pattern)?.[1] ?? '';
}

function stripTags(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeRouteLinks(html) {
  return html
    .replace(/\s(?:href|src)=["']\/(about|schedule|sponsor|venue)([^"']*)["']/giu, (match, prefix, rest) =>
      match.replace(`/${prefix}${rest}`, `/2015/${prefix}${rest}`)
    )
    .replace(/\s(?:href|src)=["']\/(css|js|images|speakers)([^"']*)["']/giu, (match, prefix, rest) =>
      match.replace(`/${prefix}${rest}`, `/2015/${prefix}${rest}`)
    )
    .replace(/\s(?:href|src)=["']css\//giu, (match) => match.replace('css/', '/2015/css/'))
    .replace(/\s(?:href|src)=["']js\//giu, (match) => match.replace('js/', '/2015/js/'))
    .replace(/\s(?:href|src)=["']images\//giu, (match) => match.replace('images/', '/2015/images/'));
}

function extractBody(html) {
  const afterNav = html.split(/<\/nav>/iu)[1] ?? html;
  const beforeScripts = afterNav.split(/<script\b/iu)[0] ?? afterNav;
  return normalizeRouteLinks(beforeScripts.trim());
}

function routeToCapturedFile(route) {
  return new URL(`${routeSlug(route)}.html`, sourceRoot);
}

const pages = [];

for (const route of routeContract.requiredRoutes) {
  const html = await fs.readFile(routeToCapturedFile(route), 'utf8');
  const title = stripTags(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/iu));
  const description = stripTags(
    matchFirst(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/iu)
  );
  const isCompatibility = routeContract.compatibilityRoutes.includes(route);
  const bodyHtml = isCompatibility
    ? `<pre class="compatibility-source">${stripTags(html)}</pre>`
    : extractBody(html);

  pages.push({
    bodyHtml,
    description,
    kind: isCompatibility ? 'compatibility' : 'html',
    route,
    title,
  });
}

const moduleSource = `import type { Legacy2015Page } from './types';

export const legacy2015Pages = ${JSON.stringify(pages, null, 2)} as const satisfies readonly Legacy2015Page[];

export function getLegacy2015Page(route: string): Legacy2015Page {
  const page = legacy2015Pages.find((candidate) => candidate.route === route);

  if (!page) {
    throw new Error(\`Missing 2015 page data for route: \${route}\`);
  }

  return page;
}
`;

await fs.writeFile(target, moduleSource);
console.log(`wrote ${target.pathname}`);
```

- [ ] **Step 3: Generate page data**

Run:

```bash
cd website && bun scripts/legacy-2015-generate-pages.mjs
```

Expected: `website/src/years/2015/data/pages.ts` exists and includes one `legacy2015Pages` entry for every route in `routes.json`.

- [ ] **Step 4: Verify generated coverage**

Run:

```bash
cd website && bun -e "import routes from './src/years/2015/data/routes.json' with { type: 'json' }; import { legacy2015Pages } from './src/years/2015/data/pages.ts'; if (routes.requiredRoutes.length !== legacy2015Pages.length) process.exit(1); console.log(legacy2015Pages.length)"
```

Expected: prints the same count as `requiredRoutes`.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add website/src/years/2015/data/types.ts website/scripts/legacy-2015-generate-pages.mjs website/src/years/2015/data/pages.ts
git commit -m "chore: generate 2015 page data"
```

## Task 4: Build The 2015 Layout, Navigation, And Styles

**Files:**
- Create: `website/src/years/2015/data/navigation.ts`
- Create: `website/src/years/2015/components/Layout2015.astro`
- Create: `website/src/years/2015/components/Navbar2015.astro`
- Create: `website/src/years/2015/components/PageContent2015.astro`
- Create: `website/src/years/2015/components/CompatibilityAsset2015.astro`
- Create: `website/src/years/2015/styles/legacy2015.css`

- [ ] **Step 1: Create exact nav data**

Create `website/src/years/2015/data/navigation.ts`:

```ts
import type { Legacy2015NavGroup } from './types';

export const legacy2015NavGroups = [
  {
    label: 'About',
    items: [
      { href: '/2015/about/what-is-pycon/', label: 'What is PyCon?' },
      { href: '/2015/about/code-of-conducts/', label: 'Code of Conducts' },
      { href: '/2015/about/staffs/', label: 'Staffs' },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/2015/schedule/', label: 'Schedule' },
      { href: 'http://bit.ly/pyconhk2015-cfp', label: 'Call For Proposals' },
    ],
  },
  {
    label: 'Sponsors',
    items: [
      { href: '/2015/sponsor/', label: 'PyCON HK 2015 Sponsors' },
      { href: '/2015/sponsor/prospectus/', label: 'Sponsorship Prospectus' },
    ],
  },
  {
    label: 'Venue',
    items: [
      { href: '/2015/venue/', label: 'Venue Map' },
      { href: '/2015/venue/hotels/', label: 'Hotels' },
    ],
  },
  {
    label: 'Attend',
    items: [
      { href: 'https://pycon-hk-2015.eventbrite.com/', label: 'Registration' },
      { href: 'http://bit.ly/pyconhk2015-faa', label: 'Financial Aid' },
    ],
  },
] as const satisfies readonly Legacy2015NavGroup[];

export const legacy2015TicketHref = 'https://pycon-hk-2015.eventbrite.com/';
```

- [ ] **Step 2: Create the navbar component**

Create `website/src/years/2015/components/Navbar2015.astro` with a checkbox-backed mobile collapse so it works without shipping jQuery/Bootstrap JS:

```astro
---
import { legacy2015NavGroups, legacy2015TicketHref } from '@/years/2015/data/navigation';
---

<nav class="legacy-2015-navbar" aria-label="PyCon HK 2015 navigation">
  <div class="legacy-2015-container legacy-2015-navbar-inner">
    <a class="legacy-2015-brand" href="/2015/">PyCON HK 2015</a>
    <input id="legacy-2015-nav-toggle" class="legacy-2015-nav-checkbox" type="checkbox" />
    <label class="legacy-2015-nav-toggle" for="legacy-2015-nav-toggle">
      <span class="sr-only">Toggle navigation</span>
      <span></span>
      <span></span>
      <span></span>
    </label>
    <div class="legacy-2015-nav-menu">
      <ul class="legacy-2015-nav-list">
        {
          legacy2015NavGroups.map((group) => (
            <li class="legacy-2015-dropdown">
              <a href="#" class="legacy-2015-dropdown-label">
                {group.label} <span class="legacy-2015-caret" />
              </a>
              <ul class="legacy-2015-dropdown-menu">
                {group.items.map((item) => (
                  <li>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))
        }
      </ul>
      <ul class="legacy-2015-nav-list legacy-2015-nav-right">
        <li class="legacy-2015-nav-highlight">
          <a href={legacy2015TicketHref}>Get Ticket</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

- [ ] **Step 3: Create the layout component**

Create `website/src/years/2015/components/Layout2015.astro`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Navbar2015 from './Navbar2015.astro';
import '@/years/2015/styles/legacy2015.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <div class="legacy-2015-site">
    <Navbar2015 />
    <slot />
  </div>
</BaseLayout>
```

- [ ] **Step 4: Create content renderers**

Create `website/src/years/2015/components/PageContent2015.astro`:

```astro
---
import type { Legacy2015Page } from '@/years/2015/data/types';

interface Props {
  page: Legacy2015Page;
}

const { page } = Astro.props;
---

<Fragment set:html={page.bodyHtml} />
```

Create `website/src/years/2015/components/CompatibilityAsset2015.astro`:

```astro
---
import type { Legacy2015Page } from '@/years/2015/data/types';

interface Props {
  page: Legacy2015Page;
}

const { page } = Astro.props;
---

<main class="legacy-2015-container legacy-2015-compatibility">
  <h1>{page.route}</h1>
  <Fragment set:html={page.bodyHtml} />
</main>
```

- [ ] **Step 5: Create the compact 2015 stylesheet**

Create `website/src/years/2015/styles/legacy2015.css`. Start with this base, then tune from pixel diffs:

```css
.legacy-2015-site {
  min-height: 100vh;
  background: #fff;
  color: #333;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.42857143;
  padding-top: 50px;
}

.legacy-2015-site a {
  color: #337ab7;
  text-decoration: none;
}

.legacy-2015-site a:focus,
.legacy-2015-site a:hover {
  color: #23527c;
  text-decoration: underline;
}

.legacy-2015-container,
.legacy-2015-site .container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
}

@media (min-width: 768px) {
  .legacy-2015-container,
  .legacy-2015-site .container {
    width: 750px;
  }
}

@media (min-width: 992px) {
  .legacy-2015-container,
  .legacy-2015-site .container {
    width: 970px;
  }
}

@media (min-width: 1200px) {
  .legacy-2015-container,
  .legacy-2015-site .container {
    width: 1170px;
  }
}

.legacy-2015-navbar {
  background: #222;
  border-bottom: 1px solid #080808;
  left: 0;
  min-height: 50px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1030;
}

.legacy-2015-navbar-inner {
  align-items: stretch;
  display: flex;
  min-height: 50px;
  position: relative;
}

.legacy-2015-brand {
  color: #9d9d9d;
  display: block;
  font-size: 18px;
  line-height: 20px;
  padding: 15px;
}

.legacy-2015-brand:hover {
  color: #fff;
  text-decoration: none;
}

.legacy-2015-nav-checkbox {
  display: none;
}

.legacy-2015-nav-toggle {
  border: 1px solid #333;
  border-radius: 4px;
  cursor: pointer;
  display: none;
  margin: 8px 15px 8px auto;
  padding: 9px 10px;
}

.legacy-2015-nav-toggle span:not(.sr-only) {
  background: #fff;
  border-radius: 1px;
  display: block;
  height: 2px;
  margin-top: 4px;
  width: 22px;
}

.legacy-2015-nav-menu {
  display: flex;
  flex: 1;
}

.legacy-2015-nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.legacy-2015-nav-right {
  margin-left: auto;
}

.legacy-2015-dropdown {
  position: relative;
}

.legacy-2015-dropdown-label,
.legacy-2015-nav-highlight a {
  color: #9d9d9d;
  display: block;
  line-height: 20px;
  padding: 15px;
}

.legacy-2015-dropdown:hover .legacy-2015-dropdown-menu {
  display: block;
}

.legacy-2015-dropdown-menu {
  background: #fff;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 4px;
  box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
  display: none;
  left: 0;
  list-style: none;
  margin: 2px 0 0;
  min-width: 160px;
  padding: 5px 0;
  position: absolute;
  top: 100%;
}

.legacy-2015-dropdown-menu a {
  color: #333;
  display: block;
  line-height: 1.42857143;
  padding: 3px 20px;
  white-space: nowrap;
}

.legacy-2015-site .jumbotron {
  background-color: #eee;
  margin-bottom: 30px;
  padding: 48px 0;
}

.legacy-2015-site .jumbotron h1 {
  font-size: 63px;
  line-height: 1;
}

.legacy-2015-site h1,
.legacy-2015-site h2,
.legacy-2015-site h3 {
  font-family: inherit;
  font-weight: 500;
  line-height: 1.1;
}

.legacy-2015-site h2 {
  font-size: 30px;
}

.legacy-2015-site h3 {
  font-size: 24px;
}

.legacy-2015-site .row {
  margin-left: -15px;
  margin-right: -15px;
}

.legacy-2015-site .row::after,
.legacy-2015-site .row::before {
  clear: both;
  content: " ";
  display: table;
}

.legacy-2015-site [class*="col-"] {
  min-height: 1px;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
}

@media (min-width: 768px) {
  .legacy-2015-site .col-sm-5 {
    float: left;
    width: 41.66666667%;
  }
}

@media (min-width: 992px) {
  .legacy-2015-site .col-md-4 {
    float: left;
    width: 33.33333333%;
  }

  .legacy-2015-site .col-md-8 {
    float: left;
    width: 66.66666667%;
  }

  .legacy-2015-site .col-md-12 {
    float: left;
    width: 100%;
  }
}

.legacy-2015-site .btn {
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-block;
  font-size: 14px;
  line-height: 1.42857143;
  margin-bottom: 0;
  padding: 6px 12px;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}

.legacy-2015-site .btn-primary {
  background: #337ab7;
  border-color: #2e6da4;
  color: #fff;
}

.legacy-2015-site .btn-lg {
  border-radius: 6px;
  font-size: 18px;
  line-height: 1.3333333;
  padding: 10px 16px;
}

.legacy-2015-site .img-thumbnail {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  height: auto;
  line-height: 1.42857143;
  max-width: 100%;
  padding: 4px;
}

.legacy-2015-site footer {
  margin: 20px 0;
}

@media (max-width: 767px) {
  .legacy-2015-navbar-inner {
    flex-wrap: wrap;
  }

  .legacy-2015-nav-toggle {
    display: block;
  }

  .legacy-2015-nav-menu {
    border-top: 1px solid #101010;
    display: none;
    flex-basis: 100%;
    flex-direction: column;
  }

  .legacy-2015-nav-checkbox:checked ~ .legacy-2015-nav-menu {
    display: flex;
  }

  .legacy-2015-nav-list,
  .legacy-2015-nav-right {
    display: block;
    margin-left: 0;
  }

  .legacy-2015-dropdown-menu {
    background: transparent;
    border: 0;
    box-shadow: none;
    display: block;
    margin: 0;
    padding-left: 20px;
    position: static;
  }

  .legacy-2015-dropdown-menu a {
    color: #9d9d9d;
    padding: 5px 15px;
  }

  .legacy-2015-site .jumbotron h1 {
    font-size: 36px;
  }
}
```

- [ ] **Step 6: Verify style compiles**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:typecheck
```

Expected: typecheck exits 0 once pages are added in Task 5; before then it may fail if the components are unreachable but syntactically invalid. Fix syntax errors before moving on.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add website/src/years/2015/data/navigation.ts website/src/years/2015/components website/src/years/2015/styles
git commit -m "feat: add 2015 microsite shell"
```

## Task 5: Wire 2015 Astro Routes

**Files:**
- Modify: `website/src/pages/2015/index.astro`
- Delete: `website/src/pages/2015/[slug]/index.astro`
- Create: `website/src/pages/2015/[...path].astro`

- [ ] **Step 1: Replace the homepage route**

Replace `website/src/pages/2015/index.astro` with:

```astro
---
import Layout2015 from '@/years/2015/components/Layout2015.astro';
import PageContent2015 from '@/years/2015/components/PageContent2015.astro';
import { getLegacy2015Page } from '@/years/2015/data/pages';

const page = getLegacy2015Page('/2015/');
---

<Layout2015 title={page.title} description={page.description}>
  <PageContent2015 page={page} />
</Layout2015>
```

- [ ] **Step 2: Remove the old one-segment highlight route**

Delete `website/src/pages/2015/[slug]/index.astro`. The route would conflict conceptually with the new catch-all and the 2015 photos page should use `/2015/photos/` inside the 2015 shell.

- [ ] **Step 3: Add the catch-all route**

Create `website/src/pages/2015/[...path].astro`:

```astro
---
import CompatibilityAsset2015 from '@/years/2015/components/CompatibilityAsset2015.astro';
import Layout2015 from '@/years/2015/components/Layout2015.astro';
import PageContent2015 from '@/years/2015/components/PageContent2015.astro';
import { legacy2015Pages } from '@/years/2015/data/pages';

function routeFromPath(path: string | undefined): string {
  return `/2015/${path ? `${path}/` : ''}`;
}

export function getStaticPaths() {
  return legacy2015Pages
    .filter((page) => page.route !== '/2015/')
    .map((page) => ({
      params: { path: page.route.replace(/^\/2015\/|\/$/gu, '') },
      props: { page },
    }));
}

const { page } = Astro.props;
const requestedRoute = routeFromPath(Astro.params.path);

if (requestedRoute !== page.route) {
  throw new Error(`2015 route mismatch: requested ${requestedRoute}, got ${page.route}`);
}
---

<Layout2015 title={page.title} description={page.description}>
  {page.kind === 'compatibility' ? (
    <CompatibilityAsset2015 page={page} />
  ) : (
    <PageContent2015 page={page} />
  )}
</Layout2015>
```

- [ ] **Step 4: Build and run the route contract**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:build
cd website && bun run test:legacy-2015
```

Expected: build exits 0 and `test:legacy-2015` passes. If it fails for the encoded Cantonese route, inspect `website/dist/2015/schedule/topics/` and adjust the catch-all path encoding while preserving the public encoded URL.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add website/src/pages/2015
git commit -m "feat: route 2015 microsite pages"
```

## Task 6: Replace Raw Legacy Images With Astro-Managed Assets

**Files:**
- Create: `website/src/years/2015/data/assets.ts`
- Modify: `website/src/years/2015/components/PageContent2015.astro`
- Modify: `website/src/years/2015/data/pages.ts`

- [ ] **Step 1: Create the asset resolver**

Create `website/src/years/2015/data/assets.ts`:

```ts
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/live/**/*.{gif,jpeg,jpg,png,webp}',
  { eager: true }
);

function normalizeKey(source: string): string {
  return source
    .replace(/^https?:\/\/[^/]+/u, '')
    .replace(/^\/2015\//u, '')
    .replace(/^\//u, '');
}

export async function resolveLegacy2015HtmlImages(html: string): Promise<string> {
  let resolvedHtml = html;

  for (const [modulePath, moduleValue] of Object.entries(imageModules)) {
    const key = modulePath.split('/assets/live/')[1];
    const optimized = await getImage({ src: moduleValue.default });
    const candidates = [
      key,
      `/${key}`,
      `/2015/${key}`,
      `/2015/${normalizeKey(key)}`,
    ];

    for (const candidate of candidates) {
      resolvedHtml = resolvedHtml.split(candidate).join(optimized.src);
    }
  }

  return resolvedHtml;
}
```

- [ ] **Step 2: Resolve images before rendering HTML**

Modify `website/src/years/2015/components/PageContent2015.astro`:

```astro
---
import { resolveLegacy2015HtmlImages } from '@/years/2015/data/assets';
import type { Legacy2015Page } from '@/years/2015/data/types';

interface Props {
  page: Legacy2015Page;
}

const { page } = Astro.props;
const bodyHtml = await resolveLegacy2015HtmlImages(page.bodyHtml);
---

<Fragment set:html={bodyHtml} />
```

- [ ] **Step 3: Verify generated HTML uses Astro asset URLs**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:build
rg -n "/2015/images|/speakers/" website/dist/2015 || true
rg -n "_astro" website/dist/2015 | sed -n '1,40p'
```

Expected: important rendered images use `/_astro/` URLs. Remaining `/2015/images` or `/speakers` references should be CSS/JS compatibility source text only, not visible page images.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add website/src/years/2015/data/assets.ts website/src/years/2015/components/PageContent2015.astro website/src/years/2015/data/pages.ts
git commit -m "feat: optimize 2015 page images"
```

## Task 7: Add Live Parity And Pixel Diff Verification

**Files:**
- Create: `website/scripts/legacy-2015-live-parity.mjs`
- Create: `website/scripts/legacy-2015-pixel-diff.mjs`
- Modify: `website/package.json`

- [ ] **Step 1: Add live parity script**

Create `website/scripts/legacy-2015-live-parity.mjs`:

```js
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const localBase = process.env.LOCAL_BASE || 'http://127.0.0.1:8790';
const liveBase = process.env.LIVE_BASE || 'https://pycon.hk';

function stripTags(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function titleOf(html) {
  return stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] ?? '');
}

async function fetchPage(base, route) {
  const response = await fetch(new URL(route, base), {
    headers: { 'user-agent': 'pyconhk-2015-live-parity/1.0' },
  });
  const html = await response.text();
  return {
    bodySample: stripTags(html).slice(0, 240),
    html,
    status: response.status,
    title: titleOf(html),
  };
}

const failures = [];

for (const route of routeContract.requiredRoutes) {
  const [local, live] = await Promise.all([
    fetchPage(localBase, route),
    fetchPage(liveBase, route),
  ]);

  if (local.status !== live.status) {
    failures.push(`${route}: status local ${local.status} vs live ${live.status}`);
  }

  if (local.title !== live.title) {
    failures.push(`${route}: title local "${local.title}" vs live "${live.title}"`);
  }

  if (!routeContract.compatibilityRoutes.includes(route) && local.bodySample.length < 80) {
    failures.push(`${route}: local body sample is unexpectedly short`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`2015 live parity passed for ${routeContract.requiredRoutes.length} routes`);
```

- [ ] **Step 2: Add pixel-diff wrapper**

Create `website/scripts/legacy-2015-pixel-diff.mjs`:

```js
import { spawnSync } from 'node:child_process';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const outDir = '../output/playwright/2015-parity';
const args = [
  'scripts/ui-diff.mjs',
  '--out',
  outDir,
  '--local-base',
  process.env.LOCAL_BASE || 'http://127.0.0.1:8790',
  '--live-base',
  process.env.LIVE_BASE || 'https://pycon.hk',
  '--viewports',
  'desktop,mobile',
  '--concurrency',
  '1',
  ...routeContract.visualSampleRoutes.flatMap((route) => ['--path', route]),
];

const result = spawnSync('bun', args, {
  cwd: new URL('..', import.meta.url),
  env: process.env,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
```

- [ ] **Step 3: Add package scripts and wire route contract into check**

Modify `website/package.json`:

```json
"test:legacy-2015": "bun test scripts/legacy-2015-route-contract.test.mjs",
"parity:2015": "bun scripts/legacy-2015-live-parity.mjs",
"diff:2015": "bun scripts/legacy-2015-pixel-diff.mjs"
```

Then modify the `check` script so it includes `bun run test:legacy-2015` after `bun run test:legacy-html`.

- [ ] **Step 4: Run route and build verification**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
```

Expected: both commands exit 0.

- [ ] **Step 5: Run preview parity**

Start preview in one terminal:

```bash
cd website && bun run preview --host 127.0.0.1 --port 8790
```

In another terminal:

```bash
cd website && bun run parity:2015
cd website && bun run diff:2015
```

Expected: `parity:2015` exits 0. `diff:2015` writes live, local, and diff screenshots plus `summary.json` under `output/playwright/2015-parity/`.

- [ ] **Step 6: Commit Task 7**

Run:

```bash
git add website/scripts/legacy-2015-live-parity.mjs website/scripts/legacy-2015-pixel-diff.mjs website/package.json
git commit -m "test: add 2015 parity verification"
```

## Task 8: Pixel-Diff Tuning And Completion Review

**Files:**
- Modify during diff tuning: `website/src/years/2015/styles/legacy2015.css`
- Modify during diff tuning: `website/src/years/2015/components/*.astro`
- Modify during content correction: `website/src/years/2015/data/pages.ts`
- Update when 2015 ticket status changes: `specs/todo.md`

- [ ] **Step 1: Review diff summary**

Run:

```bash
jq -r '.results[] | [.urlPath, .viewport, (.diff.changedRatio // -1), (.notes | join("; "))] | @tsv' output/playwright/2015-parity/summary.json
```

Expected: each sample route has screenshots and a numeric changed ratio. Large deltas should correspond to known browser noise or specific visual issues to fix.

- [ ] **Step 2: Tune the largest structural deltas**

Inspect the largest diff images first:

```bash
find output/playwright/2015-parity -name '*-diff.png' -print | sort
```

Fix issues in this order:

1. Wrong route status or wrong rendered page.
2. Missing images or non-optimized image references.
3. Navbar height, mobile collapse, dropdown placement.
4. Jumbotron dimensions, heading sizes, and top spacing.
5. Sponsor/logo sizing and schedule table spacing.
6. Footer and body text offsets.

- [ ] **Step 3: Re-run final verification**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
cd website && bun run parity:2015
cd website && bun run diff:2015
```

Expected: check/build/parity exit 0. Pixel diffs are materially close with no missing images, wrong fonts, wrong pages, broken navbar, or large vertical offset.

- [ ] **Step 4: Record remaining accepted visual noise**

If pixel diffs show only acceptable antialiasing or third-party-script differences, add a short note to `output/playwright/2015-parity/summary-notes.md`:

```md
# 2015 Parity Notes

- Accepted browser/font antialiasing differences remain in screenshot diffs.
- No accepted differences include missing content, missing images, route status mismatch, title mismatch, or mobile navbar expansion.
```

- [ ] **Step 5: Commit final 2015 tuning**

Run:

```bash
git add website/src/years/2015 website/src/pages/2015 website/scripts website/package.json specs/todo.md
git commit -m "feat: match 2015 legacy microsite"
```

If `specs/todo.md` was not changed in this task, omit it from `git add`.

## Final Acceptance Criteria

- `MISE_EXPERIMENTAL=0 mise run //website:check` exits 0.
- `MISE_EXPERIMENTAL=0 mise run //website:build` exits 0.
- `cd website && bun run test:legacy-2015` exits 0.
- `cd website && bun run parity:2015` exits 0 against a local preview.
- `cd website && bun run diff:2015` writes `output/playwright/2015-parity/summary.json` and diff images.
- `/2015/` no longer renders the generic highlight landing.
- `/2015/photos/` is the canonical 2015 photo route.
- The required live 2015 routes, including CSS/JS-looking routes, have local built output.
- User-facing 2015 images render through Astro-generated asset URLs where visible.
- No full historical static-site tree is copied into `website/public/`.

## Follow-On Pattern For Other Years

After 2015 is accepted, reuse this pattern for 2016 and 2017 first because they are structurally similar older microsites with broad route gaps. Then use the already-created review tickets in `specs/todo.md` to prioritize 2018-2024 work by value instead of attempting every historical theme difference at once.
