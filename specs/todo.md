# Astro Migration Spec / Todo

Related docs:

- `specs/README.md`
- `specs/background-and-motivation.md`
- `specs/public-site-astro-migration.md`
- `specs/adr/README.md`

## Confirmed Background

- [x] This migration originally covered the public website only; ADR 0007 expands the target to a `website/` + `cms/` monorepo.
- [x] The previous Next.js implementation is archived under `archived/website-nextjs` for reference.
- [x] `cms.pycon.hk` is being migrated from Outstatic/Next.js to Astro + Decap under `cms/`.
- [x] The Decap editing workflow must remain usable by marketing users and write content to the `cms` branch.
- [x] The public site must continue consuming content committed by the CMS into this repository.
- [x] Public URLs use `/<locale>/...` for the current year and `/<year>/<locale>/...` for archive years.
- [x] English and Cantonese must be treated as first-class locales with equal importance.
- [x] The preferred locale is stored in cookies.
- [x] The front page should use a minimal inline script to redirect users from neutral entry URLs to the correct locale.
- [x] Phase one intentionally excludes legacy WordPress and redirect compatibility work.
- [x] Blue-green deployment is required to reduce migration and cutover risk.
- [x] Current Cloudflare bugs are believed to be caused by routing/proxy/caching behavior more than page rendering.

## Foundation Status

- [x] The active Astro website application lives under top-level `website/`.
- [x] The Astro + Decap CMS app has been imported under `cms/`.
- [x] The previous `website/` app has been archived as `archived/website-nextjs`.
- [x] Shared content and assets live under `website/outstatic/` and `website/public/`.
- [x] An Astro route foundation exists for `/`, `/<locale>/`, `/<locale>/<section>/`, `/<year>/<locale>/`, and `/<year>/<locale>/<section>/`.
- [x] Locale-aware routing helpers and shared year/locale config now live in `website/src/config/site.ts` and `website/src/lib/routing.ts`.
- [x] A cookie-based locale redirect entry page is implemented for `/`.
- [x] Locale switching updates the `preferredLocale` cookie and preserves the current section path.
- [x] The website and CMS apps use Biome for formatting and linting.
- [x] Editor defaults now point to Biome instead of Prettier/ESLint.
- [x] The new Astro foundation passes `check` and `build` in the current environment.
- [x] Verify the same workflow with a real `bun` binary through the local mise-managed environment.

## Migration Motivations

- [ ] Reduce framework complexity and clean up code that has become clumsy late in the current site lifecycle.
- [ ] Move the public website toward a cleaner content-first architecture without changing the CMS editing experience.
- [ ] Make year rollover work cheaper so a new conference year is mostly content/config work instead of route/component duplication.
- [ ] Make locale handling explicit instead of relying on implicit rewrites and mixed path conventions.
- [ ] Separate legacy migration logic from the public site so routing bugs do not keep leaking into page rendering.
- [ ] Improve image handling and asset discipline, using Astro asset tooling where it materially improves output quality and maintainability.
- [ ] Keep the public site simple, static-first, and easy to reason about because there are no planned product features that require a server runtime.

## Constraints And Non-Goals

- [x] Migrate the CMS from Outstatic to Decap in the monorepo.
- [x] Preserve a marketing-friendly CMS workflow while replacing the Outstatic runtime.
- [x] Do not introduce new app-style server features that the website does not actually need.
- [x] Do not spend phase-one effort on legacy redirects or WordPress compatibility behavior.
- [ ] Do not carry forward implicit year rewrites inside the app if explicit routes can replace them.
- [ ] Do not keep hardcoded locale/year logic duplicated across layouts, links, middleware, and content loaders.
- [ ] Do not keep embedded HTML inside structured content fields where a cleaner data model is possible.

## Remaining Migration Debt

- [ ] Real conference content still needs to be ported from `archived/website-nextjs` into the new Astro routes.
- [ ] Internal links still need to be normalized during page migration so every production page uses shared locale-aware helpers.
- [ ] The project is still effectively single-year at runtime even though the year config has been centralized.
- [ ] News pagination and detail rendering have not yet been rebuilt in Astro.
- [ ] Large content/data structures still live inside archived React page components and need extraction into structured data files.
- [ ] Some public content strings still embed HTML such as `<br/>`, which forces HTML injection until that data model is cleaned up.
- [ ] SEO deliverables such as canonicals, alternates, sitemap, and robots behavior are not yet implemented in the Astro app.

