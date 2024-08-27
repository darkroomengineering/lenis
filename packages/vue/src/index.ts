import type { App, Plugin } from 'vue'
import LenisVue from './component.vue'
import { useLenis } from './use-lenis'

type SFCWithInstall<T> = T & Plugin

const withInstall = <T>(comp: T) => {
  ;(comp as SFCWithInstall<T>).install = (app: App) => {
    const name = (comp as any).name
    app.component(name, comp as SFCWithInstall<T>)
  }
  return comp as SFCWithInstall<T>
}

export default withInstall(LenisVue)
export { LenisVue, useLenis }
