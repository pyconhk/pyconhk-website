# Public Site Astro Migration Specification

## Purpose

This document defines the target architecture and delivery requirements for migrating the public PyCon Hong Kong website from the current Next.js implementation to Astro.

The scope of this specification is the public website only. `cms.pycon.hk` remains a separate editorial system. The active Astro app lives at the repository root, while the current Next.js implementation is archived for reference.

## Problem Statement

The current public site mixes several concerns in one layer:

- current-year conference pages
- internal navigation rules
- news rendering from repository-managed content

This increases maintenance cost and makes deployment behavior harder to predict.

## Primary Goals

### Product Goals

- Deliver a stable public conference website with explicit bilingual routes.
- Treat English and Cantonese as equal first-class locales.
- Preserve editorial workflows for news and business-managed content.
- Improve confidence in rollout and rollback.
- Start from a clean root-level application structure instead of continuing under `website/`.

### Technical Goals

- Move the public site to Astro.
- Move the active application from `website/` to the repository root.
- Replace implicit rewrite-driven navigation with explicit route structure.
- Reduce hardcoded year and locale duplication.
- Render content from repository-managed source files with a cleaner pipeline.
- Reduce unnecessary client-side behavior where static generation is sufficient.
- Standardize the active app toolchain around Biome and Bun-friendly workflows.

## Non-Goals

- Replacing Outstatic.
- Migrating `cms.pycon.hk`.
- Building authenticated product features.
- Re-implementing legacy WordPress redirects or proxy behavior in the first Astro foundation.
- Reworking business editorial processes during the first migration phase.

## Stakeholders

- conference organizers
- content editors and business users
- developers maintaining the public website
- users arriving from search engines in English and Cantonese
- users following legacy links from older PyCon Hong Kong pages

## Functional Requirements

### Routing

- Every public localized page must live under `/<locale>/...` for the current year or `/<year>/<locale>/...` for archive years.
- Neutral entry points must support cookie-based locale redirection.
- Locale URLs must remain directly shareable and indexable.

### Locales

- English and Cantonese must both be supported as first-class locales.
- Preferred locale must be stored in a cookie.
- Locale switching must update the cookie.
- Locale switching should preserve the current page when an equivalent translation exists.

### Content

- News content must continue to be editable through Outstatic.
- The public site must consume committed content from the repository.
- Public rendering must not depend on embedding CMS runtime behavior into the website app.

### Deployment

- The migration must use blue-green deployment.
- Rollback must be fast and operationally simple.

## Proposed Architecture

## 1. Public Site Layer

The public website is implemented in Astro and is responsible for:

- page rendering
- layout composition
- SEO metadata
- localized route structure
- static page generation
- island-based client interactivity only where needed

## 2. Editorial Content Source

Outstatic remains external to the public website runtime. The public site reads repository-managed content produced by the CMS workflow.

This means the site should treat committed content files and their related metadata as inputs, not as services that need to be embedded into the app.

## 3. Workspace And Tooling Layer

The root-level app should use a clean, low-friction toolchain that matches the migration goals.

Requirements:

- Biome is the formatter and linter for the active app.
- Root editor defaults should align with Biome.
- The active app should be Bun-friendly for install and script execution.
- Archived implementation details should stay isolated from root-level build and typecheck scope.

## URL Model

## Canonical Pattern

All localized public pages use one of these canonical patterns:

- current year: `/<locale>/...`
- archive years: `/<year>/<locale>/...`

Examples:

- `/en/`
- `/zh-hk/`
- `/en/news`
- `/2025/zh-hk/`
- `/2025/zh-hk/news`

## Neutral Entry Routes

The root route exists only to improve first-load user experience and should redirect quickly:

- `/` -> redirects to the current year + preferred locale, landing on `/<locale>/...`

When `<year>` is the current year, `/<year>/<locale>/...` redirects to `/<locale>/...`.

These redirects may use a minimal inline script and cookie lookup as already desired by the project.

## Locale Fallback Policy

The project must decide one of the following and document it clearly:

- locale-pure behavior: untranslated pages return a localized not-available state
- cross-locale fallback: untranslated pages redirect or fall back to the other language

