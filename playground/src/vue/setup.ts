import LenisVue from 'lenis/vue'
import type { App } from 'vue'

export default (app: App) => {
  app.use(LenisVue)
}

// TODO: Check why this is needed and not working with just the import
declare module 'vue' {
  interface GlobalComponents {
    lenis: typeof LenisVue
  }
}
