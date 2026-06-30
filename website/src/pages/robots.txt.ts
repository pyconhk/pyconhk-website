import type { APIRoute } from 'astro';
import { siteUrl } from '@/config/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString();
  const body = [
    '# Matches origin/main website/src/app/robots.ts until the public launch policy changes.',
    'User-agent: *',
    'Disallow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
