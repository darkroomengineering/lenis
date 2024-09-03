import type { ScrollCallback } from 'lenis'
import {
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  toRefs,
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

  watch(
    () => lenisInjection,
    (context) => {
      console.log(context, log)
    },
    { deep: true }
  )

  const { lenis } = toRefs(context)

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

  watch(
    () => context,
    ({ lenis, addCallback, removeCallback }) => {
      if (!lenis || !addCallback || !removeCallback || !callback) return
      removeCallback?.(callback)

      addCallback?.(callback, priority)
      callback?.(lenis)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    if (!context.removeCallback || !callback) return
    context.removeCallback(callback)
  })

  return lenis
}
