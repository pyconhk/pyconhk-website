export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const supportedCmsLocales = [
  "en",
  "zh-hk",
  "zh-hant",
  "zh-hans",
  "ja",
] as const;

const defaultCmsLocales = supportedCmsLocales.join(",");
const cmsContentPrefixes = ["website/outstatic/content"];
const cmsMediaPrefixes = [
  "website/public/outstatic/images",
  "website/outstatic/media",
];

export function getRequiredEnv(
  name: string,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getCmsSiteUrl(requestUrl: URL): string {
  const configuredUrl = import.meta.env.CMS_PUBLIC_URL;

  if (configuredUrl) {
    const configured = new URL(configuredUrl);

    if (
      [configured.hostname, requestUrl.hostname].every((hostname) =>
        ["127.0.0.1", "localhost"].includes(hostname),
      )
    ) {
      return trimTrailingSlash(requestUrl.origin);
    }

    return trimTrailingSlash(configuredUrl);
  }

  return trimTrailingSlash(requestUrl.origin);
}

export function getCmsRepo(): string {
  return getRequiredEnv("CMS_GITHUB_REPO", import.meta.env.CMS_GITHUB_REPO);
}

export function getCmsBranch(): string {
  return import.meta.env.CMS_GITHUB_BRANCH || "cms";
}

export function getGithubScope(): string {
  return import.meta.env.CMS_GITHUB_OAUTH_SCOPE || "repo";
}

export function getCmsAccessRepo(): string {
  return import.meta.env.CMS_ACCESS_REPO || getCmsRepo();
}

export function normalizeCmsOwnedPath(
  name: string,
  value: string,
  allowedPrefixes: string[],
): string {
  const normalized = trimTrailingSlash(value.trim());
  const isAllowed = allowedPrefixes.some((prefix) => {
    const normalizedPrefix = trimTrailingSlash(prefix);
    return (
      normalized === normalizedPrefix ||
      normalized.startsWith(`${normalizedPrefix}/`)
    );
  });

  if (
    !normalized ||
    normalized.startsWith("/") ||
    normalized.split("/").includes("..") ||
    !isAllowed
  ) {
    throw new Error(
      `${name} must stay inside CMS-owned paths: ${allowedPrefixes.join(", ")}`,
    );
  }

  return normalized;
}

export function normalizeCmsPublicFolder(value: string): string {
  const normalized = trimTrailingSlash(value.trim());

  if (normalized !== "/outstatic/images") {
    throw new Error("CMS_PUBLIC_FOLDER must be /outstatic/images");
  }

  return normalized;
}

export function normalizeCmsLocales(value: string): string[] {
  const supported = new Set<string>(supportedCmsLocales);
  const locales = value
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);

  for (const locale of locales) {
    if (!supported.has(locale)) {
      throw new Error(`Unsupported CMS locale "${locale}"`);
    }
  }

  if (locales.length === 0) {
    throw new Error("CMS_LOCALES must include at least one supported locale");
  }

  return [...new Set(locales)];
}

export function normalizeCmsDefaultLocale(
  value: string | undefined,
  locales: string[],
): string {
  if (value) {
    if (!locales.includes(value)) {
      throw new Error(
        "CMS_DEFAULT_LOCALE must be one of the configured CMS locales",
      );
    }

    return value;
  }

  if (locales.includes("en")) {
    return "en";
  }

  return locales[0] || "en";
}

export function getCmsContentRoot(): string {
  return normalizeCmsOwnedPath(
    "CMS_CONTENT_ROOT",
    import.meta.env.CMS_CONTENT_ROOT || "website/outstatic/content",
    cmsContentPrefixes,
  );
}

export function getCmsMediaFolder(): string {
  return normalizeCmsOwnedPath(
    "CMS_MEDIA_FOLDER",
    import.meta.env.CMS_MEDIA_FOLDER || "website/public/outstatic/images",
    cmsMediaPrefixes,
  );
}

export function getCmsPublicFolder(): string {
  return normalizeCmsPublicFolder(
    import.meta.env.CMS_PUBLIC_FOLDER || "/outstatic/images",
  );
}

export function getCmsLocales(): string[] {
  return normalizeCmsLocales(import.meta.env.CMS_LOCALES || defaultCmsLocales);
}

export function getCmsDefaultLocale(locales = getCmsLocales()): string {
  return normalizeCmsDefaultLocale(import.meta.env.CMS_DEFAULT_LOCALE, locales);
}
