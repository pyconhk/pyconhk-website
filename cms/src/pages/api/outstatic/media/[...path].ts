import type { APIRoute } from "astro";

import { getCmsPublicFolder } from "../../../../lib/env";
import { extractLegacyMediaPath } from "../../../../lib/media";
import { getRuntimeEnvironment } from "../../../../lib/runtime-env";

export const prerender = false;

export const GET: APIRoute = ({ params, url }) => {
  const environment = getRuntimeEnvironment();
  const mediaPath = extractLegacyMediaPath(params.path);

  if (!mediaPath) {
    return new Response(null, { status: 404 });
  }

  const redirectUrl = new URL(
    `${getCmsPublicFolder(environment)}/${mediaPath}`,
    url,
  );

  return Response.redirect(redirectUrl, 308);
};
