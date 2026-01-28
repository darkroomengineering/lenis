type EventCallback<T = unknown> = (data: T) => void

/**
 * Emitter class to handle events
 * Uses a Map-based approach for better performance and memory management
 *
 * @example
 * const emitter = new Emitter()
 * emitter.on('event', (data) => {
 *   console.log(data)
 * })
 * emitter.emit('event', 'data')
 */
export class Emitter {
  private callbacks = new Map<string, Set<EventCallback>>()

  /**
   * Emit an event with the given data
   * @param event Event name
   * @param args Data to pass to the event handlers
   */
  emit<T>(event: string, ...args: [T] | []) {
    const eventCallbacks = this.callbacks.get(event)
    if (eventCallbacks) {
      eventCallbacks.forEach((cb) => cb(args[0]))
    }
  }

  /**
   * Add a callback to the event
   * @param event Event name
   * @param cb Callback function
   * @returns Unsubscribe function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for callback flexibility while maintaining type safety at call sites
  on<CB extends (...args: any[]) => void>(event: string, cb: CB) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set())
    }
    this.callbacks.get(event)!.add(cb as EventCallback)

    // Return an unsubscribe function
    return () => this.off(event, cb)
  }

  /**
   * Remove a callback from the event
   * @param event Event name
   * @param callback Callback function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for callback flexibility while maintaining type safety at call sites
  off<CB extends (...args: any[]) => void>(event: string, callback: CB) {
    this.callbacks.get(event)?.delete(callback as EventCallback)
  }

  /**
   * Remove all event listeners and clean up
   */
  destroy() {
    this.callbacks.clear()
  }
}
