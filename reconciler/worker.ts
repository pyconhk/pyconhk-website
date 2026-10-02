import { fetchProgramme, validateSnapshot } from '../website/src/lib/programme/snapshot.ts';
import { newsContentHash } from './content.ts';
import { reconcile, type State } from './state.ts';

const targets = {
  production: {
    branch: 'main',
    cms: 'cms',
    event: 'pyconhk2026',
    origin: 'https://pyconhk-website-prod.pages.dev',
    source: 'https://pretalx.com/api/events/pyconhk2026/schedules/latest/',
  },
  test: {
    branch: 'test',
    cms: 'cms-test',
    event: 'pyconhk2025',
    origin: 'https://pyconhk-website-test.pages.dev',
    source: 'https://pretalx.com/pyconhk2025/schedule/export/schedule.json',
  },
};
type Environment = keyof typeof targets;
type Run = {
  id: number;
  name: string;
  display_title: string;
  status: string;
  created_at: string;
  conclusion: string | null;
  repository?: string;
};
interface Env {
  GITHUB_TOKEN?: string;
  NEWS_GITHUB_TOKEN?: string;
  WEBSITE_GITHUB_TOKEN?: string;
  PRETALX_API_TOKEN?: string;
  RECONCILER_TOKEN: string;
  ENABLED?: string;
  RECONCILIATION: {
    idFromName(name: string): unknown;
    get(id: unknown): { fetch(request: Request): Promise<Response> };
  };
}
interface Storage {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
}

