import { expect, test } from "@playwright/test";
import { validateEditorialPublish } from "../src/lib/editor-validation";

test("both CMS environments allow drafts and reject incomplete published content", () => {
  for (const collection of [
    "posts",
    "posts_test",
    "posts_2025",
    "posts_2025_test",
  ]) {
    expect(() =>
      validateEditorialPublish({
        collection,
        data: { status: "published" },
      }),
    ).toThrow(/before publishing: en/);

    expect(() =>
      validateEditorialPublish({
        collection,
        data: { status: "draft" },
      }),
    ).not.toThrow();
  }
});

test("2026 can publish English while translations remain unfinished drafts", () => {
  const data = {
    status: "published",
    title: "Conference guide",
    body: "A complete English guide.",
    description: "Plan your conference day.",
    publishedAt: "2026-10-19T00:00:00.000Z",
    coverImage: "/outstatic/images/guide.webp",
    tags: ["Conference"],
    slug: "guide",
  };
  for (const collection of ["posts", "posts_test"]) {
    const i18n = { "zh-hk": { data: { status: "draft", title: "" } } };
    expect(() =>
      validateEditorialPublish({ collection, data, i18n }),
    ).not.toThrow();
    expect(() =>
      validateEditorialPublish({
        collection,
        data,
        i18n: { "zh-hk": { data: { ...data, title: "中文稿", body: "" } } },
      }),
    ).toThrow(/before publishing: zh-hk/);
    expect(() =>
      validateEditorialPublish({
        collection,
        data,
        i18n: {
          "zh-hk": { data: { ...data, title: "中文稿", body: "完整中文稿。" } },
        },
      }),
    ).not.toThrow();
  }
});

test("published News validates the year's locales and keeps shared fields consistent", () => {
  const data = {
    status: "published",
    title: "News",
    body: "News body",
    description: "News summary",
    publishedAt: "2026-09-30T00:00:00.000Z",
    coverImage: "/outstatic/images/news.webp",
    tags: ["News"],
    slug: "news",
  };
  for (const collection of [
    "posts",
    "posts_test",
    "posts_2025",
    "posts_2025_test",
  ]) {
    const locales = [
      "zh-hk",
      "zh-hant",
      "zh-hans",
      "ja",
      ...(collection.startsWith("posts_2025") ? [] : ["ko"]),
    ];
    const i18n = Object.fromEntries(
      locales.map((locale) => [
        locale,
        { data: { ...data, title: `News ${locale}` } },
      ]),
    );
    expect(() =>
      validateEditorialPublish({ collection, data, i18n }),
    ).not.toThrow();
    expect(() =>
      validateEditorialPublish({
        collection,
        data,
        i18n: { ...i18n, ja: { data: { ...data, slug: "different" } } },
      }),
    ).toThrow(/slug must match English in ja/);
    expect(() =>
      validateEditorialPublish({
        collection,
        data,
        i18n: { ...i18n, ja: { data: { ...data, body: "" } } },
      }),
    ).toThrow(/before publishing: ja/);
  }
});
