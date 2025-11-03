import type { Plugin } from '#app'
import { defineNuxtPlugin } from '#imports'
// @ts-ignore - lenis/vue is a valid module
import vuePlugin from 'lenis/vue'

const plugin = defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp: any) {
    nuxtApp.vueApp.use(vuePlugin)
  },
}) satisfies Plugin

export default plugin
