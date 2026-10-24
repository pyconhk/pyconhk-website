import type { APIRoute } from "astro";
import { siteUrl } from "@/config/site";
import { postCollectionDefinitions } from "../../lib/cms-config";

export const prerender = false;

// Website-owned backgrounds and fallback covers keep their public paths in
// the shared article CSS. CMS-managed images use the existing media endpoint.
export const GET: APIRoute = ({ params, url }) => {
  if (
    !postCollectionDefinitions.some(({ year }) => String(year) === params.year)
  ) {
    return new Response(null, { status: 404 });
  }
  return Response.redirect(new URL(url.pathname, siteUrl), 302);
};
