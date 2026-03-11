# PyCon Hong Kong Public Site

This repository contains the active PyCon Hong Kong public website.

The current site is built with Astro and Tailwind CSS at the repository root. The previous Next.js site is kept only as archived reference material under `archived/website-nextjs/`.

## Tech Stack

- Astro 5
- Tailwind CSS 4
- Biome for linting and formatting
- Bun for package management and script execution
- Outstatic content files for news content

## Repository Layout

- `src/` - application pages, layouts, components, content loaders, and data
- `public/` - static assets served as-is
- `outstatic/` - committed news content and metadata
- `specs/` - migration notes, ADRs, and working specs
- `archived/website-nextjs/` - archived copy of the old site for reference only

## Prerequisites

- Bun
- Node.js-compatible local environment for Astro tooling

## Quick Start

```bash
bun install
bun run dev
```

The local dev server starts with Astro's default development workflow.

## Common Commands

- `bun run dev` - start the local Astro dev server
- `bun run build` - build the static site into `dist/`
- `bun run preview` - preview the production build locally
- `bun run check` - run `astro check` and `biome check .`
- `bun run lint` - run Biome checks
- `bun run lint:fix` - apply safe Biome fixes
- `bun run format` - format the codebase with Biome
- `bun run format:check` - verify formatting without writing changes
- `bun run typecheck` - run Astro type checking only

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

News posts are read from committed files under `outstatic/content/`.

- year folders use the pattern `<year>-posts`, for example `outstatic/content/2025-posts/`
- every news file must include a locale suffix, for example `slug.en.mdx` or `slug.zh-hk.mdx`
- bare filenames like `slug.mdx` are not supported
- localized variants are grouped by shared slug inside the same year folder
- expected frontmatter includes `collectionYear`, `title`, `publishedAt`, `status`, `slug`, `author.name`, and optional `author.picture` and `coverImage`

## Schedule Data

The conference schedule page no longer embeds the Pretalx widget.

Instead:

- Astro fetches Pretalx schedule JSON during build
- the normalization logic lives in `src/lib/schedule.ts`
- editorial overrides live in `src/years/2025/data/schedule-overrides.ts`
- the build output acts as the schedule snapshot for deployment

This means `bun run build` currently expects network access to Pretalx.

## Git and Workspace Notes

- the active site lives at the repository root
- root `.gitignore` covers current Astro/Bun build output and local tooling artifacts
- tracked files from the old site are not automatically hidden by `.gitignore`; they still need explicit git cleanup if removed from history or staging

## Build Output

- `dist/` - generated static site output
- `.astro/` - local Astro cache and generated metadata
- `.wrangler/` - local Cloudflare/Wrangler artifacts when present

These paths are ignored by the repository `.gitignore`.
