# Specs Index

This directory tracks the Astro migration for the public PyCon Hong Kong website.

## Documents

- `specs/background-and-motivation.md` - Why this migration exists, what problems it is trying to solve, and which constraints shape the work.
- `specs/public-site-astro-migration.md` - Product and technical specification for the new public website architecture.
- `specs/cms-decap-branching.md` - Branching, promotion, and deployment model for Decap-managed CMS content.
- `specs/todo.md` - Execution checklist and rollout tracker.
- `specs/adr/` - Architecture Decision Records capturing the irreversible or high-impact technical decisions for the migration.

## Scope Reminder

- The active public website is moving under top-level `website/`.
- `cms.pycon.hk` is moving under top-level `cms/` as a separate deployable app.
- Decap replaces Outstatic for marketing-owned editorial content.
- The public site consumes committed content rather than embedding CMS runtime concerns.
- Legacy redirects and WordPress compatibility behavior are not part of the first clean Astro foundation.
