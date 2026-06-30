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

## Repository Layout

- `website/` - public website app, routes, components, content loaders, data, and static assets
- `website/outstatic/` - committed news content and metadata consumed by the website
- `website/public/` - public website static assets served as-is
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
- `mise run //cms:dev` - start the CMS Astro dev server
- `mise run //cms:build` - build the CMS app only
- `mise run //cms:check` - check the CMS app only
- `mise run //cms:lint` - lint the CMS app only
- `mise run preview` - build and preview the generated website on `127.0.0.1:8788`
- `mise run cloudflare-preview` - build and preview through Wrangler Pages for redirect/runtime checks

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

- Astro fetches Pretalx schedule JSON during build
- the normalization logic lives in `website/src/lib/schedule.ts`
- editorial overrides live in `website/src/years/2025/data/schedule-overrides.ts`
- the build output acts as the schedule snapshot for deployment

This means `mise run //website:build` currently expects network access to Pretalx.

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
