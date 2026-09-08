# PyCon Hong Kong Website Monorepo

This repository contains the PyCon Hong Kong public website and the Decap CMS app.

The public site is an Astro app under `website/`. The CMS for `cms.pycon.hk` is an Astro + Decap app under `cms/`. The repository root is a mise monorepo root that provides shared orchestration for checking, building, and previewing both apps.

## Tech Stack

- Astro 7
- Tailwind CSS 4
- Biome for linting and formatting
- Bun 1.3.10 for package management and script execution
- Node.js 24.18.0 for Astro tooling
- Outstatic-compatible repository content files for news content
- Decap CMS under `cms/` for multilingual editorial updates
- Playwright for website, CMS and publishing E2E tests

## Repository Layout

- `website/` - public website app, routes, components, content loaders, data, and static assets
- `website/outstatic/` - committed news content and metadata consumed by the website
- `website/public/` - public website static assets served as-is
- `website/src/years/*/e2e/`, `website/e2e/`, `cms/e2e/` and `e2e/` - self-contained E2E suites
- `cms/publication/` - runtime publication and editorial content gates
- `.github/deploy/` - website and CMS deployment implementation
- `website/integrations/` - Astro build integration for public programme data and output
- `cms/` - Astro + Decap CMS app for `cms.pycon.hk`
- `archived/website-nextjs/` - archived copy of the old site for reference only

## Prerequisites

- mise 2026.6.14 or newer
- Bun 1.3.10, provisioned by mise
- Node.js 24.18.0, provisioned by mise

## Quick Start

```bash
mise install
mise run install
mise run //website:dev
```

The website dev command starts the public website Astro dev server.
For production-style browser checks, use `mise run preview`; it builds the website and serves `website/dist/` with Astro preview on port 8788.

## Mise Monorepo

The root `mise.toml` marks the repository as the monorepo root with `monorepo_root = true` and declares explicit `[monorepo].config_roots` for `website/` and `cms/`.

Run app tasks from the repository root with mise monorepo task paths:

- `mise run //...:check` targets every configured app root with a `check` task
- `mise run //website:build` targets only the public website app
- `mise run //cms:build` targets only the CMS app

This setup uses the current stable mise monorepo settings.

## Common Commands

- `mise install` - install Node 24.18.0 and Bun 1.3.10 from mise
- `mise run install` - install dependencies for both apps sequentially
- `mise run //...:build` - build every app with a local `build` task
- `mise run //...:check` - check every app with a local `check` task
- `mise run //...:lint` - lint every app with a local `lint` task
- `mise run //website:dev` - start the public website Astro dev server
- `mise run //website:build` - build the public website only
- `mise run //website:check` - check the public website only
- `mise run //website:lint` - lint the public website only
- `mise run //website:e2e` - run public website Playwright E2E tests through Wrangler Pages
- `mise run //cms:dev` - start the CMS Astro dev server
- `mise run //cms:build` - build the CMS app only
- `mise run //cms:check` - check the CMS app only
- `mise run //cms:lint` - lint the CMS app only
- `mise run preview` - build and preview the generated website on `127.0.0.1:8788`
- `mise run cloudflare-preview` - build and preview through Wrangler Pages for redirect/runtime checks
- `mise run e2e` - run every website, CMS and publishing E2E suite
- `PLAYWRIGHT_BASE_URL=https://<green-hostname> mise run //website:e2e` - run the same E2E suite against a hosted green environment
- `mise run //website/src/years/2025/e2e:e2e` - run the complete 2025 E2E suite
- `mise run //cms:e2e` - build a local CMS Worker and run its E2E suite
- `CMS_BASE_URL=https://cms.pycon.hk mise run //cms:e2e` - verify the same read-only CMS flows on a hosted Worker
- `mise run //e2e:e2e` - run publishing and editorial boundary E2E tests in disposable repositories

## Routing Model

The site uses explicit locale-prefixed routes.

- current year pages: `/<locale>/...`
- archived year pages: `/<year>/<locale>/...`
- `/` resolves the preferred locale from cookies and redirects accordingly

Configured locales:

- `en`
- `zh-hk`
- `zh-hant`
- `zh-hans`
- `ja`

## Content Model

News posts are read from committed files under `website/outstatic/content/`.

- year folders use the pattern `<year>-posts`, for example `website/outstatic/content/2025-posts/`
- every news file must include a locale suffix, for example `slug.en.mdx` or `slug.zh-hk.mdx`
- bare filenames like `slug.mdx` are not supported
- localized variants are grouped by shared slug inside the same year folder
- expected frontmatter includes `collectionYear`, `title`, `publishedAt`, `status`, `slug`, `author.name`, and optional `author.picture` and `coverImage`

