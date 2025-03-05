import type { ScrollCallback } from 'lenis'
import { computed, inject, nextTick, onWatcherCleanup, watch } from 'vue'
import {
  AddCallbackSymbol,
  LenisSymbol,
  RemoveCallbackSymbol,
} from './provider'
import { globalAddCallback, globalLenis, globalRemoveCallback } from './store'

export function useLenis(callback?: ScrollCallback, priority = 0) {
  const lenisInjection = inject(LenisSymbol)
  const addCallbackInjection = inject(AddCallbackSymbol)
  const removeCallbackInjection = inject(RemoveCallbackSymbol)

  const addCallback = computed(() =>
    addCallbackInjection ? addCallbackInjection : globalAddCallback.value
  )
  const removeCallback = computed(() =>
    removeCallbackInjection
      ? removeCallbackInjection
      : globalRemoveCallback.value
  )

  const lenis = computed(() =>
    lenisInjection?.value ? lenisInjection.value : globalLenis.value
  )

  if (typeof window !== 'undefined') {
    // Wait two ticks to make sure the lenis instance is mounted
    nextTick(() => {
      nextTick(() => {
        if (!lenis.value) {
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
      if (!lenis || !addCallback || !removeCallback || !callback) return

      addCallback?.(callback, priority)
      callback?.(lenis as any)

      onWatcherCleanup(() => {
        removeCallback?.(callback)
      })
    },
    {
      immediate: true,
    }
  )
  return lenis
}
