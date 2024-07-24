import type Lenis from 'lenis'
import type { LenisOptions, ScrollCallback } from 'lenis'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'

export type LenisContextValue = {
  lenis: Lenis
  addCallback: (callback: ScrollCallback, priority: number) => void
  removeCallback: (callback: ScrollCallback) => void
}

export type LenisProps = PropsWithChildren<{
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
   * RequestAnimationFrame priority
   * @default 0
   */
  rafPriority?: number
  /**
   * Class name for the wrapper div
   */
  className?: string
  /**
   * Additional props for the wrapper div
   */
  props?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>
}>

export type LenisRef = {
  wrapper: HTMLDivElement | null
  content: HTMLDivElement | null
  lenis?: Lenis
}
