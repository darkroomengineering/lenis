// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['lenis/nuxt'],
  vite: {
    server: {
      watch: {
        // Watch lenis inside node_modules (symlinked workspace package)
        ignored: ['!**/node_modules/lenis/**'],
      },
    },
    optimizeDeps: {
      // Don't pre-bundle lenis so changes are reflected immediately
      exclude: ['lenis'],
    },
  },
})
