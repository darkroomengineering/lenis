import type { ScrollCallback } from 'lenis'
import {
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  watch,
} from 'vue'
import { LenisSymbol } from './provider'

export function useLenis(callback?: ScrollCallback) {
  const lenisInjection = inject(LenisSymbol)
  const app = getCurrentInstance()

  const lenis = lenisInjection || app?.appContext.config.globalProperties.$lenis

  // Wait two ticks to make sure the lenis instance is mounted
  nextTick(() => {
    nextTick(() => {
      if (!lenis.value) {
        throw new Error(
          'No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider'
        )
      }
    })
  })

  watch(lenis, (lenis) => {
    if (callback) {
      lenis?.on('scroll', callback)
    }
  })

  onBeforeUnmount(() => {
    if (callback) {
      lenis.value?.off('scroll', callback)
    }
  })

  return lenis
}
