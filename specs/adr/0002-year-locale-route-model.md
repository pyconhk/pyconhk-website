# ADR 0002: Current-Year Locale-First Route Model

- Status: accepted
- Date: 2026-03-07

## Context

The project needs first-class support for English and Cantonese, and the target public URL model is now clear.

Implicit year rewriting and locale-less internal paths make the site harder to reason about and harder to test. At the same time, the current conference year should have cleaner shareable URLs than archive years.

## Decision

All localized public pages use one of these canonical formats:

- current year: `/<locale>/...`
- archive years: `/<year>/<locale>/...`

The root route `/` may exist as a lightweight redirect entry point that resolves the preferred locale from cookies.

When a user requests `/<current-year>/<locale>/...`, the site redirects to the locale-first current-year path.

## Consequences

- The public URL model is deterministic and shareable while keeping the current year shorter.
- Locale-aware links must be generated through shared helpers instead of hardcoded strings.
- Search engines can index each localized page directly.
- Middleware-based year rewriting is no longer needed for normal navigation in the new site.
