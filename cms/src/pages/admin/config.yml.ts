import type { APIRoute } from "astro";
import { stringify } from "yaml";

import { createCmsConfig } from "../../lib/cms-config";
import { getCmsBranch, getCmsRepo, getCmsSiteUrl } from "../../lib/env";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const siteUrl = getCmsSiteUrl(url);
  const backendMode = url.searchParams.get("backend");

  const cmsConfig =
    backendMode === "local"
      ? createCmsConfig({
          contentRoot: "sandbox-content",
          mediaFolder: "public/sandbox-images",
          publicFolder: "/sandbox-images",
          publishMode: "simple",
        })
      : createCmsConfig();

  const backend =
    backendMode === "test"
      ? { name: "test-repo" }
      : backendMode === "local"
        ? {
            name: "git-gateway",
            branch: getCmsBranch(),
          }
        : {
            name: "github",
            repo: getCmsRepo(),
            branch: getCmsBranch(),
            base_url: siteUrl,
            auth_endpoint: "api/decap/auth",
            site_domain: new URL(siteUrl).host,
          };

  const localBackend =
    backendMode === "local"
      ? {
          url: "http://localhost:8081/api/v1",
        }
      : undefined;

  const config = {
    backend,
    local_backend: localBackend,
    publish_mode: cmsConfig.publishMode,
    media_folder: cmsConfig.mediaFolder,
    public_folder: cmsConfig.publicFolder,
    i18n: {
      structure: cmsConfig.i18nStructure,
      locales: cmsConfig.locales,
      default_locale: cmsConfig.defaultLocale,
    },
    collections: cmsConfig.collections,
  };

  return new Response(stringify(config), {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
