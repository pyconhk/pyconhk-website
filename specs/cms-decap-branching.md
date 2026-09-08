# Decap CMS Branching and Promotion Model

This model keeps developer code review separate from marketing content publishing.

## Branch Roles

- `main` is the production branch.
- `test` is the staging branch for code and website changes.
- `<user>-dev` branches are developer-owned feature branches.
- `cms` is the marketing-owned content branch. Decap writes content commits here.

The `cms` branch is not the deployment branch for the CMS application. The CMS app should deploy from the production code branch, while its Decap backend writes editable content to `cms`.

## Developer Flow

1. Developers work on `<user>-dev` branches.
2. Developers open pull requests from `<user>-dev` into `test`.
3. The owner reviews and promotes `test` into `main`.
4. Website production deploys from `main`.

This keeps code changes reviewable before production.

## Marketing Flow

1. Marketing users open `cms.pycon.hk`.
2. Decap writes content and media changes to the `cms` branch.
3. A scheduled promotion workflow checks for changes every 10 minutes.
4. The workflow promotes `cms` into `main` only when the diff is limited to CMS-owned content paths and the website validates successfully through its mise tasks.

This lets marketing users publish content without opening developer pull requests, while still preventing arbitrary code changes from reaching production through the CMS branch.

Decap's editorial workflow opens same-repository `cms/*` pull requests into
`cms`. `CMS Content Boundary` accepts those PRs only when their immutable commit
diff contains CMS-owned paths. It runs from the trusted base branch using a
read-only `pull_request_target` workflow and never executes PR code. Configure
that check and `Validate Monorepo` as required checks on `cms` before enabling
editorial publication. Full locale and website validation still runs. Drafts
may be incomplete; publishing a 2026 item requires all six locale variants.

**Deployment prerequisite:** `main` currently requires an approved PR and has no
bypass actor. The promotion workflow's direct push cannot succeed under those
rules with `GITHUB_TOKEN` or an ordinary maintainer token. A repository owner must
approve a dedicated promotion identity and its narrowly scoped rule exception,
or choose a reviewed PR publishing flow. Do not disable review rules globally or
claim that supplying any PAT alone fixes this. Once a validated push succeeds,
the workflow explicitly calls the shared website deployment workflow; it does
not depend on a `GITHUB_TOKEN` push starting another workflow.

## CMS-Owned Paths

Decap is configured to write to the target top-level monorepo layout:

```text
website/outstatic/content/
website/outstatic/media/
website/public/outstatic/images/
```

The promotion workflow must reject changes outside these paths and validate promoted content with `mise run //website:check` and `mise run //website:build`.
Repository changes must also pass `mise run e2e`, which exercises the served Decap configuration and editorial publication commands.

## Decap Backend Settings

```env
CMS_GITHUB_REPO=pyconhk/pyconhk-website
CMS_GITHUB_BRANCH=cms
CMS_GITHUB_OAUTH_SCOPE=public_repo
CMS_ACCESS_REPO=pyconhk/pyconhk-website
CMS_CONTENT_ROOT=website/outstatic/content
CMS_MEDIA_FOLDER=website/public/outstatic/images
CMS_PUBLIC_FOLDER=/outstatic/images
CMS_LOCALES=en,zh-hk,zh-hant,zh-hans,ja,ko
CMS_DEFAULT_LOCALE=en
```

CMS environment overrides are intentionally constrained. `CMS_LOCALES` and
`CMS_DEFAULT_LOCALE` must stay within the website-supported locale set,
`CMS_CONTENT_ROOT` and `CMS_MEDIA_FOLDER` must stay inside the CMS-owned promotion
prefixes, and `CMS_PUBLIC_FOLDER` must remain `/outstatic/images`.

Decap exposes one folder collection per conference year. The current
configuration has `2026 Posts` at `website/outstatic/content/2026-posts` and
`2025 Posts` at `website/outstatic/content/2025-posts`. The folder determines the
year, so `collectionYear` is not duplicated in post frontmatter.
The 2025 collection overrides i18n to its existing five locales. The 2026
conference collection uses `2026-conference/settings.<locale>.json`, with shared
dates, IDs, URLs, media and order. Event, tickets, venue, catering, sprint, Q&A,
about, people, organizations, sponsorship and sponsors have explicit draft or
published states. Existing test-branch people and sponsorship material is seeded
as drafts for this year's confirmation. Changing a section to published requires
complete text in all six locales and matching shared data.

Policy pages use a single English source across all current-year locales and
are outside the translation gate. Public Pretalx titles and abstracts retain
their original language; the timetable controls are translated.

The versioned values above live in `cms/wrangler.jsonc`. GitHub OAuth client
credentials are Cloudflare Worker secrets named `CMS_GITHUB_CLIENT_ID` and
`CMS_GITHUB_CLIENT_SECRET`; they must not be stored in Wrangler variables or
repository secrets files. The OAuth callback requires GitHub to report push
permission for `CMS_ACCESS_REPO` before returning a token to Decap.

Before the CMS is released, the `cms` branch must contain locale-coded files
compatible with `multiple_files`, such as `slug.en.mdx` and `slug.zh-hk.mdx`.
An unlocalized legacy file such as `slug.mdx` will not appear as the same Decap
entry and must be migrated before editors start using the hosted CMS.

Validate the latest remote branch before release:

```bash
git fetch origin cms
mise run check-cms-content -- origin/cms
```

## Hosted Config E2E Check

After deploying `cms.pycon.hk`, verify the live Decap config matches the branch,
path, and locale contract:

```bash
CMS_BASE_URL=https://cms.pycon.hk mise run //cms:e2e
```

The E2E check fetches `/admin/config.yml` from the supplied CMS host and asserts:

- backend `name: github`, `repo: pyconhk/pyconhk-website`, and `branch: cms`
- `publish_mode: editorial_workflow`
- CMS-owned `media_folder`, `public_folder`, and year-specific post collection folders
- Decap i18n `structure: multiple_files`, all supported CMS locales, and default
  locale `en`
- localized post body editing for the `posts` collection

## Deployment Split

- `pycon.hk` deploys the website app from `main`.
- `cms.pycon.hk` deploys the CMS app from `main` as a Cloudflare Worker.
- The `cms` branch exists for content commits only, not app deployment.

In the target repository layout, the app roots should be:

```text
website/
cms/
```

Use deploy project roots to distinguish the public website and CMS deployments instead of using different deployment branches for each app.

The CMS Worker uses Astro's Cloudflare adapter, a static `ASSETS` binding, and
`nodejs_compat`. It intentionally has no KV, D1, R2, Durable Object, or service
binding. Repository CI runs `mise run //cms:e2e`, which builds the deployable Worker bundle
and verifies the running Worker through HTTP and browser flows.

Release first to the generated `workers.dev` URL. Attach `cms.pycon.hk` only
after all of these checks pass:

1. `CMS_BASE_URL=<workers.dev URL> mise run //cms:e2e`
2. `/admin/test/` loads without a Decap configuration error in a browser.
3. A real GitHub OAuth login succeeds for an editor with push permission.
4. A test edit and image upload create only locale-coded files on `cms`.
5. The scheduled promotion workflow accepts the content-only diff and the
   public website build succeeds.

The old Vercel DNS record must be removed before the Cloudflare Worker custom
domain is attached. Update the GitHub OAuth callback to the final custom-domain
URL as part of that cutover.
