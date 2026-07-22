# Background And Motivation

## Context

PyCon Hong Kong's public website currently lives in `website/` and is implemented in Next.js. Over time, the codebase has accumulated a mix of conference content, year-specific page logic, custom routing rewrites, proxy behavior for older WordPress pages, and incremental one-off solutions for new content needs.

The site is no longer behaving like a product application with deep server requirements. It is primarily a public conference website with:

- year-based content
- bilingual public pages
- editorial news content
- sponsor, organizer, guide, and policy pages
- a transitional need to keep old WordPress and migrated static pages reachable

This makes the public site a strong candidate for a more explicit, content-first architecture.

## What Is In Scope

- the new root-level public website
- page architecture
- content rendering
- localized routing
- deployment strategy for public traffic

## What Is Out Of Scope

- migrating `cms.pycon.hk`
- replacing Outstatic as the editorial tool
- introducing new product features that require a persistent server runtime
- redesigning the business workflow used by editors
- reimplementing legacy redirects in the first Astro foundation

## Operational Reality

The editorial workflow still matters. News and business-facing content continue to be authored by non-developer users through Outstatic. That requirement does not go away just because the public site stack changes. The migration therefore must preserve the editing experience while simplifying how the public site consumes the resulting content.

The current separation of responsibilities is acceptable and should be preserved:

- `cms.pycon.hk` remains a standalone editorial system
- the public website consumes committed content from the repository

## Why Change Now

The current public site has reached the point where the implementation cost of continuing in the same style is becoming too high. The most visible problems are not only cosmetic; they affect maintainability, routing safety, and rollout confidence.

### 1. Routing Logic Has Become A Source Of Product Risk

The existing site combines normal page navigation with legacy proxy behavior and implicit year rewriting. This increases the chance that a routing fix for one path breaks another unrelated page, asset, or stylesheet. The current Cloudflare issues reported during routing experiments are consistent with that risk profile.

The response to that risk is to simplify scope, not to recreate the same complexity in a different framework. The first Astro foundation should focus on clean localized routes only.

### 2. URL Structure Needs To Be Explicit

The target information architecture is now clearer than it was when the site was first assembled:

- current-year public pages should live under `/<locale>/...`
- archive-year public pages should live under `/<year>/<locale>/...`
- English and Cantonese should be treated as equal first-class locales
- neutral entry routes should redirect using a cookie-backed preferred locale

That model is easier to reason about when it is expressed directly in the route structure rather than inferred through middleware rewrites.

### 3. The Public Site Is Mostly Content, Not An App

The site does not currently need heavy server behavior for authenticated users, personalized dashboards, or data mutations. Most pages are brochure-style conference pages or editorial content. A static-first approach is therefore a better architectural default than an app-first one.

### 4. Year Rollover Needs To Get Cheaper

Conference sites are recurring products. The cost of preparing a new year should be mostly content, configuration, and QA. Today, some year concerns are hardcoded and duplicated. The migration should reduce yearly copy-paste work and make route/config updates predictable.

### 5. Content Rendering Should Be Cleaner

Some of the current HTML injection is justified, but it is still a smell that the content model and rendering model are not aligned.

- News posts currently render through HTML strings because markdown is converted to HTML before it reaches the component tree.
- Some sponsor and organization labels contain inline HTML such as `<br/>`, which forces components to render raw HTML for layout reasons.

The goal is not to eliminate all HTML rendering blindly. The goal is to use stronger content structures so raw HTML becomes the exception instead of the default escape hatch.

## Why Astro Is A Good Direction

Astro is attractive for this public site because it aligns with the actual shape of the problem:

- content-first page authoring
- static-first delivery
- selective islands for limited interactivity
- explicit route structure
- strong compatibility with Markdown and MDX-based content workflows

Astro is not being chosen because the site needs more runtime power. It is being considered because the public website likely benefits from less framework surface area and clearer boundaries.

## Important Caveat: Image Expectations Must Be Grounded

Image handling is part of the motivation, but it should not be treated as automatic magic.

- Astro can provide a cleaner image workflow.
- Astro does not automatically optimize files served directly from `public/`.
- The final image strategy must be validated against the actual deployment target and asset locations.

In other words, the migration should improve image discipline and asset handling, but image optimization claims must be verified in the chosen hosting setup.

## Why Blue-Green Deployment Is Required

This migration changes routing, page generation, locale behavior, and edge behavior at the same time. That is too much surface area for a direct in-place cutover.

Blue-green deployment is required so the team can:

- compare old and new public behavior side by side
- verify localized routes before traffic moves
- test legacy redirects and proxied pages safely
- validate CSS and asset loading independently of the main site
- keep rollback immediate if something still behaves incorrectly at the edge

## Long-Term Outcome We Want

The desired end state is not merely "the same site in Astro." The desired end state is:

- a cleaner public-site codebase
- explicit year and locale routing
- stable consumption of Outstatic-authored content
- a clear separation between the new public site and the archived Next.js implementation
- simpler year rollover
- better confidence during deployment and rollback

That is the actual motivation for the work.
