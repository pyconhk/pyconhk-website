# PyCon HK 2026 release and Outstatic retirement

## Implemented code

The starting point is `test` commit `42b28b4`; local and remote `alex-dev` were
fast-forwarded to it before implementation. The horse branding is retained.
2026 News and conference pages use Decap content. Unconfirmed details remain
editable drafts, and a ticket link is separate from the CFP link. Privacy and
all three conduct/procedure pages render one English body under each locale's
conference navigation. The 2025 archive and `/outstatic/images/` remain supported.

The internal submission export was removed from the current tree. Its earlier
Git history is **not** cleaned by this release; history remediation remains a
separate operation.

## Build and schedule configuration

`.github/workflows/deploy-website.yml` handles pushes to `main`, `test`, and
`alex-dev`, manual dispatch and scheduled checks every five minutes, offset from
the top of the hour. Every entry point calls `deploy-website-reusable.yml`.

| Target | Source branch | Pages project | Pretalx event |
| --- | --- | --- | --- |
| production | main | pyconhk-website-prod | pyconhk2026 |
| test | test | pyconhk-website-test | pyconhk2025 |
| preview | alex-dev | pyconhk-website-test (alex-dev alias) | pyconhk2025 |

`scripts/website-deployment.ts` owns the event URL and deployment mapping. Test
uses `https://pretalx.com/pyconhk2025/schedule/export/schedule.json`. Production
uses `https://cfp.pycon.hk/pyconhk2026/schedule/export/schedule.json`; an initial
404 yields a coming-soon state, never a 2025 fallback. Switch the test source
only after verifying the actual public 2026 export.

The poll compares the source commit and a normalized public content hash against
the last deployed `/deployment-manifest.json`. The matching event/environment's
`/programme-snapshot.json` supplies the previous successful baseline. These two
public files carry `Cache-Control: no-store`. Timestamps alone do not rebuild.
Code/CMS commits and manual `force=true` do. Failed fetch, validation or build
ends before upload, leaving the previously deployed site intact. A previously
published programme cannot silently become an initial unpublished fallback.

Jobs serialize per target and check the branch head again before upload, so an
older checkout cannot overwrite a newer queued revision. Wrangler runs from
`website/`, retaining its `functions/`, generated redirects and static output.

To test ingestion locally:

```sh
PROGRAMME_ENVIRONMENT=test PROGRAMME_SOURCE_EVENT=pyconhk2025 \
  mise run //website:build
```

