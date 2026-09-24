import assert from "node:assert/strict";
import { test } from "node:test";
import { stringify } from "yaml";
import { cmsLocales, collectCmsLocaleProblems } from "./content.ts";

const contentFile = (locale) =>
  `website/outstatic/content/2026-posts/sample.${locale}.mdx`;
const validPost = {
  status: "published",
  title: "Sample news",
  slug: "sample",
  publishedAt: "2026-09-24T12:00:00.000Z",
  description: "Conference news",
  coverImage: "/outstatic/images/sample.webp",
  tags: ["announcement"],
  author: { name: "PyCon HK", picture: "/outstatic/images/author.png" },
};
const asMdx = (data) => `---\n${stringify(data)}---\nArticle body\n`;

test("valid published News includes all six locales", () => {
  const files = cmsLocales.map(contentFile);
  const problems = collectCmsLocaleProblems(files, () => asMdx(validPost));
  assert.deepEqual(problems, []);
});

test("an incomplete draft may omit optional fields", () => {
  const file = contentFile("en");
  const problems = collectCmsLocaleProblems([file], () => asMdx({ status: "draft" }));
  assert.deepEqual(problems, []);
});

for (const [field, value, expected] of [
  ["title", ["wrong"], /title must be a string/u],
  ["slug", ["wrong"], /slug must be a string/u],
  ["publishedAt", [], /publishedAt must be a string/u],
  ["description", { text: "wrong" }, /description must be a string/u],
  ["coverImage", false, /coverImage must be a string/u],
  ["coverImage", "/outstatic/images/logo.svg", /coverImage must use a raster image/u],
  ["tags", "announcement", /tags must be a list of strings/u],
  ["tags", ["announcement", null], /tags must be a list of strings/u],
  ["author", "PyCon HK", /author must be an object/u],
  ["author", { name: ["wrong"] }, /author.name must be a string/u],
  ["author", { picture: 42 }, /author.picture must be a string/u],
]) {
  test(`rejects malformed ${field} before Astro reads a draft`, () => {
    const file = contentFile("en");
    const problems = collectCmsLocaleProblems(
      [file],
      () => asMdx({ status: "draft", [field]: value }),
    );
    assert.equal(problems.length, 1);
    assert.match(problems[0], expected);
  });
}
