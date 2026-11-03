import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { parse } from "yaml";
import {
  parseSprintContent,
  type SprintContent,
  type SprintLocale,
  sprintLocales,
  validateSprintTranslations,
} from "../../website/src/lib/sprint-content.ts";

const projectGoals: Record<SprintLocale, string> = {
  en: "Document a beginner-friendly counter example.",
  "zh-hk": "寫一個適合新手嘅計數器範例說明。",
  "zh-hant": "為適合初學者的計數器範例撰寫說明。",
  "zh-hans": "为适合初学者的计数器示例编写说明。",
  ja: "初心者向けのカウンターサンプルの説明を書く。",
  ko: "초보자를 위한 카운터 예제의 설명을 작성합니다.",
};

function fixture(locale: SprintLocale): SprintContent {
  const source = JSON.parse(
    readFileSync(
      new URL(
        `../../website/outstatic/content/2026-sprint/settings.${locale}.json`,
        import.meta.url,
      ),
      "utf8",
    ),
  );
  return {
    ...source,
    status: "draft",
    intro: `Saved introduction ${locale}`,
    qa: [
      {
        id: "preparation",
        question: `Saved question ${locale}`,
        answer: `Saved answer ${locale}`,
      },
    ],
    projects: [
      {
        id: "e2e-project",
        status: "draft",
        title: `Draft project ${locale}`,
        description: "",
        lead: "",
        level: "all-levels",
        repositoryUrl: "",
        setupUrl: "",
        discordUrl: "https://discord.gg/e2e-project",
        skills: [],
        contributions: [projectGoals[locale]],
      },
    ],
  };
}

async function savedSprint(page: Page): Promise<Record<string, SprintContent>> {
  const response = await page.request.get("/admin/config.yml?backend=test");
  const config = parse(await response.text());
  const collection = config.collections.find((entry: { name: string }) =>
    ["sprint_2026", "sprint_2026_test"].includes(entry.name),
  );
  expect(collection).toBeTruthy();
  const files = await page.evaluate(
    ({ folder, locales }) =>
      Object.fromEntries(
        locales.map((locale) => {
          const path = `${folder}/settings.${locale}.json`;
          let node: unknown = Reflect.get(window, "repoFiles");
          for (const segment of path.split("/")) {
            if (!node || typeof node !== "object")
              throw new Error(`Missing saved Sprint file ${path}`);
            node = Reflect.get(node, segment);
          }
          if (
            !node ||
            typeof node !== "object" ||
            typeof Reflect.get(node, "content") !== "string"
          )
            throw new Error(`Missing saved Sprint JSON ${path}`);
          return [locale, JSON.parse(Reflect.get(node, "content"))];
        }),
      ),
    { folder: collection.folder, locales: [...sprintLocales] },
  );
  const contents = Object.fromEntries(
    sprintLocales.map((locale) => [
      locale,
      parseSprintContent(files[locale], locale),
    ]),
  );
  validateSprintTranslations(contents);
  return contents;
}

test("Sprint preview renders unsaved structured content through the public component in every language", async ({
  request,
}) => {
  for (const locale of sprintLocales) {
    const data = fixture(locale);
    data.status = "published";
    data.intro = `Unsaved introduction ${locale}`;
    data.startTime = "";
    data.endTime = "17:00";
    data.projects[0].status = "published";
    // A cleared title must preview without passing publication completeness.
    data.projects[0].title = "";
    const response = await request.post("/admin/preview/2026/sprint/", {
      data: { data, locale },
    });
    expect(response.status(), await response.text()).toBe(200);
    expect(response.headers()).toMatchObject({
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    });
    const html = await response.text();
    expect(html).toContain("data-sprint-content");
    expect(html).toContain('data-sprint-project="e2e-project"');
    expect(html).toContain('data-sprint-level="all-levels"');
    expect(html).toContain('href="https://discord.gg/e2e-project"');
    expect(html).toContain(projectGoals[locale]);
    const linksPosition = html.indexOf("data-sprint-project-links");
    const goalsPosition = html.indexOf("data-sprint-project-goals");
    expect(linksPosition).toBeGreaterThan(-1);
    expect(goalsPosition).toBeGreaterThan(linksPosition);
    expect(html).toContain(`Unsaved introduction ${locale}`);
    expect(html).toContain(`Saved question ${locale}`);
    expect(html).toContain(`Saved answer ${locale}`);
    expect(html).toContain("17:00");
    expect(html).toContain('data-site-year="2026"');
  }
  const unsafe = await request.post("/admin/preview/2026/sprint/", {
    data: {
      data: { ...fixture("en"), registrationUrl: "javascript:alert(1)" },
      locale: "en",
    },
  });
  expect(unsafe.status()).toBe(400);
  const unknownLocale = await request.post("/admin/preview/2026/sprint/", {
    data: { data: fixture("en"), locale: "fr" },
  });
  expect(unknownLocale.status()).toBe(400);
  const get = await request.get("/admin/preview/2026/sprint/");
  expect(get.status()).toBe(405);
  expect(get.headers().allow).toBe("POST");
});

