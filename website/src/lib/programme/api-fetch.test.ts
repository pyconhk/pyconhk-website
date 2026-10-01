import assert from 'node:assert/strict';
import test from 'node:test';
import { programmeApiExpansion } from './api.ts';
import { fetchProgramme, normalizeProgramme } from './snapshot.ts';

const options = {
  event: 'pyconhk2026',
  environment: 'production',
  sourceUrl: 'https://cfp.pycon.hk/api/events/pyconhk2026/schedules/latest/',
  apiToken: 'test-token-never-publish',
};
const metadata = {
  slug: options.event,
  name: { en: 'PyCon Hong Kong 2026' },
  timezone: 'Asia/Hong_Kong',
  date_from: '2026-11-14',
  date_to: '2026-11-15',
  is_public: true,
  email: 'private@example.invalid',
};
const schedule = {
  version: '0.1',
  published: '2026-10-01T14:35:12+08:00',
  slots: [
    {
      id: 1,
      room: { id: 17, name: { en: 'Main Hall' }, hidden: false },
      start: '2026-11-14T10:00:00+08:00',
      end: '2026-11-14T10:30:00+08:00',
      submission: null,
      description: { en: 'Opening' },
    },
  ],
};

test('API fetch uses only pinned published latest and event metadata with a private token', async (t) => {
  const logs = t.mock.method(console, 'info', () => {});
  const requests: { url: string; init?: RequestInit }[] = [];
  const snapshot = await fetchProgramme({
    ...options,
    fetchImpl: async (input, init) => {
      const url = String(input);
      requests.push({ url, init });
      return Response.json(requests.length === 1 ? schedule : metadata);
    },
  });
  const expected = new URL(options.sourceUrl);
  expected.searchParams.set('expand', programmeApiExpansion);
  assert.deepEqual(
    requests.map(({ url }) => url),
    [expected.href, 'https://cfp.pycon.hk/api/events/pyconhk2026/']
  );
  for (const { init } of requests) {
    assert.equal(init?.method, 'GET');
    assert.equal(init?.redirect, 'manual');
    assert.equal(
      new Headers(init?.headers).get('authorization'),
      `Token ${options.apiToken}`
    );
    assert.equal(new Headers(init?.headers).get('pretalx-version'), 'v2');
  }
  assert.equal(snapshot.title, metadata.name.en);
  assert.equal(snapshot.sourceVersion, '0.1');
  assert.equal(snapshot.sessions.length, 1);
  assert.doesNotMatch(
    JSON.stringify(snapshot),
    /test-token-never-publish|private@example/
  );
  assert.doesNotMatch(
    JSON.stringify(logs.mock.calls),
    /test-token-never-publish|private@example/
  );
});

test('approved API tokens can serve another configured PyCon HK year', async () => {
  const urls: string[] = [];
  const snapshot = await fetchProgramme({
    ...options,
    event: 'pyconhk2027',
    sourceUrl: 'https://cfp.pycon.hk/api/events/pyconhk2027/schedules/latest/',
    fetchImpl: async (input) => {
      urls.push(String(input));
      return Response.json(
        urls.length === 1
          ? { ...schedule, slots: [] }
          : {
              ...metadata,
              slug: 'pyconhk2027',
              date_from: '2027-11-14',
              date_to: '2027-11-15',
            }
      );
    },
  });
  assert.equal(snapshot.event, 'pyconhk2027');
  assert.ok(
    urls.every((url) => url.startsWith('https://cfp.pycon.hk/api/events/pyconhk2027/'))
  );
});

for (const sourceUrl of [
  'https://example.invalid/api/events/pyconhk2026/schedules/latest/',
  'https://cfp.pycon.hk/api/events/pyconhk2025/schedules/latest/',
  'https://cfp.pycon.hk/api/events/pyconhk2026/schedules/wip/',
  'https://cfp.pycon.hk/api/events/pyconhk2026/schedules/latest/?expand=private',
  'https://cfp.pycon.hk/pyconhk2026/schedule/export/schedule.json',
]) {
  test(`token is never sent to an unapproved source: ${sourceUrl}`, async () => {
    let requests = 0;
    await assert.rejects(
      fetchProgramme({
        ...options,
        sourceUrl,
        fetchImpl: async () => {
          requests += 1;
          return Response.json({});
        },
      })
    );
    assert.equal(requests, 0);
  });
}

test('API redirect responses fail without following their location', async () => {
  let requests = 0;
  await assert.rejects(
    fetchProgramme({
      ...options,
      fetchImpl: async () => {
        requests += 1;
        return new Response(null, {
          status: 302,
          headers: { location: 'https://example.invalid/' },
        });
      },
    }),
    /redirects are not permitted/
  );
  assert.equal(requests, 1);
});

test('API pagination cannot redirect token requests or silently truncate the schedule', async () => {
  const urls: string[] = [];
  await assert.rejects(
    fetchProgramme({
      ...options,
      fetchImpl: async (input) => {
        urls.push(String(input));
        return Response.json(
          urls.length === 1
            ? { ...schedule, next: 'https://example.invalid/page2' }
            : metadata
        );
      },
    }),
    /complete published latest schedule/
  );
  assert.equal(urls.length, 2);
  assert.ok(urls.every((url) => url.startsWith('https://cfp.pycon.hk/')));
});

for (const status of [401, 403]) {
  test(`API HTTP ${status} cannot become an unpublished schedule`, async () => {
    await assert.rejects(
      fetchProgramme({
        ...options,
        allowUnpublished: true,
        fetchImpl: async () => new Response(null, { status }),
      }),
      new RegExp(`HTTP ${status}`)
    );
  });
}

test('API Cloudflare challenge cannot become an unpublished schedule', async () => {
  await assert.rejects(
    fetchProgramme({
      ...options,
      allowUnpublished: true,
      fetchImpl: async () =>
        new Response(null, { status: 403, headers: { 'cf-mitigated': 'challenge' } }),
    }),
    /Cloudflare challenge or error/
  );
});

test('missing latest schedule is unpublished only before a successful publication', async () => {
  const fetchImpl: typeof fetch = async () => new Response(null, { status: 404 });
  const snapshot = await fetchProgramme({
    ...options,
    allowUnpublished: true,
    fetchImpl,
  });
  assert.equal(snapshot.status, 'unpublished');
  const baseline = normalizeProgramme(
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
  await assert.rejects(
    fetchProgramme({ ...options, baseline, allowUnpublished: true, fetchImpl }),
    /HTTP 404/
  );
});

for (const eventMetadata of [
  { ...metadata, slug: 'pyconhk2025' },
  { ...metadata, is_public: false },
]) {
  test(`nonpublic or mismatched event metadata is rejected (${eventMetadata.slug}, ${eventMetadata.is_public})`, async () => {
    let requests = 0;
    await assert.rejects(
      fetchProgramme({
        ...options,
        fetchImpl: async () =>
          Response.json(++requests === 1 ? schedule : eventMetadata),
      }),
      /configured public event/
    );
  });
}

test('transport errors cannot echo the token', async () => {
  await assert.rejects(
    fetchProgramme({
      ...options,
      fetchImpl: async () => {
        throw new Error(`bad request Authorization: Token ${options.apiToken}`);
      },
      wait: async () => {},
    }),
    (error: Error) => {
      assert.equal(error.message, 'Pretalx fetch failed after 3 attempts.');
      return true;
    }
  );
});
