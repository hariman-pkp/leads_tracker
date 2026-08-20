// https://nuxt.com/docs/api/configuration/nuxt-config
const LARAVEL  = process.env.NUXT_API_TARGET  || 'http://localhost:8002'
const FASTAPI  = process.env.NUXT_STORAGE_TARGET || 'http://localhost:8001'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  vite: {
    server: {
      hmr: false,
      allowedHosts: ['apex.hariman.online'],
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],
  runtimeConfig: {
    // Server-side only (tidak dikirim ke browser)
    apiBaseServer: `${LARAVEL}/api`,
    public: {
      // Client-side: relative, Nuxt proxy ke Laravel
      apiBase: '/api-proxy',
    }
  },
  nitro: {
    devProxy: {
      '/api-proxy':        { target: `${LARAVEL}/api`,              changeOrigin: true },
      '/storage':          { target: `${FASTAPI}/storage`,          changeOrigin: true },
      '/laravel-uploads':  { target: `${FASTAPI}/laravel-uploads`,  changeOrigin: true },
      '/laravel-public':   { target: LARAVEL,                       changeOrigin: true },
    },
    routeRules: {
      '/api-proxy/**':       { proxy: `${LARAVEL}/api/**` },
      '/storage/**':         { proxy: `${FASTAPI}/storage/**` },
      '/laravel-uploads/**': { proxy: `${FASTAPI}/laravel-uploads/**` },
      '/laravel-public/**':  { proxy: `${LARAVEL}/**` },
    },
  },
  app: {
    head: {
      title: 'APEX — Achievement & Performance Execution Platform',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'APEX — Achievement & Performance Execution Platform | PT. PKP' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'APEX CRM' },
        { name: 'theme-color', content: '#0F1923' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css' },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'APEX CRM',
      short_name: 'APEX',
      description: 'Achievement & Performance Execution Platform',
      theme_color: '#0F1923',
      background_color: '#0F1923',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        },
        {
          urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'cdn-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
        },
      ],
    },
    devOptions: { enabled: false },
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config',
  },
})
