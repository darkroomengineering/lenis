import type { ScrollCallback } from 'lenis'
import { computed, inject, onBeforeUnmount, watch } from 'vue'
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

  // Wait two ticks to make sure the lenis instance is mounted
  // nextTick(() => {
  //   nextTick(() => {
  //     if (!lenis.value) {
  //       throw new Error(
  //         'No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider'
  //       )
  //     }
  //   })
  // })

  watch(
    [lenis, addCallback, removeCallback],
    ([lenis, addCallback, removeCallback]) => {
      if (!lenis || !addCallback || !removeCallback || !callback) return

      addCallback?.(callback, priority)
      callback?.(lenis as any)
    }
  )

  onBeforeUnmount(() => {
    if (!removeCallback.value || !callback) return
    removeCallback.value?.(callback)
  })

  return lenis
}
