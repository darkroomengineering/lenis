import { version } from '../package.json'
import { Animate } from './animate'
import { Dimensions } from './dimensions'
import { Emitter } from './emitter'
import { clamp, modulo } from './maths'
import { VirtualScroll } from './virtual-scroll'

// Technical explanation
// - listen to 'wheel' events
// - prevent 'wheel' event to prevent scroll
// - normalize wheel delta
// - add delta to targetScroll
// - animate scroll to targetScroll (smooth context)
// - if animation is not running, listen to 'scroll' events (native context)

export default class Lenis {
  // isScrolling = true when scroll is animating
  // isStopped = true if user should not be able to scroll - enable/disable programmatically
  // isSmooth = true if scroll should be animated
  // isLocked = same as isStopped but enabled/disabled when scroll reaches target

  /**
   * @typedef {(t: number) => number} EasingFunction
   * @typedef {'vertical' | 'horizontal'} Orientation
   * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
   * @typedef {(e: WheelEvent) => {deltaX: number, deltaY:number}} NormalizeWheelHandler
   *
   * @typedef LenisOptions
   * @property {Window | HTMLElement} [wrapper]
   * @property {HTMLElement} [content]
   * @property {Window | HTMLElement} [wheelEventsTarget] // deprecated
   * @property {Window | HTMLElement} [eventsTarget]
   * @property {boolean} [smoothWheel]
   * @property {boolean} [smoothTouch]
   * @property {boolean} [syncTouch]
   * @property {number} [syncTouchLerp]
   * @property {number} [__iosNoInertiaSyncTouchLerp]
   * @property {number} [touchInertiaMultiplier]
   * @property {number} [duration]
   * @property {EasingFunction} [easing]
   * @property {number} [lerp]
   * @property {boolean} [infinite]
   * @property {Orientation} [orientation]
   * @property {GestureOrientation} [gestureOrientation]
   * @property {number} [touchMultiplier]
   * @property {number} [wheelMultiplier]
   * @property {boolean | NormalizeWheelHandler} [normalizeWheel]
   * @property {boolean} [autoResize]
   *
   * @param {LenisOptions}
   */
  constructor({
    wrapper = window,
    content = document.documentElement,
    wheelEventsTarget = wrapper, // deprecated
    eventsTarget = wheelEventsTarget,
    smoothWheel = true,
    smoothTouch = false,
    syncTouch = false,
    syncTouchLerp = 0.1,
    __iosNoInertiaSyncTouchLerp = 0.4, // should be 1 but had to leave 0.4 for iOS (testing purpose)
    touchInertiaMultiplier = 35,
    duration, // in seconds
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp = !duration && 0.1,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal
    gestureOrientation = 'vertical', // vertical, horizontal, both
    touchMultiplier = 1,
    wheelMultiplier = 1,
    normalizeWheel = false,
    autoResize = true,
  } = {}) {
    window.lenisVersion = version

    // if wrapper is html or body, fallback to window
    if (wrapper === document.documentElement || wrapper === document.body) {
      wrapper = window
    }

    this.options = {
      wrapper,
      content,
      wheelEventsTarget,
      eventsTarget,
      smoothWheel,
      smoothTouch,
      syncTouch,
      syncTouchLerp,
      __iosNoInertiaSyncTouchLerp,
      touchInertiaMultiplier,
      duration,
      easing,
      lerp,
      infinite,
      gestureOrientation,
      orientation,
      touchMultiplier,
      wheelMultiplier,
      normalizeWheel,
      autoResize,
    }

    this.animate = new Animate()
    this.emitter = new Emitter()
    this.dimensions = new Dimensions({ wrapper, content, autoResize })
    this.toggleClass('lenis', true)

    this.velocity = 0
    this.isLocked = false
    this.isStopped = false
    this.isSmooth = syncTouch || smoothWheel || smoothTouch
    this.isScrolling = false
    this.targetScroll = this.animatedScroll = this.actualScroll

    this.options.wrapper.addEventListener('scroll', this.onScroll, {
      passive: false,
    })

    this.virtualScroll = new VirtualScroll(eventsTarget, {
      touchMultiplier,
      wheelMultiplier,
      normalizeWheel,
    })
    this.virtualScroll.on('scroll', this.onVirtualScroll)
  }

