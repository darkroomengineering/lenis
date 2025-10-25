import vuePlugin from 'lenis/vue'
import { defineNuxtPlugin } from '#imports'
import type { Plugin } from '#app'

const plugin = defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp: any) {
    nuxtApp.vueApp.use(vuePlugin)
  },
}) satisfies Plugin

export default plugin
