import { expect, test } from "@playwright/test";
import { parse } from "yaml";

test("admin loads the published Decap configuration and login screen", async ({
  page,
  request,
  baseURL,
}) => {
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(302);
  expect(root.headers().location).toBe("/admin/");
  await page.goto("/admin/");
  await expect(page).toHaveTitle("PyCon HK CMS");
  await expect(
    page.getByRole("button", { name: /Login with GitHub/i }),
  ).toBeVisible();
  const response = await request.get("/admin/config.yml");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const config = parse(await response.text());
  expect(config.backend).toMatchObject({
    name: "github",
    repo: "pyconhk/pyconhk-website",
    branch: "cms",
    base_url: baseURL,
  });
  expect(config.publish_mode).toBe("editorial_workflow");
  expect(config.i18n.locales).toEqual([
    "en",
    "zh-hk",
    "zh-hant",
    "zh-hans",
    "ja",
    "ko",
  ]);
  expect(config.media_folder).toBe("website/public/outstatic/images");
  expect(config.public_folder).toBe("/outstatic/images");
  for (const collection of config.collections) {
    if (collection.folder)
      expect(collection.folder).toMatch(/^website\/outstatic\/content\//);
    if (collection.files)
      for (const file of collection.files)
        expect(file.file).toMatch(/^website\/outstatic\/content\//);
  }
  expect(
    config.collections.find((c) => c.name === "posts_2025").i18n.locales,
  ).toEqual(["en", "zh-hk", "zh-hant", "zh-hans", "ja"]);
});

test("OAuth starts with state and PKCE and rejects an invalid callback", async ({
  request,
  baseURL,
}) => {
  const auth = await request.get("/api/decap/auth", { maxRedirects: 0 });
  expect(auth.status()).toBe(302);
  const url = new URL(auth.headers().location);
  expect(url.origin).toBe("https://github.com");
  expect(url.pathname).toBe("/login/oauth/authorize");
  expect(url.searchParams.get("redirect_uri")).toBe(
    `${baseURL}/api/decap/callback`,
  );
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("code_challenge")).toMatch(/^[\w-]{43}$/);
  expect(url.searchParams.get("state")).toBeTruthy();
  const cookies = auth
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie");
  expect(cookies).toHaveLength(2);
  for (const { value } of cookies) {
    expect(value).toContain("HttpOnly");
    expect(value).toContain("SameSite=Lax");
  }
  for (const suffix of ["", "?code=fake&state=wrong", "?error=access_denied"]) {
    const callback = await request.get(`/api/decap/callback${suffix}`);
    expect(callback.status()).toBe(400);
    expect(callback.headers()["cache-control"]).toBe("no-store");
    expect(callback.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(await callback.text()).not.toContain("e2e-local-secret");
  }
});

test("legacy media URLs redirect within the configured public folder", async ({
  request,
  baseURL,
}) => {
  const response = await request.get(
    "/api/outstatic/media/outstatic/images/test.webp",
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(
    `${baseURL}/outstatic/images/test.webp`,
  );
  const invalid = await request.get("/api/outstatic/media/unknown-file", {
    maxRedirects: 0,
  });
  expect(invalid.status()).toBe(404);
});