In GitHub, choose **Deploy Website → Run workflow → target**, then choose whether
to force a rebuild. Cron becomes active only once the workflow is on `main`.
[GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
allows delays and missed queued runs; five minutes is a check frequency, not a
delivery guarantee. Public repositories' standard hosted runners have no minutes
charge under the [GitHub Actions billing model](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Live prerequisites and cutover order

Read-only audit on 2026-09-08 identified the following resources:

| Resource | Observed state |
| --- | --- |
| Cloudflare account | `043801e2f5b9cf2685593bd9098e98b1`, Website.pyconhk@gmail.com |
| `pyconhk-website-test` / `pyconhk-website-prod` | Existing Git-connected Pages projects; automatic builds still enabled |
| `pyconhk-cms` | Existing Worker at `pyconhk-cms.website-pyconhk.workers.dev`; old five-locale Decap config |
| `pyconhk-website-cms` | Separate Pages project, builds paused; do not assume this is the Vercel Outstatic project |
| `cms.pycon.hk` | Old Vercel Outstatic; DNS target `a0a85bda7ab07c4d.vercel-dns-017.com` |
| Vercel team/project | `websitepyconhk-7821s-projects/pyconhk-website-cms`, project ID `prj_vv7MFOlgnQ0v3cZ33dMWhTpo1evB` |
| Old Outstatic source | Separate repo `pyconhk/pyconhk-website-cms`, observed deployment source `5c865d8cbdd9f6f485c703fefe3e6391a9004253` |
| Old active Vercel deployment | `ExN3CtFc92h3SNuXMQud3ijm9ujs`, visit URL `pyconhk-website-367xo1llm-websitepyconhk-7821s-projects.vercel.app` |
| Vercel deploy hooks | None configured, verified in project Git settings |
| Outstatic environment names | `OST_REPO_SLUG`, `OST_REPO_BRANCH`, `OST_REPO_OWNER`, `OST_CONTENT_PATH`, `OST_MONOREPO_PATH`, `OST_GITHUB_ID`, `OST_GITHUB_SECRET` (all environments; secret value not inspected) |
| Old Outstatic OAuth client ID | `Iv23liF1XfASGZRIyygq` |
| Existing Decap OAuth client ID | `Ov23lic6lJluZ1ZEU5S0`, observed in public authorization redirect; distinct from Outstatic |
| GitHub Actions secrets | None at audit time |
| GitHub caller | Maintainer, not administrator |
| `main` ruleset | One approval, code-owner and last-push approval, no bypass actor |
| Required build check | `Cloudflare Pages: pyconhk-website-test`, bound to Cloudflare integration `85455` |

1. Provision a Cloudflare API token limited to Pages editing in the PyCon account
   as GitHub Actions secret `CLOUDFLARE_API_TOKEN`. Worker release and DNS cutover
   need their own appropriate access. The current local named Wrangler profile
   was observed to authenticate to a different personal account; do not deploy
   through it. A broader OAuth reauthorization was rejected by automatic approval
   review and has not been completed.
2. Merge and verify the GitHub preview deployment on `alex-dev`, including
   `/deployment-manifest.json`, timetable, policy pages, archive redirects,
   images and Pages Functions. Promote code through `test` and reviewed `main`.
3. A repo administrator must replace the Cloudflare-provider required check with
   the actual GitHub build validation (`Validate Monorepo`), while retaining
   `Branch Rules` and the existing review policy. Never create a fake check using
   Cloudflare's name. Require `CMS Content Boundary` and `Validate Monorepo` on
   `cms` after its released base includes the trusted editorial workflow.
   Resolve the CMS promotion identity prerequisite described
   in `cms-decap-branching.md` before claiming automated publishing works.
4. After successful GitHub uploads to both environments, disable production and
   preview auto-builds for both Pages projects using their existing Git deployment
   settings, as described in [Cloudflare's documentation](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments).
   Keep project names, production branches, domains, Functions and redirects.
5. Retain the resolved CMS merge ancestry and subsequent archive URL corrections.
   Bring the CMS branch forward to the released code/schema without
   losing draft content so the new editorial workflow and conference seeds exist.

Merge commit `bb7289a` resolved conflicts in 14 localized MDX files while preserving
the incoming CMS prose and frontmatter. Final CI then identified 30 incoming
locale-prefixed hrefs that the 2025 archive does not emit. Those hrefs and 21
visible URL labels were corrected to the actual canonical archive routes:
`/2025/schedule/`, `/2025/sprint/`, `/2025/access-guide/` and
`/2025/catering-guide/`. The correction preserves all other prose and frontmatter;
news validation passes and all four targets exist in the built archive.
The merge's parents are the inspected `test` and `cms` revisions. Integrate that
ancestry with the code release so future CMS promotions share the resolved history.

Live ingestion checks succeeded: the 2025 feed returned version `0.15`, 35
sessions and six room groups; a second scrape with the same baseline returned
`changed=false`. `prepare test --force` succeeded without uploading. The 2026
export returned a direct 404 and generated an unpublished snapshot. Its response
advertised `max-age=14400`; verify the upstream/Cloudflare cache behavior again
when publishing the real 2026 schedule. A request `Cache-Control: no-cache` alone
is not proof that every intermediary revalidates within five minutes.

## Outstatic retirement acceptance

Do these in order, using actual provider resource IDs and recording the result:

1. Find the Vercel project owning `cms.pycon.hk`, every deployment alias and
   preview domain, deploy hook, environment credential name, and GitHub OAuth app.
   Mark resources as dedicated or shared. A DNS CNAME alone does not identify the
   project or prove that an OAuth app is dedicated.
2. Deploy the Decap Worker to its existing `workers.dev` hostname. Run
   `CMS_BASE_URL=<workers.dev URL> mise run //cms:e2e` and the Worker E2E test,
   then verify editor login, a draft edit, image upload and six-language publish.
3. Confirm the editorial PR changes only owned content/media, passes validation,
   and reaches `cms → main → GitHub build → public page` successfully.
4. Record the current Vercel DNS and OAuth callback. Move `cms.pycon.hk` to the
   `pyconhk-cms` Worker, set `CMS_PUBLIC_URL=https://cms.pycon.hk`, and update the
   existing Decap OAuth callback to `https://cms.pycon.hk/api/decap/callback`.
5. Repeat login, edit, image and public publishing checks at the custom hostname.
   Check `/outstatic/images/` and historical media compatibility URLs.
6. Disable the verified old Outstatic deployment hooks, aliases and preview
   entrances. Only after the new flow works, delete the dedicated old Vercel
   project/deployments and revoke its dedicated credentials. Preserve shared
   integrations and content. Do not delete the unrelated paused Cloudflare Pages
   CMS project without identifying its separate role.

Until those provider checks succeed, Outstatic retirement and the build-provider
cutover must be reported as pending rather than inferred from a local build.

## Implementation verification

- Website typecheck, lint, static build and 106 archive contract checks passed.
- CMS typecheck, lint, build and Wrangler deployment dry-run passed; 26 CMS unit
  tests, four conference schema tests and 20 root operations tests passed.
- Browser coverage passed across 121 blue-green cases, 15 locale cases, 48
  additional website cases and the isolated CMS News routing build case. The two
  sample-only timetable interaction cases are skipped in production coming-soon
  mode and were separately exercised with the public 2025 sample build.
- Local Decap test backend verified draft saving, six language choices, blocked
  incomplete publication and Korean editing. A minimal version-specific patch
  fixes Decap 3.16.0's optional locale callback; a fresh frozen-lockfile install
  and installed-handler regression both passed.
- Live GitHub uploads, actual editor OAuth/publishing, custom-domain cutover and
  Vercel deletion remain unverified and unexecuted pending provider access and
  the repository rule prerequisites above.
