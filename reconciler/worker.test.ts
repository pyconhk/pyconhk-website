import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import { programmeApiExport } from '../website/src/lib/programme/api.ts';
import { normalizeProgramme } from '../website/src/lib/programme/snapshot.ts';
import { newsContentHash } from './content.ts';
import type { State } from './state.ts';
import worker, { ContentReconciliation, github } from './worker.ts';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const appKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

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
    GITHUB_APP_ID: 'Iv1.fixture',
    GITHUB_APP_INSTALLATION_ID: '123',
    GITHUB_APP_PRIVATE_KEY: appKey,
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
        start: '2026-10-04',
        end: '2026-10-04',
        rooms: [{ name: 'Hall', slug: 'hall' }],
        days: [
          {
            date: '2026-10-04',
            rooms: {
              Hall: [
                {
                  id: 1,
                  code: 'ABC',
                  title: 'Session',
                  abstract: 'Abstract',
                  description: 'Description',
                  date: '2026-10-04T10:00:00+08:00',
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
  const sourceUrl = 'https://pretalx.com/api/events/pyconhk2026/schedules/latest/';
  const metadata = {
    title: '',
    timezone: 'Asia/Hong_Kong',
    startDate: '2026-10-04',
    endDate: '2026-10-04',
  };
  const release = () => ({
    id: 1,
    version: payload.schedule.version,
    published: '2026-10-01T00:00:00Z',
    slots: payload.schedule.conference.days[0].rooms.Hall.map((item) => ({
      id: item.id,
      start: item.date,
      end: new Date(Date.parse(item.date) + 60 * 60_000).toISOString(),
      room: { id: 1, name: 'Hall', hidden: false },
      is_visible: true,
      slot_type: 'talk',
      submission: {
        code: item.code,
        title: item.title,
        abstract: item.abstract,
        description: item.description,
        state: 'confirmed',
        content_locale: '',
        track: null,
        submission_type: { name: '' },
        speakers: item.persons.map((person, index) => ({
          code: `speaker${index}`,
          name: person.name,
          biography: person.biography,
          avatar_url: '',
        })),
      },
    })),
  });
  const publicRelease = () => ({ ...release(), slots: release().slots.map((slot) => slot.id) });
  const baseline = normalizeProgramme(
    programmeApiExport(
      release(),
      { event: 'pyconhk2026', sourceUrl, ...metadata },
      publicRelease()
    ),
    {
      event: 'pyconhk2026',
      environment: 'test',
      sourceUrl,
    }
  );
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
    event: 'pyconhk2026',
    newsSource: 'external',
    newsContentHash: newsContentHash(tree),
    programmeHash: baseline.hash,
  };
  let runs: {
    display_title: string;
    status: string;
    conclusion: string | null;
    event?: string;
    verifyConclusion?: string;
    created_at: string;
  }[] = [];
  let cmsChanged = false;
  const dispatches: { url: string; body: unknown }[] = [];
  globalThis.fetch = async (url, options) => {
    const href = String(url);
    if (href === 'https://api.github.com/app/installations/123/access_tokens')
      return Response.json(
        {
          token: 'fixture',
          expires_at: new Date(Date.now() + 3_600_000).toISOString(),
          permissions: { actions: 'write', contents: 'read', metadata: 'read' },
          repositories: [
            { full_name: 'pyconhk/pyconhk-website' },
            { full_name: 'pyconhk/pyconhk-news' },
          ],
        },
        { status: 201 }
      );
    if (options?.method === 'POST') {
      assert.ok(persisted.pending, 'dispatch must follow durable reservation');
      dispatches.push({ url: href, body: JSON.parse(String(options.body)) });
      return new Response(null, { status: 204 });
    }
    if (href.includes('/runs?'))
      return Response.json({
        workflow_runs: href.includes('pyconhk-website')
          ? runs.map((run, index) => ({ ...run, id: index + 1 }))
          : [],
      });
    if (href.includes('/actions/runs/')) {
      const id = Number(/\/runs\/(\d+)\//u.exec(href)?.[1]);
      const run = runs[id - 1];
      return Response.json({
        jobs: [
          {
            name: 'deploy / Deploy test',
            conclusion: run?.conclusion,
            steps: [
              {
                name: 'Verify deployed website',
                conclusion: run?.verifyConclusion || run?.conclusion,
              },
            ],
          },
        ],
      });
    }
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
    if (href.includes('/schedules/latest/'))
      return Response.json(href.includes('expand=') ? release() : publicRelease());
    if (href.endsWith('/api/events/pyconhk2026/'))
      return Response.json({
        slug: 'pyconhk2026',
        is_public: true,
        name: '',
        timezone: metadata.timezone,
        date_from: metadata.startDate,
        date_to: metadata.endDate,
      });
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
    baseline,
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

test('fallback polling builds suppress cron and callback dispatch during activation', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  f.setRuns([
    {
      display_title: 'Fallback website polling',
      status: 'in_progress',
      conclusion: null,
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  await f.callback('activation-overlap');
  assert.equal(f.dispatches.length, 0);
  assert.equal(f.state().dirty, true);
});

test('failed fallback verification is repaired even when hosted content hashes match', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Fallback website polling',
      status: 'completed',
      conclusion: 'failure',
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  assert.equal(f.dispatches.length, 1);
  assert.equal(f.state().repairCompletion, true);
});

test('legacy scheduled runs without target labels still retain completion repair', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Deploy Website',
      event: 'schedule',
      status: 'completed',
      conclusion: 'failure',
      created_at: new Date().toISOString(),
    },
  ]);
  await f.check();
  assert.equal(f.dispatches.length, 1);
  assert.equal(f.state().repairCompletion, true);
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
    options?.method === 'POST' && String(url).includes('/repos/')
      ? new Response(null, { status: 403 })
      : acceptedFetch(url, options);
  assert.equal((await f.callback('news-456')).status, 503);
  assert.equal(f.state().pending?.websiteDispatched, false);
  globalThis.fetch = acceptedFetch;
  assert.equal((await f.callback('news-456')).status, 200);
  assert.equal(f.dispatches.length, 1);
});

test('repository requests use installation tokens and cannot target an unrelated repository', async (t) => {
  const f = fixture(t);
  const acceptedFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('/repos/'))
      assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer fixture');
    return acceptedFetch(url, options);
  };
  await github(f.env, 'pyconhk-news', 'git/trees/main?recursive=1');
  await assert.rejects(
    github(f.env, 'unrelated-repo', 'git/trees/main'),
    /Invalid reconciliation repository/u
  );
});

test('repository authentication rejection renews the installation token on the next request', async (t) => {
  const f = fixture(t);
  const acceptedFetch = globalThis.fetch;
  let issued = 0;
  let reject = true;
  globalThis.fetch = async (url, options) => {
    const href = String(url);
    if (href.includes('/access_tokens')) issued++;
    if (href.includes('/repos/') && reject) {
      reject = false;
      return new Response(null, { status: 401 });
    }
    return acceptedFetch(url, options);
  };
  await assert.rejects(github(f.env, 'pyconhk-news', 'git/trees/main?recursive=1'), /failed: 401/u);
  await github(f.env, 'pyconhk-news', 'git/trees/main?recursive=1');
  assert.equal(issued, 2);
});

test('App issuance failure before dispatch allows an authenticated callback to retry', async (t) => {
  const f = fixture(t);
  f.changeCMS();
  await f.check();
  const id = f.state().pending?.id;
  assert.ok(id);
  f.env.GITHUB_APP_PRIVATE_KEY = 'invalid-key';
  assert.equal((await f.callback(id)).status, 503);
  assert.equal(f.dispatches.length, 1);
  f.env.GITHUB_APP_PRIVATE_KEY = appKey;
  assert.equal((await f.callback(id)).status, 200);
  assert.equal(f.dispatches.length, 2);
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

test('a later no-op workflow cannot acknowledge an earlier failed uploaded version', async (t) => {
  const f = fixture(t);
  f.setRuns([
    {
      display_title: 'Deploy Website [test] no-op',
      status: 'completed',
      conclusion: 'success',
      verifyConclusion: 'skipped',
      created_at: '2026-10-02T07:00:00Z',
    },
    {
      display_title: 'Deploy Website [test] failed-upload',
      status: 'completed',
      conclusion: 'failure',
      created_at: '2026-10-02T06:00:00Z',
    },
  ]);
  await f.check();
  assert.equal(f.dispatches.length, 1);
  assert.equal(f.state().repairCompletion, true);
});

test('test event migration ignores an old sample baseline and dispatches published2026 content', async (t) => {
  const f = fixture(t);
  f.baseline.event = 'pyconhk2025';
  f.deployed.event = 'pyconhk2025';
  assert.equal((await f.check()).status, 200);
  assert.equal(f.dispatches.length, 1);
});
