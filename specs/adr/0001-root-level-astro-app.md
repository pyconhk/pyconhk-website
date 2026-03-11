# ADR 0001: Root-Level Astro App

- Status: accepted
- Date: 2026-03-07

## Context

The current public website lives under `website/`, which adds an extra path boundary between the repository root and the active application. That layout made sense historically, but it now adds friction during migration, documentation, commands, and deployment setup.

The migration is also a good opportunity to make the active application structure match the real identity of the repository.

## Decision

The active public website will live at the repository root.

The current Next.js implementation will be retained for reference under `archived/website-nextjs`.

## Consequences

- Root-level scripts, configs, and source files become the default developer entry point.
- Migration work no longer needs to keep threading new conventions through the nested `website/` path.
- The old implementation remains available for reference during incremental porting.
- Documentation and deployment commands become simpler and more obvious.
