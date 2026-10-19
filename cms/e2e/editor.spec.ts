import { expect, type Page, test } from "@playwright/test";
import { parse } from "yaml";
import {
  cmsLocales,
  collectCmsLocaleProblems,
} from "../publication/content.ts";

async function savedTranslations(page: Page): Promise<Record<string, string>> {
  const configResponse = await page.request.get(
    "/admin/config.yml?backend=test",
  );
  expect(configResponse.ok()).toBe(true);
  const config = parse(await configResponse.text()) as {
    collections: { name: string; folder: string }[];
  };
  const collection = config.collections.find(({ name }) =>
    ["posts", "posts_test"].includes(name),
  );
  if (!collection) throw new Error("The local CMS must configure 2026 News");
  return page.evaluate(
    ({ folder, locales }) =>
      Object.fromEntries(
        locales.map((locale) => {
          const file = `${folder}/e2e-volunteer-announcement.${locale}.mdx`;
          let stored: unknown = Reflect.get(window, "repoFiles");
          for (const segment of file.split("/")) {
            if (!stored || typeof stored !== "object") {
              throw new Error(`The test backend did not save ${file}`);
            }
            stored = Reflect.get(stored, segment);
          }
          const raw =
            stored && typeof stored === "object"
              ? Reflect.get(stored, "content")
              : undefined;
          if (typeof raw !== "string") {
            throw new Error(`The test backend did not save MDX for ${file}`);
          }
          return [locale, raw];
        }),
      ),
    { folder: collection.folder, locales: cmsLocales },
  );
}

