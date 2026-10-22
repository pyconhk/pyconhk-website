import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

const evidenceDirectory = "/tmp/pyconhk-cms-preview";

// All writes stay inside Decap's disposable, browser-only test repository.
test.describe("live article preview", () => {
  test.skip(
    Boolean(process.env.CMS_BASE_URL),
    "Preview editing fixtures only run against the local CMS test backend",
  );

  for (const year of [2025, 2026]) {
    test(`${year} previews unsaved content, uploaded images and locale changes`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60_000);
      const coverFilename = `preview-cover-${year}.${year === 2025 ? "webp" : "png"}`;
      const coverFixture = new URL(
        year === 2025
          ? "../../website/public/2025/landing-pages/open-graph.webp"
          : "../../website/public/2026/share/en.png",
        import.meta.url,
      );
      await page.setViewportSize({ width: 1600, height: 1000 });
      const errors: string[] = [];
      const consoleMessages: { type: string; text: string; url?: string }[] =
        [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type())) {
          consoleMessages.push({
            type: message.type(),
            text: message.text(),
            url: message.location().url,
          });
        }
      });
      page.on("response", (response) => {
        if (response.status() >= 400) {
          consoleMessages.push({
            type: "response",
            text: String(response.status()),
            url: response.url(),
          });
        }
      });
      // Follow the CMS fallback redirect without requiring an external site in CI.
      await page.route(
        `https://pycon.hk${coverFixture.pathname.split("/public")[1]}`,
        (route) =>
          route.fulfill({
            body: readFileSync(coverFixture),
            contentType: year === 2025 ? "image/webp" : "image/png",
          }),
      );
      // The browser-only backend cannot serve its upload from the Worker URL.
      // The article itself must still resolve this upload to Decap's blob URL.
      await page.route(`**/outstatic/images/${coverFilename}`, (route) =>
        route.fulfill({
          body: readFileSync(coverFixture),
          contentType: year === 2025 ? "image/webp" : "image/png",
        }),
      );
      await page.goto("/admin/test/");
      await expect(page).toHaveTitle("PyCon HK CMS Test");
      await page.getByRole("button", { name: "Login", exact: true }).click();
      if (year === 2025) {
        await page
          .getByRole("link", { name: "2025 News", exact: true })
          .click();
      }
      await page.getByText(`＋ ${year} News`, { exact: true }).click();
      await page
        .locator('input[id^="title-field"]')
        .first()
        .fill(`Unsaved ${year} article`);
      await page
        .locator('input[id^="slug-field"]')
        .first()
        .fill(`unsaved-preview-${year}`);
      await page
        .getByRole("button", { name: "Set publishedAt to now" })
        .first()
        .click();
      await page
        .locator('[contenteditable="true"][role="textbox"]')
        .first()
        .fill("This body is visible before saving.");
      await page
        .locator('input[id^="title-field"]')
        .nth(1)
        .fill(`未儲存 ${year} 文章`);
      await page
        .locator('[contenteditable="true"][role="textbox"]')
        .nth(1)
        .fill("呢段廣東話正文未儲存。\n\n第二段文字。");

      if (year === 2026) {
        await page
          .getByRole("button", { name: "Add tags", exact: true })
          .first()
          .click();
        await page
          .getByRole("textbox", { name: "Tag", exact: true })
          .first()
          .fill("preview-tag");
      }

      await page.getByTitle("Toggle i18n", { exact: true }).click();
      const pane = page.frameLocator("iframe#preview-pane");
      const article = pane.frameLocator('iframe[title="Article preview"]');
      await expect(article.locator("h1")).toHaveText(`Unsaved ${year} article`);
      await expect
        .poll(() =>
          article
            .locator("img")
            .first()
            .evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
      await page.getByTitle("Toggle i18n", { exact: true }).click();

      await page
        .getByRole("button", { name: "Choose an image", exact: true })
        .first()
        .click();
      await page.locator('input[type="file"]').setInputFiles({
        name: coverFilename,
        mimeType: year === 2025 ? "image/webp" : "image/png",
        buffer: readFileSync(coverFixture),
      });
      await expect(
        page.getByText(coverFilename, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Choose selected", exact: true })
        .click();
      await page.getByRole("switch").first().click();
      await page
        .locator('[contenteditable="true"]')
        .first()
        .fill(
          `This body is visible before saving.\n\n**Unsaved bold**\n\n![Inline preview](/outstatic/images/${coverFilename})`,
        );

      const storedBeforePreview = await page.evaluate(() =>
        JSON.stringify(Reflect.get(window, "repoFiles")),
      );
      await page.getByTitle("Toggle i18n", { exact: true }).click();
      await expect(article.locator("h1")).toHaveText(`Unsaved ${year} article`);
      await expect(article.locator(".prose")).toContainText(
        "This body is visible before saving.",
      );
      await expect(article.locator(".prose strong")).toHaveText("Unsaved bold");
      await expect(article.locator("html")).toHaveAttribute(
        "data-site-year",
        String(year),
      );
      await expect
        .poll(() =>
          article
            .locator("h1")
            .evaluate((heading) => getComputedStyle(heading).fontFamily),
        )
        .toContain(year === 2025 ? "Montserrat" : "Roboto");
      const cover = article.locator("img").first();
      await expect(cover).toHaveAttribute("src", /^blob:/);
      await expect
        .poll(() =>
          cover.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
      const coverUrl = await cover.getAttribute("src");
      const inlineImage = article.locator('.prose img[alt="Inline preview"]');
      await expect(inlineImage).toHaveAttribute("src", coverUrl || "");
      await expect
        .poll(() =>
          inlineImage.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
      const publishedAt = await article
        .locator("time")
        .getAttribute("datetime");
      expect(publishedAt).toBeTruthy();

      if (year === 2026) {
        await expect(article.locator("article")).toHaveCSS(
          "border-top-width",
          "3px",
        );
        await expect(article.locator("header")).toContainText("PyCon HK");
        await expect(article.locator("header")).toContainText("preview-tag");
        const appearance = pane.getByRole("combobox", {
          name: "Preview appearance",
          exact: true,
        });
        await appearance.selectOption("dark");
        await expect(article.locator("html")).toHaveAttribute(
          "data-conference-theme",
          "dark",
        );
        await mkdir(evidenceDirectory, { recursive: true });
        await page.locator("iframe#preview-pane").screenshot({
          path: `${evidenceDirectory}/2026-dark.png`,
        });
        await appearance.selectOption("light");
        await expect(article.locator("html")).toHaveAttribute(
          "data-conference-theme",
          "light",
        );
        await appearance.selectOption("system");
        await page.emulateMedia({ colorScheme: "dark" });
        await expect(article.locator("html")).toHaveAttribute(
          "data-conference-theme",
          "dark",
        );
        await page.emulateMedia({ colorScheme: "light" });
        await expect(article.locator("html")).toHaveAttribute(
          "data-conference-theme",
          "light",
        );
      } else {
        await expect(article.locator("article")).toHaveCSS(
          "background-color",
          "rgb(255, 255, 255)",
        );
        await expect(
          pane.getByRole("combobox", {
            name: "Preview appearance",
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(article.locator("article")).not.toContainText("PyCon HK");
      }

      await page
        .locator('input[id^="title-field"]')
        .first()
        .fill(`Updated ${year} without Save`);
      await expect(article.locator("h1")).toHaveText(
        `Updated ${year} without Save`,
      );
      await page
        .getByRole("button", { name: "Writing in EN", exact: true })
        .click();
      await page.getByRole("menuitem", { name: "zh-hk", exact: true }).click();
      await expect(article.locator("h1")).toHaveText(`未儲存 ${year} 文章`);
      await expect(article.locator(".prose")).toContainText(
        "呢段廣東話正文未儲存。",
      );
      await expect(article.locator("html")).toHaveAttribute(
        "lang",
        "zh-Hant-HK",
      );
      await expect(cover).toHaveAttribute("src", coverUrl || "");
      await expect(article.locator("time")).toHaveAttribute(
        "datetime",
        publishedAt || "",
      );
      await expect(page.locator('input[id^="slug-field"]').first()).toHaveValue(
        `unsaved-preview-${year}`,
      );
      expect(
        await page.evaluate(() =>
          JSON.stringify(Reflect.get(window, "repoFiles")),
        ),
      ).toBe(storedBeforePreview);
      await expect(
        page.getByText("Entry saved to CMS", { exact: true }),
      ).toHaveCount(0);
      expect(errors).toEqual([]);
      await mkdir(evidenceDirectory, { recursive: true });
      await page.locator("iframe#preview-pane").screenshot({
        path: `${evidenceDirectory}/${year}-zh-hk.png`,
      });
      const articleFrame = pane.locator('iframe[title="Article preview"]');
      await articleFrame.evaluate((frame: HTMLIFrameElement) => {
        frame.style.width = "390px";
        frame.contentWindow?.scrollTo(0, 0);
      });
      await expect
        .poll(() =>
          article.locator("html").evaluate((root) => root.scrollWidth),
        )
        .toBeLessThanOrEqual(390);
      await articleFrame.screenshot({
        path: `${evidenceDirectory}/${year}-mobile.png`,
      });
      await testInfo.attach("browser-console", {
        body: JSON.stringify(consoleMessages, null, 2),
        contentType: "application/json",
      });
    });
  }

  test("renderer shares Markdown sanitation and each year's actual metadata", async ({
    request,
  }) => {
    const configResponse = await request.get("/admin/config.yml");
    const config = parse(await configResponse.text());
    for (const collection of config.collections) {
      expect(collection.editor.preview).toBe(true);
    }
    const background = await request.get("/2025/inner-pages/background.svg", {
      maxRedirects: 0,
    });
    expect(background.status()).toBe(302);
    expect(background.headers().location).toBe(
      "https://pycon.hk/2025/inner-pages/background.svg",
    );
    const data = {
      title: "<script>metadata is text</script>",
      slug: "preview-only",
      body: "## A heading\n\nA **strong** paragraph.\n\n```python\nprint('hello')\n```\n\n<script>window.previewExecuted = true</script>\n\n[unsafe](javascript:alert(1))",
      publishedAt: "2026-10-21T20:15:00.000Z",
      coverImage: "/outstatic/images/example.png",
      author: { name: "Preview author" },
      tags: ["preview-tag"],
    };
    for (const year of [2025, 2026]) {
      const response = await request.post(`/admin/preview/${year}/`, {
        data: { data, locale: "en" },
      });
      expect(response.status()).toBe(200);
      expect(response.headers()["cache-control"]).toBe("no-store");
      const html = await response.text();
      expect(html).toContain(`<h2>A heading</h2>`);
      expect(html).toContain("<strong>strong</strong>");
      expect(html).toContain('<code class="language-python">');
      expect(html).not.toContain("window.previewExecuted");
      expect(html).not.toContain("javascript:alert");
      expect(html).toContain("&lt;script&gt;metadata is text&lt;/script&gt;");
      expect(html).toContain(`data-site-year="${year}"`);
      if (year === 2026) {
        expect(html).toContain("Preview author");
        expect(html).toContain("preview-tag");
        expect(html).toContain("October 22, 2026");
      } else {
        expect(html).not.toContain("Preview author");
        expect(html).not.toContain("preview-tag");
        expect(html).toContain("October 21, 2026");
      }
    }
    for (const collection of config.collections) {
      const year = /\/(\d+)-posts$/u.exec(collection.folder)?.[1];
      expect(year).toBeTruthy();
      const locales = collection.i18n.locales || config.i18n.locales;
      for (const locale of locales) {
        const draft = await request.post(`/admin/preview/${year}/`, {
          data: { data: { publishedAt: "unfinished" }, locale },
        });
        expect(draft.status(), `${year}/${locale} incomplete draft`).toBe(200);
      }
    }
    const unsupportedYear = await request.post("/admin/preview/1999/", {
      data: { data, locale: "en" },
    });
    expect(unsupportedYear.status()).toBe(404);
    const unsupportedLocale = await request.post("/admin/preview/2025/", {
      data: { data, locale: "ko" },
    });
    expect(unsupportedLocale.status()).toBe(400);
    const malformed = await request.post("/admin/preview/2026/", {
      data: "{",
      headers: { "Content-Type": "application/json" },
    });
    expect(malformed.status()).toBe(400);
  });
});
