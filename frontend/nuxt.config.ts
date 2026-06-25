// https://nuxt.com/docs/api/configuration/nuxt-config
const FASTAPI = process.env.NUXT_API_TARGET || 'http://localhost:8001'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  vite: {
    server: {
      // Workaround: disable Unix domain socket untuk vite-node di macOS
      hmr: { protocol: 'ws', host: 'localhost' }
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    // Server-side only (tidak dikirim ke browser)
    apiBaseServer: process.env.NUXT_API_TARGET || 'http://localhost:8001/api',
    public: {
      // Client-side: relative, Nuxt proxy ke FastAPI
      apiBase: '/api-proxy',
    }
  },
  nitro: {
    devProxy: {
      '/api-proxy': { target: `${FASTAPI}/api`, changeOrigin: true },
      '/storage':   { target: `${FASTAPI}/storage`, changeOrigin: true },
      '/laravel-uploads': { target: `${FASTAPI}/laravel-uploads`, changeOrigin: true },
    },
  },
  app: {
    head: {
      title: 'APEX — Achievement & Performance Execution Platform',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'APEX — Achievement & Performance Execution Platform | PT. PKP' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css' },
      ],
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config',
  },
})
