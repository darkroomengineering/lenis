import { useEffect, useState } from 'react'

export class Store {
  private state: any
  private listeners: Array<(state: any) => any> = []

  constructor(state: any) {
    this.state = state
  }

  set(state: any) {
    this.state = state

    for (let listener of this.listeners) {
      listener(this.state)
    }
  }

  subscribe(listener: (state: any) => any) {
    this.listeners = [...this.listeners, listener]
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  get() {
    return this.state
  }
}

export function useStore(store: Store) {
  const [state, setState] = useState(store.get())

  useEffect(() => {
    return store.subscribe((state: any) => setState(state))
  }, [store])

  return state
}
