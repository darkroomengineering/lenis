import vuePlugin from 'lenis/vue'
// @ts-expect-error - nuxt weird static types man
import { defineNuxtPlugin } from '#imports'

const plugin = defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp: any) {
    nuxtApp.vueApp.use(vuePlugin)
  },
})

export default plugin
