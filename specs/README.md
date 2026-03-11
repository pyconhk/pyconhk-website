# Specs Index

This directory tracks the Astro migration for the public PyCon Hong Kong website.

## Documents

- `specs/background-and-motivation.md` - Why this migration exists, what problems it is trying to solve, and which constraints shape the work.
- `specs/public-site-astro-migration.md` - Product and technical specification for the new public website architecture.
- `specs/todo.md` - Execution checklist and rollout tracker.
- `specs/adr/` - Architecture Decision Records capturing the irreversible or high-impact technical decisions for the migration.

## Scope Reminder

- The active public website is being moved to the repository root.
- The current Next.js implementation is retained for reference under `archived/website-nextjs`.
- `cms.pycon.hk` remains a separate system and is not being migrated in this workstream.
- Outstatic remains part of the editorial workflow, but the public site should consume committed content rather than embedding CMS runtime concerns.
- Legacy redirects and WordPress compatibility behavior are not part of the first clean Astro foundation.
