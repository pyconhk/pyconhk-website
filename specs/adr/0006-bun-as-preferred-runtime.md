# ADR 0006: Bun As Preferred Runtime

- Status: accepted
- Date: 2026-03-07

## Context

The migration is intentionally simplifying the active apps. Using Bun as the preferred install and script runner aligns with that goal and keeps the mise-managed monorepo oriented around a modern, minimal toolchain.

Astro 7 requires a modern Node runtime for its tooling even when Bun is the package manager and script runner. The repository pins Node 26.4.0 and Bun 1.3.10 in mise config.

The root mise config is the monorepo entry point. It uses `monorepo_root = true` and explicit `[monorepo].config_roots` for `website/` and `cms/`.

## Decision

Bun is the preferred package manager and script runner for the active `website/` and `cms/` apps.

The repository documentation and expected workflow should assume:

- `mise run //...:check` and `mise run //...:build` for repo-level validation and builds
- `mise run //website:dev` for the public website dev server
- `mise run //cms:dev` for the CMS dev server
- `mise run //website:*` and `mise run //cms:*` task paths when targeting one app from the repository root
- `bun install` and `bun run ...` only when working directly inside `website/` or `cms/`

## Consequences

- Developer onboarding and CI should provision Node 26.4.0 and Bun 1.3.10 through mise.
- Developer onboarding and deployment settings should use Node 26.4.0.
- The active apps should avoid depending on npm-specific workflow assumptions.
- Repo-level validation should use mise monorepo task paths instead of root package scripts that duplicate app orchestration.
- The mise setup should stay on current stable monorepo settings.
