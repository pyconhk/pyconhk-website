import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createOauthCookie,
  oauthCookieNames,
  renderSuccessHtml,
} from "./oauth";

describe("Decap OAuth bridge", () => {
  test("binds token delivery to the trusted CMS opener", () => {
    const html = renderSuccessHtml(
      "token-that-must-stay-private",
      "https://cms.pycon.hk",
    );

    assert.match(html, /event\.source !== window\.opener/u);
    assert.match(html, /event\.origin !== trustedOrigin/u);
    assert.match(
      html,
      /window\.opener\.postMessage\(eventName, trustedOrigin\)/u,
    );
    assert.doesNotMatch(html, /postMessage\([^\n]+, "\*"\)/u);
    assert.doesNotMatch(html, /postMessage\(eventName, event\.origin\)/u);
  });

  test("keeps state cookies short-lived, scoped, and secure in production", () => {
    assert.equal(
      createOauthCookie(oauthCookieNames.state, "state", true),
      "decap_oauth_state=state; Max-Age=600; Path=/api/decap/callback; HttpOnly; Secure; SameSite=Lax",
    );
  });
});
