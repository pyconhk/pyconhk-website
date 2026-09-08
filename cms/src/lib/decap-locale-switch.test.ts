import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

test("installed Decap switches either language pane without requiring an optional callback", () => {
  const require = createRequire(import.meta.url);
  const decapRequire = createRequire(require.resolve("decap-cms-app"));
  const core = path.dirname(
    decapRequire.resolve("decap-cms-core/package.json"),
  );
  const source = readFileSync(
    path.join(
      core,
      "dist/esm/components/Editor/EditorControlPane/EditorControlPane.js",
    ),
    "utf8",
  );
  // Exercise the installed handler independently of its DOM-dependent imports.
  const handler = source.match(
    /handleLocaleChange = (val => \{[\s\S]*?\n {2}\});/u,
  )?.[1];
  assert.ok(handler, "Review the locale patch when upgrading Decap");
  const makeHandler = runInNewContext(`(function () { return (${handler}); })`);
  let selectedLocale = "en";
  const reported: string[] = [];
  for (const props of [
    {},
    { onLocaleChange: (locale: string) => reported.push(locale) },
  ]) {
    const pane = {
      props,
      setState: (state: { selectedLocale: string }) => {
        selectedLocale = state.selectedLocale;
      },
    };
    const changeLocale = makeHandler.call(pane);
    assert.doesNotThrow(() => changeLocale("ko"));
    assert.equal(selectedLocale, "ko");
  }
  assert.deepEqual(reported, ["ko"]);
});
