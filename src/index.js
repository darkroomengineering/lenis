import { createNanoEvents } from 'nanoevents'
import { version } from '../package.json'
import { Animate } from './animate'
import { clamp, clampedModulo } from './maths'
import { ObservedElement } from './observed-element'
import { VirtualScroll } from './virtual-scroll.js'

// Technical explaination
// - listen to 'wheel' events
// - prevent event to prevent scroll
// - normalize wheel delta
// - add delta to targetScroll
// - animate scroll to targetScroll (smooth context)
// - if animation is not running, listen to 'scroll' events (native context)

export default class Lenis {
  // isScrolling = true when scroll is animating
  // isStopped = true if user should not be able to scroll - enable/disable programatically
  // isSmooth = true if scroll should be animated
  // isLocked = same as isStopped but enabled/disabled when scroll reaches target

  /**
   * @typedef {(t: number) => number} EasingFunction
   * @typedef {'vertical' | 'horizontal'} Orientation
   * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
   *
   * @typedef LenisOptions
   * @property {Orientation} [direction]
   * @property {GestureOrientation} [gestureDirection]
   * @property {number} [mouseMultiplier]
   * @property {boolean} [smooth]
   *
   * @property {Window | HTMLElement} [wrapper]
   * @property {HTMLElement} [content]
   * @property {boolean} [smoothWheel]
   * @property {boolean} [smoothTouch]
   * @property {number} [duration]
   * @property {EasingFunction} [easing]
   * @property {number} [lerp]
   * @property {boolean} [infinite]
   * @property {Orientation} [orientation]
   * @property {GestureOrientation} [gestureOrientation]
   * @property {number} [touchMultiplier]
   * @property {number} [wheelMultiplier]
   * @property {number} [normalizeWheel]
   *
   * @param {LenisOptions}
   */
  constructor({
    //--legacy options--//
    direction,
    gestureDirection,
    mouseMultiplier,
    smooth,
    //--legacy options--//
    wrapper = window,
    content = document.documentElement,
    smoothWheel = smooth ?? true,
    smoothTouch = false,
    duration, // in seconds
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp = duration ? null : 0.1,
    infinite = false,
    orientation = direction ?? 'vertical', // vertical, horizontal
    gestureOrientation = gestureDirection ?? 'vertical', // vertical, horizontal, both
    touchMultiplier = 2,
    wheelMultiplier = mouseMultiplier ?? 1,
    normalizeWheel = true,
  } = {}) {
    // warn about legacy options
    if (direction) {
      console.warn(
        'Lenis: `direction` option is deprecated, use `orientation` instead'
      )
    }
    if (gestureDirection) {
      console.warn(
        'Lenis: `gestureDirection` option is deprecated, use `gestureOrientation` instead'
      )
    }
    if (mouseMultiplier) {
      console.warn(
        'Lenis: `mouseMultiplier` option is deprecated, use `wheelMultiplier` instead'
      )
    }
    if (smooth) {
      console.warn(
        'Lenis: `smooth` option is deprecated, use `smoothWheel` instead'
      )
    }

    window.lenisVersion = version

    // if wrapper is html or body, fallback to window
    if (wrapper === document.documentElement || wrapper === document.body) {
      wrapper = window
    }

    this.options = {
      wrapper,
      content,
      smoothWheel,
      smoothTouch,
      duration,
      easing,
      lerp,
      infinite,
      gestureOrientation,
      orientation,
      touchMultiplier,
      wheelMultiplier,
      normalizeWheel,
    }

    this.wrapper = new ObservedElement(wrapper)
    this.content = new ObservedElement(content)

    this.rootElement.classList.add('lenis')

    this.velocity = 0
    this.isStopped = false
    this.isSmooth = smoothWheel || smoothTouch
    this.isScrolling = false
    this.targetScroll = this.animatedScroll = this.actualScroll
    this.animate = new Animate()
    this.emitter = createNanoEvents()

    this.wrapper.element.addEventListener('scroll', this.onScroll, {
      passive: false,
    })

    this.virtualScroll = new VirtualScroll(wrapper, {
      touchMultiplier,
      wheelMultiplier,
      normalizeWheel,
    })
    this.virtualScroll.on('scroll', this.onVirtualScroll)
  }

