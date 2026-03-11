# ADR 0006: Bun As Preferred Runtime

- Status: accepted
- Date: 2026-03-07

## Context

The migration is intentionally simplifying the active app. Using Bun as the preferred install and script runner aligns with that goal and keeps the root workspace oriented around a modern, minimal toolchain.

However, the migration environment used to bootstrap the work did not have Bun installed, so verification had to rely on equivalent npm execution for the moment.

## Decision

Bun is the preferred package manager and script runner for the active root-level app.

The repository documentation and expected workflow should assume:

- `bun install`
- `bun run dev`
- `bun run check`
- `bun run build`

## Consequences

- Developer onboarding and CI should install Bun explicitly.
- The active app should avoid depending on npm-specific workflow assumptions.
- The current migration branch still needs final Bun-native verification once Bun is available in the target environments.
