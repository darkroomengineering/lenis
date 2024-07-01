import { Emitter } from './emitter'

const LINE_HEIGHT = 100 / 6

export class VirtualScroll {
  element: HTMLElement | Window
  wheelMultiplier: number
  touchMultiplier: number
  touchStart: {
    x: number | null
    y: number | null
  }
  emitter: Emitter
  lastDelta: {
    x: number
    y: number
  } = {
    x: 0,
    y: 0,
  }
  windowWidth: number = 0
  windowHeight: number = 0

  constructor(
    element: HTMLElement | Window,
    { wheelMultiplier = 1, touchMultiplier = 1 }
  ) {
    this.element = element
    this.wheelMultiplier = wheelMultiplier
    this.touchMultiplier = touchMultiplier

    this.touchStart = {
      x: null,
      y: null,
    }

    this.emitter = new Emitter()
    window.addEventListener('resize', this.onWindowResize, false)
    this.onWindowResize()

    this.element.addEventListener('wheel', this.onWheel as EventListener, {
      passive: false,
    })
    this.element.addEventListener(
      'touchstart',
      this.onTouchStart as EventListener,
      {
        passive: false,
      }
    )
    this.element.addEventListener(
      'touchmove',
      this.onTouchMove as EventListener,
      {
        passive: false,
      }
    )
    this.element.addEventListener(
      'touchend',
      this.onTouchEnd as EventListener,
      {
        passive: false,
      }
    )
  }

  // Add an event listener for the given event and callback
  on(event: string, callback: Function) {
    return this.emitter.on(event, callback)
  }

  // Remove all event listeners and clean up
  destroy() {
    this.emitter.destroy()

    window.removeEventListener('resize', this.onWindowResize, false)

    this.element.removeEventListener('wheel', this.onWheel as EventListener)
    this.element.removeEventListener(
      'touchstart',
      this.onTouchStart as EventListener
    )
    this.element.removeEventListener(
      'touchmove',
      this.onTouchMove as EventListener
    )
    this.element.removeEventListener(
      'touchend',
      this.onTouchEnd as EventListener
    )
  }

  // Event handler for 'touchstart' event
  onTouchStart = (event: TouchEvent) => {
    // @ts-expect-error
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: 0,
      y: 0,
    }

    this.emitter.emit('scroll', {
      deltaX: 0,
      deltaY: 0,
      event,
    })
  }

  // Event handler for 'touchmove' event
  onTouchMove = (event: TouchEvent) => {
    // @ts-expect-error
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    const deltaX = -(clientX - (this.touchStart?.x ?? 0)) * this.touchMultiplier
    const deltaY = -(clientY - (this.touchStart?.y ?? 0)) * this.touchMultiplier

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: deltaX,
      y: deltaY,
    }

    this.emitter.emit('scroll', {
      deltaX,
      deltaY,
      event,
    })
  }

  onTouchEnd = (event: TouchEvent) => {
    this.emitter.emit('scroll', {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      event,
    })
  }

  // Event handler for 'wheel' event
  onWheel = (event: WheelEvent) => {
    let { deltaX, deltaY, deltaMode } = event

    const multiplierX =
      deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowWidth : 1
    const multiplierY =
      deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowHeight : 1

    deltaX *= multiplierX
    deltaY *= multiplierY

    deltaX *= this.wheelMultiplier
    deltaY *= this.wheelMultiplier

    this.emitter.emit('scroll', { deltaX, deltaY, event })
  }

  onWindowResize = () => {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }
}
