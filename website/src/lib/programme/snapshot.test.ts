import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchProgramme, normalizeProgramme } from './snapshot.ts';

const sourceUrl = 'https://cfp.pycon.hk/pyconhk2026/schedule/export/schedule.json';
const options = { event: 'pyconhk2026', environment: 'production', sourceUrl };

function response(status: number): typeof fetch {
  return async () => new Response(null, { status });
}

const published = normalizeProgramme(
  {
    schedule: {
      conference: {
        time_zone_name: 'Asia/Hong_Kong',
        start: '2026-11-14',
        end: '2026-11-15',
        rooms: [],
        days: [],
      },
    },
  },
  options
);

for (const status of [403, 404]) {
  test(`an unpublished 2026 export returning HTTP ${status} keeps the schedule pending`, async () => {
    const snapshot = await fetchProgramme({
      ...options,
      allowUnpublished: true,
      fetchImpl: response(status),
    });
    assert.equal(snapshot.event, 'pyconhk2026');
    assert.equal(snapshot.environment, 'production');
    assert.equal(snapshot.status, 'unpublished');
    assert.deepEqual(snapshot.sessions, []);
  });

  test(`HTTP ${status} cannot replace a previously published 2026 schedule`, async () => {
    await assert.rejects(
      fetchProgramme({
        ...options,
        baseline: published,
        allowUnpublished: true,
        fetchImpl: response(status),
      }),
      new RegExp(`Pretalx fetch failed: HTTP ${status}`)
    );
  });
}

test('a denied 2025 sample export fails instead of becoming a blank schedule', async () => {
  await assert.rejects(
    fetchProgramme({
      event: 'pyconhk2025',
      environment: 'test',
      sourceUrl: 'https://pretalx.com/pyconhk2025/schedule/export/schedule.json',
      allowUnpublished: false,
      fetchImpl: response(403),
    }),
    /Pretalx fetch failed: HTTP 403/
  );
});

test('HTTP 500 still fails after retries, even before publication', async () => {
  let requests = 0;
  await assert.rejects(
    fetchProgramme({
      ...options,
      allowUnpublished: true,
      fetchImpl: async () => {
        requests += 1;
        return new Response(null, { status: 500 });
      },
      wait: async () => {},
    }),
    /Pretalx fetch failed: HTTP 500/
  );
  assert.equal(requests, 3);
});

for (const status of [200, 403, 404]) {
  test(`a Cloudflare challenge returning HTTP ${status} cannot become an unpublished schedule`, async () => {
    await assert.rejects(
      fetchProgramme({
        ...options,
        allowUnpublished: true,
        fetchImpl: async () =>
          new Response('<html>Just a moment...</html>', {
            status,
            headers: { 'cf-mitigated': 'challenge', 'content-type': 'text/html' },
          }),
      }),
      /Cloudflare challenge or error/
    );
  });
}

const cloudflareErrors: { name: string; body: string; headers?: HeadersInit }[] = [
  {
    name: 'error type header',
    body: 'Access denied',
    headers: { 'cf-error-type': '1020' },
  },
  {
    name: 'error origin header',
    body: 'Access denied',
    headers: { 'cf-error-origin': 'firewall' },
  },
];

for (const status of [403, 404]) {
  for (const blocked of cloudflareErrors) {
    test(`a Cloudflare ${blocked.name} returning HTTP ${status} is rejected`, async () => {
      await assert.rejects(
        fetchProgramme({
          ...options,
          allowUnpublished: true,
          fetchImpl: async () =>
            new Response(blocked.body, {
              status,
              headers: blocked.headers,
            }),
        }),
        /Cloudflare challenge or error/
      );
    });
  }

  test(`a legitimate Pretalx HTTP ${status} with injected Cloudflare scripts stays unpublished`, async () => {
    const snapshot = await fetchProgramme({
      ...options,
      allowUnpublished: true,
      fetchImpl: async () =>
        new Response(
          '<html>No schedule has been published yet.<script src="/cdn-cgi/challenge-platform/check.js"></script></html>',
          {
            status,
            headers: {
              server: 'cloudflare',
              'cf-ray': 'example-HKG',
              'content-type': 'text/html',
            },
          }
        ),
    });
    assert.equal(snapshot.status, 'unpublished');
  });
}

test('response diagnostics expose cache evidence and normalized content without cookies or URL queries', async (t) => {
  const messages: string[] = [];
  t.mock.method(console, 'info', (message: string) => messages.push(message));
  const snapshot = await fetchProgramme({
    ...options,
    sourceUrl: `${sourceUrl}?private=do-not-log`,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          schedule: {
            version: '0.1',
            conference: {
              time_zone_name: 'Asia/Hong_Kong',
              start: '2026-11-14',
              end: '2026-11-15',
              rooms: [{ slug: 'main', name: 'Main' }],
              days: [
                {
                  date: '2026-11-14',
                  rooms: {
                    Main: [
                      {
                        id: 1,
                        title: 'Published talk',
                        duration: '00:30',
                        date: '2026-11-14T10:00:00+08:00',
                      },
                    ],
                  },
                },
              ],
            },
          },
        }),
        {
          headers: {
            'content-type': 'application/json',
            'cf-cache-status': 'HIT',
            age: '42',
            'cf-ray': 'example-HKG',
            'cache-control': 'max-age=14400',
            'set-cookie': 'private=do-not-log',
            'x-private-header': 'do-not-log',
          },
        }
      ),
  });
  assert.equal(snapshot.sourceVersion, '0.1');
  assert.equal(snapshot.sessions.length, 1);
  const responseLog = JSON.parse(messages[0].slice('[programme] response '.length));
  assert.equal(responseLog.source, sourceUrl);
  assert.equal(responseLog.status, 200);
  assert.equal(responseLog.headers['cf-cache-status'], 'HIT');
  assert.equal(responseLog.headers.age, '42');
  assert.equal(responseLog.headers['cf-ray'], 'example-HKG');
  const snapshotLog = JSON.parse(messages[1].slice('[programme] snapshot '.length));
  assert.equal(snapshotLog.status, 'published');
  assert.equal(snapshotLog.sourceVersion, '0.1');
  assert.equal(snapshotLog.sessions, 1);
  assert.equal(snapshotLog.hash, snapshot.hash);
  assert.ok(messages.every((message) => !message.includes('do-not-log')));
});
