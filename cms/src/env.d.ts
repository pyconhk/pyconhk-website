/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CMS_PUBLIC_URL?: string;
  readonly CMS_GITHUB_CLIENT_ID?: string;
  readonly CMS_GITHUB_CLIENT_SECRET?: string;
  readonly CMS_GITHUB_REPO?: string;
  readonly CMS_GITHUB_BRANCH?: string;
  readonly CMS_GITHUB_OAUTH_SCOPE?: string;
  readonly CMS_ACCESS_REPO?: string;
  readonly CMS_CONTENT_ROOT?: string;
  readonly CMS_MEDIA_FOLDER?: string;
  readonly CMS_PUBLIC_FOLDER?: string;
  readonly CMS_LOCALES?: string;
  readonly CMS_DEFAULT_LOCALE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
