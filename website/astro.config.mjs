import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

function noTrailingSlashRedirect(req, res, next) {
  if (!req.url) {
    next();
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/' || !url.pathname.endsWith('/')) {
    next();
    return;
  }

  const pathname = url.pathname.replace(/\/+$/u, '');

  res.statusCode = 308;
  res.setHeader('Location', `${pathname}${url.search}`);
  res.end();
}

function noTrailingSlashRedirects() {
  const installMiddleware = (server) => {
    server.middlewares.stack.unshift({
      handle: noTrailingSlashRedirect,
      route: '',
    });
  };

  return {
    name: 'pyconhk:no-trailing-slash-redirects',
    configureServer(server) {
      return () => installMiddleware(server);
    },
    configurePreviewServer(server) {
      return () => installMiddleware(server);
    },
  };
}

export default defineConfig({
  build: {
    format: 'file',
  },
  integrations: [
    icon({
      include: {
        'fa6-brands': [
          'alipay',
          'apple',
          'facebook',
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
    // Union of routable prefixes. Korean is currently CFP-only; the site-wide
    // locale model remains in src/config/site.ts.
    locales: ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ko', 'ja'],
    defaultLocale: 'en',
    routing: 'manual',
  },
  site: 'https://pycon.hk',
  trailingSlash: 'ignore',
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    plugins: [noTrailingSlashRedirects(), tailwindcss()],
  },
});
