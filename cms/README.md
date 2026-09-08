# PyCon HK Website CMS

Astro 7 and Decap CMS run as one Cloudflare Worker with static assets. The CMS
edits `pyconhk/pyconhk-website` through GitHub OAuth and writes content to the
`cms` branch.

## Runtime Shape

- `@astrojs/cloudflare` builds the Astro server for Workers.
- Cloudflare serves the generated client files through the `ASSETS` binding.
- OAuth state and PKCE values use short-lived, HttpOnly browser cookies.
- No KV, D1, R2, Durable Object, or Astro session storage is required.
- `nodejs_compat` is enabled because the OAuth implementation uses
  `node:crypto`.
- Worker variables come from `wrangler.jsonc`; OAuth credentials are Worker
  secrets and are never committed.

The Worker exposes:

- `/admin/`: GitHub-backed CMS
- `/admin/test/`: in-memory Decap test backend
- `/admin/config.yml`: generated Decap configuration
- `/api/decap/auth` and `/api/decap/callback`: GitHub OAuth

## Content Model

The CMS uses Decap's `multiple_files` i18n structure with `en`, `zh-hk`,
`zh-hant`, `zh-hans`, and `ja`. The sidebar exposes one folder collection per
conference year, currently `2026 Posts` and `2025 Posts`. The year is determined
by the collection, so editors do not enter it as post metadata.

A 2026 post such as `hello-world` is stored as:

```text
website/outstatic/content/2026-posts/hello-world.en.mdx
website/outstatic/content/2026-posts/hello-world.zh-hk.mdx
website/outstatic/content/2026-posts/hello-world.zh-hant.mdx
website/outstatic/content/2026-posts/hello-world.zh-hans.mdx
website/outstatic/content/2026-posts/hello-world.ja.mdx
```

The `cms` branch must be seeded with this locale-coded shape before editors use
the production backend. Legacy files such as `hello-world.mdx` are not entries
in a `multiple_files` collection.

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
CMS_BASE_URL=http://127.0.0.1:4323 mise run //cms:check
```

Use `/admin/test/` to verify the multilingual editor without GitHub. Nothing is
persisted; automated checks use isolated fixtures in the test suite.

## Validation

Run the CMS release gates from the repository root:

```bash
mise run validate-cms-ops
mise run check-cms-release
mise run //cms:check
mise run //cms:deploy-dry-run
```

The release check fetches `origin/cms` and rejects legacy or incomplete locale
file sets. The dry-run builds with Workerd and asks Wrangler to assemble the
deployable Worker without publishing it. Pull-request CI runs both checks.

After deploying any preview or production URL, run:

```bash
CMS_BASE_URL=https://your-worker.example mise run //cms:check
```

The HTTP smoke check covers redirects, generated config, runtime bindings,
OAuth scope, PKCE cookies, callback headers, and exact popup origin binding. A
final release check must also open `/admin/test/` in a browser because Decap
validates widget schemas in the client.

## Cloudflare Deployment

Switch Chrome to the `website pyconhk` profile, then create and activate the
dedicated Wrangler profile. Do not create or share a Global API key:

```bash
cd cms
mise exec -- bun x wrangler auth create website-pyconhk
mise exec -- bun x wrangler auth activate website-pyconhk .
mise exec -- bun x wrangler whoami
```

`wrangler.jsonc` pins the Website PyCon HK Cloudflare account ID, so deployment
cannot silently select another account available to the authenticated user.

Create a GitHub OAuth app to obtain its client ID and client secret. Its URLs can
be updated after Wrangler reports the generated `workers.dev` origin.

Store both credentials as encrypted Worker secrets before the first deployment.
Wrangler prompts for each value, so they do not appear in shell history:

```bash
cd cms
mise exec -- bun x wrangler secret put CMS_GITHUB_CLIENT_ID
mise exec -- bun x wrangler secret put CMS_GITHUB_CLIENT_SECRET
mise exec -- bun x wrangler secret list
```

Deploy to the generated `workers.dev` URL:

```bash
mise run //cms:deploy
```

Deployment compares CMS build inputs with the hosted `/deployment-manifest.json` and
skips build/upload when unchanged. The first release with no manifest deploys normally.
The default origin is `https://pyconhk-cms.website-pyconhk.workers.dev`; set
`CMS_DEPLOY_ORIGIN` when deploying to a different configured Worker origin.
Use `mise exec -- bun run deploy --force` from `cms/` to force a release (including
after external variable/secret changes). Website content edits do not redeploy the CMS.
When a release is needed, the remote CMS release check runs before build, Wrangler
requires both OAuth secrets, and the hosted source hash is verified after upload.

Create or update the GitHub OAuth app with:

- Homepage URL: the exact Worker origin
- Authorization callback URL: `<worker-origin>/api/decap/callback`

Then complete a real login and a test content commit with an account that has
push permission to `pyconhk/pyconhk-website`. The callback rejects users whose
GitHub repository response does not report `permissions.push: true`. The default
OAuth scope is `public_repo`, matching this public repository.

## Production Cutover

Do not attach `cms.pycon.hk` until the `workers.dev` deployment passes the HTTP
smoke, browser config load, real OAuth, image upload, and test commit checks.

The existing Vercel DNS record for `cms.pycon.hk` must be removed before adding
the Worker custom domain. After the custom domain is attached:

1. Set the GitHub OAuth app homepage and callback to `https://cms.pycon.hk` and
   `https://cms.pycon.hk/api/decap/callback`.
2. Run the hosted CMS tests against `https://cms.pycon.hk`.
3. Complete one real edit and confirm the locale-coded files land on `cms`.
4. Confirm the scheduled promotion workflow accepts only CMS-owned paths and
   the public website build succeeds.

`CMS_PUBLIC_URL` is normally unnecessary because routes derive their canonical
origin from the request. Set it only when a trusted proxy makes that origin
incorrect; its value must be an `http` or `https` origin without a path.

## Decap compatibility

`patches/decap-cms-core@3.16.0.patch` guards the optional locale callback in the
second editor pane. Bun applies it through the root workspace `patchedDependencies`.
The installed-handler regression test covers both panes. Published core versions
3.0.0, 3.6.3, 3.8.1, 3.10.1, 3.12.0–3.15.0 and 3.18.1 still contain this bug;
remove the patch when upgrading to a release that fixes it.
