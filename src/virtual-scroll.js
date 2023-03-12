import { createNanoEvents } from 'nanoevents'
import { clamp } from './maths'

export class VirtualScroll {
  constructor(
    element,
    { wheelMultiplier = 1, touchMultiplier = 2, normalizeWheel = false }
  ) {
    this.element = element
    this.wheelMultiplier = wheelMultiplier
    this.touchMultiplier = touchMultiplier
    this.normalizeWheel = normalizeWheel

    this.touchStart = {
      x: null,
      y: null,
    }

    this.emitter = createNanoEvents()

    this.element.addEventListener('wheel', this.onWheel, { passive: false })
    this.element.addEventListener('touchstart', this.onTouchStart, {
      passive: false,
    })
    this.element.addEventListener('touchmove', this.onTouchMove, {
      passive: false,
    })
  }

  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  destroy() {
    this.emitter.events = {}

    this.element.removeEventListener('wheel', this.onWheel, {
      passive: false,
    })
    this.element.removeEventListener('touchstart', this.onTouchStart, {
      passive: false,
    })
    this.element.removeEventListener('touchmove', this.onTouchMove, {
      passive: false,
    })
  }

  onTouchStart = (event) => {
    const { pageX, pageY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    this.touchStart.x = pageX
    this.touchStart.y = pageY
  }

  onTouchMove = (event) => {
    const { pageX, pageY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    const deltaX = -(pageX - this.touchStart.x) * this.touchMultiplier
    const deltaY = -(pageY - this.touchStart.y) * this.touchMultiplier

    this.touchStart.x = pageX
    this.touchStart.y = pageY

    this.emitter.emit('scroll', {
      type: 'touch',
      deltaX,
      deltaY,
      event,
    })
  }

  onWheel = (event) => {
    let { deltaX, deltaY } = event

    if (this.normalizeWheel) {
      deltaX = clamp(-100, deltaX, 100)
      deltaY = clamp(-100, deltaY, 100)
    }

    deltaX *= this.wheelMultiplier
    deltaY *= this.wheelMultiplier

    this.emitter.emit('scroll', { type: 'wheel', deltaX, deltaY, event })
  }
}
