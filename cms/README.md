# PyCon HK Website CMS

Astro 7 and Decap CMS run as Cloudflare Workers with static assets. The CMS
edits News only. `wrangler.jsonc` is the transitional Worker targeting the
website repository's `cms` branch. The new test and production configs target
separate branches in `pyconhk/pyconhk-news`, a public content repository.

## Runtime Shape

- `@astrojs/cloudflare` builds the Astro server for Workers.
- Cloudflare serves the generated client files through the `ASSETS` binding.
- OAuth state and PKCE values use short-lived, HttpOnly browser cookies.
- No KV, D1, R2, Durable Object, or Astro session storage is required.
- `nodejs_compat` is enabled because the OAuth implementation uses
  `node:crypto`.
- Worker variables come from the selected Wrangler config; OAuth credentials
  are Worker secrets and are never committed.

The Worker exposes:

- `/admin/`: GitHub-backed CMS
- `/admin/test/`: in-memory Decap test backend
- `/admin/config.yml`: generated Decap configuration
- `/api/decap/auth` and `/api/decap/callback`: GitHub OAuth

`/admin/test/` is an in-memory browser fixture, not the GitHub-backed test CMS.
The real test CMS uses `wrangler.test.jsonc`, Worker `pyconhk-cms-test` and News
branch `test`. Production uses `wrangler.production.jsonc`, Worker `pyconhk-cms`
and News branch `main`. Their OAuth applications, Worker secrets and origins must
be separate. The production config intentionally leaves `account_id` unset:
`cms.pycon.hk` is in a different Cloudflare account from the existing Worker.
Deployment must supply the verified zone-owning `CLOUDFLARE_ACCOUNT_ID`; do not
deploy it with the transitional Website account.

## Content Model

The CMS uses Decap's `multiple_files` i18n structure. The 2026 news collection uses
`en`, `zh-hk`, `zh-hant`, `zh-hans`, `ja`, and `ko`; 2025 retains its five locales
without `ko`. Published news requires every locale for its year. The sidebar
exposes only news collections, currently `2026 News` and `2025 News`. The year is
determined by the collection, so editors do not enter it as post metadata.
Conference pages and event settings are maintained in the website source.

Published content goes to `test` or `main` in the News repository. Editorial
drafts use `cms-editorial/<collection>/<slug>`; the test CMS uses collection IDs
`posts_test` and `posts_2025_test`, while production uses `posts` and
`posts_2025`. This keeps draft branch names distinct when both environments edit
the same slug. The transitional `cms` branch also uses `posts` IDs until retired.
The checked-in Bun patches give Decap this branch prefix, because Git cannot
store a branch called `cms` alongside branches named `cms/...`.

A 2026 post such as `hello-world` is stored as:

```text
website/outstatic/content/2026-posts/hello-world.en.mdx
website/outstatic/content/2026-posts/hello-world.zh-hk.mdx
website/outstatic/content/2026-posts/hello-world.zh-hant.mdx
website/outstatic/content/2026-posts/hello-world.zh-hans.mdx
website/outstatic/content/2026-posts/hello-world.ja.mdx
website/outstatic/content/2026-posts/hello-world.ko.mdx
```

Both News branches must be seeded with this locale-coded shape before editors
use them. Legacy files such as `hello-world.mdx` are not entries in a
`multiple_files` collection.

## Local Development

Install all monorepo dependencies from the repository root:

```bash
mise run install
```

Copy `cms/.dev.vars.example` to `cms/.dev.vars` and fill in the credentials for
a local GitHub OAuth app. Keep `CMS_PUBLIC_URL` unset unless an external origin
must override the current request origin.

Start Astro development:

```bash
mise run //cms:dev
```

The OAuth app callback must exactly match the local callback URL, normally
`http://localhost:4321/api/decap/callback`.

To exercise the built Cloudflare runtime instead of Astro development:

```bash
mise run //cms:build
cd cms
mise exec -- astro preview --host 127.0.0.1 --port 4323
CMS_BASE_URL=http://127.0.0.1:4323 mise run //cms:e2e
```

Use `/admin/test/` to verify the multilingual editor without GitHub. Nothing is
persisted; automated checks use isolated fixtures in the test suite.

## Validation

Run static checks, the release content gate and the complete CMS E2E suite:

