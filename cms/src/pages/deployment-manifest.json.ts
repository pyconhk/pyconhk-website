import type { APIRoute } from "astro";
import { getCmsBranch, getCmsRepo, getCmsStage } from "../lib/env";
import { getRuntimeEnvironment } from "../lib/runtime-env";

export const prerender = false;

export const GET: APIRoute = () => {
  const environment = getRuntimeEnvironment();

  return new Response(
    JSON.stringify({
      app: "cms",
      sourceHash: import.meta.env.CMS_DEPLOYMENT_SOURCE_HASH,
      environment: getCmsStage(environment),
      contentRepo: getCmsRepo(environment),
      contentBranch: getCmsBranch(environment),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
};
