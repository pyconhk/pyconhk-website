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

## CMS-Owned Paths

Decap is configured to write to the target top-level monorepo layout:

```text
website/outstatic/content/
website/outstatic/media/
website/public/outstatic/images/
```

The promotion workflow must reject changes outside these paths and validate promoted content with `mise run //website:check` and `mise run //website:build`.
Repository changes must also pass `mise run validate-cms-ops`, which checks that the Decap defaults, workflow branch rules, CMS-owned path allowlist, and promotion validation commands still match this model.

## Decap Backend Settings

```env
CMS_GITHUB_REPO=pyconhk/pyconhk-website
CMS_GITHUB_BRANCH=cms
CMS_GITHUB_OAUTH_SCOPE=public_repo
CMS_ACCESS_REPO=pyconhk/pyconhk-website
CMS_CONTENT_ROOT=website/outstatic/content
CMS_MEDIA_FOLDER=website/public/outstatic/images
CMS_PUBLIC_FOLDER=/outstatic/images
CMS_LOCALES=en,zh-hk,zh-hant,zh-hans,ja
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

## Hosted Config Smoke Check

After deploying `cms.pycon.hk`, verify the live Decap config matches the branch,
path, and locale contract:

```bash
mise run smoke-cms-config -- https://cms.pycon.hk
```

The smoke check fetches `/admin/config.yml` from the supplied CMS host and asserts:

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
binding. Repository CI must run `mise run //cms:deploy-dry-run` so a pull request
cannot pass without producing a Wrangler-deployable bundle.

Release first to the generated `workers.dev` URL. Attach `cms.pycon.hk` only
after all of these checks pass:

1. `mise run //cms:smoke-worker -- <workers.dev URL>`
2. `mise run smoke-cms-config -- <workers.dev URL>`
3. `/admin/test/` loads without a Decap configuration error in a browser.
4. A real GitHub OAuth login succeeds for an editor with push permission.
5. A test edit and image upload create only locale-coded files on `cms`.
6. The scheduled promotion workflow accepts the content-only diff and the
   public website build succeeds.

The old Vercel DNS record must be removed before the Cloudflare Worker custom
domain is attached. Update the GitHub OAuth callback to the final custom-domain
URL as part of that cutover.
