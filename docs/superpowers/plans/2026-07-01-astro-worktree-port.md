# Astro Worktree Port Implementation Plan

> **Current status (2026-07-01):** This plan is now historical. The worktree-port
> tasks below were audited with parallel agents after the monorepo migration, and the
> current source of truth is
> `docs/superpowers/plans/2026-07-01-current-goals-and-worktrees.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port every existing root-layout Astro migration worktree 1-to-1 into the newer monorepo layout where the public site lives under `website/` and shared execution is driven by current `mise` monorepo tasks.

**Architecture:** Treat `/Users/alexau/Project/pyconhk-website` at commit `ac67700` as the target monorepo base. Treat each older worktree as a source-of-truth slice, then map root `src/`, `public/`, `scripts/`, `astro.config.mjs`, `tsconfig.json`, and `wrangler.toml` changes into `website/` paths without reintroducing root-level website files. Use scoped verification through `mise run //website:*` and repo verification through `mise run ci`.

**Tech Stack:** Astro 7, Bun 1.3.10, Node 24.18.0, mise 2026.6.14+, Biome, Cloudflare Pages for the public website, Vercel for the CMS.

---

## Existing Task Inventory

The current migration source worktrees are:

- `/Users/alexau/Project/pyconhk-website-2025-parity` on `codex/astro-2025-parity`
- `/Users/alexau/Project/pyconhk-website-2026-cfp` on `codex/astro-2026-cfp`
- `/Users/alexau/Project/pyconhk-website-legacy-2018-2021` on `codex/astro-legacy-2018-2021`
- `/Users/alexau/Project/pyconhk-website-legacy-2022-2023` on `codex/astro-legacy-2022-2023`
- `/Users/alexau/Project/pyconhk-website-legacy-2024` on `codex/astro-legacy-2024`
- `/Users/alexau/Project/pyconhk-website-legacy-indexes` on `codex/astro-legacy-indexes`
- `/Users/alexau/Project/pyconhk-website-legacy-urls` on `codex/astro-legacy-urls`
- `/Users/alexau/Project/pyconhk-website-seo-deploy` on `codex/astro-seo-deploy`

The target mapping is:

- source `src/...` -> target `website/src/...`
- source `public/...` -> target `website/public/...`
- source `scripts/...` -> target `website/scripts/...`
- source `astro.config.mjs` -> target `website/astro.config.mjs`
- source `tsconfig.json` -> target `website/tsconfig.json`
- source `wrangler.toml` -> target `website/wrangler.toml`
- source `mise.toml` public-site preview/deploy changes -> target `website/mise.toml` or root `mise.toml`, depending on whether the task belongs to the app or orchestration.

Global success conditions for every task:

- No root-level public website app files are reintroduced: no target `src/`, `public/`, `outstatic/`, `astro.config.mjs`, `biome.json`, `tsconfig.json`, or `wrangler.toml` for website runtime.
- Root `mise.toml` keeps `monorepo_root = true`, explicit `[monorepo].config_roots = ["website", "cms"]`, and no `experimental_monorepo_root` or `[settings] experimental`.
- `website/mise.toml` keeps app-owned tasks for `install`, `dev`, `build`, `preview`, `cloudflare-preview`, `check`, `typecheck`, `lint`, `lint-fix`, `format`, and `format-check`.
- `cms/mise.toml` keeps app-owned tasks for `install`, `dev`, `build`, `preview`, `check`, `lint`, `format`, and `local-backend`.
- `MISE_EXPERIMENTAL=0 mise tasks validate --all` succeeds in the target repo.
- `MISE_EXPERIMENTAL=0 mise run //website:check` succeeds after each website slice.
- `MISE_EXPERIMENTAL=0 mise run //website:build` succeeds for route/content slices.
- `MISE_EXPERIMENTAL=0 mise run ci` succeeds after final integration.

## Agent Assignments

### Task 1: 2025 Parity Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-2025-parity`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-2025-parity`

