import { useSyncExternalStore } from 'react'
import type { LenisContextValue } from './types'

type Listener<S> = (state: S) => void

export class Store<S> {
  private listeners: Listener<S>[] = []

  constructor(private state: S) {}

  set(state: S) {
    this.state = state

    for (const listener of this.listeners) {
      listener(this.state)
    }
  }

  subscribe = (listener: Listener<S>) => {
    this.listeners = [...this.listeners, listener]
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  get = () => {
    return this.state
  }
}

export function useStore<S>(store: Store<S>) {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/**
 * Reserved registry key for the global/page instance (`root` / `rootContext`).
 * `useLenis()` with no name falls back to this entry.
 */
export const ROOT_KEY = 'root'

/**
 * Registry of named Lenis instances. Each key owns its own Store so that a
 * `useLenis(name)` only re-renders when *that* instance changes, not when any
 * other one does. The global root is simply the entry under {@link ROOT_KEY}.
 */
const registry = new Map<string, Store<LenisContextValue | null>>()

export function getRegistryStore(name: string) {
  let store = registry.get(name)
  if (!store) {
    store = new Store<LenisContextValue | null>(null)
    registry.set(name, store)
  }
  return store
}

export function useRegistry(name: string) {
  return useStore(getRegistryStore(name))
}