## Important Findings From The Existing Site

- [x] News pages currently use HTML injection because markdown is converted to an HTML string before render.
- [x] Organization and sponsor cards currently use HTML injection because some names/descriptions intentionally contain inline HTML such as `<br/>`.
- [x] The CMS content itself lives in repository files, which means the public site can consume committed content directly without embedding the CMS runtime.
- [x] Some Outstatic frontmatter still references `/api/outstatic/media/...` paths even though generated metadata also exposes stable `/outstatic/images/...` paths.
- [x] ADR 0007 supersedes the root-app decision; the target is a top-level `website/` app plus top-level `cms/`.

## Target Architecture Decisions

- [x] Build the new public site in Astro.
- [x] Use the repository root only for monorepo orchestration.
- [x] Move the active public site into top-level `website/`.
- [x] Archive the current Next.js implementation for reference instead of continuing to build on top of it.
- [x] Use locale-first current-year routes and explicit year/archive routes for all public pages.
- [x] Restrict cookie-based locale redirects to the neutral root entry route `/`.
- [x] Keep every locale URL directly shareable and indexable without requiring client-side state to resolve the final page.
- [x] Provide route helpers so components never hardcode locale-less paths such as `/news` or `/schedule`.
- [x] Continue using committed Outstatic content as the source of truth for news.
- [ ] Prefer direct Markdown or MDX rendering for news in Astro instead of converting content into HTML strings first.
- [ ] Replace HTML-bearing content fields with structured data where possible.
- [x] Preserve a clean separation of concerns between content, routing, presentation, and deployment.

## Locale And URL Model

- [x] Finalize the supported locale set and canonical slugs.
- [x] Define the canonical URL format as `/<locale>/...` for current-year pages and `/<year>/<locale>/...` for archive pages.
- [ ] Define how root entry works:
  - [x] `/` reads cookie and redirects to the current year + locale, landing on `/<locale>/...`.
  - [x] Missing or invalid cookies fall back to a deterministic default locale.
- [ ] Define how locale switching works:
  - [x] Switching locale updates the cookie.
  - [x] Switching locale preserves current page when a translated equivalent exists.
  - [ ] Missing translated pages use a consistent fallback policy.
- [ ] Decide and document fallback policy for untranslated content.
- [ ] Add locale-aware metadata, canonicals, alternate links, and sitemap output.

## Workspace And Tooling

- [x] Adopt Biome as the app formatter and linter via `website/biome.json` and `cms/biome.json`.
- [x] Remove root reliance on Prettier and ESLint editor settings.
- [x] Remove the root `package-lock.json` so the active apps are not npm-lockfile-led.
- [x] Keep the archived Next.js app isolated from the active TypeScript configurations.
- [x] Add Bun to the local developer environment so app-owned install/check/build tasks are verified.
- [x] Add Bun 1.3.10 and Node 24.18.0 to CI via mise.
- [x] Configure the root mise file with `monorepo_root = true` and explicit `[monorepo].config_roots` for `website/` and `cms/`.
- [x] Pin production-compatible Node 24.18.0 for the CMS runtime.
- [ ] Confirm Cloudflare Pages uses Node 24.18.0 and Bun 1.3.10 for the `website/` build.
- [x] Add mise monorepo task paths for checking and building the website app and CMS app together.
- [x] Add a local CMS operations verifier for Decap branch defaults, guarded CMS-owned paths, supported locales/default locale, and promotion workflow checks.
- [x] Document repo-level `mise run //...` commands and app-scoped `mise run //website:*` / `mise run //cms:*` commands using current stable mise monorepo settings.

## Content Strategy