**Files:**
- Compare source `src/years/2025/components/home/ActionShowcase.astro` with target `website/src/years/2025/components/home/ActionShowcase.astro`
- Compare source `src/years/2025/components/site/PrimaryNavigation.astro` with target `website/src/years/2025/components/site/PrimaryNavigation.astro`
- Compare source `src/years/2025/components/site/SiteFooter.astro` with target `website/src/years/2025/components/site/SiteFooter.astro`
- Compare source `src/years/2025/data/footer.ts` with target `website/src/years/2025/data/footer.ts`
- Compare source `src/years/2025/data/navigation.ts` with target `website/src/years/2025/data/navigation.ts`
- Compare source `src/years/2025/i18n/messages/*.ts` with target `website/src/years/2025/i18n/messages/*.ts`
- Compare source `src/years/2025/routes/HomePage.astro` with target `website/src/years/2025/routes/HomePage.astro`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-2025-parity -b codex/port-2025-parity astro-migration
```

Expected: target worktree exists on `codex/port-2025-parity`.

- [ ] **Step 2: Check source delta**

Run:

```bash
git -C /Users/alexau/Project/pyconhk-website-2025-parity status --short
```

Expected: only the Task 1 source files listed above are modified.

- [ ] **Step 3: Port missing differences into `website/`**

Use `diff -u` or direct file inspection for each source/target pair. Apply only missing semantic changes to the target `website/src/years/2025/...` files. Keep target imports valid in the `website/` app layout.

- [ ] **Step 4: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise tasks validate --all
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
git status --short
```

Expected: validation, check, and build exit 0; `git status` shows only intentional Task 1 target files.

### Task 2: 2026 CFP Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-2026-cfp`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-2026-cfp`

**Files:**
- Compare source `astro.config.mjs` with target `website/astro.config.mjs`
- Compare source `src/config/site.ts` with target `website/src/config/site.ts`
- Compare source `src/lib/routing.ts` with target `website/src/lib/routing.ts`
- Compare source `src/pages/2026/**` with target `website/src/pages/2026/**`
- Compare source `src/years/2026/**` with target `website/src/years/2026/**`
- Compare source root locale/index route edits with target `website/src/pages/**`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-2026-cfp -b codex/port-2026-cfp astro-migration
```

Expected: target worktree exists on `codex/port-2026-cfp`.

- [ ] **Step 2: Port 2026 CFP route and data changes**

Copy missing 2026-specific pages, components, data, route registry updates, and site config changes into `website/` paths. Preserve the checkpoint's monorepo routing conventions and do not add root `src/`.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/2026/index.html
test -f website/dist/2026/en/index.html
git status --short
```

Expected: check/build exit 0; generated `/2026/` and `/2026/en/` pages exist; status shows only intentional Task 2 files.

### Task 3: Legacy 2018-2021 Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-legacy-2018-2021`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-legacy-2018-2021`

**Files:**
- Compare source `public/legacy-wp/**` with target `website/public/legacy-wp/**` for years 2018, 2020, and 2021 assets
- Compare source `scripts/**` with target `website/scripts/**` for 2018-2021 generators
- Compare source `src/pages/2018/**`, `src/pages/2020-fall/**`, `src/pages/2020-spring/**`, and `src/pages/2021/**` with target `website/src/pages/...`
- Compare source `src/years/2018/**`, `src/years/2020-fall/**`, `src/years/2020-spring/**`, and `src/years/2021/**` with target `website/src/years/...`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-legacy-2018-2021 -b codex/port-legacy-2018-2021 astro-migration
```

Expected: target worktree exists on `codex/port-legacy-2018-2021`.

- [ ] **Step 2: Port missing archive pages and assets**

Apply missing source files into target `website/` paths. Keep legacy years as top-level route citizens: `/2018`, `/2020-fall`, `/2020-spring`, and `/2021`.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/2018/index.html
test -f website/dist/2020-fall/index.html
test -f website/dist/2020-spring/index.html
test -f website/dist/2021/index.html
git status --short
```

Expected: check/build exit 0; all listed year landing pages exist; status shows only intentional Task 3 files.

