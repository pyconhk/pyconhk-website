import { expect, test } from "@playwright/test";
import { validateEditorialPublish } from "../src/lib/editor-validation";

test("test CMS enforces complete translations before publishing News", () => {
  for (const collection of ["posts_test", "posts_2025_test"]) {
    expect(() =>
      validateEditorialPublish({
        collection,
        data: { status: "published" },
      }),
    ).toThrow(/every translation before publishing/);

    expect(() =>
      validateEditorialPublish({
        collection,
        data: { status: "draft" },
      }),
    ).not.toThrow();
  }
});
