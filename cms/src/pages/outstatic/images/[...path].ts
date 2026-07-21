import type { APIRoute } from "astro";

import { fetchCmsMedia, normalizeMediaPath } from "../../../lib/media";
import { getRuntimeEnvironment } from "../../../lib/runtime-env";

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const mediaPath = normalizeMediaPath(params.path);

  if (!mediaPath) {
    return new Response(null, { status: 404 });
  }

  return fetchCmsMedia(getRuntimeEnvironment(), mediaPath);
};
