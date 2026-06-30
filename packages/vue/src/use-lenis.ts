import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import {
  type ComputedRef,
  computed,
  inject,
  nextTick,
  onWatcherCleanup,
  watch,
} from 'vue'
import {
  AddCallbackSymbol,
  LenisSymbol,
  RemoveCallbackSymbol,
} from './provider'
import { getRegistryStore, ROOT_KEY } from './store'

/**
 * Access a Lenis instance and subscribe to its scroll.
 *
 * Without a name it targets the nearest provider (Vue inject) and falls back to
 * the global root instance (`<VueLenis root>` / `rootContext`). Pass a name to
 * reach a specific instance from anywhere (`<VueLenis name="sidebar">` →
 * `useLenis('sidebar')`), ignoring context.
 *
 * @example
 *   const lenis = useLenis((lenis) => console.log(lenis.progress))
 *   const sidebar = useLenis('sidebar', (lenis) => {}, 1) // with priority
 */
export function useLenis(
  callback?: ScrollCallback,
  priority?: number
): ComputedRef<Lenis | undefined>
export function useLenis(
  name: string,
  callback?: ScrollCallback,
  priority?: number
): ComputedRef<Lenis | undefined>
export function useLenis(
  a?: ScrollCallback | string,
  b?: ScrollCallback | number,
  c?: number
): ComputedRef<Lenis | undefined> {
  const named = typeof a === 'string'
  const name = named ? a : undefined
  const callback = (named ? b : a) as ScrollCallback | undefined
  const priority = (named ? c : (b as number | undefined)) ?? 0

  const lenisInjection = inject(LenisSymbol, undefined)
  const addCallbackInjection = inject(AddCallbackSymbol, undefined)
  const removeCallbackInjection = inject(RemoveCallbackSymbol, undefined)

  // Named lookups read that registry entry directly; the default lookup prefers
  // the nearest provider and falls back to the global root entry.
  const store = getRegistryStore(name ?? ROOT_KEY)

  const lenis = computed(() =>
    name ? store.value?.lenis : (lenisInjection?.value ?? store.value?.lenis)
  )
  const addCallback = computed(() =>
    name
      ? store.value?.addCallback
      : (addCallbackInjection ?? store.value?.addCallback)
  )
  const removeCallback = computed(() =>
    name
      ? store.value?.removeCallback
      : (removeCallbackInjection ?? store.value?.removeCallback)
  )

  if (typeof window !== 'undefined') {
    // Wait two ticks to make sure the lenis instance is mounted
    nextTick(() => {
      nextTick(() => {
        // @ts-expect-error - import.meta.env is available in vite and nuxt
        if (!lenis.value && import.meta.env.DEV) {
          console.warn(
            'No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider'
          )
        }
      })
    })
  }

  watch(
    [lenis, addCallback, removeCallback],
    ([lenis, addCallback, removeCallback]) => {
      if (!(lenis && addCallback && removeCallback && callback)) return

      addCallback(callback, priority)
      callback(lenis)

      onWatcherCleanup(() => {
        removeCallback(callback)
      })
    },
    {
      immediate: true,
    }
  )

  return lenis
}
