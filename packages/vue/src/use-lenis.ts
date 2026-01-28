import type { ScrollCallback } from 'lenis'
import {
  computed,
  inject,
  nextTick,
  onWatcherCleanup,
  readonly,
  ref,
  watch,
  type Ref,
} from 'vue'
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
        // @ts-ignore - import.meta.env is available in vite and nuxt
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

/**
 * Reactive composable for current scroll position
 * @returns Readonly ref with current scroll value
 */
export function useLenisScroll(): Readonly<Ref<number>> {
  const scroll = ref(0)
  useLenis((lenis) => {
    scroll.value = lenis.scroll
  })
  return readonly(scroll)
}

/**
 * Reactive composable for scroll progress (0 to 1)
 * @returns Readonly ref with current progress value
 */
export function useLenisProgress(): Readonly<Ref<number>> {
  const progress = ref(0)
  useLenis((lenis) => {
    progress.value = lenis.progress
  })
  return readonly(progress)
}

/**
 * Reactive composable for scroll velocity
 * @returns Readonly ref with current velocity value
 */
export function useLenisVelocity(): Readonly<Ref<number>> {
  const velocity = ref(0)
  useLenis((lenis) => {
    velocity.value = lenis.velocity
  })
  return readonly(velocity)
}

/**
 * Reactive composable for scroll direction
 * @returns Readonly ref with direction (-1 = up/left, 0 = none, 1 = down/right)
 */
export function useLenisDirection(): Readonly<Ref<-1 | 0 | 1>> {
  const direction = ref<-1 | 0 | 1>(0)
  useLenis((lenis) => {
    direction.value = lenis.direction
  })
  return readonly(direction)
}
