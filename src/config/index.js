module.exports = {
  app_name: 'university-welfare-monitoring',
  manifest: {
    version: '1.0.0',
  },
  isDebug: process.env.IS_DEBUG || false,
  api: {
    // Browser-facing base URL: always points at our Next.js proxy so the
    // bad upstream TLS cert is terminated server-side. The real backend
    // URL is configured via API_BASE_URL and consumed only by the proxy
    // route at src/app/api/proxy/[[...path]]/route.js.
    baseURL: '/api/proxy',
    soketiUrl: process.env.NUXT_ENV_SOKETI_PUSHER_HOST,
    soketiPort: process.env.NUXT_ENV_SOKETI_PUSHER_PORT || 80,
    soketiAppKey: process.env.NUXT_ENV_SOKETI_PUSHER_APP_KEY,
    soketiAuthUrl: process.env.NUXT_ENV_SOKETI_AUTH_URL,
    browserBaseURL: null,
    proxy: false,
  },
  media: {
    baseUrl: process.env.MEDIA_BASE_URL || process.env.API_BASE_URL || '',
  },
  site: {
    baseUrl: (
      process.env.BASE_URL || 'http://localhost:' + (process.env.NUXT_PORT || '3000') + '/'
    ).replace(/\/$/, ''),
  },
  gtm: {
    id: process.env.NUXT_ENV_GTM_ID,
  },
};