### Task 4: Legacy 2022-2023 Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-legacy-2022-2023`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-legacy-2022-2023`

**Files:**
- Compare source `public/legacy-wp/**` with target `website/public/legacy-wp/**` for 2022-2023 assets
- Compare source `scripts/**` with target `website/scripts/**` for 2022-2023 generators
- Compare source `src/pages/2022/**` and `src/pages/2023/**` with target `website/src/pages/2022/**` and `website/src/pages/2023/**`
- Compare source `src/years/2022/**` and `src/years/2023/**` with target `website/src/years/2022/**` and `website/src/years/2023/**`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-legacy-2022-2023 -b codex/port-legacy-2022-2023 astro-migration
```

Expected: target worktree exists on `codex/port-legacy-2022-2023`.

- [ ] **Step 2: Port missing archive pages and assets**

Apply missing source files into target `website/` paths. Keep years as top-level route citizens: `/2022` and `/2023`.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/2022/index.html
test -f website/dist/2023/index.html
git status --short
```

Expected: check/build exit 0; all listed year landing pages exist; status shows only intentional Task 4 files.

### Task 5: Legacy 2024 Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-legacy-2024`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-legacy-2024`

**Files:**
- Compare source `public/legacy-wp/**` with target `website/public/legacy-wp/**` for 2024 assets
- Compare source `scripts/**` with target `website/scripts/**` for 2024 migration scripts
- Compare source `src/pages/2024/**` with target `website/src/pages/2024/**`
- Compare source `src/years/2024/**` with target `website/src/years/2024/**`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-legacy-2024 -b codex/port-legacy-2024 astro-migration
```

Expected: target worktree exists on `codex/port-legacy-2024`.

- [ ] **Step 2: Port missing archive pages and assets**

Apply missing source files into target `website/` paths. Keep `/2024` as a top-level year route.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/2024/index.html
git status --short
```

Expected: check/build exit 0; `/2024/index.html` exists; status shows only intentional Task 5 files.

### Task 6: Legacy Indexes Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-legacy-indexes`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-legacy-indexes`

**Files:**
- Compare source `public/_redirects` with target `website/public/_redirects`
- Compare source `tsconfig.json` with target `website/tsconfig.json`
- Compare source `public/legacy-wp/**` with target `website/public/legacy-wp/**`
- Compare source `scripts/**` with target `website/scripts/**`
- Compare source `src/legacy/**` with target `website/src/legacy/**`
- Compare source `src/pages/author/**`, `src/pages/category/**`, `src/pages/conference-highlights/**`, `src/pages/page/**`, and `src/pages/tag/**` with target `website/src/pages/...`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-legacy-indexes -b codex/port-legacy-indexes astro-migration
```

Expected: target worktree exists on `codex/port-legacy-indexes`.

- [ ] **Step 2: Port missing index archive support**

Apply missing archive index data, components, route pages, redirects, and TypeScript config changes into `website/` paths.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/category/index.html
test -f website/dist/tag/index.html
test -f website/public/_redirects
git status --short
```

Expected: check/build exit 0; index archive pages and redirects exist; status shows only intentional Task 6 files.

### Task 7: Legacy URL Compatibility Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-legacy-urls`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-legacy-urls`

**Files:**
- Compare source `public/_redirects` with target `website/public/_redirects`
- Compare source `src/pages/2025/[locale]/**` edits with target `website/src/pages/2025/[locale]/**`
- Compare source `src/pages/2025/[section]/**`, `src/pages/2025/index.astro`, and `src/pages/2025/news/**` with target `website/src/pages/2025/...`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-legacy-urls -b codex/port-legacy-urls astro-migration
```

Expected: target worktree exists on `codex/port-legacy-urls`.

- [ ] **Step 2: Port missing compatibility routes and redirects**

Apply missing redirect and 2025 compatibility route changes into target `website/` paths. Preserve locale-prefixed routes and direct `/2025/...` compatibility routes.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/2025/index.html
test -f website/dist/2025/news/index.html
test -f website/public/_redirects
git status --short
```

