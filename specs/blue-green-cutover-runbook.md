# Blue-Green Cutover And Rollback Runbook

Date: 2026-07-01

This runbook covers the public Astro website under `website/`. It is for replacing
the current live public site with a green Cloudflare Pages deployment, then rolling
back quickly if production behavior is not acceptable.

It does not cover the Decap CMS cutover for `cms.pycon.hk`.

## Scope And Ground Rules

- Blue is the current production public website serving `pycon.hk` and any owner-approved
  public aliases.
- Green is the candidate Cloudflare Pages deployment for the Astro website in this
  repository.
- Keep blue untouched until the post-cutover E2E pass and owner sign-off are complete.
- Do not delete old Cloudflare Pages projects, deployments, DNS records, or custom-domain
  entries during the cutover window.
- Do not cut over if any required local or hosted E2E gate fails.
- Do not claim Cloudflare, DNS, GitHub branch protection, secrets, or production build
  settings are correct until the owner verifies them in the external services.

## What The Repo Proves Locally

These items are verified by committed repository files, not by external service state:

- The public website app lives under `website/`.
- The root mise task surface includes `mise install`, `mise run install`, `mise run ci`,
  and `mise run e2e`.
- `mise run e2e` runs the public website Playwright E2E tests through the website task.
- The hosted E2E suite can target a deployed site with:

```bash
PLAYWRIGHT_BASE_URL=https://<green-hostname> mise run e2e
```

- `website/wrangler.toml` names the local Pages project as `pyconhk-public-site` and
  declares `pages_build_output_dir = "./dist"` for the `website/` app.

## External Settings Requiring Owner Verification

Record these values before the cutover window starts. The repository does not prove
them.

| Setting | Required owner verification |
| --- | --- |
| Blue production hostnames | Exact hostname list currently serving production, for example `pycon.hk` and `www.pycon.hk` if both are live. |
| Blue rollback target | Cloudflare Pages project/deployment, DNS target, or legacy origin that currently serves production. |
| Green hostname | Exact Cloudflare Pages preview, branch alias, or staging custom domain used for hosted E2E. |
| Green deployment commit | Exact Git commit SHA deployed to green. |
| Cloudflare Pages project root | Confirm the public website build runs from `website/`, or document the equivalent monorepo command setup. |
| Cloudflare Pages build command | Confirm it provisions the same toolchain and produces the Astro `dist` output. |
| Cloudflare Pages output directory | Confirm the published output resolves to `website/dist` or the dashboard equivalent. |
| Runtime/tool versions | Confirm Cloudflare Pages uses Node `24.18.0` and Bun `1.3.10`, matching mise. |
| GitHub branch rules | Confirm the production deployment branch and PR rules match the intended release path. |
| Cloudflare custom-domain ownership | Confirm `pycon.hk` is in the Cloudflare account that owns the target Pages project. |
| DNS records | Record current blue DNS/custom-domain records and the intended green records before changing them. |
| Cache controls | Confirm whether any Cloudflare cache purge is required after cutover or rollback. |
| Access policy | Confirm green is publicly reachable for E2E tests, or that the operator running E2E has access. |

Cloudflare product behavior to account for:

- Custom domains must be added through the Pages custom-domain flow; a DNS-only CNAME
  pointed at Pages without a Pages custom-domain association can fail to resolve.
- A branch custom domain requires a proxied Cloudflare DNS record. With external DNS or
  an unproxied record, Cloudflare documents that the custom alias is sent to the Pages
  production branch.
- Cloudflare Pages production rollbacks are available from the Pages deployment list,
  but that rollback only helps when blue and green are deployments of the same Pages
  project. If the cutover changes DNS or moves a custom domain between projects, keep a
  DNS/custom-domain rollback path ready too.

References:

- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Cloudflare Pages branch custom domains](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/)
- [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## Required Run Sheet

Create one run sheet per cutover attempt and fill these values before touching DNS or
custom domains.

| Field | Value |
| --- | --- |
| Cutover owner | |
| Rollback owner | |
| Start time | |
| Decision deadline | |
| Candidate branch | |
| Candidate commit SHA | |
| Blue hostname list | |
| Blue Cloudflare Pages project or origin | |
| Blue deployment ID or DNS target | |
| Green Cloudflare Pages project | |
| Green deployment ID | |
| Green hostname for E2E | |
| Production hostnames to cut over | |
| DNS/custom-domain cutover method | |
| Cloudflare cache purge needed | |
| Rollback method rehearsed | |
| Rollback rehearsal timestamp | |

## Preflight

Run these commands from the repository root on the exact candidate commit intended for
green.

```bash
mise install
mise run install
mise run ci
mise run e2e
```

Preflight fails if any command exits non-zero. Stop and fix the candidate before
deploying green.

Before leaving preflight:

1. Confirm `git status --short` contains only expected release changes.
2. Record the candidate commit SHA in the run sheet.
3. Confirm the E2E suite covers the launch-critical behavior documented in the
   coordination note: redirects, locale cookies, critical pages, static assets, robots,
   and sitemap.
4. Freeze release changes except fixes approved by the cutover owner.
5. Confirm the rollback owner can access Cloudflare DNS, Pages, and any legacy hosting
   controls needed to restore blue.

Abort before deploy if:

- local `mise run ci` fails;
- local `mise run e2e` fails;
- the rollback owner cannot access the required external controls;
- the blue rollback target is not recorded;
- the green deployment settings are not owner-verified.

## Deploy Green

This repository does not contain a public-site production deployment workflow. Deploy
green through the owner-approved Cloudflare Pages mechanism.

Required green deployment checks:

1. Deploy the candidate commit to a Cloudflare Pages green environment.
2. Record the Cloudflare Pages project, deployment ID, hostname, and commit SHA.
3. Confirm the deployment status is successful in Cloudflare Pages.
4. Confirm the green hostname serves HTTPS without certificate warnings.
5. Confirm the green hostname is publicly reachable by the operator who will run E2E.
6. Confirm the green deployment is isolated from blue and does not already serve live
   `pycon.hk` traffic.

Deployment fails if:

- Cloudflare Pages builds a different commit than the run sheet records;
- the build uses unverified Node/Bun versions or an unverified output directory;
- the green hostname is inaccessible;
- HTTPS is not active;
- the green environment already owns production traffic before the cutover decision.

## Hosted Green E2E

Run the same Playwright E2E suite against the hosted green hostname.

```bash
PLAYWRIGHT_BASE_URL=https://<green-hostname> mise run e2e
```

Hosted E2E fails if the command exits non-zero.

Also manually inspect Cloudflare deployment logs for failed asset uploads, build
warnings that indicate missing generated routes/assets, or unexpected runtime errors.
Do not cut over until the E2E command passes and deployment logs are acceptable to
the cutover owner.

Rollback rehearsal must happen before production cutover:

1. If blue and green are deployments in the same Pages project, rehearse Cloudflare
   Pages rollback on a non-production project or staging deployment and record the
   target deployment selection path.
2. If cutover will move DNS or custom-domain records between projects/origins, rehearse
   the equivalent staging hostname move or dry-run every dashboard step with current
   blue and green values recorded.
3. Record the rehearsal timestamp and owner in the run sheet.

Abort before cutover if:

- hosted green E2E fails;
- deployment logs show missing routes, missing assets, or unexpected runtime errors;
- rollback has not been rehearsed or dry-run with the actual production values recorded;
- the owner cannot confirm the exact DNS/custom-domain changes required.

## DNS Or Custom-Domain Cutover

Choose one cutover method before the window. Use the method that matches the
owner-verified Cloudflare setup.

### Method A: Same Pages Project Production Roll Forward

Use this only when blue and green are deployments in the same Cloudflare Pages project
and production hostnames already point at that project.

1. Confirm the green deployment is the intended production candidate.
2. Promote or roll forward the Pages production deployment according to the approved
   Cloudflare Pages release control for the project.
3. Keep the previous production deployment ID recorded as the rollback target.
4. Do not change DNS unless the owner has confirmed DNS is part of this method.

### Method B: Custom Domain Move Between Pages Projects

Use this when blue and green are separate Pages projects and production hostnames must
move to the green project.

1. In Cloudflare DNS and Pages, record screenshots or copied values for every current
   production hostname.
2. In the blue Pages project, prepare to remove production custom domains only at the
   cutover moment.
3. In the green Pages project, add the production custom domains through the Pages
   custom-domain flow.
4. Let Cloudflare create or update the required DNS records, or apply the owner-approved
   DNS changes exactly as recorded in the run sheet.
5. Wait for Pages custom-domain status and HTTPS to become active.

### Method C: DNS Target Swap

Use this only when production traffic is controlled by DNS records that can safely be
pointed from blue to green.

1. Confirm the DNS records and their previous values are recorded.
2. Update only the production hostnames listed in the run sheet.
3. Point the records to the owner-verified green Pages hostname or target.
4. Keep the previous DNS values available for rollback.
5. Wait for Cloudflare DNS and HTTPS status to settle.

Cutover fails if:

- Pages custom-domain activation fails;
- production hostnames show certificate warnings;
- DNS resolves to an unexpected target;
- live traffic reaches a deployment ID or commit SHA different from the run sheet;
- the cutover cannot be completed before the decision deadline.

If cutover fails before production traffic moves, abort and leave blue serving traffic.
If production traffic has moved, start rollback immediately unless the cutover owner
explicitly accepts a short fix-forward window.

## Post-Cutover Verification

Run hosted E2E against every production hostname that should serve the public site.
For each hostname, replace `<production-hostname>` with the exact value from the run
sheet.

```bash
PLAYWRIGHT_BASE_URL=https://<production-hostname> mise run e2e
```

Post-cutover verification passes only when all production hostname E2E runs exit 0.

Also verify:

1. `https://pycon.hk/` resolves to the expected locale behavior.
2. Critical localized pages load without asset errors.
3. Current and archive routes load from the expected Astro deployment.
4. Critical legacy redirects still resolve.
5. `/robots.txt` and `/sitemap.xml` return successful responses and expected content.
6. Static assets, Open Graph images, and legacy media used by the E2E routes return
   successful responses.
7. Cloudflare analytics/logs do not show a spike in 4xx/5xx responses after cutover.

Hold the rollback window open until:

- all E2E runs pass;
- the cutover owner accepts the analytics/log sample;
- no launch-blocking user reports are open;
- the previous blue rollback target remains available.

## Rollback Triggers

Rollback immediately if any of these happen after production traffic starts moving:

- any production `PLAYWRIGHT_BASE_URL=... mise run e2e` E2E run fails;
- `pycon.hk` or another production hostname has HTTPS/certificate errors;
- root locale redirect or locale-cookie behavior is broken;
- critical current-year, archive, or news routes return 404/500;
- critical static assets, social images, CSS, or JS fail to load;
- `/robots.txt` accidentally blocks production crawling or `/sitemap.xml` is missing;
- legacy redirects needed for launch-critical archive traffic fail;
- Cloudflare logs show sustained elevated 4xx/5xx responses;
- the team cannot determine which deployment is serving production;
- the decision deadline passes without a clean post-cutover E2E pass.

## Rollback Procedure

Pick the rollback path that matches the cutover method actually used.

### Rollback For Method A

1. In Cloudflare Pages, open the production project deployment list.
2. Select the previous blue production deployment ID recorded in the run sheet.
3. Use Cloudflare Pages rollback to restore that deployment.
4. Confirm production hostnames still point at the same Pages project.
5. Run production E2E:

```bash
PLAYWRIGHT_BASE_URL=https://<production-hostname> mise run e2e
```

6. If Cloudflare caching could serve stale green assets or HTML, perform the
   owner-approved cache purge and rerun E2E.

### Rollback For Method B

1. Stop further green deployment changes.
2. Remove or detach production custom domains from the green Pages project as required
   by Cloudflare Pages.
3. Restore the production custom domains to the blue Pages project using the recorded
   blue values.
4. Restore any DNS records that changed during cutover.
5. Wait for Pages custom-domain and HTTPS status to become active on blue.
6. Run production E2E:

```bash
PLAYWRIGHT_BASE_URL=https://<production-hostname> mise run e2e
```

7. If Cloudflare caching could serve stale green assets or HTML, perform the
   owner-approved cache purge and rerun E2E.

### Rollback For Method C

1. Restore the DNS records to the previous blue values from the run sheet.
2. Confirm DNS resolves to the blue target.
3. Confirm HTTPS is valid for every production hostname.
4. Run production E2E:

```bash
PLAYWRIGHT_BASE_URL=https://<production-hostname> mise run e2e
```

5. If Cloudflare caching could serve stale green assets or HTML, perform the
   owner-approved cache purge and rerun E2E.

Rollback succeeds only when production hostnames serve blue again and production E2E
passes. Keep the incident open if E2E passes but logs still show elevated 4xx/5xx
responses.

## After A Successful Cutover

1. Record the final production deployment ID, commit SHA, and cutover time.
2. Keep blue available until the owner closes the rollback window.
3. Keep the rollback run sheet with the release notes.
4. Re-enable normal release and content promotion only after the cutover owner signs off.
5. If rollback was used, open a follow-up issue with the failing E2E output, deployment
   ID, and Cloudflare log evidence.
