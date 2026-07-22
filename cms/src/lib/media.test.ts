import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createGithubMediaUrl,
  extractLegacyMediaPath,
  fetchCmsMedia,
  normalizeMediaPath,
} from "./media";

const environment = {
  CMS_GITHUB_REPO: "pyconhk/pyconhk-website",
  CMS_GITHUB_BRANCH: "cms",
  CMS_MEDIA_FOLDER: "website/public/outstatic/images",
};

describe("CMS media delivery", () => {
  test("normalizes safe media paths and rejects traversal", () => {
    assert.equal(
      normalizeMediaPath("/sponsors/aws.webp/"),
      "sponsors/aws.webp",
    );

    for (const path of [
      undefined,
      "",
      "../secret",
      "a/../secret",
      "a\\b",
    ] as const) {
      assert.equal(normalizeMediaPath(path), null);
    }
  });

  test("extracts migrated Outstatic media paths", () => {
    assert.equal(
      extractLegacyMediaPath(
        "pyconhk/pyconhk-website/cms/website/website/public/outstatic/images/aws.webp",
      ),
      "aws.webp",
    );
    assert.equal(extractLegacyMediaPath("unrelated/aws.webp"), null);
  });

  test("builds a raw GitHub URL inside the configured media folder", () => {
    assert.equal(
      createGithubMediaUrl(environment, "sponsors/aws logo.webp").toString(),
      "https://raw.githubusercontent.com/pyconhk/pyconhk-website/cms/website/public/outstatic/images/sponsors/aws%20logo.webp",
    );
  });

  test("streams images without exposing non-image responses", async () => {
    const imageResponse = await fetchCmsMedia(
      environment,
      "aws.webp",
      async () =>
        new Response("image", {
          headers: { "Content-Type": "image/webp", ETag: "test" },
        }),
    );

    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get("Content-Type"), "image/webp");
    assert.equal(imageResponse.headers.get("ETag"), "test");
    assert.equal(await imageResponse.text(), "image");

    const invalidResponse = await fetchCmsMedia(
      environment,
      "not-an-image.txt",
      async () =>
        new Response("text", { headers: { "Content-Type": "text/plain" } }),
    );

    assert.equal(invalidResponse.status, 502);
  });
});
