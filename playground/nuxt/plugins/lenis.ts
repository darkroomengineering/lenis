import LenisVue from 'lenis/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(LenisVue)
})
