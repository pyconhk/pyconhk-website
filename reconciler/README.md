# Content deployment reconciliation

The intended active state is source-controlled (`ENABLED=true`). Deploy this
configuration only after the scoped credentials and both repository flags are
ready. Deploy with `--var ENABLED:false` to suspend the Worker immediately.

One Cloudflare cron (`*/5 * * * *`) checks production and test independently.
Each environment has its own SQLite Durable Object. The object serializes checks,
reserves a correlation ID before dispatch, and retains dirty/recheck state while
work is running. A lost dispatch response retains the reservation for a 30-minute
GitHub indexing grace period; confirmed rejection or a completed failed run can
retry at the next tick. Reservations are never successful content versions.

The Worker compares anonymous published Pretalx releases plus their expanded
public sessions, speakers, biographies, abstracts and descriptions using the same
normalization/hash code as Astro. An organizer token cannot publish draft slots:
the anonymous published release remains the boundary. It also checks unpromoted
`cms → main` / `cms-test → test` changes and hashes all News posts/images from the
published branch's pinned Git tree. Maintenance commits do not change that hash.
Only uploaded site metadata plus successful workflow completion acknowledges a
version. Matching content does not queue validation, build or upload work.

The cron dispatches the existing trusted News promotion workflow. That workflow
continues its pinned merge-candidate validation, six-language/draft rules, file
boundary checks and target-race protection. After successful publication (or a
cron-requested repair), an authenticated callback to this Worker dispatches the
website workflow through the **same reservation**. Thus promotion and programme
changes become one website build. Duplicate callbacks and overlapping cron checks
cannot queue a second build. If another website build is active, the callback
retains dirty state and the next tick rechecks the published version. CMS refs are
never website build inputs. Immediate save → validate → promote remains enabled
through `workflow_run`. GitHub polling remains the fallback until the repository
variable `CONTENT_RECONCILIATION_ENABLED=true` disables its scheduled jobs.

Website preflight pins published News, computes its content-tree version, and
finalization verifies the checkout and hashes the rendered pages/assets. The
manifest records changed/deleted URL paths. After upload, GitHub invalidates only
those paths (30 URLs per request, canonical/redirect variants) on the corresponding
`pycon.hk` or `test.pycon.hk` zone, then verifies hosted manifests/snapshot/homepage.
File-format HTML includes `.html`, extensionless and trailing-slash URLs; directory
pages include their `index.html`/`index` aliases. Static assets retain exact paths.
Pages deployment handles its own pages.dev cache. No purge-everything operation or
site-wide no-cache rule is introduced. Only version metadata bypasses cache.
If upload succeeded but invalidation/verification failed, the next reconciliation
requests completion repair: retry purge/verification while skipping an unchanged
build. A changed deployment first completes the previous manifest's targeted purge
before replacing that upload, so a second content change cannot discard URLs still
cached from an earlier failed purge. Repeating that small previous path set is
idempotent. Ordinary unchanged deployments do not repeat the previous cache purge.

## Review and authorized activation steps

1. Review the two local diffs. Apply website changes to **both main and test**;
   apply trusted News promotion changes to **main** (and maintain matching News
   policy on test). This is necessary because builds check out their target's
   deployment scripts. Do not activate the Worker before both site branches have
   the new content manifest and retry behavior.
2. Create a private, organization-owned GitHub App installed only on
   `pyconhk-news` and `pyconhk-website`, with Contents read and Actions read/write.
   Disable its webhook and user OAuth flow. Configure Worker `GITHUB_APP_ID`,
   `GITHUB_APP_INSTALLATION_ID` and encrypted `GITHUB_APP_PRIVATE_KEY` as described
   below. The Worker obtains and renews short-lived installation tokens itself.
   Existing News `GITHUB_TOKEN` retains its current Contents/PR/Checks permissions.
   The Worker does not require permission to merge or write repository content.
3. Configure the **same approved callback secret** as Worker and News
   repository `RECONCILER_TOKEN`; set News repository variable `RECONCILER_URL` to
   the approved deployed HTTPS workers.dev URL. Keep secret values out of Git,
   command arguments and logs.
   For production expanded public data, provide the already approved scoped
   Pretalx token as Worker `PRETALX_API_TOKEN` if anonymous expansion requires it.
   The existing GitHub Pretalx credential remains unchanged.
4. Configure website `CLOUDFLARE_CACHE_PURGE_TOKEN` restricted to Cache Purge on the
   `pycon.hk` zone, and `CLOUDFLARE_ZONE_ID`. This is separate from the existing
   Pages Edit credential/account and does not grant DNS edits. Preserve existing
   `NEWS_SOURCE=external` and Pages upload configuration.
