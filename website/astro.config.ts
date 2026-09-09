import type { IncomingMessage, ServerResponse } from 'node:http';
import tailwindcss from '@tailwindcss/vite';
import type { ViteUserConfig } from 'astro';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import conferenceBuild from './integrations/conference-build';

function noTrailingSlashRedirect(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  if (!req.url) {
    next();
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (/^\/2026\/[^/]+\/(speakers|talks)\/[^/]+\/?$/u.test(url.pathname)) {
    if (url.pathname.endsWith('/')) {
      next();
      return;
    }
    res.statusCode = 308;
    res.setHeader('Location', `${url.pathname}/${url.search}`);
    res.end();
    return;
  }

  if (url.pathname === '/' || !url.pathname.endsWith('/')) {
    next();
    return;
  }

  const pathname = url.pathname.replace(/\/+$/u, '');

  res.statusCode = 308;
  res.setHeader('Location', `${pathname}${url.search}`);
  res.end();
}

function noTrailingSlashRedirects(): Extract<
  NonNullable<ViteUserConfig['plugins']>[number],
  { name: string }
> {
  return {
    name: 'pyconhk:no-trailing-slash-redirects',
    configureServer(server) {
      return () => {
        server.middlewares.stack.unshift({
          handle: noTrailingSlashRedirect,
          route: '',
        });
      };
    },
    configurePreviewServer(server) {
      return () => {
        server.middlewares.stack.unshift({
          handle: noTrailingSlashRedirect,
          route: '',
        });
      };
    },
  };
}

export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pretalx.com', pathname: '/media/**' },
      { protocol: 'https', hostname: 'cfp.pycon.hk', pathname: '/media/**' },
    ],
  },
  build: {
    format: 'file',
  },
  integrations: [
    conferenceBuild(),
    icon({
      include: {
        'fa6-brands': [
          'alipay',
          'apple',
          'discord',
          'facebook',
          'github',
          'instagram',
          'linkedin',
          'threads',
          'weixin',
          'x-twitter',
          'youtube',
        ],
        'fa6-solid': [
          'champagne-glasses',
          'map-location-dot',
          'store',
          'train-subway',
          'taxi',
          'utensils',
        ],
        'heroicons-outline': [
          'arrow-right',
          'calendar',
          'chevron-left',
          'chevron-right',
          'chevron-down',
          'check',
          'credit-card',
          'eye',
          'globe-alt',
          'heart',
          'information-circle',
          'location-marker',
          'menu',
          'users',
          'wifi',
          'x-mark',
        ],
        mdi: ['currency-usd-circle-outline', 'shoe-sneaker'],
      },
    }),
  ],
  i18n: {
    // Current-year prefixes; archive routes retain their existing locale set.
    locales: ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ko', 'ja'],
    defaultLocale: 'en',
    routing: 'manual',
  },
  site: 'https://pycon.hk',
  trailingSlash: 'ignore',
  vite: {
    build: {
      // Tiny page styles must not add another request before ClientRouter swaps.
      // Keep images/fonts as separate files so their URLs remain cacheable.
      assetsInlineLimit: (filePath, content) =>
        filePath.endsWith('.css') && content.length <= 8 * 1024,
    },
    plugins: [noTrailingSlashRedirects(), tailwindcss()],
  },
});
