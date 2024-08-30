import type { LenisOptions } from 'lenis'
import type { HTMLAttributes } from 'vue'
import type { VueLenis } from './provider'

export interface LenisVueProps {
  /**
   * Setup a global instance of Lenis
   * @default false
   */
  root?: boolean
  /**
   * Lenis options
   */
  options?: LenisOptions
  /**
   * Auto-setup requestAnimationFrame
   * @default true
   */
  autoRaf?: boolean
  /**
   * Additional props for the wrapper div
   *
   * When `root` is `false`, this will be applied to the wrapper div
   */
  props?: HTMLAttributes
}

declare module 'vue' {
  export interface GlobalComponents {
    lenis: typeof VueLenis
  }
}
