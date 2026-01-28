import type { ScrollCallback } from 'lenis'
import { useContext, useEffect, useSyncExternalStore } from 'react'
import { LenisContext, rootLenisContextStore } from './provider'
import { useStore } from './store'
import type { LenisContextValue } from './types'

// Fall back to an empty object if both context and store are not available
const fallbackContext: Partial<LenisContextValue> = {}

/**
 * Hook to access the Lenis instance and its methods
 *
 * @example <caption>Scroll callback</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...')
 *            }
 *
 *            if (lenis.progress === 1) {
 *              console.log('At the end!')
 *            }
 *          })
 *
 * @example <caption>Scroll callback with dependencies</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...', someDependency)
 *            }
 *          }, [someDependency])
 * @example <caption>Scroll callback with priority</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...')
 *            }
 *          }, [], 1)
 * @example <caption>Instance access</caption>
 *          const lenis = useLenis()
 *
 *          handleClick() {
 *            lenis.scrollTo(100, {
 *              lerp: 0.1,
 *              duration: 1,
 *              easing: (t) => t,
 *              onComplete: () => {
 *                console.log('Complete!')
 *              }
 *            })
 *          }
 */
export function useLenis(
  callback?: ScrollCallback,
  deps: any[] = [],
  priority = 0
) {
  // Try to get the lenis instance from the context first
  const localContext = useContext(LenisContext)
  // Fall back to the root store if the context is not available
  const rootContext = useStore(rootLenisContextStore)
  // Fall back to the fallback context if all else fails
  const currentContext = localContext ?? rootContext ?? fallbackContext

  const { lenis, addCallback, removeCallback } = currentContext

  useEffect(() => {
    if (!callback || !addCallback || !removeCallback || !lenis) return

    addCallback(callback, priority)
    callback(lenis)

    return () => {
      removeCallback(callback)
    }
  }, [lenis, addCallback, removeCallback, priority, ...deps])

  return lenis
}

/**
 * Hook to get the current scroll position with React 18 concurrent mode support
 * Uses useSyncExternalStore for tear-free reads
 *
 * @example
 * const scroll = useLenisScroll()
 * console.log('Current scroll:', scroll)
 */
export function useLenisScroll() {
  const localContext = useContext(LenisContext)
  const rootContext = useStore(rootLenisContextStore)
  const lenis = localContext?.lenis ?? rootContext?.lenis

  return useSyncExternalStore(
    (callback) => {
      if (!lenis) return () => {}
      return lenis.on('scroll', callback)
    },
    () => lenis?.scroll ?? 0,
    () => 0 // server snapshot
  )
}

/**
 * Hook to get the current scroll progress with React 18 concurrent mode support
 * Uses useSyncExternalStore for tear-free reads
 *
 * @example
 * const progress = useLenisProgress()
 * console.log('Scroll progress:', progress)
 */
export function useLenisProgress() {
  const localContext = useContext(LenisContext)
  const rootContext = useStore(rootLenisContextStore)
  const lenis = localContext?.lenis ?? rootContext?.lenis

  return useSyncExternalStore(
    (callback) => {
      if (!lenis) return () => {}
      return lenis.on('scroll', callback)
    },
    () => lenis?.progress ?? 0,
    () => 0 // server snapshot
  )
}

/**
 * Hook to get the current scroll velocity with React 18 concurrent mode support
 * Uses useSyncExternalStore for tear-free reads
 *
 * @example
 * const velocity = useLenisVelocity()
 * console.log('Scroll velocity:', velocity)
 */
export function useLenisVelocity() {
  const localContext = useContext(LenisContext)
  const rootContext = useStore(rootLenisContextStore)
  const lenis = localContext?.lenis ?? rootContext?.lenis

  return useSyncExternalStore(
    (callback) => {
      if (!lenis) return () => {}
      return lenis.on('scroll', callback)
    },
    () => lenis?.velocity ?? 0,
    () => 0 // server snapshot
  )
}

/**
 * Hook to get the current scroll direction with React 18 concurrent mode support
 * Uses useSyncExternalStore for tear-free reads
 *
 * @example
 * const direction = useLenisDirection()
 * // direction is 1 (down/right), -1 (up/left), or 0 (not scrolling)
 */
export function useLenisDirection() {
  const localContext = useContext(LenisContext)
  const rootContext = useStore(rootLenisContextStore)
  const lenis = localContext?.lenis ?? rootContext?.lenis

  return useSyncExternalStore(
    (callback) => {
      if (!lenis) return () => {}
      return lenis.on('scroll', callback)
    },
    () => lenis?.direction ?? 0,
    () => 0 // server snapshot
  )
}