```bash
mise run //cms:check
mise run check-cms-release
mise run //cms:e2e
```

The E2E task builds and starts a local Worker. It verifies the admin screen,
served Decap configuration, OAuth redirect and PKCE cookies, invalid callbacks,
media redirects, and the editor's image upload, draft save and review flow.
The editor uses Decap's in-memory test repository; no live GitHub commits are made.
Publication language and editorial branch rules run as command-level E2E tests
in disposable repositories via `mise run //e2e:e2e`.

Exercise each real config without touching GitHub or Cloudflare:

```bash
CMS_E2E_PROFILE=test mise run //cms:e2e
CMS_E2E_PROFILE=production mise run //cms:e2e
```

The runtime checks verify the configured repository, branch, visible environment
label and distinct test collection IDs. They still use dummy OAuth credentials
and an in-memory editor for mutations.

After deployment, run the read-only Worker cases against its origin:

```bash
CMS_BASE_URL=https://your-test-worker.example CMS_E2E_PROFILE=test mise run //cms:e2e
```

The local editor fixture is skipped against a hosted origin. A real OAuth login
and authorized content publication remain release acceptance steps.

## Cloudflare Deployment

The site uses `.github/deploy/cms.ts` for manual and GitHub Actions Worker
releases, including profile-specific source-hash comparison and hosted manifest
verification. The transitional `legacy` profile also runs its existing CMS
content release gate. News content in the separate repository is validated by
its own CI and by the website build before deployment.
The existing Pages-only `CLOUDFLARE_API_TOKEN` cannot deploy Workers. Test and
production need distinct deployment credentials and GitHub OAuth callbacks.

Switch Chrome to the `website pyconhk` profile, then create and activate the
dedicated Wrangler profile. Do not create or share a Global API key:

```bash
cd cms
mise exec -- bun x wrangler auth create website-pyconhk
mise exec -- bun x wrangler auth activate website-pyconhk .
mise exec -- bun x wrangler whoami
```

`wrangler.jsonc` pins the Website PyCon HK Cloudflare account ID for the
transitional Worker. `wrangler.test.jsonc` pins that account for the test Worker.
The production account must be supplied explicitly after verifying ownership of
the `cms.pycon.hk` zone. Validate the two Worker bundles without deploying:

```bash
cd cms
CMS_BUILD_PROFILE=test mise exec -- bun run build
mise exec -- bunx wrangler deploy --dry-run
CMS_BUILD_PROFILE=production mise exec -- bun run build
mise exec -- bunx wrangler deploy --dry-run
```

The Astro adapter reads the selected config at build time and writes a generated
`dist/server/wrangler.json`. Run Wrangler without `--config` after that build so
it deploys the generated Worker entrypoint. Passing one of the source configs
directly to `wrangler deploy` leaves the Astro entrypoint unresolved.

Create a GitHub OAuth app to obtain its client ID and client secret. Its URLs can
be updated after Wrangler reports the generated `workers.dev` origin.

For the already deployed **transitional** Worker only, store both credentials
as encrypted Worker secrets. Wrangler prompts for each value, so they do not
appear in shell history:

```bash
cd cms
mise exec -- bunx wrangler secret put CMS_GITHUB_CLIENT_ID --config wrangler.jsonc
mise exec -- bunx wrangler secret put CMS_GITHUB_CLIENT_SECRET --config wrangler.jsonc
mise exec -- bunx wrangler secret list --config wrangler.jsonc
```

For the new test and production Workers, the first deployment supplies both
environment-specific OAuth credentials through Wrangler's `--secrets-file`.
The deploy script writes a private temporary file and removes it after Wrangler
exits. This avoids creating a placeholder Worker while setting secrets one at a
time. After the first release, rotate a secret with `wrangler secret put
--config wrangler.test.jsonc` or `--config wrangler.production.jsonc`, setting
the correct Cloudflare account first. A bare `secret put` in `cms/` targets the
transitional Worker and is unsafe here.

Deploy the transitional Worker to its existing `workers.dev` URL:

```bash
mise run //cms:deploy
```

