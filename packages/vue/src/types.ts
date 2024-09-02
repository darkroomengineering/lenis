import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import type { VueLenis } from './provider'

export type LenisContextValue = {
  lenis: Lenis | null
  addCallback: (callback: ScrollCallback, priority: number) => void
  removeCallback: (callback: ScrollCallback) => void
}

declare module 'vue' {
  export interface GlobalComponents {
    lenis: typeof VueLenis
  }
}
