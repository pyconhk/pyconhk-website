import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { ContentReconciliation } from './worker.ts';
import { normalizeProgramme } from '../website/src/lib/programme/snapshot.ts';
import { newsContentHash } from './content.ts';
import type { State } from './state.ts';

function fixture(t: test.TestContext) {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let persisted: State = { dirty: false };
  const callbacks = new Map<string, unknown>();
  const storage = {
    get: async <T>(key: string) =>
      key === 'state' ? (structuredClone(persisted) as T) : (callbacks.get(key) as T),
    put: async (key: string, value: unknown) => {
      if (key === 'state') persisted = structuredClone(value) as State;
      else callbacks.set(key, structuredClone(value));
    },
  };
  const env = {
    GITHUB_TOKEN: 'fixture',
    ENABLED: 'true',
    RECONCILER_TOKEN: 'callback-fixture',
    RECONCILIATION: {
      idFromName: (name: string) => name,
      get: () => ({ fetch: async () => new Response('unused') }),
    },
  };
  const payload = {
    schedule: {
      version: 'same-version',
      conference: {
        time_zone_name: 'Asia/Hong_Kong',
        start: '2025-10-04',
        end: '2025-10-04',
        rooms: [{ name: 'Hall', slug: 'hall' }],
        days: [
          {
            date: '2025-10-04',
            rooms: {
              Hall: [
                {
                  id: 1,
                  code: 'ABC',
                  title: 'Session',
                  abstract: 'Abstract',
                  description: 'Description',
                  date: '2025-10-04T10:00:00+08:00',
                  duration: '01:00',
                  persons: [{ name: 'Speaker', biography: 'Biography' }],
                },
              ],
            },
          },
        ],
      },
    },
  };
  const baseline = normalizeProgramme(payload, {
    event: 'pyconhk2025',
    environment: 'test',
    sourceUrl: 'https://pretalx.com/pyconhk2025/schedule/export/schedule.json',
  });
  const tree = {
    tree: [
      {
        path: 'website/public/outstatic/images/cover.webp',
        sha: 'a'.repeat(40),
        mode: '100644',
        type: 'blob',
      },
    ],
  };
  const deployed = {
    environment: 'test',
    event: 'pyconhk2025',
    newsSource: 'external',
    newsContentHash: newsContentHash(tree),
    programmeHash: baseline.hash,
  };
  let runs: {
    display_title: string;
    status: string;
    conclusion: string | null;
    created_at: string;
  }[] = [];
  let cmsChanged = false;
  const dispatches: { url: string; body: unknown }[] = [];
  globalThis.fetch = async (url, options) => {
    const href = String(url);
    if (options?.method === 'POST') {
      assert.ok(persisted.pending, 'dispatch must follow durable reservation');
      dispatches.push({ url: href, body: JSON.parse(String(options.body)) });
      return new Response(null, { status: 204 });
    }
    if (href.includes('/runs?'))
      return Response.json({ workflow_runs: href.includes('pyconhk-website') ? runs : [] });
    if (href.includes('/compare/'))
      return Response.json({
        status: cmsChanged ? 'ahead' : 'behind',
        files: cmsChanged
          ? [{ filename: 'website/outstatic/content/2026-posts/story.en.mdx' }]
          : [],
      });
    if (href.includes('/git/trees/')) return Response.json(tree);
    if (href.includes('/deployment-manifest.json')) return Response.json(deployed);
    if (href.includes('/programme-snapshot.json')) return Response.json(baseline);
    if (href.includes('/schedule/export/')) return Response.json(payload);
    throw new Error(`Unexpected test request ${href}`);
  };
  const instance = new ContentReconciliation({ storage }, env);
  const check = () => instance.fetch(new Request('https://reconcile.internal/test'));
  const callback = (id: string) =>
    instance.fetch(
      new Request('https://reconcile.internal/deploy', {
        method: 'POST',
        body: JSON.stringify({ target: 'test', id }),
      })
    );
  return {
    instance,
    env,
    payload,
    tree,
    deployed,
    dispatches,
    check,
    callback,
    state: () => persisted,
    setRuns: (value: typeof runs) => {
      runs = value;
    },
    changeCMS: () => {
      cmsChanged = true;
    },
  };
}

test('Worker compares actual published descriptions and speakers, not only schedule version', async (t) => {
  const f = fixture(t);
  assert.equal((await f.check()).status, 200);
  assert.equal(f.dispatches.length, 0);
  f.payload.schedule.conference.days[0].rooms.Hall[0].description = 'Edited description';
  assert.equal((await f.check()).status, 200);
  assert.equal(f.dispatches.length, 1);
  assert.ok(f.dispatches[0].url.includes('pyconhk-news'));
  assert.equal(f.state().dirty, true);
});

