import { Emitter } from './emitter'
import type { GestureCallback } from './types'

const LINE_HEIGHT = 100 / 6
const listenerOptions: AddEventListenerOptions = { passive: false }

// px a pressed pointer must travel before the press becomes a drag —
// below it, clicks and text selection behave natively
const DRAG_THRESHOLD = 4

function getDeltaMultiplier(deltaMode: number, size: number): number {
  if (deltaMode === 1) return LINE_HEIGHT
  if (deltaMode === 2) return size
  return 1
}

export class GesturesHandler {
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

  // drag (mouse) state — same emission shape as touch: a zero-delta gesture on
  // press, 1:1 deltas while dragging, and a final gesture on release for inertia
  private pointer = { x: 0, y: 0 }
  private dragOrigin = { x: 0, y: 0 }
  private isPointerDown = false
  private isDragging = false

  constructor(
    private element: HTMLElement,
    private options: { drag?: boolean } = {}
  ) {
    window.addEventListener('resize', this.onWindowResize)
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

    if (this.options.drag) {
      this.element.addEventListener(
        'pointerdown',
        this.onPointerDown as EventListener,
        listenerOptions
      )
      // a press on an image/link must not start a native HTML drag
      this.element.addEventListener(
        'dragstart',
        this.onNativeDragStart as EventListener,
        listenerOptions
      )
    }
  }

  /**
   * Add an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   */
  on(event: string, callback: GestureCallback) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
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

    if (this.options.drag) {
      this.element.removeEventListener(
        'pointerdown',
        this.onPointerDown as EventListener,
        listenerOptions
      )
      this.element.removeEventListener(
        'dragstart',
        this.onNativeDragStart as EventListener,
        listenerOptions
      )
      this.removeDragListeners()
    }
  }

  /**
   * Event handler for 'touchstart' event
   *
   * @param event Touch event
   */
  onTouchStart = (event: TouchEvent) => {
    // @ts-expect-error - event.targetTouches is not defined
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: 0,
      y: 0,
    }

    this.emitter.emit('gesture', {
      deltaX: 0,
      deltaY: 0,
      type: 'touch',
      event,
    })
  }

  /** Event handler for 'touchmove' event */
  onTouchMove = (event: TouchEvent) => {
    // @ts-expect-error - event.targetTouches is not defined
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    const deltaX = -(clientX - this.touchStart.x)
    const deltaY = -(clientY - this.touchStart.y)

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: deltaX,
      y: deltaY,
    }

    this.emitter.emit('gesture', {
      deltaX,
      deltaY,
      type: 'touch',
      event,
    })
  }

  onTouchEnd = (event: TouchEvent) => {
    this.emitter.emit('gesture', {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      type: 'touch',
      event,
    })
  }

  /** Event handler for 'wheel' event */
  onWheel = (event: WheelEvent) => {
    let { deltaX, deltaY, deltaMode } = event

    const multiplierX = getDeltaMultiplier(deltaMode, this.window.width)
    const multiplierY = getDeltaMultiplier(deltaMode, this.window.height)

    deltaX *= multiplierX
    deltaY *= multiplierY

    this.emitter.emit('gesture', {
      deltaX,
      deltaY,
      type: 'wheel',
      event,
    })
  }

  private onPointerDown = (event: PointerEvent) => {
    // touch pointers already flow through the touch events above
    if (event.pointerType !== 'mouse' || event.button !== 0) return

    this.isPointerDown = true
    this.isDragging = false
    this.dragOrigin = { x: event.clientX, y: event.clientY }
    this.pointer = { x: event.clientX, y: event.clientY }
    this.lastDelta = { x: 0, y: 0 }

    // the pointer can leave the element (and the window) mid-drag
    window.addEventListener('pointermove', this.onPointerMove, listenerOptions)
    window.addEventListener('pointerup', this.onPointerUp, listenerOptions)
    window.addEventListener('pointercancel', this.onPointerUp, listenerOptions)

    this.emitter.emit('gesture', {
      deltaX: 0,
      deltaY: 0,
      type: 'drag',
      event,
    })
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isPointerDown) return

    if (!this.isDragging) {
      const distance = Math.hypot(
        event.clientX - this.dragOrigin.x,
        event.clientY - this.dragOrigin.y
      )
      if (distance < DRAG_THRESHOLD) return

      this.isDragging = true
      // restart delta tracking from here so the threshold distance doesn't jump
      this.pointer = { x: event.clientX, y: event.clientY }
      // Lenis owns the DOM side (`lenis-dragging` class) — see updateClassName
      this.emitter.emit('dragging', true)
      return
    }

    const deltaX = -(event.clientX - this.pointer.x)
    const deltaY = -(event.clientY - this.pointer.y)

    this.pointer = { x: event.clientX, y: event.clientY }

    this.lastDelta = {
      x: deltaX,
      y: deltaY,
    }

    this.emitter.emit('gesture', {
      deltaX,
      deltaY,
      type: 'drag',
      event,
    })
  }

  private onPointerUp = (event: PointerEvent) => {
    this.removeDragListeners()

    const wasDragging = this.isDragging
    this.isPointerDown = false
    this.isDragging = false

    if (!wasDragging) return

    this.emitter.emit('dragging', false)

    // swallow the click generated by a real drag so links/buttons under the
    // pointer don't activate; cleaned up next frame if no click follows
    window.addEventListener('click', this.suppressClick, {
      capture: true,
      once: true,
    })
    requestAnimationFrame(() => {
      window.removeEventListener('click', this.suppressClick, {
        capture: true,
      })
    })

    this.emitter.emit('gesture', {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      type: 'drag',
      event,
    })
  }

  private onNativeDragStart = (event: DragEvent) => {
    if (this.isPointerDown) event.preventDefault()
  }

  private suppressClick = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  private removeDragListeners() {
    window.removeEventListener(
      'pointermove',
      this.onPointerMove,
      listenerOptions
    )
    window.removeEventListener('pointerup', this.onPointerUp, listenerOptions)
    window.removeEventListener(
      'pointercancel',
      this.onPointerUp,
      listenerOptions
    )
  }

  onWindowResize = () => {
    this.window = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }
}
