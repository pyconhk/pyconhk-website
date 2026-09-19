import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      app: "cms",
      sourceHash: import.meta.env.CMS_DEPLOYMENT_SOURCE_HASH,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
