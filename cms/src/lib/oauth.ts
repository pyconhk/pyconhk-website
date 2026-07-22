import { createHash, randomBytes } from "node:crypto";

const CALLBACK_PATH = "/api/decap/callback";
const COOKIE_PATH = CALLBACK_PATH;
const COOKIE_MAX_AGE = 60 * 10;

export const oauthCookieNames = {
  state: "decap_oauth_state",
  verifier: "decap_oauth_verifier",
};

type CookieOptions = {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
};

export function createOauthState(): string {
  return randomBytes(16).toString("base64url");
}

export function createPkceVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function createPkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function getCallbackPath(): string {
  return CALLBACK_PATH;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  parts.push(`Path=${options.path || "/"}`);

  if (options.httpOnly ?? true) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  parts.push(`SameSite=${options.sameSite || "Lax"}`);

  return parts.join("; ");
}

export function createOauthCookie(
  name: string,
  value: string,
  isSecure: boolean,
): string {
  return serializeCookie(name, value, {
    maxAge: COOKIE_MAX_AGE,
    path: COOKIE_PATH,
    secure: isSecure,
  });
}

export function clearOauthCookie(name: string, isSecure: boolean): string {
  return serializeCookie(name, "", {
    maxAge: 0,
    path: COOKIE_PATH,
    secure: isSecure,
  });
}

export function parseCookies(
  headerValue: string | null,
): Record<string, string> {
  if (!headerValue) {
    return {};
  }

  return headerValue
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, cookie) => {
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const name = cookie.slice(0, separatorIndex);
      const value = cookie.slice(separatorIndex + 1);
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializeInlineScriptValue(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function renderAuthBridgeHtml(options: {
  title: string;
  heading: string;
  message: string;
  eventName: string;
  trustedOrigin: string;
}): string {
  const eventName = serializeInlineScriptValue(options.eventName);
  const trustedOrigin = serializeInlineScriptValue(options.trustedOrigin);
  const heading = escapeHtml(options.heading);
  const message = escapeHtml(options.message);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.title}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #fef6e4, #dff3ea);
        color: #1f2933;
      }
      main {
        width: min(30rem, calc(100vw - 2rem));
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 24px 60px rgba(31, 41, 51, 0.12);
      }
      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.35rem;
      }
      p {
        margin: 0;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${heading}</h1>
      <p>${message}</p>
    </main>
    <script>
      const eventName = ${eventName};
      const trustedOrigin = ${trustedOrigin};

      const completeAuthorization = (event) => {
        if (
          !window.opener ||
          event.source !== window.opener ||
          event.origin !== trustedOrigin ||
          event.data !== "authorizing:github"
        ) {
          return;
        }

        window.opener.postMessage(eventName, trustedOrigin);
        window.removeEventListener("message", completeAuthorization, false);
        window.close();
      };

      window.addEventListener("message", completeAuthorization, false);

      if (window.opener) {
        window.opener.postMessage("authorizing:github", trustedOrigin);
        window.setTimeout(() => {
          window.close();
        }, 4000);
      }
    </script>
  </body>
</html>`;
}

export function renderSuccessHtml(
  token: string,
  trustedOrigin: string,
): string {
  return renderAuthBridgeHtml({
    title: "GitHub authorization complete",
    heading: "GitHub authorization complete",
    message: "You can close this window if it stays open.",
    eventName: `authorization:github:success:${JSON.stringify({
      token,
      provider: "github",
    })}`,
    trustedOrigin,
  });
}

export function renderErrorHtml(
  message: string,
  trustedOrigin: string,
): string {
  return renderAuthBridgeHtml({
    title: "GitHub authorization failed",
    heading: "GitHub authorization failed",
    message,
    eventName: `authorization:github:error:${JSON.stringify({
      message,
    })}`,
    trustedOrigin,
  });
}
