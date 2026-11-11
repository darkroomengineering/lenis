import vuePlugin from 'lenis/vue'

import type { Plugin } from '#app'
import { defineNuxtPlugin } from '#imports'

const plugin = defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp: unknown) {
    ;(nuxtApp as { vueApp: { use: (plugin: unknown) => void } }).vueApp.use(
      vuePlugin
    )
  },
}) satisfies Plugin

export default plugin
