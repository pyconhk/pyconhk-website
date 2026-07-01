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
    locales: ["en", "zh-hk", "zh-hant", "zh-hans", "ja"],
    default_locale: "en",
  },
  collections: [
    {
      name: "posts",
      folder: "website/outstatic/content",
      path: "{{collectionYear}}-posts/{{slug}}",
      create: true,
      i18n: true,
      extension: "mdx",
      format: "frontmatter",
      fields: [
        { label: "Title", name: "title", widget: "string", i18n: true },
        { label: "Body", name: "body", widget: "markdown", i18n: true },
      ],
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
      ],
    });

    assert.deepEqual(problems, [
      "backend.branch must be cms",
      "media_folder must be website/public/outstatic/images",
      "i18n.locales must be en, zh-hk, zh-hant, zh-hans, ja",
      "posts.folder must be website/outstatic/content",
      "posts body field must be locale-enabled",
    ]);
  });
});
