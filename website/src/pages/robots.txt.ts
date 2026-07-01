import type { APIRoute } from 'astro';
import { siteUrl } from '@/config/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString();
  const isTestEnvironment =
    import.meta.env.PUBLIC_IS_TEST_ENV === 'true' ||
    import.meta.env.NEXT_PUBLIC_IS_TEST_ENV === 'true';
  const body = [
    'User-agent: *',
    isTestEnvironment ? 'Disallow: /' : 'Allow: /',
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
