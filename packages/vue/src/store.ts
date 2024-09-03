import { onUnmounted, shallowRef } from 'vue'

type Listener<S> = (state: S) => void

export class Store<S> {
  private listeners: Listener<S>[] = []

  constructor(private state: S) {}

  set(state: S) {
    this.state = state

    for (let listener of this.listeners) {
      listener(this.state)
    }
  }

  subscribe(listener: Listener<S>) {
    this.listeners = [...this.listeners, listener]
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  get() {
    return this.state
  }
}

export function useStore<S>(store: Store<S>) {
  const state = shallowRef(store.get())

  const unsubscribe = store.subscribe(() => {
    state.value = store.get()
  })

  onUnmounted(unsubscribe)

  return [state, store.set]
}
