import {
  type CmsEnvironment,
  getCmsBranch,
  getCmsMediaFolder,
  getCmsRepo,
} from "./env";

type Fetcher = typeof fetch;

export function normalizeMediaPath(value: string | undefined): string | null {
  const normalized = value?.replace(/^\/+|\/+$/gu, "");
  const segments = normalized?.split("/") || [];

  if (
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("\\") ||
        segment.includes("\0"),
    )
  ) {
    return null;
  }

  return segments.join("/");
}

export function extractLegacyMediaPath(
  value: string | undefined,
): string | null {
  const marker = "outstatic/images/";
  const markerIndex = value?.lastIndexOf(marker) ?? -1;

  if (!value || markerIndex < 0) {
    return null;
  }

  return normalizeMediaPath(value.slice(markerIndex + marker.length));
}

export function createGithubMediaUrl(
  environment: CmsEnvironment,
  mediaPath: string,
): URL {
  const normalizedPath = normalizeMediaPath(mediaPath);

  if (!normalizedPath) {
    throw new Error("Invalid CMS media path");
  }

  const [owner, repository] = getCmsRepo(environment).split("/");
  const pathSegments = [
    owner,
    repository,
    getCmsBranch(environment),
    ...getCmsMediaFolder(environment).split("/"),
    ...normalizedPath.split("/"),
  ].map((segment) => encodeURIComponent(segment));

  return new URL(pathSegments.join("/"), "https://raw.githubusercontent.com/");
}

export async function fetchCmsMedia(
  environment: CmsEnvironment,
  mediaPath: string,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  const upstream = await fetcher(createGithubMediaUrl(environment, mediaPath));

  if (!upstream.ok) {
    return new Response(null, {
      status: upstream.status === 404 ? 404 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const contentType = upstream.headers.get("Content-Type") || "";

  if (!contentType.startsWith("image/")) {
    return new Response(null, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const headers = new Headers({
    "Cache-Control": "public, max-age=300",
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });

  for (const name of ["Content-Length", "ETag", "Last-Modified"]) {
    const value = upstream.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  }

  return new Response(upstream.body, { headers });
}
