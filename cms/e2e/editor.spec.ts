import { expect, test } from "@playwright/test";

// The bundled Decap test backend stores this scenario in the browser only.
// Hosted runs exercise read-only Worker endpoints; editing stays local.
test("an editor can upload a portrait, save a partial draft and change its workflow status", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.CMS_BASE_URL),
    "Editing fixtures only run against the local CMS test backend",
  );
  await page.goto("/admin/test/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByText("＋ 2026 Posts", { exact: true }).click();
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
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Entry saved", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Status: Draft", exact: true }),
  ).toBeVisible();
  await expect(page.locator('input[id^="title-field"]').first()).toHaveValue(
    "E2E volunteer announcement",
  );
  await page
    .getByRole("button", { name: "Status: Draft", exact: true })
    .click();
  await page.getByText("In review", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Status: In review", exact: true }),
  ).toBeVisible();
});
