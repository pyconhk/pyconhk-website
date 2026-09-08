import { type APIRequestContext, expect } from '@playwright/test';

// Exercise the public HTTP surface, including the assets the delivered HTML uses.
export async function verifyPublishedPages(request: APIRequestContext, year: string) {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const paths = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((route) => new RegExp(`^/${year}(?:/|-|$)`).test(route));
  expect(paths.length).toBeGreaterThan(0);
  const assets = new Set<string>();
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < paths.length) {
        const route = paths[next++];
        const response = await request.get(route);
        expect(response.status(), route).toBe(200);
        const html = await response.text();
        expect(html, route).toMatch(/<title>[^<]+<\/title>/);
        expect(html, route).not.toContain('Internal Server Error');
        for (const match of html.matchAll(
          /(?:src|href)=["'](\/[^"']+\.(?:webp|png|jpe?g|gif|svg|css|js|woff2?)(?:\?[^"']*)?)["']/g
        ))
          assets.add(match[1].replaceAll('&amp;', '&'));
      }
    })
  );
  const urls = [...assets];
  next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < urls.length) {
        const url = urls[next++];
        const response = await request.get(url);
        expect(response.status(), url).toBe(200);
        expect(response.headers()['content-type'], url).not.toContain('text/html');
      }
    })
  );
}
