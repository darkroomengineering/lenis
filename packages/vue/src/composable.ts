import type Lenis from 'lenis'
import { inject, onBeforeUnmount, type ShallowRef } from 'vue'

export function useLenis(callback = () => {}, instanceId?: string) {
  const instanceKey = `lenis${instanceId ? `-${instanceId}` : ''}`
  const lenis = inject(instanceKey) as ShallowRef<Lenis | undefined>

  lenis.value?.on('scroll', callback)

  onBeforeUnmount(() => lenis.value?.off('scroll', callback))

  return lenis
}
