import type { APIRoute } from "astro";
import { stringify } from "yaml";

import { createCmsConfig } from "../../lib/cms-config";
import { getCmsBranch, getCmsRepo, getCmsSiteUrl } from "../../lib/env";
import { getRuntimeEnvironment } from "../../lib/runtime-env";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const environment = getRuntimeEnvironment();
  const siteUrl = getCmsSiteUrl(url, environment);
  const backendMode = url.searchParams.get("backend");

  const cmsConfig = createCmsConfig(environment);

  const backend =
    backendMode === "test"
      ? { name: "test-repo" }
      : {
          name: "github",
          repo: getCmsRepo(environment),
          branch: getCmsBranch(environment),
          base_url: siteUrl,
          auth_endpoint: "api/decap/auth",
          site_domain: new URL(siteUrl).host,
        };

  const config = {
    backend,
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