// The bundled Decap test backend stores this scenario in the browser only.
// Hosted runs exercise read-only Worker endpoints; editing stays local.
test("CMS saves drafts and publishes English before other translations independently", async ({
  page,
}) => {
  // Exercise multiple saves plus copy/reopen checks across six locale panels.
  test.setTimeout(60_000);
  test.skip(
    Boolean(process.env.CMS_BASE_URL),
    "Editing fixtures only run against the local CMS test backend",
  );
  await page.goto("/admin/test/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByText("＋ 2026 News", { exact: true }).click();
  await expect(
    page.getByText("No unsaved changes", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved to CMS", exact: true }),
  ).toHaveCount(0);
  await page
    .locator('input[id^="title-field"]')
    .first()
    .fill("E2E volunteer announcement");
  await page
    .locator('input[id^="slug-field"]')
    .first()
    .fill("e2e-volunteer-announcement");
  await page
    .getByRole("button", { name: "Choose an image", exact: true })
    .first()
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByText("e2e-avatar.png", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Choose selected", exact: true })
    .click();
  await expect(
    page
      .getByRole("button", { name: "Choose different image", exact: true })
      .first(),
  ).toBeVisible();
  await expect(page.getByRole("status").first()).toContainText(
    "Draft — save unfinished content",
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Save and create new", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Save and duplicate", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved to CMS", { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved to CMS", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Published", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Status:/ })).toHaveCount(0);
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );

  const visibility = page.getByRole("combobox", {
    name: "Website visibility",
    exact: true,
  });
  await visibility.first().selectOption("published");
  await expect(visibility.nth(1)).toHaveValue("draft");
  await expect(page.getByRole("status").first()).toContainText(
    "website updates only after checks and deployment succeed",
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText(/each published translation before publishing: en/),
  ).toBeVisible();
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );
  const blocked = await savedTranslations(page);
  expect(
    parse(/^---\r?\n([\s\S]*?)\r?\n---/u.exec(blocked.en)?.[1] || "").status,
  ).toBe("draft");

  await page
    .getByRole("textbox", { name: "Description (optional)", exact: true })
    .first()
    .fill("An E2E announcement for the local test backend.");
  await page.getByRole("button", { name: "Set publishedAt to now" }).click();
  await page
    .getByRole("button", { name: "Add tags", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Tag", exact: true })
    .first()
    .fill("announcement");
  await page
    .locator('[contenteditable="true"][role="textbox"]')
    .first()
    .fill("This is the English announcement body.");

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved to CMS", { exact: true }).last(),
  ).toBeVisible();
  const englishFirst = await savedTranslations(page);
  for (const locale of cmsLocales) {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(
      englishFirst[locale],
    );
    if (!frontmatter) throw new Error(`${locale} must contain frontmatter`);
    expect(parse(frontmatter[1]).status).toBe(
      locale === "en" ? "published" : "draft",
    );
  }

  const copyWarnings: string[] = [];
  page.on("dialog", (dialog) => {
    copyWarnings.push(dialog.message());
    return dialog.accept();
  });
  let selected = "ZH-HK";
  const locales = ["zh-hk", "zh-hant", "zh-hans", "ja", "ko"];
  for (const locale of locales) {
    if (selected !== locale.toUpperCase()) {
      await page
        .getByRole("button", { name: `Writing in ${selected}`, exact: true })
        .click();
      await page.getByRole("menuitem", { name: locale, exact: true }).click();
      selected = locale.toUpperCase();
    }
    await page
      .getByRole("button", { name: "Fill in from another locale", exact: true })
      .nth(1)
      .click();
    await page.getByRole("menuitem", { name: "en", exact: true }).click();
    await expect(visibility.nth(1)).toHaveValue("published");
    await visibility
      .nth(1)
      .selectOption(locale === "zh-hk" ? "published" : "draft");
    await page
      .locator('input[id^="title-field"]')
      .nth(1)
      .fill(`Announcement ${locale}`);
    await page
      .locator('[contenteditable="true"][role="textbox"]')
      .nth(1)
      .fill(`Announcement body ${locale}.`);
  }
  expect(copyWarnings).toHaveLength(locales.length);
  for (const warning of copyWarnings) {
    expect(warning).toContain("including Website visibility");
  }
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Save changes", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved to CMS", { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByText("No unsaved changes", { exact: true }),
  ).toBeVisible();

  const configResponse = await page.request.get(
    "/admin/config.yml?backend=test",
  );
  expect(configResponse.ok()).toBe(true);
  const config = parse(await configResponse.text()) as {
    collections: { name: string; folder: string }[];
  };
  const collection = config.collections.find(({ name }) =>
    ["posts", "posts_test"].includes(name),
  );
  if (!collection) throw new Error("The local CMS must configure 2026 News");
  const savedLocales = await savedTranslations(page);
  const savedFiles = Object.fromEntries(
    cmsLocales.map((locale) => [
      `${collection.folder}/e2e-volunteer-announcement.${locale}.mdx`,
      savedLocales[locale],
    ]),
  );
  expect(
    collectCmsLocaleProblems(
      Object.keys(savedFiles),
      (file) => savedFiles[file],
    ),
  ).toEqual([]);

  const publishedData = cmsLocales.map((locale) => {
    const file = `${collection.folder}/e2e-volunteer-announcement.${locale}.mdx`;
    const frontmatter =
      /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u.exec(
        savedFiles[file],
      );
    if (!frontmatter) throw new Error(`${file} must contain YAML frontmatter`);
    const data = parse(frontmatter[1]);
    expect(data).toMatchObject({
      title:
        locale === "en"
          ? "E2E volunteer announcement"
          : `Announcement ${locale}`,
      slug: "e2e-volunteer-announcement",
      status: ["en", "zh-hk"].includes(locale) ? "published" : "draft",
      description: "An E2E announcement for the local test backend.",
      tags: ["announcement"],
      author: { name: "PyCon HK" },
    });
    expect(data.author).not.toHaveProperty("picture");
    expect(frontmatter[2].trim()).toBe(
      locale === "en"
        ? "This is the English announcement body."
        : `Announcement body ${locale}.`,
    );
    return data;
  });
  expect(publishedData[0].publishedAt).toEqual(expect.any(String));
  expect(Number.isNaN(Date.parse(publishedData[0].publishedAt))).toBe(false);
  expect(publishedData[0].coverImage).toMatch(/^\/outstatic\/images\/.+/u);
  for (const data of publishedData) {
    for (const field of ["slug", "publishedAt", "coverImage"]) {
      expect(data[field]).toBe(publishedData[0][field]);
    }
  }

  await page
    .getByRole("link", { name: /Writing in 2026 News collection/ })
    .click();
  await page
    .getByRole("link", { name: "E2E volunteer announcement", exact: true })
    .click();
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );
  selected = "ZH-HK";
  for (const locale of locales) {
    if (selected !== locale.toUpperCase()) {
      await page
        .getByRole("button", { name: `Writing in ${selected}`, exact: true })
        .click();
      await page.getByRole("menuitem", { name: locale, exact: true }).click();
      selected = locale.toUpperCase();
    }
    await expect(page.locator('input[id^="title-field"]').nth(1)).toHaveValue(
      `Announcement ${locale}`,
    );
    await expect(visibility.nth(1)).toHaveValue(
      locale === "zh-hk" ? "published" : "draft",
    );
    await expect(
      page.locator('[contenteditable="true"][role="textbox"]').nth(1),
    ).toContainText(`Announcement body ${locale}.`);
  }
});
