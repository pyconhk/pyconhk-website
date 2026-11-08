import assert from "node:assert/strict";
import { test } from "node:test";
import { stringify } from "yaml";
import { cmsLocales, collectCmsLocaleProblems, collectSprintLocaleProblems } from "./content.ts";

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
const sprintFile = (locale) => `website/outstatic/content/2026-sprint/settings.${locale}.json`;
const sprintFiles = cmsLocales.map(sprintFile);
const sprintSettings = (locale) => ({
  slug: "settings", status: "published", intro: `Sprint introduction ${locale}`,
  date: "2026-11-15", startTime: "10:00", endTime: "17:00",
  location: `Conference venue ${locale}`, registrationUrl: "https://example.invalid/register",
  proposalUrl: "https://example.invalid/propose", proposalDeadline: "2026-11-10T23:59:00+08:00",
  items: [`Preparation ${locale}`],
  qa: [{ id: "prepare", question: `Question ${locale}`, answer: `Answer ${locale}` }],
  projects: [{ id: "community-project", status: "published", title: `Project ${locale}`,
    description: `Description ${locale}`, lead: "Project lead", repositoryUrl: "https://example.invalid/repo",
    setupUrl: "https://example.invalid/setup", skills: ["Python"], contributions: [`Task ${locale}`] }],
});
const sprintContents = () => Object.fromEntries(cmsLocales.map((locale) => [sprintFile(locale), sprintSettings(locale)]));

test("publication validates six structured Sprint locales alongside existing News", () => {
  const contents = sprintContents();
  assert.deepEqual(collectCmsLocaleProblems([...sprintFiles, contentFile("en")], (file) =>
    file.endsWith(".json") ? JSON.stringify(contents[file]) : asMdx(validPost)), []);
  assert.deepEqual(collectCmsLocaleProblems(sprintFiles, (file) => JSON.stringify(contents[file])), []);
});

test("legacy News without Sprint remains valid, but a partial singleton never does", () => {
  assert.deepEqual(collectSprintLocaleProblems([contentFile("en")], () => asMdx(validPost)), []);
  assert.match(collectSprintLocaleProblems([sprintFile("en")], () => JSON.stringify(sprintSettings("en"))).join("\n"), /all six locale files/u);
  assert.match(collectSprintLocaleProblems([...sprintFiles.slice(0, -1), sprintFile("fr")], () => JSON.stringify(sprintSettings("en"))).join("\n"), /not a canonical/u);
});

test("unfinished Sprint drafts are allowed but publishing requires every translation", () => {
  assert.deepEqual(collectSprintLocaleProblems(sprintFiles, () => JSON.stringify({ slug: "settings", status: "draft" })), []);
  const contents = sprintContents();
  contents[sprintFile("ko")].status = "draft";
  assert.match(collectSprintLocaleProblems(sprintFiles, (file) => JSON.stringify(contents[file])).join("\n"), /published translations: ko/u);
});

for (const [name, change, message] of [
  ["unsafe registration URL", (data) => { data.registrationUrl = "javascript:alert(1)"; }, /complete HTTPS URL/u],
  ["non-text project lead", (data) => { data.projects[0].lead = false; }, /expected text/u],
  ["unrelated conference fields", (data) => { data.sponsors = []; }, /unknown field/u],
  ["mismatched shared date", (data) => { data.date = "2026-11-16"; }, /must match English/u],
  ["mismatched published project", (data) => { data.projects[0].repositoryUrl = "https://example.invalid/other"; }, /must match English/u],
  ["mismatched question IDs", (data) => { data.qa[0].id = "different"; }, /must match English/u],
] as const) {
  test(`publication rejects Sprint ${name} through the shared parser`, () => {
    const contents = sprintContents();
    change(contents[sprintFile("ko")]);
    assert.match(collectSprintLocaleProblems(sprintFiles, (file) => JSON.stringify(contents[file])).join("\n"), message);
  });
}

test("malformed Sprint JSON is reported with its canonical locale path", () => {
  const contents = sprintContents();
  const errors = collectSprintLocaleProblems(sprintFiles, (file) =>
    file === sprintFile("ja") ? "{" : JSON.stringify(contents[file]));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /settings\.ja\.json/u);
});

test("draft Sprint projects may differ without weakening published project consistency", () => {
  const contents = sprintContents();
  contents[sprintFile("ja")].projects.push({ id: "unfinished", status: "draft" } as never);
  assert.deepEqual(collectSprintLocaleProblems(sprintFiles, (file) => JSON.stringify(contents[file])), []);
});

test("valid published News can include all six locales", () => {
  const files = cmsLocales.map(contentFile);
  const problems = collectCmsLocaleProblems(files, () => asMdx(validPost));
  assert.deepEqual(problems, []);
});

test("2026 News can publish English while translations remain draft or missing", () => {
  const files = [contentFile("en"), contentFile("zh-hk")];
  const problems = collectCmsLocaleProblems(files, (file) =>
    asMdx(file.endsWith(".en.mdx") ? validPost : { status: "draft" }),
  );
  assert.deepEqual(problems, []);
});

test("published translations keep shared English fields while drafts can be unfinished", () => {
  const files = [contentFile("en"), contentFile("zh-hk")];
  const problems = collectCmsLocaleProblems(files, (file) =>
    asMdx(file.endsWith(".en.mdx") ? validPost : { ...validPost, coverImage: "/different.webp" }),
  );
  assert.deepEqual(problems, [
    "website/outstatic/content/2026-posts/sample coverImage must match English in zh-hk",
  ]);
});

test("2025 News still requires all five published translations", () => {
  const file = contentFile("en").replace("2026-posts", "2025-posts");
  const problems = collectCmsLocaleProblems([file], () => asMdx(validPost));
  assert.deepEqual(problems, [
    "website/outstatic/content/2025-posts/sample is missing published locales: zh-hk, zh-hant, zh-hans, ja",
  ]);
});

test("an incomplete draft may omit optional fields", () => {
  const file = contentFile("en");
  const problems = collectCmsLocaleProblems([file], () => asMdx({ status: "draft" }));
  assert.deepEqual(problems, []);
});

for (const value of [undefined, null, "", "   "]) {
  test(`draft optional strings accept ${JSON.stringify(value) ?? "absence"}`, () => {
    const file = contentFile("en");
    assert.deepEqual(
      collectCmsLocaleProblems([file], () =>
        asMdx({
          status: "draft",
          title: value,
          description: value,
          publishedAt: value,
          coverImage: value,
          author: { name: "PyCon HK", picture: value },
        }),
      ),
      [],
    );
  });
}

for (const tags of [undefined, null, [], ["announcement"]]) {
  test(`optional tags accept ${JSON.stringify(tags) ?? "absence"}`, () => {
    const files = cmsLocales.map(contentFile);
    assert.deepEqual(
      collectCmsLocaleProblems(files, () => asMdx({ ...validPost, tags })),
      [],
    );
  });
}

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
  ["slug", null, /slug must be a string/u],
  ["author", null, /author must be an object/u],
  ["author", { name: null }, /author.name must be a string/u],
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
