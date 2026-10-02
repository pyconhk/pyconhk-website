import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcile, type State, type Adapter } from './state.ts';
import { newsContentHash } from './content.ts';

function fixture() {
  const state: State = { dirty: false };
  const calls: string[] = [];
  const adapter: Adapter = {
    active: async () => false,
    status: async () => 'completed',
    changed: async () => true,
    save: async () => {
      calls.push('save');
    },
    dispatch: async (id) => {
      calls.push(`dispatch:${id}`);
    },
  };
  return { state, adapter, calls };
}

test('unchanged inputs do not dispatch or retain dirty state', async () => {
  const f = fixture();
  f.adapter.changed = async () => false;
  await reconcile(f.state, f.adapter, 0, 'a');
  assert.deepEqual(f.calls, ['save']);
  assert.equal(f.state.dirty, false);
});

test('coalesces changes and reserves before dispatch, then rechecks successful deployment', async () => {
  const f = fixture();
  await reconcile(f.state, f.adapter, 0, 'a');
  assert.deepEqual(f.calls, ['save', 'dispatch:a']);
  f.adapter.status = async () => 'active';
  await reconcile(f.state, f.adapter, 100, 'b');
  assert.deepEqual(f.state.pending, { id: 'a', since: 0 });
  assert.equal(f.state.dirty, true);
  f.adapter.status = async () => 'completed';
  f.adapter.changed = async () => false;
  await reconcile(f.state, f.adapter, 200, 'c');
  assert.equal(f.state.pending, undefined);
  assert.equal(f.state.dirty, false);
  assert.equal(f.calls.filter((call) => call.startsWith('dispatch')).length, 1);
});

test('a change during deployment remains dirty and dispatches once after completion', async () => {
  const f = fixture();
  await reconcile(f.state, f.adapter, 0, 'a');
  f.adapter.status = async () => 'active';
  await reconcile(f.state, f.adapter, 100, 'b');
  f.adapter.status = async () => 'completed';
  await reconcile(f.state, f.adapter, 200, 'c');
  assert.deepEqual(
    f.calls.filter((call) => call.startsWith('dispatch')),
    ['dispatch:a', 'dispatch:c']
  );
});

test('failed build/upload/verification retries next tick even when hosted hashes match', async () => {
  const f = fixture();
  f.state.pending = { id: 'a', since: 0 };
  f.adapter.status = async () => 'failed';
  f.adapter.changed = async () => false;
  await reconcile(f.state, f.adapter, 300_000, 'b');
  assert.equal(f.state.pending?.id, 'b');
  assert.ok(f.calls.includes('dispatch:b'));
});

test('ambiguous dispatch failures retain a durable reservation through indexing grace', async () => {
  const f = fixture();
  f.adapter.dispatch = async () => {
    throw new Error('connection lost');
  };
  await assert.rejects(reconcile(f.state, f.adapter, 0, 'a'), /connection lost/);
  assert.equal(f.state.pending?.id, 'a');
  f.adapter.status = async () => 'missing';
  await reconcile(f.state, f.adapter, 300_000, 'b');
  assert.equal(f.state.pending?.id, 'a');
  f.adapter.dispatch = async (id) => {
    f.calls.push(`dispatch:${id}`);
  };
  await reconcile(f.state, f.adapter, 31 * 60_000, 'c');
  assert.equal(f.state.pending?.id, 'c');
});

test('confirmed rejection releases reservation for retry next tick', async () => {
  const f = fixture();
  f.adapter.dispatch = async () => {
    throw Object.assign(new Error('rejected'), { rejected: true });
  };
  await assert.rejects(reconcile(f.state, f.adapter, 0, 'a'));
  assert.equal(f.state.pending, undefined);
  assert.equal(f.state.dirty, true);
});

test('existing runs suppress dispatch without acknowledging content', async () => {
  const f = fixture();
  f.adapter.active = async () => true;
  f.adapter.changed = async () => {
    throw new Error('must recheck later');
  };
  await reconcile(f.state, f.adapter, 0, 'a');
  assert.deepEqual(f.calls, ['save']);
  assert.equal(f.state.dirty, true);
});

test('production reservations do not suppress test reconciliation', async () => {
  const production = fixture();
  const staging = fixture();
  production.state.pending = { id: 'prod', since: 0 };
  production.adapter.status = async () => 'active';
  await Promise.all([
    reconcile(production.state, production.adapter, 300_000, 'p'),
    reconcile(staging.state, staging.adapter, 300_000, 't'),
  ]);
  assert.equal(production.state.pending.id, 'prod');
  assert.equal(staging.state.pending?.id, 't');
});

test('News version hashes all published posts and images, ignoring maintenance and tree order', () => {
  const item = (path: string, sha: string) => ({ path, sha, mode: '100644', type: 'blob' });
  const tree = [
    item('README.md', 'docs'),
    item('website/outstatic/content/2026-posts/a.en.mdx', 'post'),
    item('website/public/outstatic/images/a.webp', 'image'),
  ];
  const version = newsContentHash({ tree });
  assert.equal(newsContentHash({ tree: [...tree].reverse() }), version);
  assert.equal(
    newsContentHash({ tree: [item('README.md', 'new docs'), ...tree.slice(1)] }),
    version
  );
  assert.notEqual(
    newsContentHash({ tree: [tree[0], tree[1], item(tree[2].path, 'new image')] }),
    version
  );
  assert.notEqual(newsContentHash({ tree: tree.slice(0, 2) }), version);
  assert.throws(() => newsContentHash({ tree, truncated: true }), /truncated/);
});
