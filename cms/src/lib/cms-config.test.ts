import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createCmsConfig } from "./cms-config";
import { readCmsEnvironment } from "./env";

describe("createCmsConfig", () => {
  test("exposes one collection per conference year", () => {
    const environment = readCmsEnvironment({});
    const config = createCmsConfig(environment);

    assert.deepEqual(
      config.collections.map((collection) => ({
        name: collection.name,
        label: collection.label,
        folder: collection.folder,
        summary: collection.summary,
      })),
      [
        {
          name: "posts",
          label: "2026 Posts",
          folder: "website/outstatic/content/2026-posts",
          summary: "{{title}}",
        },
        {
          name: "posts_2025",
          label: "2025 Posts",
          folder: "website/outstatic/content/2025-posts",
          summary: "{{title}}",
        },
      ],
    );

    for (const collection of config.collections) {
      const fields = collection.fields as Record<string, unknown>[];

      assert.equal(collection.path, undefined);
      assert.equal(
        fields.some((field) => field.name === "collectionYear"),
        false,
      );
    }

    assert.notEqual(
      config.collections[0]?.fields,
      config.collections[1]?.fields,
    );
  });

  test("uses the boolean i18n mode required by Decap list widgets", () => {
    const environment = readCmsEnvironment({});
    const config = createCmsConfig(environment);
    const [collection] = config.collections;
    const fields = collection.fields as Record<string, unknown>[];
    const tags = fields.find((field) => field.name === "tags");

    assert.equal(tags?.widget, "list");
    assert.equal(tags?.i18n, true);
  });
});