export async function github(env: Env, repository: string, endpoint: string, body?: unknown) {
  const token =
    (repository === 'pyconhk-news' ? env.NEWS_GITHUB_TOKEN : env.WEBSITE_GITHUB_TOKEN) ||
    env.GITHUB_TOKEN;
  if (!token) throw new Error('Scoped GitHub reconciliation credential is not configured');
  const response = await fetch(`https://api.github.com/repos/pyconhk/${repository}/${endpoint}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'pyconhk-content-reconciler',
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20_000),
  });
  // Do not log responses, URLs supplied by credentials, or token values.
  if (!response.ok)
    throw Object.assign(new Error(`GitHub reconciliation request failed: ${response.status}`), {
      rejected: response.status >= 400 && response.status < 500,
    });
  return response.status === 204 ? null : response.json();
}

async function metadata(origin: string, filename: string) {
  const url = new URL(filename, origin);
  url.searchParams.set('reconciliation-check', Date.now().toString());
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
    // Only machine-readable version metadata bypasses Cloudflare cache.
    cf: { cacheTtl: 0 },
  } as RequestInit);
  if (
    response.status === 404 ||
    (response.ok && !response.headers.get('content-type')?.includes('application/json'))
  )
    return null;
  if (!response.ok) throw new Error(`Deployment metadata unavailable: ${response.status}`);
  return response.json();
}

export class ContentReconciliation {
  private serial: Promise<unknown> = Promise.resolve();
  private ctx: { storage: Storage };
  private env: Env;
  constructor(ctx: { storage: Storage }, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }

  fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const task = this.serial.then(async () => {
      if (request.method === 'POST') {
        const { target, id } = (await request.json()) as { target: string; id: string };
        await this.deploy(target, id);
      } else await this.check(url.pathname.slice(1));
    });
    this.serial = task.catch(() => undefined);
    return task
      .then(() => new Response('checked'))
      .catch(
        () =>
          new Response('Reconciliation failed; reserved work is retained for recheck.', {
            status: 503,
          })
      );
  }

  private async deploy(environment: string, id: string) {
    if (!Object.hasOwn(targets, environment) || !/^[A-Za-z0-9-]{1,100}$/.test(id))
      throw new Error('Invalid callback');
    const state = (await this.ctx.storage.get<State>('state')) || { dirty: true };
    const callbackKey = `callback:${id}`;
    if (await this.ctx.storage.get<boolean>(callbackKey)) return;
    if (state.pending && state.pending.id !== id) {
      // Another reconciliation already owns this environment. Its promotion
      // callback will build the latest published content; retain the recheck.
      state.dirty = true;
      await this.ctx.storage.put('state', state);
      await this.ctx.storage.put(callbackKey, true);
      return;
    }
    if (state.pending?.websiteDispatched) return;
    for (const status of ['queued', 'in_progress', 'waiting', 'pending', 'requested']) {
      for (let page = 1; ; page++) {
        const data = await github(
          this.env,
          'pyconhk-website',
          `actions/workflows/deploy-website.yml/runs?status=${status}&per_page=100&page=${page}`
        );
        if (data.workflow_runs.some((run: Run) => run.display_title.includes(`[${environment}]`))) {
          state.dirty = true;
          await this.ctx.storage.put('state', state);
          await this.ctx.storage.put(callbackKey, true);
          return;
        }
        if (data.workflow_runs.length < 100) break;
      }
    }
    state.pending = { id, since: Date.now(), websiteDispatched: true };
    state.dirty = true;
    await this.ctx.storage.put('state', state);
    // Persist consumed callback IDs separately from input acknowledgement. A
    // replay remains harmless even after its deployment reservation is cleared.
    await this.ctx.storage.put(callbackKey, true);
    try {
      await github(this.env, 'pyconhk-website', 'actions/workflows/deploy-website.yml/dispatches', {
        ref: 'main',
        inputs: {
          target: environment,
          force: 'false',
          repair_completion: String(Boolean(state.repairCompletion)),
          reconcile_id: id,
        },
      });
    } catch (error) {
      if ((error as { rejected?: boolean }).rejected) {
        state.pending.websiteDispatched = false;
        await this.ctx.storage.put('state', state);
        await this.ctx.storage.put(callbackKey, false);
      }
      throw error;
    }
  }

  private async check(environment: string) {
    if (!Object.hasOwn(targets, environment)) throw new Error('Invalid environment');
    const name = environment as Environment;
    const target = targets[name];
    const state = (await this.ctx.storage.get<State>('state')) || { dirty: true };
    // Cache only within this single serialized check, never across cron ticks.
    let runs: Promise<Run[]> | undefined;
    const readRuns = () =>
      (runs ||= (async () => {
        const all: Run[] = [];
        for (const [repository, workflow] of [
          ['pyconhk-news', 'promote-news.yml'],
          ['pyconhk-website', 'deploy-website.yml'],
        ]) {
          // Active runs can be older than the last hundred completed runs. Query
          // active statuses separately and paginate before releasing any reservation.
          for (const status of ['queued', 'in_progress', 'waiting', 'pending', 'requested']) {
            for (let page = 1; ; page++) {
              const data = await github(
                this.env,
                repository,
                `actions/workflows/${workflow}/runs?status=${status}&per_page=100&page=${page}`
              );
              all.push(...data.workflow_runs.map((run: Run) => ({ ...run, repository })));
              if (data.workflow_runs.length < 100) break;
            }
          }
          const recent = await github(
            this.env,
            repository,
            `actions/workflows/${workflow}/runs?per_page=100`
          );
          all.push(...recent.workflow_runs.map((run: Run) => ({ ...run, repository })));
        }
        return all;
      })());
    const forTarget = (run: Run) =>
      run.display_title.includes(`[${name}]`) || run.display_title.includes('[all]');
    await reconcile(state, {
      save: (value) => this.ctx.storage.put('state', value),
      active: async () =>
        (await readRuns()).some(
          (run) =>
            forTarget(run) &&
            (run.status !== 'completed' ||
              (run.repository === 'pyconhk-news' &&
                run.conclusion === 'success' &&
                Date.now() - Date.parse(run.created_at) < 120_000))
        ),
      status: async (id) => {
        const matching = (await readRuns()).filter(
          (run) => forTarget(run) && run.display_title.includes(id)
        );
        if (matching.some((run) => run.status !== 'completed')) return 'active';
        const website = matching.filter((run) => run.repository === 'pyconhk-website');
        if (website.length)
          return website.some((run) => run.conclusion !== 'success') ? 'failed' : 'completed';
        // A lost callback response can fail publication after GitHub accepted the
        // website dispatch. Retain the reservation throughout indexing grace.
        if (state.pending?.websiteDispatched) return 'missing';
        if (matching.some((run) => run.conclusion && run.conclusion !== 'success')) return 'failed';
        return matching.length ? 'completed' : 'missing';
      },
      changed: async () => {
        const [comparison, news, deployed, baseline] = await Promise.all([
          github(this.env, 'pyconhk-news', `compare/${target.branch}...${target.cms}`),
          github(this.env, 'pyconhk-news', `git/trees/${target.branch}?recursive=1`),
          metadata(target.origin, '/deployment-manifest.json'),
          metadata(target.origin, '/programme-snapshot.json'),
        ]);
        const unpublishedEdits =
          !['identical', 'behind'].includes(comparison.status) &&
          (comparison.files.length >= 300 ||
            comparison.files.some((file: { filename: string }) =>
              file.filename.startsWith('website/')
            ));
        const programme = await fetchProgramme({
          event: target.event,
          environment: name,
          sourceUrl: target.source,
          baseline: baseline ? validateSnapshot(baseline, target.event, name) : undefined,
          allowUnpublished: name === 'production',
          ...(name === 'production' && this.env.PRETALX_API_TOKEN
            ? { apiToken: this.env.PRETALX_API_TOKEN }
            : {}),
        });
        let failedDeployment = false;
        const candidates = [
          ...new Map(
            (await readRuns())
              .filter((run) => forTarget(run) && run.repository === 'pyconhk-website')
              .map((run) => [run.id, run])
          ).values(),
        ].sort((a, b) => b.created_at.localeCompare(a.created_at));
        for (const run of candidates) {
          if (run.status !== 'completed') continue;
          const jobs = await github(
            this.env,
            'pyconhk-website',
            `actions/runs/${run.id}/jobs?per_page=100`
          );
          const deployment = jobs.jobs.find((job: { name: string }) =>
            job.name.endsWith(`Deploy ${name}`)
          );
          if (!deployment || deployment.conclusion === 'skipped') continue;
          if (deployment.conclusion !== 'success') {
            failedDeployment = true;
            break;
          }
          // A successful no-op/inspection workflow is not proof that an uploaded
          // version passed verification. Ignore it and inspect the last real attempt.
          if (
            deployment.steps.some(
              (step: { name: string; conclusion: string }) =>
                step.name === 'Verify deployed website' && step.conclusion === 'success'
            )
          )
            break;
        }
        state.repairCompletion = Boolean(failedDeployment);
        return (
          failedDeployment ||
          unpublishedEdits ||
          !deployed ||
          deployed.environment !== name ||
          deployed.event !== target.event ||
          deployed.newsSource !== 'external' ||
          deployed.newsContentHash !== newsContentHash(news) ||
          deployed.programmeHash !== programme.hash
        );
      },
      dispatch: (id) =>
        github(this.env, 'pyconhk-news', 'actions/workflows/promote-news.yml/dispatches', {
          ref: 'main',
          inputs: { target: name, reconcile_id: id, deploy_after: 'true' },
        }).then(() => undefined),
    });
  }
}

export default {
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    if (env.ENABLED !== 'true') return;
    ctx.waitUntil(
      Promise.allSettled(
        (Object.keys(targets) as Environment[]).map((name) =>
          env.RECONCILIATION.get(env.RECONCILIATION.idFromName(name))
            .fetch(new Request(`https://reconcile.internal/${name}`))
            .then((response) => {
              if (!response.ok) throw new Error(`${name} reconciliation failed`);
            })
        )
      ).then((results) => {
        for (const [index, result] of results.entries())
          if (result.status === 'rejected')
            console.error(`${Object.keys(targets)[index]} reconciliation failed; retry next tick`);
      })
    );
  },
  async fetch(request: Request, env: Env) {
    // Only the trusted promotion workflow can request immediate deployment.
    if (
      env.ENABLED !== 'true' ||
      request.method !== 'POST' ||
      new URL(request.url).pathname !== '/deploy' ||
      !env.RECONCILER_TOKEN ||
      request.headers.get('Authorization') !== `Bearer ${env.RECONCILER_TOKEN}`
    )
      return new Response('Not found', { status: 404 });
    let body: { target?: string; id?: string };
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid callback', { status: 400 });
    }
    if (
      !body.target ||
      !Object.hasOwn(targets, body.target) ||
      !body.id ||
      !/^[A-Za-z0-9-]{1,100}$/.test(body.id)
    )
      return new Response('Invalid callback', { status: 400 });
    return env.RECONCILIATION.get(env.RECONCILIATION.idFromName(body.target)).fetch(
      new Request('https://reconcile.internal/deploy', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
    );
  },
};
