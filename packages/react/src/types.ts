import type Lenis from 'lenis'
import type { LenisOptions, ScrollCallback, UserData } from 'lenis'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type LenisContextValue<UD extends UserData = UserData> = {
  lenis: Lenis<UD>
  addCallback: (callback: ScrollCallback, priority: number) => void
  removeCallback: (callback: ScrollCallback) => void
}

export type LenisProps = {
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
   * Children
   */
  children?: ReactNode
  /**
   * Class name for the wrapper div
   */
  className?: string
  /**
   * Additional props for the wrapper div
   */
  props?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>
}

export type LenisRef<UD extends UserData = UserData> = {
  wrapper: HTMLDivElement | null
  content: HTMLDivElement | null
  lenis?: Lenis<UD>
}
