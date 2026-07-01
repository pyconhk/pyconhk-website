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

## Deployment Split

- `pycon.hk` deploys the website app from `main`.
- `cms.pycon.hk` deploys the CMS app from `main`.
- The `cms` branch exists for content commits only, not app deployment.

In the target repository layout, the app roots should be:

```text
website/
cms/
```

Use deploy project roots to distinguish the public website and CMS deployments instead of using different deployment branches for each app.
