# Content Rendering Policy

Date: 2026-07-01

This policy covers repository-authored content that reaches Astro through Markdown,
MDX, or migrated HTML.

## Current News Content

News posts are stored as committed source files under:

- `website/outstatic/content/<year>-posts/<slug>.<locale>.mdx`

The website reads the source MDX files directly through `website/src/lib/news.ts`.
The required frontmatter contract is:

- `title`
- `description`
- `publishedAt`
- `status`
- `slug`
- `coverImage`
- `tags`
- `author.name`

`website/tests/news-validation.ts` enforces the content contract during
`mise run //website:check` and `mise run ci`.

## Markdown And HTML Rules

CMS-authored news bodies are Markdown-first. Raw HTML in news bodies is not part of
the supported CMS contract.

The validator rejects:

- raw HTML tags such as `<script>`, `<iframe>`, `<img>`, and `<a>`
- raw HTML event handlers such as `onclick` and `onerror`
- raw HTML `javascript:` URLs

News Markdown is rendered by `renderNewsMarkdown()` in `website/src/lib/news.ts`.
That function uses `remark-html` with `sanitize: true` before the generated HTML
string reaches Astro's `set:html` rendering path.

The remaining `set:html` use in `website/src/years/2025/routes/NewsArticlePage.astro`
is intentional for this migration phase because the source is validated Markdown
and the renderer sanitizes the HTML output explicitly.

## Legacy Archive HTML

Several archive routes still render migrated WordPress HTML with `set:html`.
Those files live under legacy archive components and year data, not in the CMS-owned
news content path.

This legacy HTML exists to preserve old public pages and URLs while the site is
migrated. It is not a model for new content. New CMS-authored content should use
frontmatter plus Markdown, not raw HTML fields.

Legacy archive data may keep static HTML required to preserve old page structure,
but committed archive page content should not carry executable `<script>` embeds.
Interactive third-party embeds should be replaced with stable archive links unless
there is a documented exception and a dedicated test for it.

## Future Cleanup

Direct Astro MDX rendering can replace the current Markdown-to-sanitized-HTML string
path later if it keeps the same content contract and visual behavior. Until then,
sanitization and validation are required gates for CMS-authored news content.