The recommended default is locale-pure behavior because it is cleaner for SEO, analytics, and user expectation management.

## Content Model Decisions

## News

News remains authored via Outstatic, but the public website should render it through a content pipeline that is appropriate for Astro.

Requirements:

- preserve title, description, cover image, publish date, slug, and tags
- support rich Markdown or MDX post bodies
- generate static listing and detail pages
- support social metadata per post
- avoid client-only pagination for discoverability-sensitive content

## Structured Data Instead Of Embedded HTML

Where the current site stores formatting directly inside strings, the migration should prefer structured data.

Example improvement:

- current: one string containing `<br/>`
- target: explicit fields or arrays for multiple display lines

This is especially important for sponsor and organization names currently rendered with `dangerouslySetInnerHTML`.

## `dangerouslySetInnerHTML` Policy

HTML injection is permitted only when it has a documented reason.

### Allowed Transitional Cases

- rendering trusted editorial HTML that is intentionally produced as part of the content pipeline and cannot yet be rendered more directly

### Preferred End State

- direct Markdown or MDX rendering for news
- structured display data for organization and sponsor content
- no raw HTML injection for ordinary layout formatting needs

## Interactivity Policy

Client-side code should be used only for behavior that genuinely benefits from it.

Likely examples:

- locale switcher behavior
- limited navigation state
- embedded schedule widgets
- small interactive sections already present in the current site

Likely non-examples:

- discoverability-critical pagination
- route resolution
- content lookup that can be static

## Asset And Image Policy

The migration should separate three asset categories:

### 1. CMS-Managed Media

- remains directly addressable and easy for editors to manage
- should not depend on unstable `/api/outstatic/media/...` paths in the public site

### 2. Public Static Assets

- assets that intentionally remain in `public/`
- used for direct public file serving and legacy URL stability

### 3. Build-Time Optimizable Assets

- assets moved into source-controlled asset folders where Astro's asset tooling can be applied intentionally

The project should not assume all assets fit into one strategy.

## Migration Workstreams

## Workstream 1: Route And Locale Foundation

- define route helpers
- define year and locale config
- implement neutral-route redirects
- implement locale switching behavior

## Workstream 2: Layout And Static Pages

- migrate shell, navigation, footer, and metadata
- migrate the homepage and high-traffic informational pages
- centralize repeated year-bound configuration

## Workstream 3: News Pipeline

- define Astro-side content ingestion from committed Outstatic files
- generate listing and detail pages
- normalize image paths
- replace client-side pagination with static pagination

## Workstream 4: Data Cleanup

- move hardcoded arrays out of page components
- normalize sponsor and organization display data
- reduce reasons to inject raw HTML

## Workstream 5: Deployment And Cutover

- provision green environment
- run side-by-side QA
- verify routing, assets, cookies, and SEO
- perform controlled traffic switch

## Workstream 6: Tooling Alignment

- keep root formatting and linting centralized in Biome
- ensure Bun-based install and script execution are documented and verified in CI
- keep archived implementation files out of active root tooling scope

## Risks And Mitigations

### Risk: News Content Breaks During CMS/Public Separation

Mitigation:

- document the content contract between CMS output and Astro input
- normalize image and metadata fields early
- test multiple real posts, not only synthetic fixtures

### Risk: Locale Routing Becomes Inconsistent Across Pages

Mitigation:

- generate paths through shared helpers only
- prohibit hardcoded locale-less internal links
- add QA coverage for language switching and deep links

### Risk: Blue-Green Cutover Serves Stale HTML Or Assets

Mitigation:

- revisit cache policy before launch
- keep deploy environments fully isolated
- verify asset references after switch

## Success Criteria

The migration is successful when:

- all important public pages are available under the current-year or archive-year localized URL model
- root entry correctly resolves the preferred locale
- news content renders reliably from committed CMS content
- no critical navigation depends on implicit middleware year rewriting
- the green environment can be validated and rolled back independently

## Open Decisions

- exact default locale when no valid cookie exists
- fallback behavior for untranslated pages
- final list of pages that must ship bilingually on day one