- [x] Keep Outstatic-managed news as a repository-driven content source.
- [x] Define how Astro reads and renders Outstatic-authored Markdown/MDX content from the repository.
- [x] Normalize frontmatter fields used by the public site, including title, description, slug, published date, tags, and cover image.
- [x] Normalize cover image paths so the public site does not depend on `/api/outstatic/media/...` URLs.
- [x] Decide whether to consume Outstatic's generated metadata JSON, source MDX files directly, or use both for different concerns.
- [x] Document the content contract between the external CMS and the Astro website.
- [x] Add validation checks for malformed frontmatter, missing cover images, missing descriptions, and duplicate slugs.

## `dangerouslySetInnerHTML` Cleanup Strategy

- [ ] News rendering:
  - [ ] Confirm whether Astro can render committed Markdown/MDX directly without HTML string injection.
  - [ ] Preserve equivalent typography and styling for rich news content.
  - [x] Keep sanitization expectations explicit if any HTML content is still allowed.
- [ ] Organization and sponsor content:
  - [ ] Replace inline HTML strings such as `<br/>` with structured arrays or explicit line-break fields.
  - [ ] Update card and modal components to render structured content without HTML injection.
  - [ ] Preserve exact visual layout for long bilingual organization names.
- [ ] Keep HTML injection only where there is a clear, documented reason and no cleaner representation.

## Component And Page Migration Workstream

- [x] Establish the Astro project structure for year-based and locale-based pages.
- [ ] Migrate the global layout, header, footer, fonts, and SEO metadata setup.
- [ ] Migrate the homepage and major static pages first.
- [ ] Port interactive pieces as isolated islands only where needed.
- [ ] Replace Next-specific primitives (`next/link`, `next/image`, metadata APIs, middleware assumptions) with Astro equivalents.
- [x] Centralize shared route generation and year/locale config.
- [ ] Move hardcoded content arrays out of TSX files into structured content/data files.
- [ ] Review every page for responsive behavior on both desktop and mobile after migration.

## News Migration Workstream

- [ ] Build a listing page with static, indexable pagination rather than purely client-side state.
- [ ] Build static detail pages for each news slug.
- [ ] Preserve current cover image, publication date, tag, excerpt, and rich body behavior.
- [ ] Preserve sharable Open Graph and Twitter metadata for each post.
- [ ] Ensure links inside CMS-authored content continue to work across year/locale paths.
- [ ] Define locale behavior for news if some posts are only available in one language.

## Images And Asset Strategy

- [ ] Audit which images should remain in `public/` and which should move into source-controlled asset folders for Astro processing.
- [ ] Use Astro image tooling where it provides real benefit and does not complicate editor workflow.
- [ ] Preserve direct public URLs for Outstatic-managed media that should remain CMS-friendly.
- [ ] Add image guidelines for dimensions, formats, alt text, and responsive usage.
- [ ] Validate that sponsor logos, speaker images, landing images, and news cover images all behave correctly after migration.

## Deployment And Blue-Green Plan

- [ ] Stand up a green Astro environment on a separate hostname.
- [ ] Keep the existing blue environment stable while parity work is in progress.
- [ ] Ensure the green environment has the same required content, assets, cookies, and localized routing behavior.
- [x] Add smoke tests for critical pages, localized routes, and news pages.
- [ ] Perform side-by-side visual and functional QA between blue and green.
- [ ] Switch traffic only after routing, assets, locale redirects, and SEO outputs are verified.
- [ ] Keep rollback instructions explicit and rehearsed.

## Quality Gates

- [ ] Every important page exists under the current-year or archive-year localized route model.
- [ ] Neutral entry routes redirect to the correct locale based on cookie rules.
- [ ] News content renders correctly from repository-managed Outstatic content.
- [ ] No critical component relies on implicit rewrites for normal navigation.
- [ ] No required page depends on client-side pagination to be discoverable.
- [ ] SEO output includes correct canonicals, locale alternates, robots rules, and sitemap data.
- [ ] Mobile and desktop layouts are both validated.
- [x] The public website application is cleanly rooted under top-level `website/`.

## Simply Static Legacy Parity Review

Source export: `/Users/alexau/Downloads/simply-static-1-1779119343`.
Detailed agent ticket drafts: `output/playwright/year-style-audit/ticket-drafts/`.
Treat these as review tickets, not all as approved work. Value is user-visible migration value; effort is a rough porting estimate.

