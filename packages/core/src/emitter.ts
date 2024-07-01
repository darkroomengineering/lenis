export class Emitter {
  events: Record<string, Function[]>

  constructor() {
    this.events = {}
  }

  emit(event: string, ...args: any[]) {
    let callbacks = this.events[event] || []
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args)
    }
  }

  on(event: string, callback: Function) {
    // Add the callback to the event's callback list, or create a new list with the callback
    this.events[event]?.push(callback) || (this.events[event] = [callback])

    // Return an unsubscribe function
    return () => {
      this.events[event] = this.events[event]?.filter((i) => callback !== i)
    }
  }

  off(event: string, callback: Function) {
    this.events[event] = this.events[event]?.filter((i) => callback !== i)
  }

  destroy() {
    this.events = {}
  }
}
