export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
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

export function getCmsContentRoot(): string {
  return trimTrailingSlash(
    import.meta.env.CMS_CONTENT_ROOT || "website/outstatic/content",
  );
}

export function getCmsMediaFolder(): string {
  return import.meta.env.CMS_MEDIA_FOLDER || "website/public/outstatic/images";
}

export function getCmsPublicFolder(): string {
  return import.meta.env.CMS_PUBLIC_FOLDER || "/outstatic/images";
}

export function getCmsLocales(): string[] {
  const configuredLocales =
    import.meta.env.CMS_LOCALES || "en,zh-hk,zh-hant,zh-hans,ja";

  return configuredLocales
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
}

export function getCmsDefaultLocale(locales = getCmsLocales()): string {
  const configuredDefault = import.meta.env.CMS_DEFAULT_LOCALE;

  if (configuredDefault && locales.includes(configuredDefault)) {
    return configuredDefault;
  }

  if (locales.includes("en")) {
    return "en";
  }

  return locales[0] || "en";
}
