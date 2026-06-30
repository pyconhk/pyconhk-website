import type { APIRoute } from "astro";

import {
  getCmsAccessRepo,
  getCmsSiteUrl,
  getRequiredEnv,
} from "../../../lib/env";
import {
  clearOauthCookie,
  getCallbackPath,
  oauthCookieNames,
  parseCookies,
  renderErrorHtml,
  renderSuccessHtml,
} from "../../../lib/oauth";

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
            import.meta.env.CMS_GITHUB_CLIENT_ID,
          ),
          client_secret: getRequiredEnv(
            "CMS_GITHUB_CLIENT_SECRET",
            import.meta.env.CMS_GITHUB_CLIENT_SECRET,
          ),
          code,
          redirect_uri: `${getCmsSiteUrl(url)}${getCallbackPath()}`,
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
    const userResponse = await fetch("https://api.github.com/user", {
      headers: githubHeaders,
    });

    if (!userResponse.ok) {
      throw new Error("GitHub user validation failed.");
    }

    const accessRepoResponse = await fetch(
      `https://api.github.com/repos/${getCmsAccessRepo()}`,
      {
        headers: githubHeaders,
      },
    );

    if (!accessRepoResponse.ok) {
      throw new Error(
        `GitHub user does not have access to ${getCmsAccessRepo()}.`,
      );
    }

    return new Response(renderSuccessHtml(tokenBody.access_token), { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "GitHub authorization failed.";
    return new Response(renderErrorHtml(message), {
      status: 400,
      headers,
    });
  }
};
