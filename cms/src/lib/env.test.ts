import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  getCmsRepo,
  getCmsSiteUrl,
  getGithubScope,
  normalizeCmsDefaultLocale,
  normalizeCmsLocales,
  normalizeCmsOwnedPath,
  normalizeCmsPublicFolder,
  normalizeGithubRepo,
  readCmsEnvironment,
} from "./env";

describe("CMS environment normalization", () => {
  test("accepts only website-supported CMS locales", () => {
    assert.deepEqual(normalizeCmsLocales("en, zh-hk, ja"), [
      "en",
      "zh-hk",
      "ja",
    ]);

    assert.throws(
      () => normalizeCmsLocales("en,fr"),
      /Unsupported CMS locale "fr"/u,
    );
    assert.deepEqual(normalizeCmsLocales("en,ko"), ["en", "ko"]);
  });

  test("keeps CMS write paths inside promotion-owned prefixes", () => {
    assert.equal(
      normalizeCmsOwnedPath("CMS_CONTENT_ROOT", "website/outstatic/content/", [
        "website/outstatic/content",
      ]),
      "website/outstatic/content",
    );

    assert.equal(
      normalizeCmsOwnedPath(
        "CMS_MEDIA_FOLDER",
        "website/public/outstatic/images",
        ["website/public/outstatic/images", "website/outstatic/media"],
      ),
      "website/public/outstatic/images",
    );

    assert.throws(
      () =>
        normalizeCmsOwnedPath("CMS_CONTENT_ROOT", "website/src/content", [
          "website/outstatic/content",
        ]),
      /CMS_CONTENT_ROOT must stay inside CMS-owned paths/u,
    );
  });

  test("keeps CMS public media URLs aligned with website public assets", () => {
    assert.equal(
      normalizeCmsPublicFolder("/outstatic/images/"),
      "/outstatic/images",
    );

    assert.throws(
      () => normalizeCmsPublicFolder("/uploads"),
      /CMS_PUBLIC_FOLDER must be \/outstatic\/images/u,
    );
  });

  test("rejects unsupported CMS default locales", () => {
    assert.equal(normalizeCmsDefaultLocale("zh-hk", ["en", "zh-hk"]), "zh-hk");
    assert.equal(normalizeCmsDefaultLocale(undefined, ["en", "zh-hk"]), "en");
    assert.equal(normalizeCmsDefaultLocale(undefined, ["zh-hk"]), "zh-hk");

    assert.throws(
      () => normalizeCmsDefaultLocale("ko", ["en", "zh-hk"]),
      /CMS_DEFAULT_LOCALE must be one of the configured CMS locales/u,
    );
  });

  test("reads runtime bindings through an explicit environment boundary", () => {
    assert.deepEqual(
      readCmsEnvironment({
        CMS_GITHUB_REPO: "pyconhk/pyconhk-website",
        CMS_GITHUB_CLIENT_SECRET: "secret",
        UNRELATED_BINDING: "ignored",
      }),
      {
        CMS_GITHUB_REPO: "pyconhk/pyconhk-website",
        CMS_GITHUB_CLIENT_SECRET: "secret",
      },
    );

    assert.throws(
      () => readCmsEnvironment({ CMS_GITHUB_REPO: { binding: true } }),
      /CMS_GITHUB_REPO must be a string/u,
    );
  });

  test("uses the request origin unless a canonical CMS origin is configured", () => {
    const requestUrl = new URL(
      "https://preview.pyconhk-cms.workers.dev/admin/",
    );

    assert.equal(getCmsSiteUrl(requestUrl, {}), requestUrl.origin);
    assert.equal(
      getCmsSiteUrl(requestUrl, { CMS_PUBLIC_URL: "https://cms.pycon.hk/" }),
      "https://cms.pycon.hk",
    );

    assert.throws(
      () =>
        getCmsSiteUrl(requestUrl, {
          CMS_PUBLIC_URL: "https://cms.pycon.hk/unexpected-path",
        }),
      /CMS_PUBLIC_URL must be an origin/u,
    );
  });

  test("uses the least-privilege GitHub scope and validates repository names", () => {
    assert.equal(getGithubScope({}), "public_repo");
    assert.equal(
      getCmsRepo({ CMS_GITHUB_REPO: "pyconhk/pyconhk-website" }),
      "pyconhk/pyconhk-website",
    );
    assert.equal(
      normalizeGithubRepo("CMS_GITHUB_REPO", "pyconhk/pyconhk-website"),
      "pyconhk/pyconhk-website",
    );

    assert.throws(
      () => normalizeGithubRepo("CMS_GITHUB_REPO", "pyconhk/website/extra"),
      /CMS_GITHUB_REPO must use the owner\/repository form/u,
    );
  });
});
