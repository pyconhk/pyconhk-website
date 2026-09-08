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
- Playwright for public website e2e smoke tests

## Repository Layout

- `website/` - public website app, routes, components, content loaders, data, and static assets
- `website/outstatic/` - committed news content and metadata consumed by the website
- `website/public/` - public website static assets served as-is
- `website/tests/` and `tests/` - repeatable tests, including archive and CMS contracts
- `website/integrations/` - Astro build integration for public programme data and output
- `cms/` - Astro + Decap CMS app for `cms.pycon.hk`
- `specs/` - migration notes, ADRs, and working specs
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
- `mise run //website:e2e` - run public website Playwright smoke tests through Wrangler Pages
- `mise run //cms:dev` - start the CMS Astro dev server
- `mise run //cms:build` - build the CMS app only
- `mise run //cms:check` - check the CMS app only
- `mise run //cms:lint` - lint the CMS app only
- `mise run preview` - build and preview the generated website on `127.0.0.1:8788`
- `mise run cloudflare-preview` - build and preview through Wrangler Pages for redirect/runtime checks
- `mise run e2e` - run the public website Playwright smoke tests
- `PLAYWRIGHT_BASE_URL=https://<green-hostname> mise run e2e` - run the same smoke tests against a hosted green environment
- `mise run smoke-cms-config -- https://cms.pycon.hk` - verify hosted Decap config branch, path, and locale policy

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

The PR workflow builds one shared website artifact using the checked-in public 2025
programme fixture. Each conference year runs its route and browser tests on a separate
Ubuntu runner. Shared tests and CMS checks have their own jobs. Playwright runs independent
cases in parallel within each runner. The required `Validate Monorepo` check succeeds only
when the build, unit tests and every year job pass.

Bun dependencies are cached by OS and lockfiles; Playwright browser binaries have a
separate cache. Jobs download the same build artifact instead of rebuilding the website.

Deployment compares each app's build-input hash with its last successful hosted manifest.
Tests, CI configuration, documentation and edits confined to the other app do not trigger
a website build/upload. Shared dependencies and build configuration invalidate both apps.
The website also compares the public Pretalx hash, source event and environment; `force`
in Run workflow bypasses the skip. A missing manifest triggers the first deployment.
The recorded commit remains the commit actually deployed, even when later unrelated
commits are skipped. All JavaScript Actions use Node 24; mise pins app commands to 24.18.0.
CMS content-generation tests create their own fixture build to exercise changed content.

From `website/`, use `bun run test:unit` for source tests, `bun run test:build` for an
existing build, or `TEST_YEAR=2026 PLAYWRIGHT_SKIP_BUILD=1 bunx playwright test` to run
one year's browser tests against existing output. Omit these variables for the full
browser suite with a fresh build. Completed migration and capture tools have been removed;
the archive content and regression tests remain.

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
- `cms/.vercel/` - local Vercel artifacts when present

These paths are ignored by the repository `.gitignore`.
