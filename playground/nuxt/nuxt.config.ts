import path from 'node:path'

// Resolve `lenis*` to the repo's freshly-built dist (mirrors playground/astro.config).
// Without this, bun resolves `"lenis": "*"` to a stale published build (the `*`
// range skips the workspace's 2.0.0-dev prerelease), so the playground would run
// old code regardless of local rebuilds.
//
// Regex finds (not exact strings) so they also match Nuxt's component imports,
// which append a query like `lenis/vue?nuxt_component=...`.
const dist = path.resolve('../../dist')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['lenis/nuxt'],
  vite: {
    resolve: {
      alias: [
        { find: /^lenis\/dist\/lenis\.css/, replacement: path.join(dist, 'lenis.css') },
        { find: /^lenis\/vue/, replacement: path.join(dist, 'lenis-vue.mjs') },
        { find: /^lenis\/snap/, replacement: path.join(dist, 'lenis-snap.mjs') },
        { find: /^lenis$/, replacement: path.join(dist, 'lenis.mjs') },
      ],
    },
  },
})
