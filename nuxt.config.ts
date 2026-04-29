import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: ['@nuxt/eslint'],

  runtimeConfig: {
    public: {
      apiBase: 'https://dummyjson.com',
    },
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "variables" as *;\n@use "mixins" as *;\n',
          loadPaths: [fileURLToPath(new URL('./app/assets/styles', import.meta.url))],
        },
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  eslint: {},
})
