# Content deployment reconciliation

The Worker is disabled by default (`ENABLED=false`). Repository code can roll out
using existing integrations before new ongoing credentials are approved.

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
2. With explicit approval, configure an owner-provided GitHub App installation
   token mechanism or scoped fine-grained token as Worker `GITHUB_TOKEN`:
   only `pyconhk-news` and `pyconhk-website`, Contents read and Actions read/write.
   Existing News `GITHUB_TOKEN` retains its current Contents/PR/Checks permissions.
   The Worker does not require permission to merge or write repository content.
3. Configure the **same owner-provided callback secret** as Worker and News
   repository `RECONCILER_TOKEN`; set News repository variable `RECONCILER_URL` to
   the approved deployed HTTPS workers.dev URL. No secret has been generated.
   For production expanded public data, provide the already approved scoped
   Pretalx token as Worker `PRETALX_API_TOKEN` if anonymous expansion requires it.
   The existing GitHub Pretalx credential remains unchanged.
4. Configure website `CLOUDFLARE_CACHE_PURGE_TOKEN` restricted to Cache Purge on the
   `pycon.hk` zone, and `CLOUDFLARE_ZONE_ID`. This is separate from the existing
   Pages Edit credential/account and does not grant DNS edits. Preserve existing
   `NEWS_SOURCE=external` and Pages upload configuration.
5. With approval, upload `reconciler/wrangler.jsonc` and its migration to the
   existing PyCon Cloudflare account. Set credentials via approved secret tooling,
   never command arguments or Git. The upload activates the single five-minute
   cron. Verify test promotion, failed upload repair, and cache invalidation first;
   then observe production without forcing a build. Finally set Worker `ENABLED=true`
   and repository `CONTENT_RECONCILIATION_ENABLED=true` in both repositories only
   after callbacks and scoped cache invalidation are verified. This switches to
   the single active Worker cron. To roll back scheduling, set Worker `ENABLED=false`
   and repository `CONTENT_RECONCILIATION_ENABLED=false`; existing GitHub polling
   resumes without reverting code.

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
production activation and end-to-end GitHub/Cloudflare checks remain unperformed.

### Credential minimization and outage behavior

A dual-repository credential is **not mandatory**. The implementation also accepts
`NEWS_GITHUB_TOKEN` restricted to News (Contents read, Actions read/write) and
`WEBSITE_GITHUB_TOKEN` restricted to Website (Actions read/write only). These
repository-selected credentials take precedence over a common `GITHUB_TOKEN`.
Use an approved GitHub App with short-lived installation tokens where available;
its token renewal must be explicitly authorized and supplied by the owner. A
one-time installation token stored as a secret will expire, so it is not a
persistent solution. Repo-scoped fine-grained tokens are a simpler owner-managed
alternative. No organization-wide, Contents-write, PR-write or admin grant is
needed by the Worker. No grants or renewal service were created here.

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