  destroy() {
    this.emitter.destroy()

    this.options.wrapper.removeEventListener('scroll', this.onScroll, {
      passive: false,
    })

    this.virtualScroll.destroy()
    this.dimensions.destroy()

    this.toggleClass('lenis', false)
    this.toggleClass('lenis-smooth', false)
    this.toggleClass('lenis-scrolling', false)
    this.toggleClass('lenis-stopped', false)
    this.toggleClass('lenis-locked', false)
  }

  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  off(event, callback) {
    return this.emitter.off(event, callback)
  }

  setScroll(scroll) {
    // apply scroll value immediately
    if (this.isHorizontal) {
      this.rootElement.scrollLeft = scroll
    } else {
      this.rootElement.scrollTop = scroll
    }
  }

  onVirtualScroll = ({ deltaX, deltaY, event }) => {
    // keep zoom feature
    if (event.ctrlKey) return

    const isTouch = event.type.includes('touch')
    const isWheel = event.type.includes('wheel')

    if (
      (this.options.gestureOrientation === 'both' &&
        deltaX === 0 &&
        deltaY === 0) || // "touchend" events prevents "click"
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) || // trackpad previous/next page gesture
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0) ||
      (isTouch &&
        this.options.gestureOrientation === 'vertical' &&
        this.scroll === 0 &&
        !this.options.infinite &&
        deltaY <= 0) // touch pull to refresh
    )
      return

    // catch if scrolling on nested scroll elements
    let composedPath = event.composedPath()
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)) // remove parents elements

    if (
      !!composedPath.find(
        (node) =>
          node.hasAttribute?.('data-lenis-prevent') ||
          (isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
          (isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
          node.classList?.contains('lenis') // nested lenis instance
      )
    )
      return

    if (this.isStopped || this.isLocked) {
      event.preventDefault()
      return
    }

    this.isSmooth =
      ((this.options.smoothTouch || this.options.syncTouch) && isTouch) ||
      (this.options.smoothWheel && isWheel)

    if (!this.isSmooth) {
      this.isScrolling = false
      this.animate.stop()
      return
    }

    event.preventDefault()

    let delta = deltaY
    if (this.options.gestureOrientation === 'both') {
      delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX
    } else if (this.options.gestureOrientation === 'horizontal') {
      delta = deltaX
    }

    const syncTouch = isTouch && this.options.syncTouch
    const isTouchEnd = isTouch && event.type === 'touchend'
    const hasTouchInertia = isTouchEnd && Math.abs(delta) > 1
    if (hasTouchInertia) {
      delta = this.velocity * this.options.touchInertiaMultiplier
    }

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(syncTouch && {
        lerp: hasTouchInertia
          ? this.syncTouchLerp
          : this.options.__iosNoInertiaSyncTouchLerp,
      }),
    })
  }

  resize() {
    this.dimensions.resize()
  }

  emit() {
    this.emitter.emit('scroll', this)
  }

  onScroll = () => {
    if (!this.isScrolling) {
      const lastScroll = this.animatedScroll
      this.animatedScroll = this.targetScroll = this.actualScroll
      this.velocity = 0
      this.direction = Math.sign(this.animatedScroll - lastScroll)
      this.emit()
    }
  }

  reset() {
    this.isLocked = false
    this.isScrolling = false
    this.velocity = 0
    this.animate.stop()
  }

  start() {
    this.isStopped = false

    this.reset()
  }

  stop() {
    this.isStopped = true
    this.animate.stop()

    this.reset()
  }

  raf(time) {
    const deltaTime = time - (this.time || time)
    this.time = time

    this.animate.advance(deltaTime * 0.001)
  }

  scrollTo(
    target,
    {
      offset = 0,
      immediate = false,
      lock = false,
      duration = this.options.duration,
      easing = this.options.easing,
      lerp = !duration && this.options.lerp,
      onComplete = null,
      force = false, // scroll even if stopped
      programmatic = true, // called from outside of the class
    } = {}
  ) {
    if ((this.isStopped || this.isLocked) && !force) return

    // keywords
    if (['top', 'left', 'start'].includes(target)) {
      target = 0
    } else if (['bottom', 'right', 'end'].includes(target)) {
      target = this.limit
    } else {
      let node

      if (typeof target === 'string') {
        // CSS selector
        node = document.querySelector(target)
      } else if (target?.nodeType) {
        // Node element
        node = target
      }

      if (node) {
        if (this.options.wrapper !== window) {
          // nested scroll offset correction
          const wrapperRect = this.options.wrapper.getBoundingClientRect()
          offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top
        }

        const rect = node.getBoundingClientRect()

        target =
          (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll
      }
    }

    if (typeof target !== 'number') return

    target += offset
    target = Math.round(target)

    if (this.options.infinite) {
      if (programmatic) {
        this.targetScroll = this.animatedScroll = this.scroll
      }
    } else {
      target = clamp(0, target, this.limit)
    }

    if (immediate) {
      this.animatedScroll = this.targetScroll = target
      this.setScroll(this.scroll)
      this.reset()
      onComplete?.(this)
      return
    }

    if (!programmatic) {
      if (target === this.targetScroll) return

      this.targetScroll = target
    }

    this.animate.fromTo(this.animatedScroll, target, {
      duration,
      easing,
      lerp,
      onStart: () => {
        // started
        if (lock) this.isLocked = true
        this.isScrolling = true
      },
      onUpdate: (value, completed) => {
        this.isScrolling = true

        // updated
        this.velocity = value - this.animatedScroll
        this.direction = Math.sign(this.velocity)

        this.animatedScroll = value
        this.setScroll(this.scroll)

        if (programmatic) {
          // wheel during programmatic should stop it
          this.targetScroll = value
        }

        if (!completed) this.emit()

        if (completed) {
          // avoid emitting twice (onScroll)
          requestAnimationFrame(() => {
            this.reset()
            this.emit()
            onComplete?.(this)
          })
        }
      },
    })
  }

  get rootElement() {
    return this.options.wrapper === window
      ? this.options.content
      : this.options.wrapper
  }

  get limit() {
    return this.dimensions.limit[this.isHorizontal ? 'x' : 'y']
  }

  get isHorizontal() {
    return this.options.orientation === 'horizontal'
  }

  get actualScroll() {
    // value browser takes into account
    return this.isHorizontal
      ? this.rootElement.scrollLeft
      : this.rootElement.scrollTop
  }

  get scroll() {
    return this.options.infinite
      ? modulo(this.animatedScroll, this.limit)
      : this.animatedScroll
  }

  get progress() {
    // avoid progress to be NaN
    return this.limit === 0 ? 1 : this.scroll / this.limit
  }

  get isSmooth() {
    return this.__isSmooth
  }

  set isSmooth(value) {
    if (this.__isSmooth !== value) {
      this.__isSmooth = value
      this.toggleClass('lenis-smooth', value)
    }
  }

  get isScrolling() {
    return this.__isScrolling
  }

  set isScrolling(value) {
    if (this.__isScrolling !== value) {
      this.__isScrolling = value
      this.toggleClass('lenis-scrolling', value)
    }
  }

  get isStopped() {
    return this.__isStopped
  }

  set isStopped(value) {
    if (this.__isStopped !== value) {
      this.__isStopped = value
      this.toggleClass('lenis-stopped', value)
    }
  }

  get isLocked() {
    return this.__isLocked
  }

  set isLocked(value) {
    if (this.__isLocked !== value) {
      this.__isLocked = value
      this.toggleClass('lenis-locked', value)
    }
  }

  get className() {
    let className = 'lenis'
    if (this.isStopped) className += ' lenis-stopped'
    if (this.isLocked) className += ' lenis-locked'
    if (this.isScrolling) className += ' lenis-scrolling'
    if (this.isSmooth) className += ' lenis-smooth'
    return className
  }

  toggleClass(name, value) {
    this.rootElement.classList.toggle(name, value)
    this.emitter.emit('className change', this)
  }
}
