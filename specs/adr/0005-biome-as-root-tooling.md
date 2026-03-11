# ADR 0005: Biome As Root Tooling

- Status: accepted
- Date: 2026-03-07

## Context

The root-level Astro app needs a single, predictable code-quality toolchain. Carrying forward separate formatter and linter setups from the archived implementation would add noise and encourage drift during migration.

The project also prefers clean, composable code rather than layered ad hoc tooling.

## Decision

Biome is the formatter and linter for the active root-level application.

The root editor configuration is updated to use Biome defaults for supported file types.

## Consequences

- The active app has one primary code-quality tool instead of a formatter/linter split.
- Editor behavior becomes more consistent across the root app.
- Archived implementation tooling remains archived instead of leaking into the active workspace.
- Astro and TypeScript files must stay within Biome's practical support envelope, with targeted overrides where needed.
