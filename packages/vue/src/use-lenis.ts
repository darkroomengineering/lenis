import type { ScrollCallback } from 'lenis'
import {
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  watch,
} from 'vue'
import { LenisSymbol } from './provider'
import type { LenisContextValue } from './types'

export function useLenis(
  callback?: ScrollCallback,
  priority = 0,
  log = 'useLenis'
) {
  const lenisInjection = inject(LenisSymbol)
  const app = getCurrentInstance()

  const context =
    lenisInjection ||
    (app?.appContext.config.globalProperties.$lenisContext as LenisContextValue)

  // watch(
  //   () => context.lenis,
  //   (context) => {
  //     console.log(context, log)
  //   },
  //   { deep: true }
  // )

  // Wait two ticks to make sure the lenis instance is mounted
  nextTick(() => {
    nextTick(() => {
      if (!context.lenis.value) {
        throw new Error(
          'No lenis instance found, either mount a root lenis instance or wrap your component in a lenis provider'
        )
      }
    })
  })

  watch(
    [context.lenis, context.addCallback, context.removeCallback],
    ([lenis, addCallback, removeCallback]) => {
      console.log(lenis, addCallback, removeCallback, callback, log)
      if (!lenis || !addCallback || !removeCallback || !callback) return
      removeCallback?.(callback)

      addCallback?.(callback, priority)
      callback?.(lenis)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    if (!context.removeCallback || !callback) return
    context.removeCallback.value?.(callback)
  })

  return context.lenis
}
