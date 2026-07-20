import type { APIRoute } from "astro";

import {
  getCmsSiteUrl,
  getGithubScope,
  getRequiredEnv,
} from "../../../lib/env";
import {
  createOauthCookie,
  createOauthState,
  createPkceChallenge,
  createPkceVerifier,
  getCallbackPath,
  oauthCookieNames,
} from "../../../lib/oauth";
import { getRuntimeEnvironment } from "../../../lib/runtime-env";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const environment = getRuntimeEnvironment();
  const clientId = getRequiredEnv(
    "CMS_GITHUB_CLIENT_ID",
    environment.CMS_GITHUB_CLIENT_ID,
  );
  const state = createOauthState();
  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);
  const callbackUrl = `${getCmsSiteUrl(url, environment)}${getCallbackPath()}`;
  const isSecure = url.protocol === "https:";
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("scope", getGithubScope(environment));
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const headers = new Headers({
    Location: authorizeUrl.toString(),
    "Cache-Control": "no-store",
  });

  headers.append(
    "Set-Cookie",
    createOauthCookie(oauthCookieNames.state, state, isSecure),
  );
  headers.append(
    "Set-Cookie",
    createOauthCookie(oauthCookieNames.verifier, verifier, isSecure),
  );

  return new Response(null, {
    status: 302,
    headers,
  });
};
