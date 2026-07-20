import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { requireGithubWriteAccess } from "./github";

describe("GitHub repository authorization", () => {
  test("requires explicit push permission", () => {
    assert.doesNotThrow(() =>
      requireGithubWriteAccess(
        { permissions: { pull: true, push: true } },
        "pyconhk/pyconhk-website",
      ),
    );

    for (const response of [
      {},
      { permissions: {} },
      { permissions: { pull: true, push: false } },
    ]) {
      assert.throws(
        () => requireGithubWriteAccess(response, "pyconhk/pyconhk-website"),
        /does not have write access/u,
      );
    }
  });
});