### High-Value Port Candidates

- [x] `2018-MIG-001` `[High/M]` Fix 2018 legacy archive mobile navigation so `/2018/`, `/2018/page/1/`, and `/2018/page/2/` do not render with a huge expanded header on mobile.
- [x] `PYCONHK-ASTRO-2020-2021-01` `[High/M]` Preserve 2020 Spring/Fall and 2021 encoded legacy slugs, including Cantonese and special-character titles, so raw and encoded URLs resolve to migrated pages.
- [x] `PYCONHK-ASTRO-2020-2021-05` `[High/M]` Fix mobile header behavior on 2020-2021 legacy archive/detail pages so page titles are not pushed below an expanded WordPress-style menu.
- [x] `PYHK-ASTRO-2022-2023-01` `[High/S]` Fix the 2023 Cantonese talk slug so `/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript/` renders the migrated page instead of a static-path error.
- [x] `PYHK-ASTRO-2022-2023-03` `[High/M]` Fix 2022/2023 archive mobile navigation so `/2022/`, `/2023/`, and pagination routes start with collapsed header chrome.
- [x] `2024-001` `[High/L]` Approximate the 2024 Voyago detail-page chrome, typography, spacing, and article shell across migrated 2024 routes without cloning the full WordPress theme.
- [x] `2024-002` `[High/M]` Restore `/2024/schedule/` as an embedded Pretalx schedule page or static schedule snapshot, including the fallback link and desktop/mobile height checks.
- [x] `2024-003` `[High/S]` Fix the 2024 Halloween meetup emoji-heavy slug so static preview and deployed Pages serve it with 200 status through encoded route handling or redirect.
- [x] `CY-01` `[High/M]` Review conference highlight canonical URLs and make `/conference-highlights/*` plus year-local photo/recording aliases consistent in navigation and metadata.
- [x] `CY-04` `[High/M]` Define and implement legacy root post archive pagination behavior so `/page/1/` and page-1 links do not accidentally resolve through the modern locale redirect.
- [x] `CY-05` `[High/M]` Align Astro sitemap and robots output with the chosen legacy archive policy for year, category, author, tag, and highlight routes.

### Medium-Value Port Candidates

- [x] `2018-MIG-003` `[Medium/S]` Sanitize the 2018 CFP submission link by stripping hidden bidi/control characters so it no longer resolves as a nested `/2018/call-for-proposals-2018/` 404 path.
- [x] `2018-MIG-004` `[Medium/S-M]` Adjust 2018 detail-page featured image rendering so portrait and square speaker images are not forced into a cropped wide hero ratio.
- [x] `2018-MIG-005` `[Medium/M]` Content-QA 2018 schedule, sponsors, organisers, ticket, volunteers, and privacy pages for logos, links, tables, and mobile readability.
- [x] `PYCONHK-ASTRO-2020-2021-02` `[Medium/S]` Explicitly preserve `/2020-spring/`, `/2020-fall/`, `/2021/`, and 2021 archive pagination routes even where child folders are absent from the export inventory.
- [x] `PYCONHK-ASTRO-2020-2021-03` `[Medium/M]` Rebuild `/2020-spring/` and `/2020-fall/` with an Astro-owned legacy archive template that approximates old WordPress headings, spacing, and listing behavior.
- [x] `PYCONHK-ASTRO-2020-2021-04` `[Medium/L]` Apply a shared Astro legacy article template to 2020 Spring/Fall and 2021 detail pages to approximate old WordPress typography, spacing, footer, and content flow.
- [x] `PYCONHK-ASTRO-2020-2021-06` `[Medium/S]` Normalize 2020 Spring/Fall and 2021 document titles to the live/export `- PyCon HK` suffix instead of duplicating year-group suffixes.
- [x] `PYHK-ASTRO-2022-2023-02` `[Medium/S]` Decide whether `/2023/about/code-of-conduct/` should redirect to `/2023/2023-code-of-conduct/` for legacy compatibility, then implement or mark out of scope.
- [x] `PYHK-ASTRO-2022-2023-04` `[Medium/M]` Tighten mobile rendering for `/2022/2022-schedule/` and `/2023/2023-schedule/` so dense timetable tables stay scannable.
- [x] `2024-004` `[Medium/S]` Expose 2024 Code of Conduct, enforcement procedure, and attendee reporting pages from the 2024 detail-page navigation or related-links area.
- [x] `2024-005` `[Medium/M]` QA 2024 sponsor, community, organizer, patron, booth, and volunteer media layouts for logo counts, image sizing, captions, and mobile stacking.
- [x] `2024-006` `[Medium/M]` Verify 2024 conference-day and sprint-day access guides preserve maps/media, bilingual sections, and event-notice cross-links.
- [x] `2024-007` `[Medium/M]` QA notable 2024 event/news posts for content, media, CTA buttons, and internal links while deferring exact WordPress previous/next plugin chrome.
- [x] `CY-02` `[Medium/M]` Decide sitemap/noindex policy for legacy category and tag archives, then make Astro sitemap and metadata match that policy.
- [x] `CY-03` `[Medium/S]` Review legacy author archives and choose preserve, noindex, or redirect behavior for populated and empty author pages.
- [x] `CY-06` `[Medium/M]` Verify migrated legacy archive assets and add targeted `/wp-content/uploads/*` compatibility redirects or copied assets where old media URLs still matter.