## Schedule Data

The conference schedule page no longer embeds the Pretalx widget.

Instead:

- Astro fetches the public Pretalx schedule JSON during its build lifecycle
- current programme normalization lives in `website/src/lib/programme/`
- `PROGRAMME_SOURCE_EVENT`, `PROGRAMME_SOURCE_URL` and `PROGRAMME_ENVIRONMENT` select the source
- `PROGRAMME_SNAPSHOT_PATH` can explicitly select a checked-in fixture for offline tests
- speaker routes are generated as `2026/<locale>/speakers/<name-slug>/index.html`
- the build output acts as the schedule snapshot for deployment

This means `mise run //website:build` currently expects network access to Pretalx.

## Tests and CI

All behavioral tests run through Playwright at the browser, HTTP or complete-command
boundary. There is one complete E2E suite per year, a cross-year website suite, a CMS
suite and a publishing suite. There is no separate unit or smoke tier. Typecheck and
lint remain static checks; the production content and deployment validators remain
part of their actual workflows.

Year-owned tests live beside the year's code under
`website/src/years/<year>/e2e/`. Each directory contains specs and a small mise task
that extends the root `playwright:e2e` task template:

```toml
[tasks.e2e]
extends = "playwright:e2e"
dir = "{{config_root}}/../../../.."
env = { E2E_SUITE = "2025" }
```

Add a new year by adding its directory, specs and task. Website Playwright discovers
these directories automatically. CI dynamically walks `**/e2e/mise.toml`, validates
the discovered mise tasks, and creates one matrix job per suite, including CMS.
No central year list, filename mapping or test-title grep needs updating.

`mise run e2e` runs the website, CMS and publishing suites concurrently. Website
projects share one build and one local Pages server. The CMS suite builds and starts
a local Worker with dummy OAuth credentials; publishing tests use disposable Git
repositories. CI builds the website once and shares that artifact between year jobs.
Bun dependencies are cached by OS and lockfile. Browser jobs use the Chrome already
installed on GitHub's Ubuntu 24.04 runners, avoiding per-job browser downloads and
apt updates. A green
`Validate Monorepo` requires discovery, build, static checks and every E2E job to pass.

Use `mise run //website/src/years/2025/e2e:e2e` for one year, or add
`PLAYWRIGHT_SKIP_BUILD=1` when reusing an existing build. Hosted website runs use
`PLAYWRIGHT_BASE_URL=... mise run //website:e2e`; hosted CMS runs use
`CMS_BASE_URL=... mise run //cms:e2e`. Local-only publishing scenarios never write
to hosted CMS content.

Deployment compares each app's build-input hash with its last successful hosted
manifest. Tests, CI, docs and changes confined to the other app do not deploy an
unchanged app. Shared dependencies and build configuration invalidate both apps.
The website also compares the public Pretalx hash, event and environment. A manual
force bypasses the skip; a missing manifest triggers the first deployment.

## Git and Workspace Notes

- the public website lives at `website/`
- the CMS app lives at `cms/`
- root `.gitignore` covers Astro/Bun build output and local tooling artifacts for both apps
- `cms` is a marketing-owned content branch; the CMS application itself deploys from the production code branch
- Decap writes content and media under `website/outstatic/...` and `website/public/outstatic/images/...`

## Build Output

- `website/dist/` - generated public website output
- `cms/dist/` - generated CMS output
- `website/.astro/` and `cms/.astro/` - local Astro cache and generated metadata
- `website/.wrangler/` - local Cloudflare/Wrangler artifacts when present

These paths are ignored by the repository `.gitignore`.

## Content and tests

CMS news uses locale-coded Markdown in `website/outstatic/content/<year>-posts/`.
Published 2026 content requires six complete translations; 2025 requires five.
Raw HTML is rejected and Markdown output is sanitized. Archived HTML stays in the
year-specific archive data and is covered by the archive regression tests.

Checks belong in the Node/Bun test suites or Playwright, not standalone verification
programs. `mise run check-cms-content` tests local content; `mise run check-cms-release`
fetches and tests `origin/cms`. `CMS_BASE_URL=https://cms.pycon.hk mise run //cms:check`
also runs the hosted editor, configuration and OAuth checks. Without that variable,
hosted tests are skipped. Build helpers are Astro integration functions; deployment
orchestration lives with its workflows in `.github/deploy/`.
