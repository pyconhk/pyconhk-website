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