Deployment compares CMS build inputs with the hosted `/deployment-manifest.json` and
skips build/upload when unchanged. The first release with no manifest deploys normally.
The legacy default origin is `https://pyconhk-cms.website-pyconhk.workers.dev`.
For a test release, set `CMS_BUILD_PROFILE=test`; its default origin is
`https://pyconhk-cms-test.website-pyconhk.workers.dev`. For production, set
`CMS_BUILD_PROFILE=production`, the verified OSHK `CLOUDFLARE_ACCOUNT_ID`, and
the exact `CMS_DEPLOY_ORIGIN`. Both new profiles require their own
`CMS_GITHUB_CLIENT_ID` and `CMS_GITHUB_CLIENT_SECRET` for a changed release.
The deploy script rejects another production
account ID and verifies the hosted repo, branch and environment as well as the
source hash.
Use `mise exec -- bun run deploy --force` from `cms/` to force a release (including
after external variable/secret changes). Website content edits do not redeploy the CMS.
When a release is needed, Wrangler requires both OAuth secrets, and the hosted
manifest is verified after upload.

`.github/workflows/deploy-cms.yml` builds and deploys the test Worker from the
website `test` branch and the production Worker from `main`. It is disabled until
the repository variable `CMS_DUAL_ENV_ENABLED=true` is set. Before enabling it,
create `pyconhk/pyconhk-news`, set `NEWS_SOURCE=external`, create distinct GitHub
OAuth applications and callback URLs, and set these website
repository credentials/configuration:

- `CLOUDFLARE_CMS_TEST_API_TOKEN`: Worker Edit token scoped to the Website
  PyCon HK account.
- `CLOUDFLARE_CMS_PRODUCTION_API_TOKEN`: Worker Edit token scoped to the OSHK
  account that owns `cms.pycon.hk`.
- `CMS_GITHUB_CLIENT_ID_TEST` and `CMS_GITHUB_CLIENT_SECRET_TEST`: test OAuth
  application credentials.
- `CMS_GITHUB_CLIENT_ID_PRODUCTION` and `CMS_GITHUB_CLIENT_SECRET_PRODUCTION`:
  production OAuth application credentials.
- `CMS_PRODUCTION_ORIGIN`: exact HTTPS origin of the production Worker, initially
  its `workers.dev` address and later `https://cms.pycon.hk`.

The workflow checks the selected News branch and local CMS runtime, then deploys
and verifies the hosted Worker. The two CMS deploys have independent concurrency
groups; unchanged source/profile inputs skip the upload. Marketing needs News
repository write access only, not website repository or Cloudflare access.

Create or update the GitHub OAuth app with:

- Homepage URL: the exact Worker origin
- Authorization callback URL: `<worker-origin>/api/decap/callback`

Then complete a real login and a test News commit with an account that has
push permission to `pyconhk/pyconhk-news`. The callback rejects users whose
GitHub repository response does not report `permissions.push: true`. The default
OAuth scope is `public_repo`, matching the public News repository. Developers
keep website code and deploy permissions; marketing receives write access to
the News repository only. Protect its production branch and require a reviewer
for promotion from `test` before relying on this role boundary.

## Production Cutover

Do not attach `cms.pycon.hk` until the `workers.dev` deployment passes the HTTP
E2E checks, browser config load, real OAuth, image upload, and test commit checks.

The existing Vercel DNS record for `cms.pycon.hk` must be removed before adding
the Worker custom domain. After the custom domain is attached:

1. Set the GitHub OAuth app homepage and callback to `https://cms.pycon.hk` and
   `https://cms.pycon.hk/api/decap/callback`.
2. Run the hosted CMS tests against `https://cms.pycon.hk`.
3. Complete one real edit and confirm the locale-coded files land on News
   branch `main`, while test edits remain on News branch `test`.
4. Confirm each website build consumes the matching News branch at a recorded
   commit and the public website update succeeds.

`CMS_PUBLIC_URL` is normally unnecessary because routes derive their canonical
origin from the request. Set it only when a trusted proxy makes that origin
incorrect; its value must be an `http` or `https` origin without a path.

## Decap compatibility

`patches/decap-cms-core@3.16.0.patch` guards the optional locale callback in the
second editor pane. Bun applies it through the root workspace `patchedDependencies`.
The CMS editor E2E exercises the patched editor. Published core versions
3.0.0, 3.6.3, 3.8.1, 3.10.1, 3.12.0–3.15.0 and 3.18.1 still contain this bug;
remove the patch when upgrading to a release that fixes it.
