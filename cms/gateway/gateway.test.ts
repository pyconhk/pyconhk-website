import assert from "node:assert/strict";
import { test } from "node:test";
import gateway from "./public/_worker.js";

test("OAuth requests and redirect cookies pass through without rewriting", async () => {
  const request = new Request(
    "https://cms.pycon.hk/api/decap/callback?code=example&state=state",
    {
      headers: {
        Cookie: "decap_oauth_state=state; decap_oauth_verifier=verifier",
      },
    },
  );
  const headers = new Headers({
    Location: "https://github.com/login/oauth/authorize?state=state",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "frame-ancestors 'none'",
  });
  headers.append(
    "Set-Cookie",
    "decap_oauth_state=state; Path=/api/decap/callback; HttpOnly; Secure; SameSite=Lax",
  );
  headers.append(
    "Set-Cookie",
    "decap_oauth_verifier=verifier; Path=/api/decap/callback; HttpOnly; Secure; SameSite=Lax",
  );
  const upstream = new Response(null, { status: 302, headers });
  let forwarded: Request | undefined;
  const response = await gateway.fetch(request, {
    CMS: {
      fetch: async (received: Request) => {
        forwarded = received;
        return upstream;
      },
    },
  });

  assert.equal(forwarded, request);
  assert.equal(response, upstream);
  assert.equal(response.status, 302);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.equal(
    response.headers.get("content-security-policy"),
    "frame-ancestors 'none'",
  );
});

test("request and response bodies remain unconsumed streams", async () => {
  const request = new Request("https://cms.pycon.hk/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: new Uint8Array([0, 1, 2, 255]),
  });
  const upstream = new Response(new Uint8Array([255, 2, 1, 0]), {
    headers: { "Content-Type": "application/octet-stream" },
  });
  const response = await gateway.fetch(request, {
    CMS: {
      fetch: async (received: Request) => {
        assert.equal(received, request);
        assert.equal(received.bodyUsed, false);
        return upstream;
      },
    },
  });

  assert.equal(request.bodyUsed, false);
  assert.equal(response, upstream);
  assert.equal(response.bodyUsed, false);
  assert.deepEqual(
    new Uint8Array(await response.arrayBuffer()),
    new Uint8Array([255, 2, 1, 0]),
  );
});

test("CMS assets, config, media and lookalike marker paths never use Pages assets", async () => {
  for (const path of [
    "/_astro/editor.js",
    "/admin/config.yml",
    "/outstatic/images/logo.webp",
    "/deployment-manifest.json",
    "/cms-gateway-manifest.json/",
  ]) {
    const request = new Request(`https://cms.pycon.hk${path}`);
    const upstream = new Response("CMS response");
    const response = await gateway.fetch(request, {
      CMS: {
        fetch: async (received: Request) => {
          assert.equal(received, request);
          return upstream;
        },
      },
      ASSETS: {
        fetch: () => assert.fail("CMS requests must not reach Pages assets"),
      },
    });
    assert.equal(response, upstream);
  }
});

test("only the exact gateway manifest path uses Pages assets independently of CMS", async () => {
  const request = new Request(
    "https://cms.pycon.hk/cms-gateway-manifest.json?deployment-check=1",
  );
  const marker = Response.json({ app: "cms-gateway", sourceHash: "expected" });
  const response = await gateway.fetch(request, {
    ASSETS: {
      fetch: async (received: Request) => {
        assert.equal(received, request);
        return marker;
      },
    },
  });
  assert.equal(response, marker);
});

test("missing or failed bindings fail closed without falling back to assets", async () => {
  const request = new Request(
    "https://cms.pycon.hk/api/decap/callback?code=private-code",
  );
  const assets = {
    fetch: () =>
      assert.fail("Unavailable CMS must not fall back to Pages assets"),
  };
  for (const env of [
    undefined,
    {},
    { CMS: {} },
    { ASSETS: assets },
    {
      CMS: {
        fetch: async () => {
          throw new Error("private-code and secret details");
        },
      },
      ASSETS: assets,
    },
  ]) {
    const response = await gateway.fetch(request, env);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(await response.text(), "CMS is temporarily unavailable.");
  }
  const markerResponse = await gateway.fetch(
    new Request("https://cms.pycon.hk/cms-gateway-manifest.json"),
    {},
  );
  assert.equal(markerResponse.status, 503);
});
