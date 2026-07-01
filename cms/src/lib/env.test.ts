import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  normalizeCmsDefaultLocale,
  normalizeCmsLocales,
  normalizeCmsOwnedPath,
  normalizeCmsPublicFolder,
} from "./env";

describe("CMS environment normalization", () => {
  test("accepts only website-supported CMS locales", () => {
    assert.deepEqual(normalizeCmsLocales("en, zh-hk, ja"), [
      "en",
      "zh-hk",
      "ja",
    ]);

    assert.throws(
      () => normalizeCmsLocales("en,ko"),
      /Unsupported CMS locale "ko"/u,
    );
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
});