  destroy() {
    this.emitter.events = {}

    this.wrapper.element.removeEventListener('scroll', this.onScroll, {
      passive: false,
    })

    this.virtualScroll.destroy()
  }

  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  off(event, callback) {
    this.emitter.events[event] = this.emitter.events[event]?.filter(
      (i) => callback !== i
    )
  }

  setScroll(scroll) {
    // apply scroll value immediately
    if (this.isHorizontal) {
      this.rootElement.scrollLeft = scroll
    } else {
      this.rootElement.scrollTop = scroll
    }
  }

  onVirtualScroll = ({ type, deltaX, deltaY, event }) => {
    // keep zoom feature
    if (event.ctrlKey) return

    // keep previous/next page gesture on trackpads
    if (
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0)
    )
      return

    // catch if scrolling on nested scroll elements
    if (
      !!event
        .composedPath()
        .find((node) => node?.hasAttribute?.('data-lenis-prevent'))
    )
      return

    if (this.isStopped || this.isLocked) {
      event.preventDefault()
      return
    }

    this.isSmooth =
      (this.options.smoothTouch && type === 'touch') ||
      (this.options.smoothWheel && type === 'wheel')

    if (!this.isSmooth) {
      this.isScrolling = false
      this.animate.stop()
      return
    }

    event.preventDefault()

    let delta = deltaY
    if (this.options.gestureOrientation === 'both') {
      delta = deltaX + deltaY
    } else if (this.options.gestureOrientation === 'horizontal') {
      delta = deltaX
    }

    this.scrollTo(this.targetScroll + delta, { programmatic: false })
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
      onComplete,
      force = false, // scroll even if stopped
      programmatic = true, // called from outside of the class
    } = {}
  ) {
    if (this.isStopped && !force) return

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
        if (this.wrapper.element !== window) {
          // nested scroll offset correction
          const wrapperRect = this.wrapper.element.getBoundingClientRect()
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
      this.animate.stop()
      this.reset()
      this.emit()
      onComplete?.()
      return
    }

    if (!programmatic) {
      this.targetScroll = target
    }

    this.animate.fromTo(this.animatedScroll, target, {
      duration,
      easing,
      lerp,
      onUpdate: (value, { completed }) => {
        // started
        if (lock) this.isLocked = true
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

        // completed
        if (completed) {
          if (lock) this.isLocked = false
          requestAnimationFrame(() => {
            //avoid double scroll event
            this.isScrolling = false
          })
          this.velocity = 0
          onComplete?.()
        }

        this.emit()
      },
    })
  }

  get rootElement() {
    return this.wrapper.element === window
      ? this.content.element
      : this.wrapper.element
  }

  get limit() {
    return Math.round(
      this.isHorizontal
        ? this.content.width - this.wrapper.width
        : this.content.height - this.wrapper.height
    )
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
      ? clampedModulo(this.animatedScroll, this.limit)
      : this.animatedScroll
  }

  get progress() {
    return this.scroll / this.limit
  }

  get isSmooth() {
    return this.__isSmooth
  }

  set isSmooth(value) {
    if (this.__isSmooth !== value) {
      this.rootElement.classList.toggle('lenis-smooth', value)
      this.__isSmooth = value
    }
  }

  get isScrolling() {
    return this.__isScrolling
  }

  set isScrolling(value) {
    if (this.__isScrolling !== value) {
      this.rootElement.classList.toggle('lenis-scrolling', value)
      this.__isScrolling = value
    }
  }

  get isStopped() {
    return this.__isStopped
  }

  set isStopped(value) {
    if (this.__isStopped !== value) {
      this.rootElement.classList.toggle('lenis-stopped', value)
      this.__isStopped = value
    }
  }
}

// Lenis.ScrollSnap = ScrollSnap
// export { ScrollSnap }
