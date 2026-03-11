# ADR 0004: External Outstatic CMS Boundary

- Status: accepted
- Date: 2026-03-07

## Context

The editorial workflow still depends on Outstatic and business users are not expected to switch away from it in this migration. At the same time, `cms.pycon.hk` is already a separate operational system and is not being migrated in this workstream.

The public site should not embed CMS runtime concerns if repository-managed content is enough.

## Decision

`cms.pycon.hk` remains external to the public website.

The Astro site consumes committed content and media from the repository as inputs, rather than embedding or depending on a CMS runtime inside the public app.

## Consequences

- The public app stays simpler and more static-first.
- CMS operational concerns remain isolated.
- The content contract between CMS output and public rendering becomes an explicit integration boundary.
- Migration work should avoid `outstatic/server`-style runtime coupling inside the Astro website.