5. With approval, configure credentials while the deployed Worker remains disabled.
   Set repository `CONTENT_RECONCILIATION_ENABLED=true` in **both repositories**
   before deploying the reviewed enabled configuration: News gates the callback
   and Website gates targeted cache invalidation on those flags. Deploy
   `reconciler/wrangler.jsonc` and its migration directly with Wrangler to the
   existing PyCon account (the GitHub upload helper accepts only disabled config),
   then read back `ENABLED=true` and the single five-minute cron. Verify a real
   test cron-to-callback deployment, completion repair, cache invalidation and
   duplicate callback handling; observe production without forcing a build.
   A green News run alone does not prove its callback succeeded, and an accepted
   dispatch alone does not prove deployment completion.
   To roll back scheduling, deploy with `--var ENABLED:false` and set repository
   `CONTENT_RECONCILIATION_ENABLED=false` in both repositories. Existing GitHub
   polling resumes. Persist `ENABLED=false` in source before the next ordinary
   Worker deployment so it preserves the rollback state.

## Local verification

Use Node 24 and the existing Bun dependencies:

```
node --test .github/deploy/*.test.ts cms/gateway/*.test.ts reconciler/*.test.ts
node --test cms/publication/content.test.ts website/src/lib/programme/*.test.ts
node website/node_modules/typescript/bin/tsc -p reconciler/tsconfig.json
node website/node_modules/@biomejs/biome/bin/biome lint reconciler .github/deploy/cache.ts .github/deploy/cache.test.ts
WRANGLER_LOG_PATH=/tmp/pyconhk-wrangler.log WRANGLER_SEND_METRICS=false node website/node_modules/wrangler/bin/wrangler.js deploy --dry-run --config reconciler/wrangler.jsonc --outdir /tmp/pyconhk-reconciler-bundle
```

In News: `node --test .github/news-promotion.test.ts`. Dry run bundles locally;
record production activation and end-to-end GitHub/Cloudflare results separately.

### Credential minimization and outage behavior

GitHub App authentication uses three bindings:

| Binding | Value |
| --- | --- |
| `GITHUB_APP_ID` | The registered App ID or client ID used as the JWT issuer. |
| `GITHUB_APP_INSTALLATION_ID` | Its installation on the PyCon HK organization. |
| `GITHUB_APP_PRIVATE_KEY` | Encrypted Worker secret containing the App key in PKCS#8 PEM format. |

Store all three bindings as Worker secrets so an ordinary Wrangler deployment
preserves them without relying on dashboard-only plaintext variables.

GitHub downloads App keys in PKCS#1 format. Convert the downloaded file locally
with `openssl pkcs8 -topk8 -nocrypt -in <downloaded-key.pem> -out <worker-key.pem>`.
Protect temporary key files with mode `0600`; send the converted key to Wrangler
through stdin, never as a command argument. Delete local temporary copies after
installation and verification. Keep key values out of source control and logs.

The App key has no automatic expiry and can be revoked in the App settings.
Installation tokens expire after one hour. The Worker signs a short-lived RS256
JWT, requests a token restricted to these two repositories and the configured
Actions/Contents permissions, and refreshes it before expiry. It does not require
an expiring personal access token or a manually supplied installation token.
No organization-wide, Contents-write, PR-write or admin grant is needed.
Missing or incomplete App configuration fails closed.

The shared callback credential grants only the Worker `/deploy` action. It cannot
change CMS, merge News, access repository contents or alter Cloudflare settings.
It is used because routing immediate and cron dispatches through one Durable
Object provides durable deduplication without a second cross-repository workflow
credential. GitHub OIDC verification could remove this persistent callback secret,
but would require a separately reviewed trust policy and workflow identity-token
permission; that alternative is not configured by this patch. If an existing
approved Cloudflare credential already has Cache Purge on the exact zone, it can
be reused instead of creating another grant. Otherwise request that zone-only
permission; do not broaden the Pages/DNS credential.

Callback IDs are durably consumed after acceptance or coalescing, so replay cannot
queue another deployment even after the reservation is cleared. A confirmed
GitHub rejection releases that callback ID for retry; an ambiguous result retains
it and the reservation until the indexing grace/recheck. Authentication requires
the configured bearer secret, HTTPS and no redirect forwarding. Unauthenticated
public calls return 404. Consumed IDs are not content acknowledgements.

A Worker outage or absent callback configuration does **not** block or roll back
save validation or promotion. The final callback step is allowed to fail after
publication. Published/deployed hashes still differ, so the next working cron
repairs the handoff. The existing immediate validation/promotion permissions and
six-language policy do not depend on the Worker. Site acknowledgement still waits
for an actual upload followed by successful cache invalidation/host verification;
a failed completed website run requests completion repair even if its uploaded
manifest is already visible.