Expected: check/build exit 0; direct `/2025` pages and redirects exist; status shows only intentional Task 7 files.

### Task 8: SEO and Deployment Port Audit

**Source worktree:** `/Users/alexau/Project/pyconhk-website-seo-deploy`

**Target worktree:** `/Users/alexau/Project/pyconhk-website-port-seo-deploy`

**Files:**
- Compare source `mise.toml` with target root `mise.toml` and `website/mise.toml`
- Compare source `src/config/site.ts` with target `website/src/config/site.ts`
- Compare source `src/layouts/BaseLayout.astro` with target `website/src/layouts/BaseLayout.astro`
- Compare source `src/lib/seo.ts` with target `website/src/lib/seo.ts`
- Compare source `src/pages/robots.txt.ts` with target `website/src/pages/robots.txt.ts`
- Compare source `src/pages/sitemap.xml.ts` with target `website/src/pages/sitemap.xml.ts`
- Compare source `wrangler.toml` with target `website/wrangler.toml`

- [ ] **Step 1: Create or enter the target worktree**

Run:

```bash
git worktree add /Users/alexau/Project/pyconhk-website-port-seo-deploy -b codex/port-seo-deploy astro-migration
```

Expected: target worktree exists on `codex/port-seo-deploy`.

- [ ] **Step 2: Port missing SEO and deployment settings**

Apply missing SEO helpers, robots/sitemap routes, layout metadata, Cloudflare config, and mise preview/deploy task changes into the correct target paths. Public app tasks belong in `website/mise.toml`; repo orchestration belongs in root `mise.toml`.

- [ ] **Step 3: Verify**

Run:

```bash
MISE_EXPERIMENTAL=0 mise tasks validate --all
MISE_EXPERIMENTAL=0 mise run //website:check
MISE_EXPERIMENTAL=0 mise run //website:build
test -f website/dist/robots.txt
test -f website/dist/sitemap.xml
test -f website/wrangler.toml
git status --short
```

Expected: validation, check, and build exit 0; robots, sitemap, and Wrangler config exist; status shows only intentional Task 8 files.

### Task 9: Integration Audit

**Target repo:** `/Users/alexau/Project/pyconhk-website`

**Files:**
- Integrate reviewed changes from Tasks 1-8 back into `astro-migration`
- Update this plan if a task discovers a source worktree contains no additional changes beyond checkpoint `ac67700`

- [ ] **Step 1: Inspect each target worktree result**

Run:

```bash
git -C /Users/alexau/Project/pyconhk-website-port-2025-parity status --short
git -C /Users/alexau/Project/pyconhk-website-port-2026-cfp status --short
git -C /Users/alexau/Project/pyconhk-website-port-legacy-2018-2021 status --short
git -C /Users/alexau/Project/pyconhk-website-port-legacy-2022-2023 status --short
git -C /Users/alexau/Project/pyconhk-website-port-legacy-2024 status --short
git -C /Users/alexau/Project/pyconhk-website-port-legacy-indexes status --short
git -C /Users/alexau/Project/pyconhk-website-port-legacy-urls status --short
git -C /Users/alexau/Project/pyconhk-website-port-seo-deploy status --short
```

Expected: each worktree is either clean because checkpoint already contains the slice, or contains only intentional files for its task.

- [ ] **Step 2: Integrate completed slices**

Use normal Git integration from each target branch after reviewing its diff. Do not merge root-layout source worktree branches directly into `astro-migration`.

- [ ] **Step 3: Verify final repo state**

Run:

```bash
rg -n "experimental_monorepo_root|MISE_EXPERIMENTAL|experimental: true" mise.toml .github website cms README.md specs || true
find . -maxdepth 2 \( -path ./src -o -path ./public -o -path ./outstatic \) -print
MISE_EXPERIMENTAL=0 mise tasks validate --all
MISE_EXPERIMENTAL=0 mise run ci
git diff --check
```

Expected: no stale experimental mise settings; no root-level website runtime directories; validation and CI exit 0; diff check exits 0.
