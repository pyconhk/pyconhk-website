import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { conferenceLocales } from "../../../website/src/lib/conference-schema";
import { validateEditorialPublish } from "./editor-validation";

const published = {
  status: "published",
  title: "Approved announcement",
  body: "Article text",
  description: "Approved description",
  publishedAt: "2026-09-08T00:00:00.000Z",
  coverImage: "/outstatic/images/approved.webp",
  tags: ["announcement"],
};
const translations = Object.fromEntries(
  conferenceLocales
    .filter((locale) => locale !== "en")
    .map((locale) => [locale, { data: published }]),
);

describe("CMS publish validation", () => {
  test("allows partial drafts and blocks publishing an incomplete translation", () => {
    assert.doesNotThrow(() =>
      validateEditorialPublish({
        collection: "posts",
        data: { status: "draft" },
      }),
    );
    assert.throws(
      () => validateEditorialPublish({ collection: "posts", data: published }),
      /zh-hk.*ko/u,
    );
    assert.throws(
      () =>
        validateEditorialPublish({
          collection: "posts",
          data: published,
          i18n: { ...translations, ko: { data: { ...published, body: " " } } },
        }),
      /ko/u,
    );
  });
  test("publishes six complete translations and keeps the archive at five", () => {
    assert.doesNotThrow(() =>
      validateEditorialPublish({
        collection: "posts",
        data: published,
        i18n: translations,
      }),
    );
    const { ko: _korean, ...archive } = translations;
    assert.doesNotThrow(() =>
      validateEditorialPublish({
        collection: "posts_2025",
        data: published,
        i18n: archive,
      }),
    );
    assert.throws(
      () =>
        validateEditorialPublish({
          collection: "posts",
          data: published,
          i18n: archive,
        }),
      /ko/u,
    );
  });
  test("blocks missing published metadata and mismatched shared fields", () => {
    for (const patch of [
      { description: "" },
      { publishedAt: "not-a-date" },
      { coverImage: "" },
      { tags: [] },
      { publishedAt: "2026-09-09T00:00:00.000Z" },
    ]) {
      assert.throws(
        () =>
          validateEditorialPublish({
            collection: "posts",
            data: published,
            i18n: { ...translations, ko: { data: { ...published, ...patch } } },
          }),
        /ko/u,
      );
    }
  });
});
