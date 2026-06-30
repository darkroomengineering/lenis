import type Lenis from 'lenis'
import type { ScrollCallback } from 'lenis'
import { type ShallowRef, shallowRef } from 'vue'

export type LenisRegistryEntry = {
  lenis: Lenis
  addCallback: (callback: ScrollCallback, priority: number) => void
  removeCallback: (callback: ScrollCallback) => void
}

/**
 * Reserved registry key for the global/page instance (`root` / `rootContext`).
 * `useLenis()` with no name falls back to this entry.
 */
export const ROOT_KEY = 'root'

/**
 * Registry of named Lenis instances. Each key owns its own `shallowRef` so a
 * `useLenis(name)` only reacts when *that* instance changes. The global root is
 * simply the entry under {@link ROOT_KEY}.
 */
const registry = new Map<string, ShallowRef<LenisRegistryEntry | undefined>>()

export function getRegistryStore(name: string) {
  let store = registry.get(name)
  if (!store) {
    store = shallowRef<LenisRegistryEntry | undefined>(undefined)
    registry.set(name, store)
  }
  return store
}
