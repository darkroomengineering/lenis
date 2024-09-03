import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import type { ShallowRef } from 'vue'
import type { VueLenis } from './provider'

export type LenisContextValue = {
  lenis: ShallowRef<Lenis | null>
  addCallback: ShallowRef<(callback: ScrollCallback, priority: number) => void>
  removeCallback: ShallowRef<(callback: ScrollCallback) => void>
}

declare module 'vue' {
  export interface GlobalComponents {
    lenis: typeof VueLenis
  }
}