test("Sprint singleton edits, previews, saves and reopens six JSON translations without changing News", async ({
  page,
}) => {
  test.setTimeout(90_000);
  test.skip(
    Boolean(process.env.CMS_BASE_URL),
    "Editing stays inside the disposable local browser test backend",
  );
  page.setDefaultTimeout(10_000);
  const configResponse = await page.request.get(
    "/admin/config.yml?backend=test",
  );
  const config = parse(await configResponse.text());
  const collection = config.collections.find((entry: { name: string }) =>
    ["sprint_2026", "sprint_2026_test"].includes(entry.name),
  );
  const files = Object.fromEntries(
    sprintLocales.map((locale) => [
      `${collection.folder}/settings.${locale}.json`,
      JSON.stringify(fixture(locale)),
    ]),
  );
  await page.addInitScript((files) => {
    const tree: Record<string, unknown> = {};
    for (const [path, content] of Object.entries(files)) {
      const segments = path.split("/");
      let node = tree;
      for (const segment of segments.slice(0, -1)) {
        node[segment] ??= {};
        node = node[segment] as Record<string, unknown>;
      }
      node[segments[segments.length - 1]] = { path, content };
      // Decap's browser test backend lists by the complete folder key but reads
      // and writes by nested path. Both keys must point to the same directory.
      tree[segments.slice(0, -1).join("/")] = node;
    }
    Reflect.set(window, "repoFiles", tree);
  }, files);
  await page.setViewportSize({ width: 1600, height: 1000 });
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  await page.goto("/admin/test/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "2026 News", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "2026 Sprint", exact: true }).click();
  await expect(page.getByText("＋ 2026 Sprint", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole("link", { name: "Sprint settings", exact: true })
    .click();
  await expect(
    page.getByText("No unsaved changes", { exact: true }),
  ).toBeVisible();
  const intro = page
    .getByRole("textbox", { name: "Introduction (optional)", exact: true })
    .first();
  await intro.fill("Unsaved Sprint introduction");
  const sprintDate = page.locator('input[id^="date-field"]').first();
  const startTime = page
    .getByRole("textbox", {
      name: "Start time (Hong Kong) (optional)",
      exact: true,
    })
    .first();
  await sprintDate.fill("2026-11-16");
  await startTime.fill("10:30");
  await page
    .getByText("Draft project en · draft", { exact: true })
    .locator("..")
    .getByRole("button")
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Project title (optional)", exact: true })
    .first()
    .fill("Unsaved project title");
  const level = page
    .getByRole("combobox", {
      name: "Participant level (optional)",
      exact: true,
    })
    .first();
  await level.focus();
  await level.press("Delete");
  await page
    .getByText("Saved question en", { exact: true })
    .locator("..")
    .getByRole("button")
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Question (optional)", exact: true })
    .first()
    .fill("Unsaved preparation question");
  const beforePreview = await page.evaluate(() =>
    JSON.stringify(Reflect.get(window, "repoFiles")),
  );
  await page.getByTitle("Toggle i18n", { exact: true }).click();
  const pane = page.frameLocator("iframe#preview-pane");
  const sprint = pane.frameLocator('iframe[title="Sprint preview"]');
  await expect(sprint.locator("[data-sprint-content]")).toContainText(
    "Unsaved Sprint introduction",
  );
  await expect(sprint.locator('time[datetime="2026-11-16"]')).toBeVisible();
  await expect(sprint.locator("[data-sprint-content]")).toContainText("10:30");
  await expect(sprint.locator("[data-sprint-project] h3")).toHaveText(
    "Unsaved project title",
  );
  await expect(sprint.locator("[data-sprint-level]")).toHaveCount(0);
  await page
    .getByText("Unsaved project title · draft", { exact: true })
    .locator("..")
    .getByRole("button")
    .first()
    .click();
  await level.click();
  await page.getByText("All levels", { exact: true }).click();
  await expect(
    sprint.locator('[data-sprint-level="all-levels"]'),
  ).toBeVisible();
  await expect(sprint.locator("[data-sprint-project-goals]")).toBeVisible();
  await expect(sprint.locator("[data-sprint-project-goals]")).toContainText(
    projectGoals.en,
  );
  await expect(sprint.locator("[data-sprint-question] h2")).toHaveText(
    "Unsaved preparation question",
  );
  await pane
    .getByRole("combobox", { name: "Preview appearance", exact: true })
    .selectOption("dark");
  await expect(sprint.locator("html")).toHaveAttribute(
    "data-conference-theme",
    "dark",
  );
  await page
    .locator("iframe#preview-pane")
    .screenshot({ path: "/tmp/pyconhk-cms-sprint-preview.png" });
  await intro.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "/tmp/pyconhk-cms-sprint-editor.png",
    fullPage: false,
  });
  await page
    .getByRole("button", { name: "Writing in EN", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "zh-hk", exact: true }).click();
  await expect(sprint.locator("[data-sprint-content]")).toContainText(
    "Saved introduction zh-hk",
  );
  await expect(sprint.locator("[data-sprint-project-goals]")).toContainText(
    projectGoals["zh-hk"],
  );
  await expect(sprint.locator('time[datetime="2026-11-16"]')).toBeVisible();
  await expect(sprint.locator("[data-sprint-content]")).toContainText("10:30");
  await expect(sprint.locator("html")).toHaveAttribute("lang", "zh-Hant-HK");
  expect(
    await page.evaluate(() => JSON.stringify(Reflect.get(window, "repoFiles"))),
  ).toBe(beforePreview);
  await page
    .getByRole("button", { name: "Writing in ZH-HK", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "en", exact: true }).click();
  await page.getByTitle("Toggle i18n", { exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved to CMS", { exact: true }).last(),
  ).toBeVisible();
  const savedDraft = await savedSprint(page);
  expect(savedDraft.en).toMatchObject({
    status: "draft",
    intro: "Unsaved Sprint introduction",
  });
  expect(savedDraft.en.projects[0].title).toBe("Unsaved project title");
  expect(savedDraft.en.projects[0]).toMatchObject({
    level: "all-levels",
    discordUrl: "https://discord.gg/e2e-project",
  });
  expect(savedDraft.en.qa[0].question).toBe("Unsaved preparation question");
  for (const locale of sprintLocales) {
    expect(savedDraft[locale]).toMatchObject({
      status: "draft",
      date: "2026-11-16",
      startTime: "10:30",
    });
  }
  expect(errors.map((error) => error.message)).toEqual([]);

  await page
    .getByRole("combobox", { name: "Website visibility", exact: true })
    .first()
    .click();
  await page
    .getByText("Publish all six translations after checks", { exact: true })
    .click();
  await intro.fill("");
  // Decap reports a rejected preSave as an unhandled object as well as its
  // visible error message. Expect that one deliberate rejection explicitly.
  const validationRejection = page.waitForEvent("pageerror");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText(
      /Invalid en Sprint content \(intro\): required before publishing/,
    ),
  ).toBeVisible();
  const rejectedSave = await validationRejection;
  expect(rejectedSave.message).toBe("Object");
  expect(errors).toContain(rejectedSave);
  errors.splice(errors.indexOf(rejectedSave), 1);
  expect((await savedSprint(page)).en.status).toBe("draft");
  await intro.fill("Ready Sprint introduction");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved to CMS", { exact: true }).last(),
  ).toBeVisible();
  const published = await savedSprint(page);
  for (const locale of sprintLocales) {
    expect(published[locale]).toMatchObject({
      status: "published",
      date: "2026-11-16",
      startTime: "10:30",
    });
  }
  await page
    .getByRole("link", { name: /Writing in 2026 Sprint collection/ })
    .click();
  await page
    .getByRole("link", { name: "Sprint settings", exact: true })
    .click();
  await expect(intro).toHaveValue("Ready Sprint introduction");
  await expect(sprintDate).toHaveValue("2026-11-16");
  await expect(startTime).toHaveValue("10:30");
  expect(errors.map((error) => error.message)).toEqual([]);
});
