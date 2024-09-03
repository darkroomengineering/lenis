import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import { shallowRef } from 'vue'

export const globalLenis = shallowRef<Lenis>()
export const globalAddCallback =
  shallowRef<(callback: ScrollCallback, priority: number) => void>()
export const globalRemoveCallback =
  shallowRef<(callback: ScrollCallback) => void>()
