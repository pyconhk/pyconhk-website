import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import { githubInstallationToken, invalidateGitHubToken } from './auth.ts';

// Test keys exist only in process memory and cannot authenticate to GitHub.
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

function fixture(t: test.TestContext) {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  const env = {
    GITHUB_APP_ID: 'Iv1.fixture',
    GITHUB_APP_INSTALLATION_ID: '123',
    GITHUB_APP_PRIVATE_KEY: pem,
  };
  const calls: { url: string; options: RequestInit | undefined }[] = [];
  let response = () =>
    Response.json(
      {
        token: `fixture-${calls.length}`,
        expires_at: new Date(Date.now() + 3_600_000).toISOString(),
        permissions: { actions: 'write', contents: 'read', metadata: 'read' },
        repositories: [
          { full_name: 'pyconhk/pyconhk-website' },
          { full_name: 'pyconhk/pyconhk-news' },
        ],
      },
      { status: 201 }
    );
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return response();
  };
  return {
    env,
    calls,
    respond: (value: typeof response) => {
      response = value;
    },
  };
}

test('App JWT is signed with RS256, short lived, and mint request restricts both repositories', async (t) => {
  const f = fixture(t);
  const before = Math.floor(Date.now() / 1000);
  assert.equal(await githubInstallationToken(f.env), 'fixture-1');
  assert.equal(f.calls[0].url, 'https://api.github.com/app/installations/123/access_tokens');
  const options = f.calls[0].options;
  assert.equal(options?.method, 'POST');
  assert.equal(options.redirect, 'manual');
  assert.deepEqual(JSON.parse(String(options.body)), {
    repositories: ['pyconhk-website', 'pyconhk-news'],
    permissions: { actions: 'write', contents: 'read' },
  });
  const jwt = new Headers(options.headers).get('Authorization')?.slice('Bearer '.length);
  assert.ok(jwt);
  const [header, payload, signature] = jwt.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url').toString()), {
    alg: 'RS256',
    typ: 'JWT',
  });
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
  assert.equal(claims.iss, f.env.GITHUB_APP_ID);
  assert.ok(claims.iat >= before - 60 && claims.iat <= Math.floor(Date.now() / 1000) - 60);
  assert.equal(claims.exp - claims.iat, 600);
  const key = await crypto.subtle.importKey(
    'spki',
    publicKey.export({ type: 'spki', format: 'der' }),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  assert.ok(
    await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      Buffer.from(signature, 'base64url'),
      new TextEncoder().encode(`${header}.${payload}`)
    )
  );
});

test('concurrent callers share token issuance and cached token refreshes before expiration', async (t) => {
  const f = fixture(t);
  let now = Date.now();
  t.mock.method(Date, 'now', () => now);
  assert.deepEqual(
    await Promise.all([
      githubInstallationToken(f.env),
      githubInstallationToken(f.env),
      githubInstallationToken(f.env),
    ]),
    ['fixture-1', 'fixture-1', 'fixture-1']
  );
  assert.equal(f.calls.length, 1);
  now += 3_500_000;
  assert.equal(await githubInstallationToken(f.env), 'fixture-1');
  now += 50_000;
  assert.equal(await githubInstallationToken(f.env), 'fixture-2');
  assert.equal(f.calls.length, 2);
});

test('environment identity and changed installation or signing key cannot share tokens', async (t) => {
  const f = fixture(t);
  assert.equal(await githubInstallationToken(f.env), 'fixture-1');
  assert.equal(await githubInstallationToken({ ...f.env }), 'fixture-2');
  f.env.GITHUB_APP_INSTALLATION_ID = '456';
  assert.equal(await githubInstallationToken(f.env), 'fixture-3');
  assert.equal(f.calls[2].url, 'https://api.github.com/app/installations/456/access_tokens');
  f.env.GITHUB_APP_PRIVATE_KEY = pem.replaceAll('\n', '\\n');
  assert.equal(await githubInstallationToken(f.env), 'fixture-4');
  f.env.GITHUB_APP_ID = '987';
  assert.equal(await githubInstallationToken(f.env), 'fixture-5');
});

test('missing App bindings, invalid installation ID, and PKCS1 keys fail before networking', async (t) => {
  const f = fixture(t);
  await assert.rejects(githubInstallationToken({}), /not fully configured/u);
  await assert.rejects(
    githubInstallationToken({ ...f.env, GITHUB_APP_INSTALLATION_ID: '../other' }),
    /not fully configured/u
  );
  await assert.rejects(
    githubInstallationToken({
      ...f.env,
      GITHUB_APP_PRIVATE_KEY: privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
    }),
    /PKCS8/u
  );
  assert.equal(f.calls.length, 0);
});

test('failed issuance clears single-flight state and never caches the response body', async (t) => {
  const f = fixture(t);
  f.respond(() => new Response('private upstream detail', { status: 403 }));
  await assert.rejects(githubInstallationToken(f.env), {
    message: 'GitHub App token request failed: 403',
  });
  f.respond(() =>
    Response.json(
      {
        token: 'repaired',
        expires_at: new Date(Date.now() + 3_600_000).toISOString(),
        permissions: { actions: 'write', contents: 'read' },
        repositories: [
          { full_name: 'pyconhk/pyconhk-website' },
          { full_name: 'pyconhk/pyconhk-news' },
        ],
      },
      { status: 201 }
    )
  );
  assert.equal(await githubInstallationToken(f.env), 'repaired');
  assert.equal(f.calls.length, 2);
});

test('App issuance rejects redirects without following them or accepting a token', async (t) => {
  const f = fixture(t);
  f.respond(
    () =>
      new Response(null, {
        status: 307,
        headers: { Location: 'https://untrusted.example/access_tokens' },
      })
  );
  await assert.rejects(githubInstallationToken(f.env), {
    message: 'GitHub App token request failed: 307',
  });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].options?.redirect, 'manual');
  assert.equal(f.calls[0].url, 'https://api.github.com/app/installations/123/access_tokens');
});

test('unexpected token permissions, repositories, and invalid expiry fail closed', async (t) => {
  const f = fixture(t);
  const good = {
    token: 'fixture',
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    permissions: { actions: 'write', contents: 'read' },
    repositories: [{ full_name: 'pyconhk/pyconhk-website' }, { full_name: 'pyconhk/pyconhk-news' }],
  };
  for (const variant of [
    { ...good, expires_at: 'invalid' },
    { ...good, expires_at: new Date(Date.now() + 30_000).toISOString() },
    { ...good, permissions: { actions: 'write', contents: 'write' } },
    { ...good, permissions: { ...good.permissions, administration: 'write' } },
    {
      ...good,
      repositories: [{ full_name: 'someone-else/pyconhk-website' }, good.repositories[1]],
    },
    { ...good, repositories: undefined },
    { ...good, token: '' },
  ]) {
    f.respond(() => Response.json(variant, { status: 201 }));
    await assert.rejects(githubInstallationToken(f.env), /unexpectedly scoped/u);
  }
});

test('a rejected token is renewed and an older request cannot discard its replacement', async (t) => {
  const f = fixture(t);
  const first = await githubInstallationToken(f.env);
  invalidateGitHubToken(f.env, first);
  const second = await githubInstallationToken(f.env);
  assert.notEqual(first, second);
  invalidateGitHubToken(f.env, first);
  assert.equal(await githubInstallationToken(f.env), second);
  assert.equal(f.calls.length, 2);
});
