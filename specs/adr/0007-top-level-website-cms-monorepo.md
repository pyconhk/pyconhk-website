# ADR 0007: Top-Level Website and CMS Monorepo

- Status: accepted
- Date: 2026-07-01
- Supersedes: `0001-root-level-astro-app.md`
- Updates: `0004-external-outstatic-cms-boundary.md`

## Context

The original Astro migration moved the active public website to the repository root. That simplified early migration work, but the repository already has production-oriented `main`, `test`, and `cms` branches whose historical tree shape uses a top-level `website/` directory.

The project now also needs to migrate `cms.pycon.hk` from Outstatic to Decap and keep it operationally close to the website content it edits.

At the same time, `cms` must remain a marketing-owned content branch. It should not become the deployment branch for the CMS application.

## Decision

The repository will use a top-level monorepo layout:

```text
website/
cms/
```

The public Astro website lives under `website/`.

The Decap CMS app lives under `cms/`.

Both apps deploy from the production code branch. Deployment tools distinguish the apps by project root, not by using separate app deployment branches.

Decap writes marketing-owned content to the `cms` branch under website-owned content paths.

The repository root is the mise monorepo root. It should declare `monorepo_root = true` and explicit `[monorepo].config_roots` for `website/` and `cms/`, so repo-level task paths can target all apps or one app through current stable mise settings.

## Branch Model

Developers work through:

```text
<user>-dev -> test -> main
```

Marketing users work through:

```text
Decap CMS -> cms branch -> scheduled content promotion -> main
```

The `cms` branch is content-only.

## Consequences

- The old root-level Astro app decision is superseded.
- Deployment settings must use app roots: `website/` for `pycon.hk`, `cms/` for `cms.pycon.hk`.
- The CMS app can share repository ownership with the website without merging CMS runtime concerns into the public website app.
- The `cms` branch remains easy to protect because only content and media paths are allowed.
- Local and CI commands should use `mise run //...` and app-specific `mise run //website:*` or `mise run //cms:*` task paths to avoid ambiguity between the two Astro apps and to keep build/check ownership inside each app.
- The monorepo should stay on current stable mise monorepo settings.