### Low-Value Or Policy Decisions

- [x] `2018-MIG-002` `[Medium/S]` Decide whether 2018 slug page titles should match the export/live `- PyCon HK` suffix or keep the current `- PyCon HK 2018` convention.
- [x] `PYHK-ASTRO-2022-2023-05` `[Low/S]` Decide whether 2022/2023 migrated page titles should preserve the WordPress `- PyCon HK` suffix or accept the Astro `| PyCon HK` convention.
- [x] `2024-008` `[Low/S]` Decide and document the 2024 archive title/canonical policy, avoiding `legacy.pycon.hk` canonicals while optionally matching the old title suffix.

### Explicit Defer Unless Pixel Parity Becomes A Goal

- [ ] `2015-MIG-008` `[Defer/M]` Decide whether 2015 photo-page pixel parity should prefer byte-identical WordPress upload images over Astro-cached optimized images; current mobile diff is about 7.9% after restoring WordPress-style captions, and exact raw-image parity trades against the requested smaller app bundle.
- [ ] `2018-MIG-006` `[Defer/L]` Keep exact 2018 WordPress Marketingly chrome parity out of scope for detail pages; port content-critical behavior only.
- [ ] `PYCONHK-ASTRO-2020-2021-07` `[Defer/L]` Defer exact WordPress Marketingly CSS/JS/theme cloning for 2020-2021 and document an Astro-owned approximate legacy-style acceptance target instead.
- [ ] `PYHK-ASTRO-2022-2023-06` `[Defer/L]` Document the 2022/2023 decision to keep current Astro article styling and defer exact WordPress footer/sidebar/previous-next plugin parity.
- [ ] `2024-009` `[Defer/S]` Review `/2024/` archive landing parity separately because `/2024/index.html` is absent from the scoped Simply Static export tree.
- [ ] `CY-07` `[Defer/L]` Decide whether cross-year WordPress archive pages need exact Marketingly visual parity or whether modern Astro archive framing is accepted for launch.

## Open Questions To Track

- [ ] What is the exact default locale when the cookie is missing, invalid, or blocked?
- [ ] What should happen when a page exists in one locale but not the other?
- [ ] Which localized pages must be fully translated at launch, and which can ship later?
- [x] How should the external CMS configuration be updated once content paths are under `website/`?

## Initial Execution Order

- [ ] Finalize route, locale, and fallback rules.
- [x] Stand up the Astro skeleton with locale-first current-year routing plus explicit archive-year routing.
- [x] Archive the old `website/` application and establish the top-level `website/` + `cms/` layout.
- [x] Port shared layout and route helpers.
- [ ] Port the homepage and highest-traffic static pages.
- [ ] Implement news reading from committed Outstatic content.
- [ ] Normalize image paths and structured data.
- [ ] Run blue-green QA.
- [ ] Cut over traffic and keep rollback ready.
