import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import { useContext, useEffect } from 'react'
import { LenisContext } from './provider'
import { ROOT_KEY, useRegistry } from './store'
import type { LenisContextValue } from './types'

// Fall back to an empty object if neither context nor registry has an instance
const fallbackContext: Partial<LenisContextValue> = {}

/**
 * Hook to access a Lenis instance and subscribe to its scroll.
 *
 * Without a name it targets the nearest provider (React context) and falls
 * back to the global root instance (`<ReactLenis root>` / `rootContext`).
 * Pass a name to reach a specific instance from anywhere in the app
 * (`<ReactLenis name="sidebar">` → `useLenis('sidebar')`), ignoring context.
 *
 * @example <caption>Accessor</caption>
 *          const lenis = useLenis()
 *          const sidebar = useLenis('sidebar')
 *
 * @example <caption>Scroll callback</caption>
 *          useLenis((lenis) => console.log(lenis.progress))
 *          useLenis('sidebar', (lenis) => console.log(lenis.progress))
 *
 * @example <caption>With deps and priority</caption>
 *          useLenis('sidebar', (lenis) => {}, [someDependency])
 *          useLenis('sidebar', (lenis) => {}, 1, [someDependency])
 */
export function useLenis(
  callback?: ScrollCallback,
  deps?: unknown[]
): Lenis | undefined
export function useLenis(
  callback: ScrollCallback,
  priority: number,
  deps?: unknown[]
): Lenis | undefined
export function useLenis(
  name: string,
  callback?: ScrollCallback,
  deps?: unknown[]
): Lenis | undefined
export function useLenis(
  name: string,
  callback: ScrollCallback,
  priority: number,
  deps?: unknown[]
): Lenis | undefined
export function useLenis(
  a?: ScrollCallback | string,
  b?: ScrollCallback | number | unknown[],
  c?: number | unknown[],
  d?: unknown[]
): Lenis | undefined {
  const named = typeof a === 'string'

  const name = named ? a : undefined
  const callback = (named ? b : a) as ScrollCallback | undefined

  // The two args after the callback are (priority?, deps?) — but priority is
  // skippable, so the first of them is a number when priority is present and
  // an array when it's just deps.
  const tail0 = named ? c : b
  const tail1 = named ? d : c
  const priority = typeof tail0 === 'number' ? tail0 : 0
  const deps =
    ((typeof tail0 === 'number' ? tail1 : tail0) as unknown[] | undefined) ?? []

  // Named lookups hit that registry entry directly; the default lookup prefers
  // the nearest provider and falls back to the global root entry.
  const localContext = useContext(LenisContext)
  const registryContext = useRegistry(name ?? ROOT_KEY)
  const currentContext = name
    ? (registryContext ?? fallbackContext)
    : (localContext ?? registryContext ?? fallbackContext)

  const { lenis, addCallback, removeCallback } = currentContext

  useEffect(() => {
    if (!(callback && addCallback && removeCallback && lenis)) return

    addCallback(callback, priority)
    callback(lenis)

    return () => {
      removeCallback(callback)
    }
  }, [lenis, addCallback, removeCallback, priority, ...deps, callback])

  return lenis
}
