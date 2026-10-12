import { expect, test } from "@playwright/test";
import { parse } from "yaml";
import {
  cmsLocales,
  collectCmsLocaleProblems,
} from "../publication/content.ts";

// The bundled Decap test backend stores this scenario in the browser only.
// Hosted runs exercise read-only Worker endpoints; editing stays local.
test("direct saves allow partial drafts, block incomplete publication and preserve all translations", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.CMS_BASE_URL),
    "Editing fixtures only run against the local CMS test backend",
  );
  await page.goto("/admin/test/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByText("＋ 2026 News", { exact: true }).click();
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
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Publish now", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved", { exact: true }).last(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Status:/ })).toHaveCount(0);
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );

  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .first()
    .fill("published");
  await page.getByRole("option", { name: "published", exact: true }).click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Publish now", exact: true })
    .click();
  await expect(
    page.getByText(/every translation before publishing:/),
  ).toBeVisible();
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );

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

  page.on("dialog", (dialog) => dialog.accept());
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
    await page
      .locator('input[id^="title-field"]')
      .nth(1)
      .fill(`Announcement ${locale}`);
    await page
      .locator('[contenteditable="true"][role="textbox"]')
      .nth(1)
      .fill(`Announcement body ${locale}.`);
  }
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Publish now", exact: true })
    .click();
  await expect(
    page.getByText("Entry saved", { exact: true }).last(),
  ).toBeVisible();
  await expect(page.getByText("Changes saved", { exact: true })).toBeVisible();

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
  const savedFiles = await page.evaluate(
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
          return [file, raw];
        }),
      ),
    { folder: collection.folder, locales: cmsLocales },
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
      status: "published",
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
    await expect(
      page.locator('[contenteditable="true"][role="textbox"]').nth(1),
    ).toContainText(`Announcement body ${locale}.`);
  }
});
