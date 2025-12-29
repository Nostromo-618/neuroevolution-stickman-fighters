// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-29',
  ssr: false,
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: '/neuroevolution-stickman-fighters/',
    head: {
      title: 'NeuroEvolution: Stickman Fighters',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },

  vite: {
    worker: {
      format: 'es'
    }
  },

  nitro: {
    experimental: {
      wasm: true
    },
    compatibilityDate: '2025-12-29'
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})

