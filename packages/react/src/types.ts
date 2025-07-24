import type Lenis from 'lenis'
import type { LenisOptions, ScrollCallback } from 'lenis'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type LenisContextValue = {
  lenis: Lenis
  addCallback: (callback: ScrollCallback, priority: number) => void
  removeCallback: (callback: ScrollCallback) => void
}

export type LenisProps = ComponentPropsWithoutRef<'div'> & {
  /**
   * Setup a global instance of Lenis
   * if `asChild`, the component will render wrapper and content divs
   * @default false
   */
  root?: boolean | 'asChild'
  /**
   * Lenis options
   */
  options?: LenisOptions
  /**
   * Auto-setup requestAnimationFrame
   * @default true
   * @deprecated use options.autoRaf instead
   */
  autoRaf?: boolean
  /**
   * Children
   */
  children?: ReactNode
}

export type LenisRef = {
  /**
   * The wrapper div element
   *
   * Will only be defined if `root` is `false` or `root` is `asChild`
   */
  wrapper: HTMLDivElement | null
  /**
   * The content div element
   *
   * Will only be defined if `root` is `false` or `root` is `asChild`
   */
  content: HTMLDivElement | null
  /**
   * The lenis instance
   */
  lenis?: Lenis
}
