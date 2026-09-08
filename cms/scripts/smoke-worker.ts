import assert from "node:assert/strict";
import { parse } from "yaml";

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const value = headers.get("set-cookie");
  return value ? value.split(/,(?=\s*[^;,]+=)/u) : [];
}

async function request(baseUrl, pathname) {
  return fetch(new URL(pathname, baseUrl), { redirect: "manual" });
}

export async function smokeWorker(rawUrl) {
  const baseUrl = new URL(rawUrl);

  const root = await request(baseUrl, "/");
  assert.equal(root.status, 302, "root must redirect to the CMS admin");
  assert.equal(root.headers.get("location"), "/admin/");

  const admin = await request(baseUrl, "/admin/");
  assert.equal(admin.status, 200, "admin page must be available");
  assert.match(await admin.text(), /<title>PyCon HK CMS<\/title>/u);

  const configResponse = await request(baseUrl, "/admin/config.yml");
  assert.equal(configResponse.status, 200, "Decap config must be available");
  assert.match(configResponse.headers.get("content-type") || "", /text\/yaml/u);
  assert.equal(configResponse.headers.get("cache-control"), "no-store");

  const config = parse(await configResponse.text());
  assert.equal(config.backend.name, "github");
  assert.equal(config.backend.repo, "pyconhk/pyconhk-website");
  assert.equal(config.backend.branch, "cms");
  assert.equal(config.backend.base_url, baseUrl.origin);
  assert.equal(config.backend.site_domain, baseUrl.host);
  assert.equal(config.i18n.structure, "multiple_files");
  assert.deepEqual(config.i18n.locales, [
    "en",
    "zh-hk",
    "zh-hant",
    "zh-hans",
    "ja",
  ]);
  const tagsField = config.collections[0].fields.find(
    (field) => field.name === "tags",
  );
  assert.equal(
    tagsField.i18n,
    true,
    "Decap list widgets require a boolean i18n mode",
  );

  const auth = await request(baseUrl, "/api/decap/auth");
  assert.equal(auth.status, 302, "OAuth endpoint must redirect to GitHub");
  assert.equal(auth.headers.get("cache-control"), "no-store");

  const authorizeUrl = new URL(auth.headers.get("location"));
  assert.equal(authorizeUrl.origin, "https://github.com");
  assert.equal(authorizeUrl.pathname, "/login/oauth/authorize");
  assert.ok(authorizeUrl.searchParams.get("client_id"));
  assert.equal(authorizeUrl.searchParams.get("scope"), "public_repo");
  assert.equal(
    authorizeUrl.searchParams.get("redirect_uri"),
    `${baseUrl.origin}/api/decap/callback`,
  );
  assert.equal(authorizeUrl.searchParams.get("code_challenge_method"), "S256");
  assert.ok(authorizeUrl.searchParams.get("code_challenge"));

  const oauthCookies = getSetCookies(auth.headers);
  assert.equal(oauthCookies.length, 2, "OAuth endpoint must set state and PKCE cookies");
  assert.ok(oauthCookies.every((cookie) => cookie.includes("HttpOnly")));
  assert.ok(oauthCookies.every((cookie) => cookie.includes("SameSite=Lax")));

  const callback = await request(baseUrl, "/api/decap/callback");
  assert.equal(callback.status, 400, "invalid OAuth callback must fail closed");
  assert.equal(callback.headers.get("cache-control"), "no-store");
  assert.match(
    callback.headers.get("content-security-policy") || "",
    /frame-ancestors 'none'/u,
  );

  const callbackHtml = await callback.text();
  assert.match(callbackHtml, /event\.source !== window\.opener/u);
  assert.match(callbackHtml, /event\.origin !== trustedOrigin/u);
  assert.doesNotMatch(callbackHtml, /postMessage\([^\n]+, "\*"\)/u);

  console.log(`Cloudflare Worker smoke validation passed: ${baseUrl.origin}`);
}

async function main() {
  const rawUrl = process.argv[2] || process.env.CMS_BASE_URL;

  if (!rawUrl) {
    throw new Error("Usage: node scripts/smoke-worker.ts http://127.0.0.1:4321");
  }

  await smokeWorker(rawUrl);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
