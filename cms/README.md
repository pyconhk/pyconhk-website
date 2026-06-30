# PyCon HK Website CMS

This repository now serves an Astro 7 + Decap CMS dashboard that edits content in the PyCon HK website repository.

## What It Does

- serves Decap CMS from Astro on Vercel
- authenticates editors with GitHub OAuth through Astro server endpoints
- commits content changes into `pyconhk/pyconhk-website`
- targets the website monorepo content paths under `website/outstatic/...`
- starts with multilingual Decap defaults using `en`, `zh-hk`, `zh-hant`, `zh-hans`, and `ja`

## Why There Is Still Custom Code

Decap provides the editor UI itself. The admin shell lives in `src/pages/admin/index.astro` and initializes the Decap bundle locally.

The TypeScript in this repository is the glue around that UI:

- `src/pages/admin/config.yml.ts` generates Decap config from environment variables
- `src/pages/api/decap/auth.ts` and `src/pages/api/decap/callback.ts` handle GitHub OAuth on Vercel
- `src/lib/cms-config.ts` defines the collections, fields, locales, and target content paths for the separate website repo

## Required Environment Variables

Copy `.env.local.example` to `.env.local` and set:

- `CMS_GITHUB_CLIENT_ID`
- `CMS_GITHUB_CLIENT_SECRET`
- `CMS_GITHUB_REPO`

Optional:

- `CMS_GITHUB_BRANCH` defaults to `cms`
- `CMS_GITHUB_OAUTH_SCOPE` defaults to `repo`
- `CMS_ACCESS_REPO` defaults to `CMS_GITHUB_REPO`
- `CMS_CONTENT_ROOT` defaults to `website/outstatic/content`
- `CMS_MEDIA_FOLDER` defaults to `website/public/outstatic/images`
- `CMS_PUBLIC_FOLDER` defaults to `/outstatic/images`
- `CMS_LOCALES` defaults to `en,zh-hk,zh-hant,zh-hans,ja`
- `CMS_DEFAULT_LOCALE` defaults to the first locale in `CMS_LOCALES`
- `CMS_PUBLIC_URL` is recommended for local development and Vercel production

## GitHub OAuth App

Create a GitHub OAuth app with:

- Homepage URL: your Astro CMS URL
- Authorization callback URL: `https://your-cms-domain/api/decap/callback`

For local development, you can use `http://localhost:4321/api/decap/callback` in a separate OAuth app or update the app callback URL while testing.

## Decap Configuration

The Decap backend config is generated dynamically at `src/pages/admin/config.yml.ts`, while the content collections live in `src/lib/cms-config.ts`.

The current CMS defaults assume explicit locale-coded filenames through Decap `multiple_files`, for example `slug.en.mdx` and `slug.zh-hk.mdx`.

Posts are managed through a single Decap collection. Editors choose a `Collection Year`, and Decap writes files into folders like `website/outstatic/content/2025-posts/slug.en.mdx` and `website/outstatic/content/2026-posts/slug.en.mdx` without needing a config change for each new year.

This repository assumes the target website repository uses an Astro-style content structure. You can adjust the shared root and locale settings with environment variables, then update `src/lib/cms-config.ts` to match the actual collections and fields in the real content repo before editors start writing production content.

Preview is disabled by default because the CMS is hosted in a different repository from the public website, so uploaded asset and rendered content previews would otherwise point at the wrong origin.

## Safe Test Mode

To try the multilingual editing flow without touching GitHub, open `/admin/test/`.

- this uses Decap's `test-repo` backend
- you can create entries and switch locales normally
- nothing is committed anywhere
- changes disappear after refresh

Use `/admin/` when you want the real GitHub-backed CMS.

## Persistent Local Sandbox

To test the full multilingual flow with files that persist locally but never go to GitHub:

1. from `cms/`, run `bun run cms:local-backend` in one terminal
2. from `cms/`, run `bun run dev` in another terminal
3. open `/admin/local/`

This mode writes into local sandbox paths inside this repo:

- content: `sandbox-content/`
- uploads: `public/sandbox-images/`

It is meant for trying filename patterns like `2026-posts/hello-world.en.mdx` and reopening entries locally. Sandbox files are git-ignored.

## Access Control

Right now `/` redirects straight to `/admin/`.

The Decap page itself is public, but editing access is limited by GitHub because users must authenticate and pass the repository access check performed in the callback route. By default that check uses `CMS_GITHUB_REPO`, and you can point `CMS_ACCESS_REPO` at another repository if you want CMS login to require access somewhere else.

If you want to hard-block the admin route itself, add an extra gate in front of `/admin/` and `/api/decap/*`, such as:

- Vercel Authentication or another upstream access layer
- a custom Astro middleware that checks the authenticated GitHub user against an allowlist or organization/team membership

## Commands

From the repository root, use mise monorepo task paths for CMS work:

```bash
mise install
mise run //cms:dev
mise run //cms:build
mise run //cms:check
mise run //cms:lint
```

Use repo-wide validation from the repository root when checking both apps:

```bash
mise run //...:check
mise run //...:build
```

When already working inside `cms/`, the direct app commands are:

```bash
bun install
bun run dev
bun run build
bun run check
bun run lint
```

The root `mise.toml` provisions Bun 1.3.10 and Node 26.4.0. It uses current stable mise monorepo settings with `monorepo_root = true` and explicit `[monorepo].config_roots` for `website/` and `cms/`.
