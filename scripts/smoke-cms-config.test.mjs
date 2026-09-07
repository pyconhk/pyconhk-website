import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildConfigUrl,
  collectCmsConfigProblems,
} from "./smoke-cms-config.mjs";

const validConfig = {
  backend: {
    name: "github",
    repo: "pyconhk/pyconhk-website",
    branch: "cms",
  },
  publish_mode: "editorial_workflow",
  media_folder: "website/public/outstatic/images",
  public_folder: "/outstatic/images",
  i18n: {
    structure: "multiple_files",
    locales: ["en", "zh-hk", "zh-hant", "zh-hans", "ja", "ko"],
    default_locale: "en",
  },
  collections: [
    {
      name: "posts",
      label: "2026 Posts",
      folder: "website/outstatic/content/2026-posts",
      create: true,
      i18n: true,
      extension: "mdx",
      format: "frontmatter",
      summary: "{{title}}",
      fields: [
        { label: "Title", name: "title", widget: "string", i18n: true },
        { label: "Tags", name: "tags", widget: "list", i18n: true },
        { label: "Body", name: "body", widget: "markdown", i18n: true },
      ],
    },
    {
      name: "posts_2025",
      label: "2025 Posts",
      folder: "website/outstatic/content/2025-posts",
      create: true,
      i18n: {
        locales: ["en", "zh-hk", "zh-hant", "zh-hans", "ja"],
        default_locale: "en",
      },
      extension: "mdx",
      format: "frontmatter",
      summary: "{{title}}",
      fields: [
        { label: "Title", name: "title", widget: "string", i18n: true },
        { label: "Tags", name: "tags", widget: "list", i18n: true },
        { label: "Body", name: "body", widget: "markdown", i18n: true },
      ],
    },
    {
      name: "conference_2026",
      folder: "website/outstatic/content/2026-conference",
      create: false,
      delete: false,
      i18n: true,
      extension: "json",
      format: "json",
      fields: [
        "event",
        "tickets",
        "venue",
        "catering",
        "sprint",
        "qa",
        "sponsors",
        "sponsorship",
        "patrons",
        "organizations",
        "people",
        "about",
      ].map((name) => ({ name })),
    },
  ],
};

describe("CMS hosted config smoke validation", () => {
  test("builds the Decap config URL from a CMS host or config URL", () => {
    assert.equal(
      buildConfigUrl("https://cms.pycon.hk").href,
      "https://cms.pycon.hk/admin/config.yml",
    );
    assert.equal(
      buildConfigUrl("https://cms.pycon.hk/admin/").href,
      "https://cms.pycon.hk/admin/config.yml",
    );
    assert.equal(
      buildConfigUrl("https://cms.pycon.hk/admin/config.yml?cache=skip").href,
      "https://cms.pycon.hk/admin/config.yml",
    );
  });

  test("accepts the expected hosted Decap branch, path, and locale contract", () => {
    assert.deepEqual(collectCmsConfigProblems(validConfig), []);
  });

  test("reports actionable problems when hosted config can write outside the CMS contract", () => {
    const problems = collectCmsConfigProblems({
      ...validConfig,
      backend: { ...validConfig.backend, branch: "main" },
      media_folder: "public/uploads",
      i18n: { ...validConfig.i18n, locales: ["en"] },
      collections: [
        {
          ...validConfig.collections[0],
          folder: "cms/content",
          fields: [{ name: "body", widget: "markdown", i18n: false }],
        },
        validConfig.collections[1],
        validConfig.collections[2],
      ],
    });

    assert.deepEqual(problems, [
      "backend.branch must be cms",
      "media_folder must be website/public/outstatic/images",
      "i18n.locales must be en, zh-hk, zh-hant, zh-hans, ja, ko",
      "posts.folder must be website/outstatic/content/2026-posts",
      "posts body field must be locale-enabled",
      "posts tags field must use locale-enabled list semantics",
    ]);
  });

  test("requires the archive collection as well as the current collection", () => {
    const problems = collectCmsConfigProblems({
      ...validConfig,
      collections: [validConfig.collections[0], validConfig.collections[2]],
    });

    assert.deepEqual(problems, ["posts_2025 collection is required"]);
  });
});
