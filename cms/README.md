# PyCon HK News CMS

The public website, CMS, articles and uploaded images live together in
`pyconhk/pyconhk-website`. The CMS edits News only; conference pages are written
in the website source.

| Environment | Editor | Content branch | Published branch |
| --- | --- | --- | --- |
| Test | https://cms-test.pycon.hk/admin/ | `cms-test` | `test` |
| Production | https://cms.pycon.hk/admin/ | `cms` | `main` |

## Saving and publishing

Decap uses simple publishing. **Publish now** saves directly to the selected CMS
branch. The entry's **Status** controls visibility: `draft` can be saved with
incomplete translations; `published` requires all six 2026 locales (`en`, `zh-hk`,
`zh-hant`, `zh-hans`, `ja`, `ko`). The 2025 archive requires five, without Korean.

The promotion workflow checks the CMS branches every five minutes and can be run
manually. It prepares a merge candidate using the current published branch,
rejects changes outside localized News and raster uploads, and runs the full
website/CMS validation workflow on that exact candidate. On success, its bot PR
merges automatically and explicitly invokes GitHub Actions website deployment.
Cloudflare receives the built output. Invalid content, conflicts or a newer
published revision stop publication and leave the existing site intact.

Test publication only updates `test`; it does not automatically promote to
production. Code changes follow feature branch → `test` → `main` with developer
review. GitHub schedules can be delayed; five minutes is a check interval, not a
publication deadline.

Article files are `website/outstatic/content/<year>-posts/<slug>.<locale>.mdx`.
Uploaded images are `website/public/outstatic/images/`. Existing public image
paths remain `/outstatic/images/`. The former external News repository is retained
as history; neither CMS nor website deployment reads it.

## Roles and branch protection

The GitHub OAuth callback checks the configured repository and allowed teams.
Both environments use their own OAuth application and secrets. `CMS_ACCESS_REPO`
and `CMS_GITHUB_REPO` point to `pyconhk/pyconhk-website`.

For both `main` and `test`, require PRs, the existing GitHub Actions `Branch Rules`
and `Validate Monorepo` checks, resolved conversations, and code-owner review.
Enable **Require branches to be up to date before merging** so GitHub rejects
any candidate whose target changed after validation.
Use zero general approvals and no latest-push approval, so unowned News-only
changes can publish automatically. `.github/CODEOWNERS` assigns all other files
(including itself and workflows) to the Website team. Do not add a bot bypass or
exempt whole image directories; the exceptions are limited to raster extensions.

These controls protect merges. GitHub write permission applies to the repository,
not a content folder. A repository writer can use GitHub outside the CMS and can
access repository-level Actions secrets through workflows. Strict separation of
those credentials requires deployment environments restricted to reviewed branches;
the News-only editor alone is not that security boundary.

## Cloudflare runtime

Astro and Decap run as Workers with static assets. Both Workers and their dedicated
Pages gateways belong to Website PyCon HK account
`043801e2f5b9cf2685593bd9098e98b1`:

- Test: Worker and gateway `pyconhk-cms-test`, configured by `wrangler.test.jsonc`
  and `gateway/wrangler.test.jsonc`.
- Production: Worker and gateway `pyconhk-cms`, configured by
  `wrangler.production.jsonc` and `gateway/wrangler.jsonc`.

Each gateway's `CMS` service binding forwards the original request, including
OAuth cookies, only to its matching Worker. Preview gateways have no binding.
The `pycon.hk` DNS zone remains in OSHK; edit CMS CNAMEs in its Cloudflare console.

OAuth callback URLs are `https://cms-test.pycon.hk/api/decap/callback` and
`https://cms.pycon.hk/api/decap/callback`. GitHub must approve both apps for the
organization. OAuth state and PKCE cookies are short-lived and HttpOnly; credentials
remain Worker secrets. No KV, D1 or R2 is required.

The Worker serves `/admin/`, `/admin/config.yml`, `/api/decap/auth` and
`/api/decap/callback`. `/admin/test/` is an in-memory editor fixture, not the real
test CMS. Test collection IDs are `posts_test` and `posts_2025_test`; production
uses `posts` and `posts_2025`.

## Development and verification

Use Node.js 24 and the pinned Bun runtime through mise:

```sh
mise run install
mise run //cms:dev
mise run //cms:check
mise run check-cms-content
CMS_E2E_PROFILE=test mise run //cms:e2e
CMS_E2E_PROFILE=production mise run //cms:e2e
mise run //e2e:e2e
```

Local browser tests use dummy OAuth credentials and an in-memory editor. They
cover draft saving, published translation validation and image upload. Publication
tests use disposable Git repositories and never write live articles.

Hosted checks are read-only:

```sh
CMS_BASE_URL=https://cms-test.pycon.hk CMS_E2E_PROFILE=test mise run //cms:e2e
CMS_BASE_URL=https://cms.pycon.hk CMS_E2E_PROFILE=production mise run //cms:e2e
```

`Deploy CMS Workers` runs for CMS changes on `test` and `main`, or manually with a
target. `CMS_TEST_ORIGIN` and `CMS_PRODUCTION_ORIGIN` select the public URLs.
Deployment verifies repository, branch, environment and source hash; unchanged
Worker and gateway inputs skip builds/uploads. Real GitHub login and article
publication should also be checked during a CMS release.
