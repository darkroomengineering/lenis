import { defineConfig } from 'astro/config'
import path from 'path'

import react from '@astrojs/react'
import vue from '@astrojs/vue'

const root = path.resolve('..')

export default defineConfig({
  integrations: [react(), vue({ appEntrypoint: './vue/setup' })],
  devToolbar: {
    enabled: false,
  },
  srcDir: './www',
  vite: {
    resolve: {
      alias: {
        'lenis/dist/lenis.css': path.resolve(root, 'dist/lenis.css'),
        'lenis/react': path.resolve(root, 'dist/lenis-react.mjs'),
        'lenis/snap': path.resolve(root, 'dist/lenis-snap.mjs'),
        'lenis/vue': path.resolve(root, 'dist/lenis-vue.mjs'),
        lenis: path.resolve(root, 'dist/lenis.mjs'),
      },
    },
  },
})
