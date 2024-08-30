import type { ScrollCallback } from 'lenis'
import { inject, onBeforeUnmount, watch } from 'vue'
import { LenisSymbol } from './provider'

export function useLenis(callback?: ScrollCallback) {
  const lenisInjection = inject(LenisSymbol)

  if (!lenisInjection) {
    throw new Error('No lenis instance found')
  }

  watch(lenisInjection, (lenis) => {
    if (lenis && callback) {
      lenisInjection.value?.on('scroll', callback)
    }
  })

  onBeforeUnmount(() => {
    if (lenisInjection.value && callback) {
      lenisInjection.value.off('scroll', callback)
    }
  })

  return lenisInjection
}
