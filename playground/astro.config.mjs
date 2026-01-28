import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [react(), vue({ appEntrypoint: './vue/setup' })],
  devToolbar: {
    enabled: false,
  },
  srcDir: './www',
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
