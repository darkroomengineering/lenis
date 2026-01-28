import { Emitter } from './emitter'
import type { VirtualScrollCallback } from './types'

const LINE_HEIGHT = 100 / 6
const listenerOptions: AddEventListenerOptions = { passive: false }

export class VirtualScroll {
  touchStart = {
    x: 0,
    y: 0,
  }
  lastDelta = {
    x: 0,
    y: 0,
  }
  window = {
    width: 0,
    height: 0,
  }
  private emitter = new Emitter()
  private _stopped = false

  constructor(
    private element: HTMLElement,
    private options = { wheelMultiplier: 1, touchMultiplier: 1 }
  ) {
    window.addEventListener('resize', this.onWindowResize, { passive: true })
    this.onWindowResize()

    this.element.addEventListener('wheel', this.onWheel, listenerOptions)
    this.element.addEventListener(
      'touchstart',
      this.onTouchStart,
      listenerOptions
    )
    this.element.addEventListener(
      'touchmove',
      this.onTouchMove,
      listenerOptions
    )
    this.element.addEventListener('touchend', this.onTouchEnd, listenerOptions)
  }

  /**
   * Add an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   */
  on(event: string, callback: VirtualScrollCallback) {
    return this.emitter.on(event, callback)
  }

  /**
   * Stop virtual scroll event handling
   */
  stop() {
    this._stopped = true
  }

  /**
   * Start virtual scroll event handling
   */
  start() {
    this._stopped = false
  }

  /** Remove all event listeners and clean up */
  destroy() {
    this.emitter.destroy()

    window.removeEventListener('resize', this.onWindowResize)

    this.element.removeEventListener('wheel', this.onWheel, listenerOptions)
    this.element.removeEventListener(
      'touchstart',
      this.onTouchStart,
      listenerOptions
    )
    this.element.removeEventListener(
      'touchmove',
      this.onTouchMove,
      listenerOptions
    )
    this.element.removeEventListener(
      'touchend',
      this.onTouchEnd,
      listenerOptions
    )
  }

  /**
   * Event handler for 'touchstart' event
   *
   * @param event Touch event
   */
  onTouchStart = (event: TouchEvent) => {
    if (this._stopped) return

    const touch = event.targetTouches?.[0]
    const clientX = touch?.clientX ?? 0
    const clientY = touch?.clientY ?? 0

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    // Mutate instead of allocating new object
    this.lastDelta.x = 0
    this.lastDelta.y = 0

    this.emitter.emit('scroll', {
      deltaX: 0,
      deltaY: 0,
      event,
    })
  }

  /** Event handler for 'touchmove' event */
  onTouchMove = (event: TouchEvent) => {
    if (this._stopped) return

    const touch = event.targetTouches?.[0]
    const clientX = touch?.clientX ?? 0
    const clientY = touch?.clientY ?? 0

    const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier
    const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    // Mutate instead of allocating new object
    this.lastDelta.x = deltaX
    this.lastDelta.y = deltaY

    this.emitter.emit('scroll', {
      deltaX,
      deltaY,
      event,
    })
  }

  onTouchEnd = (event: TouchEvent) => {
    if (this._stopped) return

    this.emitter.emit('scroll', {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      event,
    })
  }

  /** Event handler for 'wheel' event */
  onWheel = (event: WheelEvent) => {
    if (this._stopped) return

    let { deltaX, deltaY, deltaMode } = event

    const multiplierX =
      deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1
    const multiplierY =
      deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1

    deltaX *= multiplierX
    deltaY *= multiplierY

    deltaX *= this.options.wheelMultiplier
    deltaY *= this.options.wheelMultiplier

    this.emitter.emit('scroll', { deltaX, deltaY, event })
  }

  onWindowResize = () => {
    // Mutate instead of allocating new object
    this.window.width = window.innerWidth
    this.window.height = window.innerHeight
  }
}
