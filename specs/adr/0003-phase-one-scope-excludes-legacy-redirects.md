# ADR 0003: Phase One Excludes Legacy Redirects

- Status: accepted
- Date: 2026-03-07

## Context

Earlier planning considered keeping or rebuilding legacy WordPress and historical route behavior as part of the Astro migration. However, that would expand the first migration phase into a routing-heavy project and recreate the same complexity that the new architecture is trying to escape.

The immediate product need is a clean public site with locale-first current-year routes and explicit archive-year routes.

## Decision

The first Astro foundation does not implement legacy redirects or WordPress compatibility behavior.

The new app focuses only on the clean localized route structure and the current public-site migration.

## Consequences

- The migration scope stays smaller and more coherent.
- The new application can be designed around explicit routing instead of transitional compatibility behavior.
- Any future legacy redirect work must be treated as a separate decision and workstream.
