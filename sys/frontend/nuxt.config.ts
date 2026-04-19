// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    backendApiBaseUrl: process.env.BACKEND_API_BASE_URL ?? 'http://localhost:8080',
    public: {
      appName: 'FERMS',
      backendPublicUrl:
        process.env.NUXT_PUBLIC_BACKEND_PUBLIC_URL ?? 'http://localhost:8080',
      frontendPublicUrl:
        process.env.NUXT_PUBLIC_FRONTEND_PUBLIC_URL ?? 'http://localhost:3000',
    },
  },
})
