export const cmsEnvironmentKeys = [
  "CMS_PUBLIC_URL",
  "CMS_GITHUB_CLIENT_ID",
  "CMS_GITHUB_CLIENT_SECRET",
  "CMS_GITHUB_REPO",
  "CMS_GITHUB_BRANCH",
  "CMS_GITHUB_OAUTH_SCOPE",
  "CMS_ACCESS_REPO",
  "CMS_CONTENT_ROOT",
  "CMS_MEDIA_FOLDER",
  "CMS_PUBLIC_FOLDER",
  "CMS_LOCALES",
  "CMS_DEFAULT_LOCALE",
] as const;

type CmsEnvironmentKey = (typeof cmsEnvironmentKeys)[number];

export type CmsEnvironment = Readonly<
  Partial<Record<CmsEnvironmentKey, string>>
>;

export const supportedCmsLocales = [
  "en",
  "zh-hk",
  "zh-hant",
  "zh-hans",
  "ja",
  "ko",
] as const;

const defaultCmsLocales = supportedCmsLocales.join(",");
const cmsContentPrefixes = ["website/outstatic/content"];
const cmsMediaPrefixes = [
  "website/public/outstatic/images",
  "website/outstatic/media",
];

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function readCmsEnvironment(source: object): CmsEnvironment {
  const environment: Partial<Record<CmsEnvironmentKey, string>> = {};

  for (const key of cmsEnvironmentKeys) {
    const value = Reflect.get(source, key);

    if (value === undefined) {
      continue;
    }

    if (typeof value !== "string") {
      throw new Error(`${key} must be a string`);
    }

    environment[key] = value;
  }

  return environment;
}

export function getRequiredEnv(
  name: string,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function normalizeCmsSiteUrl(value: string): string {
  const url = new URL(value);

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("CMS_PUBLIC_URL must be an origin without a path");
  }

  return url.origin;
}

export function getCmsSiteUrl(
  requestUrl: URL,
  environment: CmsEnvironment,
): string {
  return environment.CMS_PUBLIC_URL
    ? normalizeCmsSiteUrl(environment.CMS_PUBLIC_URL)
    : requestUrl.origin;
}

export function normalizeGithubRepo(name: string, value: string): string {
  const normalized = value.trim();

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(normalized)) {
    throw new Error(`${name} must use the owner/repository form`);
  }

  return normalized;
}

export function getCmsRepo(environment: CmsEnvironment): string {
  return normalizeGithubRepo(
    "CMS_GITHUB_REPO",
    getRequiredEnv("CMS_GITHUB_REPO", environment.CMS_GITHUB_REPO),
  );
}

export function getCmsBranch(environment: CmsEnvironment): string {
  return environment.CMS_GITHUB_BRANCH || "cms";
}

export function getGithubScope(environment: CmsEnvironment): string {
  return environment.CMS_GITHUB_OAUTH_SCOPE || "public_repo";
}

export function getCmsAccessRepo(environment: CmsEnvironment): string {
  return normalizeGithubRepo(
    "CMS_ACCESS_REPO",
    environment.CMS_ACCESS_REPO || getCmsRepo(environment),
  );
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

export function getCmsContentRoot(environment: CmsEnvironment): string {
  return normalizeCmsOwnedPath(
    "CMS_CONTENT_ROOT",
    environment.CMS_CONTENT_ROOT || "website/outstatic/content",
    cmsContentPrefixes,
  );
}

export function getCmsMediaFolder(environment: CmsEnvironment): string {
  return normalizeCmsOwnedPath(
    "CMS_MEDIA_FOLDER",
    environment.CMS_MEDIA_FOLDER || "website/public/outstatic/images",
    cmsMediaPrefixes,
  );
}

export function getCmsPublicFolder(environment: CmsEnvironment): string {
  return normalizeCmsPublicFolder(
    environment.CMS_PUBLIC_FOLDER || "/outstatic/images",
  );
}

export function getCmsLocales(environment: CmsEnvironment): string[] {
  return normalizeCmsLocales(environment.CMS_LOCALES || defaultCmsLocales);
}

export function getCmsDefaultLocale(
  environment: CmsEnvironment,
  locales = getCmsLocales(environment),
): string {
  return normalizeCmsDefaultLocale(environment.CMS_DEFAULT_LOCALE, locales);
}
