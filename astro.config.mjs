// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The contact form posts to Web3Forms, which emails the message to me.
const web3forms = 'https://api.web3forms.com';

export default defineConfig({
  site: 'https://polluxgronier.me',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } },
      filter: (page) => !page.includes('/cv/'),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
  // Never inline small assets (font subsets) as data: URLs; the Content-Security-Policy allows fonts from 'self' only.
  vite: { build: { assetsInlineLimit: 0 } },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src 'self' ${web3forms}`,
        "base-uri 'self'",
        `form-action 'self' ${web3forms}`,
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
        "media-src 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: { resources: ["'self'"] },
    },
  },
});
