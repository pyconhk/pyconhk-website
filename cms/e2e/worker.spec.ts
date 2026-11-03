import { expect, test } from "@playwright/test";
import { parse } from "yaml";

const profile = process.env.CMS_E2E_PROFILE ?? "legacy";
const expectedBackend = {
  legacy: { repo: "pyconhk/pyconhk-website", branch: "cms" },
  test: { repo: "pyconhk/pyconhk-news", branch: "cms-test" },
  production: { repo: "pyconhk/pyconhk-news", branch: "cms" },
}[profile];

if (!expectedBackend) {
  throw new Error("CMS_E2E_PROFILE must be legacy, test or production");
}

const collectionSuffix = profile === "test" ? "_test" : "";

test("admin loads the published Decap configuration and login screen", async ({
  page,
  request,
  baseURL,
}) => {
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(302);
  expect(root.headers().location).toBe("/admin/");
  await page.goto("/admin/");
  await expect(page).toHaveTitle(
    `PyCon HK CMS · ${profile === "legacy" ? "TRANSITION" : profile.toUpperCase()}`,
  );
  await expect(page.getByLabel("CMS environment")).toContainText(
    expectedBackend.branch,
  );
  await expect(
    page.getByRole("button", { name: /Login with GitHub/i }),
  ).toBeVisible();
  const response = await request.get("/admin/config.yml");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const config = parse(await response.text());
  expect(config.backend).toMatchObject({
    name: "github",
    ...expectedBackend,
    base_url: baseURL,
  });
  expect(config.publish_mode).toBe("simple");
  expect(config.locale).toBe("pycon-en");
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
  expect(config.collections.map((collection) => collection.name)).toEqual([
    `posts${collectionSuffix}`,
    `posts_2025${collectionSuffix}`,
    `sprint_2026${collectionSuffix}`,
  ]);
  expect(config.collections.map((collection) => collection.label)).toEqual([
    "2026 News",
    "2025 News",
    "2026 Sprint",
  ]);
  for (const collection of config.collections) {
    if (collection.folder)
      expect(collection.folder).toMatch(/^website\/outstatic\/content\//);
    if (collection.files)
      for (const file of collection.files)
        expect(file.file).toMatch(/^website\/outstatic\/content\//);
  }
  expect(
    config.collections.find((c) => c.name === `posts_2025${collectionSuffix}`)
      .i18n.locales,
  ).toEqual(["en", "zh-hk", "zh-hant", "zh-hans", "ja"]);
  for (const collection of config.collections) {
    const visibility = collection.fields.find(
      (field) => field.name === "status",
    );
    expect(visibility.label).toBe("Website visibility");
    expect(visibility.options).toEqual([
      { label: "Draft — do not publish", value: "draft" },
      {
        label: collection.name.startsWith("sprint_2026")
          ? "Publish all six translations after checks"
          : collection.name.startsWith("posts_2025")
            ? "Publish all five translations after checks"
            : "Publish this language after checks",
        value: "published",
      },
    ]);
    expect(visibility.i18n).toBe(
      collection.name.startsWith("posts_2025") ||
        collection.name.startsWith("sprint_2026")
        ? "duplicate"
        : true,
    );
  }
  const sprint = config.collections.find(
    (collection) => collection.name === `sprint_2026${collectionSuffix}`,
  );
  expect(sprint).toMatchObject({
    folder: "website/outstatic/content/2026-sprint",
    create: false,
    delete: false,
    i18n: true,
    format: "json",
    extension: "json",
    filter: { field: "slug", value: "settings" },
    editor: { preview: true },
  });
});

test("deployment manifest identifies the CMS content environment", async ({
  request,
}) => {
  const response = await request.get("/deployment-manifest.json");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toMatchObject({
    app: "cms",
    environment: profile,
    contentRepo: expectedBackend.repo,
    contentBranch: expectedBackend.branch,
  });
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
