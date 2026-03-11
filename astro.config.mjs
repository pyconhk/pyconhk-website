import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
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
    locales: ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  site: 'https://pycon.hk',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
