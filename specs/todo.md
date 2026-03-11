# Astro Migration Spec / Todo

Related docs:

- `specs/README.md`
- `specs/background-and-motivation.md`
- `specs/public-site-astro-migration.md`
- `specs/adr/README.md`

## Confirmed Background

- [x] This migration covers the public website only, and the active app now lives at the repository root.
- [x] The previous Next.js implementation is archived under `archived/website-nextjs` for reference.
- [x] `cms.pycon.hk` remains a separate system and stays on Next.js/Vercel for now.
- [x] The Outstatic editing workflow remains required because business users still depend on it.
- [x] The public site must continue consuming content committed by the CMS into this repository.
- [x] Public URLs use `/<locale>/...` for the current year and `/<year>/<locale>/...` for archive years.
- [x] English and Cantonese must be treated as first-class locales with equal importance.
- [x] The preferred locale is stored in cookies.
- [x] The front page should use a minimal inline script to redirect users from neutral entry URLs to the correct locale.
- [x] Phase one intentionally excludes legacy WordPress and redirect compatibility work.
- [x] Blue-green deployment is required to reduce migration and cutover risk.
- [x] Current Cloudflare bugs are believed to be caused by routing/proxy/caching behavior more than page rendering.

## Foundation Status

- [x] The repository root now contains the active Astro application.
- [x] The previous `website/` app has been archived as `archived/website-nextjs`.
- [x] Shared content and assets have been lifted to top-level `outstatic/` and `public/` directories.
- [x] An Astro route foundation exists for `/`, `/<locale>/`, `/<locale>/<section>/`, `/<year>/<locale>/`, and `/<year>/<locale>/<section>/`.
- [x] Locale-aware routing helpers and shared year/locale config now live in `src/config/site.ts` and `src/lib/routing.ts`.
- [x] A cookie-based locale redirect entry page is implemented for `/`.
- [x] Locale switching updates the `preferredLocale` cookie and preserves the current section path.
- [x] The root app uses Biome for formatting and linting.
- [x] Root editor defaults now point to Biome instead of Prettier/ESLint.
- [x] The new Astro foundation passes `check` and `build` in the current environment.
- [ ] Verify the same workflow with a real `bun` binary once Bun is installed in developer and CI environments.

## Migration Motivations

- [ ] Reduce framework complexity and clean up code that has become clumsy late in the current site lifecycle.
- [ ] Move the public website toward a cleaner content-first architecture without changing the CMS editing experience.
- [ ] Make year rollover work cheaper so a new conference year is mostly content/config work instead of route/component duplication.
- [ ] Make locale handling explicit instead of relying on implicit rewrites and mixed path conventions.
- [ ] Separate legacy migration logic from the public site so routing bugs do not keep leaking into page rendering.
- [ ] Improve image handling and asset discipline, using Astro asset tooling where it materially improves output quality and maintainability.
- [ ] Keep the public site simple, static-first, and easy to reason about because there are no planned product features that require a server runtime.

## Constraints And Non-Goals

- [x] Do not migrate the CMS in this phase.
- [x] Do not require editors to stop using Outstatic.
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
- [x] The user wants the new Astro application at the repository root and the old Next.js implementation archived instead of kept active under `website/`.

## Target Architecture Decisions

- [x] Build the new public site in Astro.
- [x] Make the repository root the home of the active public site.
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

- [x] Adopt Biome as the root formatter and linter via `biome.json`.
- [x] Remove root reliance on Prettier and ESLint editor settings.
- [x] Remove the root `package-lock.json` so the active app is not npm-lockfile-led.
- [x] Keep the archived Next.js app isolated from the active root TypeScript configuration.
- [ ] Add Bun to developer and CI environments so `bun install`, `bun run check`, and `bun run build` can be the verified default workflow.

## Content Strategy

- [ ] Keep Outstatic-managed news as a repository-driven content source.
- [ ] Define how Astro reads and renders Outstatic-authored Markdown/MDX content from the repository.
- [ ] Normalize frontmatter fields used by the public site, including title, description, slug, published date, tags, and cover image.
- [ ] Normalize cover image paths so the public site does not depend on `/api/outstatic/media/...` URLs.
- [ ] Decide whether to consume Outstatic's generated metadata JSON, source MDX files directly, or use both for different concerns.
- [ ] Document the content contract between the external CMS and the Astro website.
- [ ] Add validation checks for malformed frontmatter, missing cover images, missing descriptions, and duplicate slugs.

## `dangerouslySetInnerHTML` Cleanup Strategy

- [ ] News rendering:
  - [ ] Confirm whether Astro can render committed Markdown/MDX directly without HTML string injection.
  - [ ] Preserve equivalent typography and styling for rich news content.
  - [ ] Keep sanitization expectations explicit if any HTML content is still allowed.
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
- [ ] Add smoke tests for critical pages, localized routes, and news pages.
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
- [ ] The active application is cleanly rooted at the top of the repository.

## Open Questions To Track

- [ ] What is the exact default locale when the cookie is missing, invalid, or blocked?
- [ ] What should happen when a page exists in one locale but not the other?
- [ ] Which localized pages must be fully translated at launch, and which can ship later?
- [ ] How should the external CMS configuration be updated once content paths are fully lifted to the repository root?

## Initial Execution Order

- [ ] Finalize route, locale, and fallback rules.
- [x] Stand up the Astro skeleton with locale-first current-year routing plus explicit archive-year routing.
- [x] Archive the old `website/` application and establish the root app layout.
- [x] Port shared layout and route helpers.
- [ ] Port the homepage and highest-traffic static pages.
- [ ] Implement news reading from committed Outstatic content.
- [ ] Normalize image paths and structured data.
- [ ] Run blue-green QA.
- [ ] Cut over traffic and keep rollback ready.
