# Current Astro Goals And Worktree Audit

Date: 2026-07-01

This is the current coordination note for the Astro migration work after auditing the
forked worktrees with parallel agents. It supersedes the unchecked execution state in
`docs/superpowers/plans/2026-07-01-astro-worktree-port.md`.

## Progress Log

- `d2100b2` audits the worktrees, integrates the missing conference-highlight
  redirects, documents the remaining goals, and prunes unused legacy assets.
- This checkpoint hardens 2026 SEO and locale output: current-year CFP pages
  canonicalize to unyeared locale URLs, 2025 archive pages stay under `/2025/`,
  non-localized legacy archive pages no longer advertise fake locale alternates, and
  `robots.txt` allows crawling unless an explicit test environment flag is set.
- Korean is documented and implemented as a 2026 CFP-only locale. It is included in
  CFP pages, CFP hreflang alternates, and the sitemap as `/ko/`; it is not added to
  the site-wide `SiteLocale` model or to 2025 archive route generation.
- The stale current-page 2025 social image has been replaced with a 2026 CFP Open Graph
  image at `website/public/2026/open-graph.webp`; known 2025 archive and legacy routes
  keep the existing 2025 conference Open Graph fallback.
- Visual parity evidence was generated at
  `output/playwright/visual-parity-readiness-20260701T040448Z/summary.json`. A focused
  `/news/` rerun after adding root news compatibility lives at
  `output/playwright/visual-parity-news-rerun-20260701T041841Z/summary.json`.
- News content validation now runs in `website:check`: it verifies localized post
  frontmatter, duplicate slugs, cover images, tags, and year-aware internal links.
  Existing 2025 posts have descriptions, tags, and archive-safe links.
- Playwright e2e coverage now runs through `mise //website:e2e` against a local
  Wrangler Pages server. It covers locale-cookie redirects, legacy redirects, critical
  current/archive/news pages, robots, sitemap, and key static assets.
- Pull request validation now installs a Playwright browser and runs the same website
  e2e smoke gate after check/build. The suite also supports
  `PLAYWRIGHT_BASE_URL=https://<green-hostname>` for hosted green-environment smoke
  checks without starting a local Wrangler server.
- Hosted CMS config smoke validation is available through
  `mise run smoke-cms-config -- https://cms.pycon.hk`. It fetches Decap
  `/admin/config.yml` and checks the GitHub branch, CMS-owned write paths,
  multi-file i18n structure, and locale list.
- The first live CMS smoke run against `https://cms.pycon.hk` fails with
  `404 Not Found` for `/admin/config.yml`, so hosted CMS cutover/config remains an
  external deployment task rather than a local-code task.

## Agent Audit Summary

- Current-year and locale audit: no missing 2025 parity or 2026 CFP code should be
  ported. The source worktrees are older than `astro-migration` in a few shared config
  files.
- Legacy year and asset audit: legacy route/data/page slices for 2018, 2020 Spring,
  2020 Fall, 2021, 2022, 2023, and 2024 are represented in `astro-migration`; older
  branch route files are superseded by the current highlight/sanitization handling.
  The Simply Static crawl is about 257 MB, mostly WordPress runtime and upload variants;
  direct crawl slug coverage is complete locally for 2018 through 2024, so remaining
  legacy migration work is navigation purity, redirects, and asset deduplication.
- Archive index, redirect, SEO, and deploy audit: archive indexes, 2025 compatibility,
  SEO primitives, Wrangler config, and mise monorepo tasks are represented. One
  missing redirect block for `/conference-highlights` was identified and should be
  integrated into `website/public/_redirects`.
- Task-document audit: several historical todo items are stale. The real remaining
  work is launch hardening, content validation, visual parity evidence, CMS operations,
  and cleanup.
- Worktree cleanup re-audit: the only clean worktrees whose branch heads are already
  ancestors of `astro-migration` are `integrate-current-deploy`,
  `integrate-legacy-archives`, `port-2025-parity`, and `port-legacy-urls`. Several
  other clean `port-*` branches still have one unique commit each and must be reviewed
  before removal, even when their behavior appears represented in the active branch.
- CMS repo audit: `/Users/alexau/Project/pyconhk-website-cms` is a separate clone, not
  a worktree. The monorepo `cms/` copy is the canonical Decap migration target because
  it has the newer Node 24/mise alignment plus the current `description` and `tags`
  post fields.

## Worktree Classification

