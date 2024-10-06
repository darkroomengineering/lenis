import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [react(), vue({ appEntrypoint: './vue/setup' })],
  devToolbar: {
    enabled: false,
  },
  srcDir: './www',
})