test('CMS and Pretalx changes coalesce into promotion followed by one website dispatch', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  f.payload.schedule.conference.days[0].rooms.Hall[0].persons[0].biography = 'New biography';
  await f.check();
  const id = f.state().pending?.id;
  assert.ok(id);
  assert.equal(f.dispatches.length, 1);
  assert.ok(f.dispatches[0].url.includes('promote-news.yml'));
  await Promise.all([f.callback(id), f.callback(id), f.callback(id)]);
  assert.equal(f.dispatches.length, 2);
  assert.ok(f.dispatches[1].url.includes('deploy-website.yml'));
  assert.equal(f.state().pending?.websiteDispatched, true);
  await f.check();
  assert.equal(f.dispatches.length, 2, 'indexing delay must not enqueue duplicates');
});

test('published images missing from hosted deployment trigger repair; maintenance does not', async (t) => {
  const f = fixture(t);
  f.tree.tree[0].sha = 'b'.repeat(40);
  await f.check();
  assert.equal(f.dispatches.length, 1);
});

test('callbacks retain a dirty recheck instead of queueing behind an active site build', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Deploy Website [test] manual',
      status: 'in_progress',
      conclusion: null,
      created_at: new Date().toISOString(),
    },
  ]);
  await f.callback('immediate');
  assert.equal(f.dispatches.length, 0);
  assert.equal(f.state().dirty, true);
  await f.check();
  assert.equal(f.dispatches.length, 0);
});

test('completed failed upload/verification retries even if uploaded metadata matches', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Deploy Website [test] failed',
      status: 'completed',
      conclusion: 'failure',
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  assert.equal(f.dispatches.length, 1);
});

test('untrusted public requests cannot invoke the deployment callback', async (t) => {
  const f = fixture(t);
  const response = await worker.fetch(
    new Request('https://worker.example/deploy', {
      method: 'POST',
      body: JSON.stringify({ target: 'production', id: 'attack' }),
    }),
    f.env
  );
  assert.equal(response.status, 404);
  assert.equal(f.dispatches.length, 0);
});

test('concurrent cron checks serialize and preserve one pending reservation', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  const responses = await Promise.all([f.check(), f.check(), f.check()]);
  assert.ok(responses.every((response) => response.ok));
  assert.equal(f.dispatches.length, 1);
});

test('completion repair dispatches without forcing a rebuild of matching content', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Deploy Website [test] failed',
      status: 'completed',
      conclusion: 'failure',
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  const id = f.state().pending?.id;
  assert.ok(id);
  f.setRuns([]);
  await f.callback(id);
  const body = f.dispatches[1].body as { inputs: { force: string; repair_completion: string } };
  assert.equal(body.inputs.force, 'false');
  assert.equal(body.inputs.repair_completion, 'true');
});

test('a different immediate callback coalesces into the existing environment reservation', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  await f.check();
  const reserved = f.state().pending?.id;
  assert.ok(reserved);
  await f.callback('another-immediate-publication');
  assert.equal(f.dispatches.length, 1);
  assert.equal(f.state().pending?.id, reserved);
  await f.callback(reserved);
  assert.equal(f.dispatches.length, 2);
});

test('an active production deployment does not block test publication', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  f.setRuns([
    {
      display_title: 'Deploy Website [production] prod',
      status: 'in_progress',
      conclusion: null,
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  assert.equal(f.dispatches.length, 1);
});

test('accepted callbacks cannot replay after their deployment reservation is cleared', async (t) => {
  const f = fixture(t);
  await f.callback('news-123');
  assert.equal(f.dispatches.length, 1);
  delete f.state().pending;
  await f.callback('news-123');
  assert.equal(f.dispatches.length, 1);
});

test('confirmed website dispatch rejection permits the same authenticated callback to retry', async (t) => {
  const f = fixture(t);
  const acceptedFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) =>
    options?.method === 'POST' ? new Response(null, { status: 403 }) : acceptedFetch(url, options);
  assert.equal((await f.callback('news-456')).status, 503);
  assert.equal(f.state().pending?.websiteDispatched, false);
  globalThis.fetch = acceptedFetch;
  assert.equal((await f.callback('news-456')).status, 200);
  assert.equal(f.dispatches.length, 1);
});

test('disabled Worker performs no scheduled checks before credentials are approved', async (t) => {
  const f = fixture(t);
  f.env.ENABLED = 'false';
  let scheduled = false;
  await worker.scheduled(undefined, f.env, {
    waitUntil: () => {
      scheduled = true;
    },
  });
  assert.equal(scheduled, false);
  assert.equal(f.dispatches.length, 0);
});