Keep these worktrees as historical snapshots until the owner approves cleanup; do not
merge them blindly.

| Worktree | Branch | Current classification |
| --- | --- | --- |
| `/Users/alexau/Project/pyconhk-website` | `astro-migration` | Active target branch |
| `/Users/alexau/Project/pyconhk-website-integrate-current-deploy` | `codex/integrate-current-deploy` | Integrated into active target |
| `/Users/alexau/Project/pyconhk-website-integrate-legacy-archives` | `codex/integrate-legacy-archives` | Integrated into active target |
| `/Users/alexau/Project/pyconhk-website-2025-parity` | `codex/astro-2025-parity` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-2026-cfp` | `codex/astro-2026-cfp` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-legacy-2018-2021` | `codex/astro-legacy-2018-2021` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-legacy-2022-2023` | `codex/astro-legacy-2022-2023` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-legacy-2024` | `codex/astro-legacy-2024` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-legacy-indexes` | `codex/astro-legacy-indexes` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-legacy-urls` | `codex/astro-legacy-urls` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-seo-deploy` | `codex/astro-seo-deploy` | Obsolete root-layout source snapshot |
| `/Users/alexau/Project/pyconhk-website-port-2025-parity` | `codex/port-2025-parity` | Clean port; superseded |
| `/Users/alexau/Project/pyconhk-website-port-2026-cfp` | `codex/port-2026-cfp` | Clean but not ancestor; review unique commit before cleanup |
| `/Users/alexau/Project/pyconhk-website-port-legacy-2018-2021` | `codex/port-legacy-2018-2021` | Clean but not ancestor; review unique commit before cleanup |
| `/Users/alexau/Project/pyconhk-website-port-legacy-2022-2023` | `codex/port-legacy-2022-2023` | Clean but not ancestor; review unique commit before cleanup |
| `/Users/alexau/Project/pyconhk-website-port-legacy-2024` | `codex/port-legacy-2024` | Clean but not ancestor; review unique commit before cleanup |
| `/Users/alexau/Project/pyconhk-website-port-legacy-indexes` | `codex/port-legacy-indexes` | Clean but not ancestor; review unique commit before cleanup |
| `/Users/alexau/Project/pyconhk-website-port-legacy-urls` | `codex/port-legacy-urls` | Clean port; superseded after highlight redirects land |
| `/Users/alexau/Project/pyconhk-website-port-seo-deploy` | `codex/port-seo-deploy` | Clean but not ancestor; review unique commit before cleanup |

Current live-state notes:

- The active repo has untracked visual parity evidence under `output/`; keep it out of
  code commits unless the owner asks to preserve those artifacts in git.
- Local branch `alex-dev` is not an ancestor of `astro-migration` and needs separate
  owner review before any branch cleanup.

## Related Repositories

| Path | Status | Current decision |
| --- | --- | --- |
| `/Users/alexau/Project/pyconhk-website-cms` | Separate dirty clone on `feat/astro-decap-migration` | Keep as reference only; sync forward from monorepo `cms/` if the standalone deploy artifact is still needed |
| `/Users/alexau/Project/pyconhk-website-redeem` | Separate clean repo on `main` | Out of scope for the Astro/Decap migration |

## Remaining Goals

### P0: Commit And Verify Asset Pruning

The active working tree intentionally prunes unused legacy WordPress assets so the
repository no longer carries the full crawled payload. The current `website/public`
size is about 82 MB and `website/public/legacy-wp` is about 74 MB.

Success conditions:

- A reference scanner over generated pages and source content reports zero missing
  `/legacy-wp/...` paths, including URL-encoded filenames.
- `website/public` stays comfortably below 100 MB.
- `MISE_EXPERIMENTAL=0 mise run ci` exits 0 after the prune and redirect changes.
- The commit contains only intentional asset deletions, `_redirects`, and this
  coordination documentation.

### P0: Finish 2026 Current-Year SEO And Routing Hardening

`currentConferenceYear` is 2026, and neutral locale routes serve the 2026 CFP, but
some SEO and sitemap code still needs a launch-mode review.

Status: implemented and verified in the SEO/routing checkpoint that follows `d2100b2`.

Success conditions:

- `website/src/lib/seo.ts` and `website/src/pages/sitemap.xml.ts` produce the intended
  current-year and archive-year metadata without relying on stale 2025 assumptions.
- `website/src/pages/robots.txt.ts` reflects the intended launch policy instead of
  accidentally blocking production indexing.
- Canonical URLs, alternate links, sitemap entries, and Open Graph data are verified
  for `/`, `/en/`, `/zh-hk/`, `/2026/`, `/2026/en/`, `/2025/en/`, and legacy archive
  highlight pages.

### P0: Resolve Locale Scope Drift

The Astro i18n config and 2026 CFP data include `ko`, while the shared site locale
model is narrower. Decide whether Korean is CFP-only or a global public-site locale.

Status: policy chosen and implemented. Korean is CFP-only for 2026; the site-wide
locale model remains unchanged.

Success conditions:

- Locale configuration, route helpers, sitemap output, and docs all describe the same
  locale policy.
- Korean CFP pages either build and link intentionally or are removed from public route
  generation until the site-wide locale model supports them.
- Locale switching behavior is documented for pages without translated equivalents.

### P0: Produce Visual Parity Evidence Against Live `pycon.hk`

The migration still needs browser evidence that local Astro pages match or intentionally
differ from the live site.

Status: exact desktop and mobile evidence has been generated for the requested route
set. Current major differences are intentional migration differences or known legacy
URL compatibility gaps rather than missing local assets; `/news/` now has a local
compatibility route and returns 200 in the focused rerun. A Playwright e2e smoke gate
now exercises the launch-critical local routes through Wrangler Pages and can target a
hosted green URL with `PLAYWRIGHT_BASE_URL`.

Latest live comparison evidence:

- A fresh local-vs-live run compared 22 routes at desktop `1440x1000` and mobile
  `390x844`; current artifacts live under
  `output/playwright/hosted-live-ui-parity-current-20260701T062916Z/`.
- Route parity risk: local serves localized 2025 routes such as `/2025/en/`,
  `/2025/en/news/`, `/2025/en/news/pre-event-notice/`, and `/2025/zh-hk/`, while live
  currently returns 404 for those paths. Decide whether these are intentional new
  routes for the Astro launch or whether 2025 navigation should remain unlocalized.
- Visual/content differences still needing owner decision: local 2025 schedule has a
  Pretalx-derived hero block before the live-style schedule content; local 2025 news
  cards include excerpts and long-form dates; local supporting-organizations headings
  differ from live; local metadata uses `PyCon Hong Kong 2025` where live mostly uses
  `PyCon HK 2025`.
- 2026 canonical `/2026/en/` and `/2026/zh-hk/` match content, but font/link formatting
  differs. The `/zh-hk/` alias intentionally differs from live today because local uses
  localized Cantonese CFP copy while live still shows English CFP copy there.
- Legacy year routes remain simplified Astro archives rather than full WordPress visual
  parity; this is acceptable only if the launch strategy treats them as archival,
  year-first compatibility pages rather than exact restores.

Latest crawl inventory:

- `/Users/alexau/Downloads/simply-static-1-1779119343` is about 257 MB. The largest
  buckets are `wp-content/uploads` at about 168 MB, `wp-includes` at about 39 MB, and
  `wp-content/plugins` at about 27 MB.
- Local year coverage matches crawl slug counts for 2018, 2020 Spring, 2020 Fall,
  2021, 2022, 2023, and 2024. The 2015-2017 material in this crawl only supports
  highlight pages, not full schedules/sites.
- Non-year legacy surfaces should stay compatibility-only: `/conference-highlights/*`
  maps into year-owned highlights, category/tag/author/page archives are duplicate
  WordPress index surfaces, and sponsor/community tags duplicate year pages.
- The year-first navigation leak in `LegacyShell.astro` has been closed by pointing
  shell navigation at `/2024/photos/`, `/2024/`, and the current news index. The
  renderable compatibility route remains acceptable for old URLs but should not be
  primary navigation.
- Asset cleanup should keep only referenced legacy media, avoid WordPress runtime
  folders, normalize duplicated media URLs, and run the existing Sharp optimizer.

Success conditions:

- Start the local site through mise-managed tasks.
- Compare desktop and mobile screenshots for the critical routes: `/`, `/en/`,
  `/zh-hk/`, `/2025/en/`, `/2025/zh-hk/`, `/2026/en/`, `/2024/`, `/2023/`,
  `/conference-highlights/pycon-hk-2024-photos/`, `/news/`, and one article page.
- Record intentional differences, regressions, and broken assets with screenshot paths.

### P1: Harden News Rendering And Validation

News listing and detail pages exist, but content validation and rendering policy still
need cleanup.

Status: content validation, per-article social images, and the Markdown/HTML
rendering policy are implemented. News Markdown is rendered through explicit
sanitization before the intentional `set:html` path. Legacy WordPress archive HTML
remains a separate compatibility surface.

Success conditions:

- Duplicate slugs, malformed frontmatter, missing descriptions, missing cover images,
  missing tags, and broken internal links fail a validation command.
- Per-post Open Graph images use the post cover image when available.
- Markdown/HTML rendering policy is documented; any remaining `set:html` usage is
  intentional and sanitized or otherwise justified.

### P1: CMS And Branching Operations

The Decap CMS app and promotion workflow exist, but production operations still need
secrets, branch protections, and deployment checks.

Status: local CMS operations policy validation is implemented through
`mise run validate-cms-ops` and is part of root `mise run ci` plus pull request
validation. The gate checks Decap branch defaults, guarded CMS-owned content paths,
multi-file locale configuration, promotion workflow branch/path rules, and website
check/build validation commands. CMS env overrides now fail fast when locales or
the default locale are not supported by the website, or when write paths fall
outside the promotion-owned prefixes. A hosted config smoke command now checks the
live Decap YAML contract when pointed at a CMS base URL. Hosted GitHub settings,
deployment secrets, and real CMS UI publishing still require environment-level
verification. Multi-locale Decap editing is implemented for the 2025 content shape,
and CMS-created `<year>-posts` folders beyond 2025 now build year-owned localized
news detail routes plus sitemap entries.
The current live `https://cms.pycon.hk/admin/config.yml` check returns 404, which means
the hosted CMS deployment is not yet serving this Decap config.

Success conditions:

- `cms.pycon.hk` deploys the CMS app from production code, not from the content branch.
- Decap writes only to the `cms` branch and only to CMS-owned paths.
- The scheduled promotion workflow can merge content-only changes into `main` every
  10 minutes after website check/build validation.
- Multi-locale content editing is documented and tested through the CMS UI.
- Hosted `/admin/config.yml` passes `mise run smoke-cms-config -- https://cms.pycon.hk`.
- CMS-authored posts in year folders beyond 2025 have public year-owned routes and
  Playwright fixture coverage.

### P1: Blue-Green Cutover And Rollback

The public site still needs operational cutover evidence before replacing live traffic.

Status: a practical cutover and rollback runbook exists at
`specs/blue-green-cutover-runbook.md`. The runbook documents local preflight commands,
green deployment checks, hosted Playwright smoke with `PLAYWRIGHT_BASE_URL`,
DNS/custom-domain cutover methods, post-cutover verification, rollback triggers, and
rollback procedures. Cloudflare Pages project settings, DNS/custom-domain ownership, GitHub
branch protections, runtime versions, production hostnames, deployment IDs, and rollback
rehearsal evidence still require owner verification in the external services.

Success conditions:

- A green Cloudflare Pages environment exists with the Astro build.
- Playwright smoke tests cover redirects, locale cookies, critical pages, static assets, robots,
  and sitemap.
- The same Playwright smoke tests pass against the hosted green hostname through
  `PLAYWRIGHT_BASE_URL`.
- Rollback steps are documented and rehearsed.

### P2: Worktree Cleanup

There are many local worktrees because earlier migration slices were forked before the
monorepo layout settled. They are useful for audit history but no longer need active
development.

Success conditions:

- The owner confirms which worktrees should be removed.
- Each candidate worktree is clean or has its useful diff captured elsewhere.
- `git worktree remove` is used only after confirmation; branches are deleted only by
  explicit owner instruction.
- Automatic cleanup candidates after owner approval: `integrate-current-deploy`,
  `integrate-legacy-archives`, `port-2025-parity`, and `port-legacy-urls`.
- Review-before-cleanup candidates: dirty obsolete `astro-*` source worktrees and clean
  non-ancestor `port-*` worktrees with unique commits.

## Suggested Next Parallel Assignments

- SEO/routing worker: owns `website/src/lib/seo.ts`, `website/src/pages/sitemap.xml.ts`,
  `website/src/pages/robots.txt.ts`, and route metadata checks.
- Locale worker: owns shared locale config, route helpers, Astro i18n config, and docs
  for Korean CFP scope.
- Visual QA worker: owns local-vs-live browser comparison and screenshot/report output.
- News validation worker: owns content validation command, post metadata, and rendering
  policy notes.
- CMS ops worker: owns branch protection assumptions, Decap environment documentation,
  and promotion workflow verification.
