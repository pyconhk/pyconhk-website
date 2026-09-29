function unavailable() {
  return new Response("CMS is temporarily unavailable.", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env) {
    // Only the gateway's deployment marker belongs to Pages. Astro serves all
    // CMS routes and assets, using the original public URL for OAuth and cookies.
    const service =
      new URL(request.url).pathname === "/cms-gateway-manifest.json"
        ? env?.ASSETS
        : env?.CMS;

    if (typeof service?.fetch !== "function") return unavailable();

    try {
      return await service.fetch(request);
    } catch {
      // Never fall back to public HTTP or expose an upstream error containing
      // OAuth query parameters or cookies.
      return unavailable();
    }
  },
};
