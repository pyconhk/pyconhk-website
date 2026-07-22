import type { APIRoute } from "astro";

import {
  getCmsAccessRepo,
  getCmsSiteUrl,
  getRequiredEnv,
} from "../../../lib/env";
import { requireGithubWriteAccess } from "../../../lib/github";
import {
  clearOauthCookie,
  getCallbackPath,
  oauthCookieNames,
  parseCookies,
  renderErrorHtml,
  renderSuccessHtml,
} from "../../../lib/oauth";
import { getRuntimeEnvironment } from "../../../lib/runtime-env";

export const prerender = false;

function createGithubHeaders(accessToken: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "pyconhk-website-cms",
  };
}

function buildHeaders(url: URL): Headers {
  const isSecure = url.protocol === "https:";
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });

  headers.append(
    "Set-Cookie",
    clearOauthCookie(oauthCookieNames.state, isSecure),
  );
  headers.append(
    "Set-Cookie",
    clearOauthCookie(oauthCookieNames.verifier, isSecure),
  );

  return headers;
}

export const GET: APIRoute = async ({ request, url }) => {
  const environment = getRuntimeEnvironment();
  const siteUrl = getCmsSiteUrl(url, environment);
  const headers = buildHeaders(url);

  try {
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    if (oauthError) {
      throw new Error(`GitHub returned: ${oauthError}`);
    }

    if (!code || !returnedState) {
      throw new Error("GitHub did not return a valid code and state.");
    }

    const cookies = parseCookies(request.headers.get("cookie"));
    const expectedState = cookies[oauthCookieNames.state];
    const codeVerifier = cookies[oauthCookieNames.verifier];

    if (!expectedState || expectedState !== returnedState) {
      throw new Error("OAuth state validation failed.");
    }

    if (!codeVerifier) {
      throw new Error("Missing PKCE verifier cookie.");
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "pyconhk-website-cms",
        },
        body: JSON.stringify({
          client_id: getRequiredEnv(
            "CMS_GITHUB_CLIENT_ID",
            environment.CMS_GITHUB_CLIENT_ID,
          ),
          client_secret: getRequiredEnv(
            "CMS_GITHUB_CLIENT_SECRET",
            environment.CMS_GITHUB_CLIENT_SECRET,
          ),
          code,
          redirect_uri: `${siteUrl}${getCallbackPath()}`,
          code_verifier: codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Token exchange failed with status ${tokenResponse.status}.`,
      );
    }

    const tokenBody = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenBody.access_token) {
      const reason =
        tokenBody.error_description || tokenBody.error || "Unknown error.";
      throw new Error(`GitHub did not return an access token. ${reason}`);
    }

    const githubHeaders = createGithubHeaders(tokenBody.access_token);
    const accessRepo = getCmsAccessRepo(environment);
    const accessRepoResponse = await fetch(
      `https://api.github.com/repos/${accessRepo}`,
      {
        headers: githubHeaders,
      },
    );

    if (!accessRepoResponse.ok) {
      throw new Error(`GitHub user does not have access to ${accessRepo}.`);
    }

    requireGithubWriteAccess(await accessRepoResponse.json(), accessRepo);

    return new Response(renderSuccessHtml(tokenBody.access_token, siteUrl), {
      headers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "GitHub authorization failed.";
    return new Response(renderErrorHtml(message, siteUrl), {
      status: 400,
      headers,
    });
  }
};
