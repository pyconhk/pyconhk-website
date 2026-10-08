export interface GitHubAppEnv {
  GITHUB_APP_ID?: string;
  GITHUB_APP_INSTALLATION_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
}

export const githubRepositories: readonly string[] = Object.freeze([
  'pyconhk-website',
  'pyconhk-news',
]);
const permissions = { actions: 'write', contents: 'read' };
const refreshMargin = 60_000;
const encoder = new TextEncoder();
type CachedAuth = {
  appId: string;
  installationId: string;
  privateKey: string;
  token?: { value: string; expiresAt: number };
  pending?: Promise<string>;
};
// Each binding object owns its credentials and token. A different installation,
// rotated key, or another Worker environment cannot reuse a previous token.
const tokens = new WeakMap<GitHubAppEnv, CachedAuth>();

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function appJWT(auth: CachedAuth) {
  const pem = auth.privateKey.replaceAll('\\n', '\n').trim();
  const encoded =
    /^-----BEGIN PRIVATE KEY-----\s*([A-Za-z0-9+/=\s]+)\s*-----END PRIVATE KEY-----$/u.exec(
      pem
    )?.[1];
  if (!encoded) throw new Error('GitHub App private key must be unencrypted PKCS8 PEM');
  const key = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(encoded.replace(/\s/gu, '')), (character) => character.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const now = Math.floor(Date.now() / 1000);
  const message = [
    { alg: 'RS256', typ: 'JWT' },
    { iat: now - 60, exp: now + 540, iss: auth.appId },
  ]
    .map((part) => base64url(encoder.encode(JSON.stringify(part))))
    .join('.');
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(message));
  return `${message}.${base64url(new Uint8Array(signature))}`;
}

async function mint(auth: CachedAuth) {
  const response = await fetch(
    `https://api.github.com/app/installations/${auth.installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await appJWT(auth)}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'pyconhk-content-reconciler',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repositories: githubRepositories, permissions }),
      redirect: 'error',
      signal: AbortSignal.timeout(20_000),
    }
  );
  // Authentication failures contain no response body or credential in logs.
  if (!response.ok) throw new Error(`GitHub App token request failed: ${response.status}`);
  const data = (await response.json()) as {
    token?: unknown;
    expires_at?: string;
    permissions?: Record<string, string>;
    repositories?: { full_name: string }[];
  };
  const expiresAt = Date.parse(data.expires_at || '');
  const repositories = data.repositories?.map((repository) => repository.full_name).sort();
  const expected = githubRepositories.map((repository) => `pyconhk/${repository}`).sort();
  if (
    typeof data.token !== 'string' ||
    !data.token ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now() + refreshMargin ||
    data.permissions?.actions !== 'write' ||
    data.permissions.contents !== 'read' ||
    Object.entries(data.permissions).some(
      ([name, value]) =>
        !Object.hasOwn(permissions, name) && !(name === 'metadata' && value === 'read')
    ) ||
    JSON.stringify(repositories) !== JSON.stringify(expected)
  )
    throw new Error('GitHub App returned an invalid or unexpectedly scoped installation token');
  auth.token = { value: data.token, expiresAt };
  return data.token;
}

export async function githubInstallationToken(env: GitHubAppEnv) {
  const appId = env.GITHUB_APP_ID?.trim();
  const installationId = env.GITHUB_APP_INSTALLATION_ID?.trim();
  const privateKey = env.GITHUB_APP_PRIVATE_KEY;
  if (
    !appId ||
    !/^[A-Za-z0-9_.-]+$/u.test(appId) ||
    !installationId ||
    !/^[1-9]\d*$/u.test(installationId) ||
    !privateKey
  )
    throw new Error('GitHub App reconciliation credentials are not fully configured');
  let auth = tokens.get(env);
  if (
    !auth ||
    auth.appId !== appId ||
    auth.installationId !== installationId ||
    auth.privateKey !== privateKey
  ) {
    auth = { appId, installationId, privateKey };
    tokens.set(env, auth);
  }
  if (auth.token && auth.token.expiresAt > Date.now() + refreshMargin) return auth.token.value;
  if (auth.pending) return auth.pending;
  const owned = auth;
  const pending = mint(owned).finally(() => {
    owned.pending = undefined;
  });
  owned.pending = pending;
  return pending;
}

export function invalidateGitHubToken(env: GitHubAppEnv, token: string) {
  const auth = tokens.get(env);
  if (auth?.token?.value === token) auth.token = undefined;
}
