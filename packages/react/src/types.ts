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
   * Target the window: render no wrapper divs and let Lenis drive the page
   * scroll. When `false`, Lenis scrolls the wrapper/content divs it renders.
   * @default false
   */
  root?: boolean
  /**
   * Register this instance in the global store so `useLenis` can reach it from
   * anywhere in the app (outside this provider's subtree). Independent of
   * `root` — set it to expose a scoped container globally, or to keep a window
   * scroller local. Defaults to `root`.
   * @default root
   */
  rootContext?: boolean
  /**
   * Register this instance under a name so it can be reached from anywhere via
   * `useLenis(name)`, independent of the provider subtree. Use it to expose
   * secondary scrollers (e.g. a sidebar) alongside the global root.
   */
  name?: string
  /**
   * Lenis options
   */
  options?: LenisOptions
  /**
   * Children
   */
  children?: ReactNode

  /**
   * Class name to be applied to the wrapper div
   * @default ''
   */
  className?: string | undefined
}

export type LenisRef = {
  /**
   * The wrapper div element
   *
   * Will only be defined if `root` is `false`
   */
  wrapper: HTMLDivElement | null
  /**
   * The content div element
   *
   * Will only be defined if `root` is `false`
   */
  content: HTMLDivElement | null
  /**
   * The lenis instance
   */
  lenis?: Lenis
}
