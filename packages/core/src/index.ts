import { version } from '../../../package.json'
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

type EasingFunction = (t: number) => number
type Orientation = 'vertical' | 'horizontal'
type GestureOrientation = 'vertical' | 'horizontal' | 'both'

export type LenisOptions = {
  wrapper?: Window | HTMLElement
  content?: HTMLElement
  wheelEventsTarget?: Window | HTMLElement
  eventsTarget?: Window | HTMLElement
  smoothWheel?: boolean
  syncTouch?: boolean
  syncTouchLerp?: number
  touchInertiaMultiplier?: number
  duration?: number
  easing?: EasingFunction
  lerp?: number
  infinite?: boolean
  orientation?: Orientation
  gestureOrientation?: GestureOrientation
  touchMultiplier?: number
  wheelMultiplier?: number
  autoResize?: boolean
  __experimental__naiveDimensions?: boolean
}

export default class Lenis {
  __isSmooth: boolean = false // true if scroll should be animated
  __isScrolling: boolean = false // true when scroll is animating
  __isStopped: boolean = false // true if user should not be able to scroll - enable/disable programmatically
  __isLocked: boolean = false // same as isStopped but enabled/disabled when scroll reaches target

  constructor({
    wrapper = window,
    content = document.documentElement,
    wheelEventsTarget = wrapper, // deprecated
    eventsTarget = wheelEventsTarget,
    smoothWheel = true,
    syncTouch = false,
    syncTouchLerp = 0.075,
    touchInertiaMultiplier = 35,
    duration, // in seconds
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp = !duration && 0.1,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal
    gestureOrientation = 'vertical', // vertical, horizontal, both
    touchMultiplier = 1,
    wheelMultiplier = 1,
    autoResize = true,
    __experimental__naiveDimensions = false,
  }: LenisOptions = {}) {
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
      syncTouch,
      syncTouchLerp,
      touchInertiaMultiplier,
      duration,
      easing,
      lerp,
      infinite,
      gestureOrientation,
      orientation,
      touchMultiplier,
      wheelMultiplier,
      autoResize,
      __experimental__naiveDimensions,
    }

    this.animate = new Animate()
    this.emitter = new Emitter()
    this.dimensions = new Dimensions({ wrapper, content, autoResize })
    // this.toggleClassName('lenis', true)
    this.updateClassName()

    this.velocity = 0
    this.isLocked = false
    this.isStopped = false
    // this.isSmooth = syncTouch || smoothWheel
    // this.isSmooth = false
    this.isScrolling = false
    this.targetScroll = this.animatedScroll = this.actualScroll

    this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false)

    this.virtualScroll = new VirtualScroll(eventsTarget, {
      touchMultiplier,
      wheelMultiplier,
    })
    this.virtualScroll.on('scroll', this.onVirtualScroll)
  }

  destroy() {
    this.emitter.destroy()

    this.options.wrapper.removeEventListener(
      'scroll',
      this.onNativeScroll,
      false
    )

    this.virtualScroll.destroy()
    this.dimensions.destroy()

    this.rootElement.className = ''

    // this.toggleClassName('lenis', false)
    // this.toggleClassName('lenis-smooth', false)
    // this.toggleClassName('lenis-scrolling', false)
    // this.toggleClassName('lenis-stopped', false)
    // this.toggleClassName('lenis-locked', false)
  }

  on(event: string, callback: Function) {
    return this.emitter.on(event, callback)
  }

  off(event: string, callback: Function) {
    return this.emitter.off(event, callback)
  }

  private setScroll(scroll) {
    // apply scroll value immediately
    if (this.isHorizontal) {
      this.rootElement.scrollLeft = scroll
    } else {
      this.rootElement.scrollTop = scroll
    }
  }

  private onVirtualScroll = ({ deltaX, deltaY, event }) => {
    // keep zoom feature
    if (event.ctrlKey) return

    const isTouch = event.type.includes('touch')
    const isWheel = event.type.includes('wheel')

    this.isTouching = event.type === 'touchstart' || event.type === 'touchmove'

    const isTapToStop =
      this.options.syncTouch &&
      isTouch &&
      event.type === 'touchstart' &&
      !this.isStopped &&
      !this.isLocked

    if (isTapToStop) {
      this.reset()
      return
    }

    const isClick = deltaX === 0 && deltaY === 0 // click event

    // const isPullToRefresh =
    //   this.options.gestureOrientation === 'vertical' &&
    //   this.scroll === 0 &&
    //   !this.options.infinite &&
    //   deltaY <= 5 // touch pull to refresh, not reliable yet

    const isUnknownGesture =
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0)

    if (isClick || isUnknownGesture) {
      // console.log('prevent')
      return
    }

    // catch if scrolling on nested scroll elements
    let composedPath = event.composedPath()
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)) // remove parents elements

    if (
      !!composedPath.find(
        (node) =>
          node.hasAttribute?.('data-lenis-prevent') ||
          (isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
          (isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
          (node.classList?.contains('lenis') &&
            !node.classList?.contains('lenis-stopped')) // nested lenis instance
      )
    )
      return

    if (this.isStopped || this.isLocked) {
      event.preventDefault() // this will stop forwarding the event to the parent, this is problematic
      return
    }

    const isSmooth =
      (this.options.syncTouch && isTouch) ||
      (this.options.smoothWheel && isWheel)

    if (!isSmooth) {
      this.isScrolling = 'native'
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

    const hasTouchInertia = isTouchEnd && Math.abs(delta) > 5

    if (hasTouchInertia) {
      delta = this.velocity * this.options.touchInertiaMultiplier
    }

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(syncTouch
        ? {
            lerp: hasTouchInertia ? this.options.syncTouchLerp : 1,
          }
        : {
            lerp: this.options.lerp,
            duration: this.options.duration,
            easing: this.options.easing,
          }),
    })
  }

  resize() {
    this.dimensions.resize()
  }

  private emit(extra = {}) {
    this.emitter.emit('scroll', this, extra)
  }

  private onNativeScroll = () => {
    clearTimeout(this.__resetVelocityTimeout)
    delete this.__resetVelocityTimeout

    if (this.__preventNextNativeScrollEvent) {
      delete this.__preventNextNativeScrollEvent
      return
    }

    if (this.isScrolling === false || this.isScrolling === 'native') {
      const lastScroll = this.animatedScroll
      this.animatedScroll = this.targetScroll = this.actualScroll
      this.lastVelocity = this.velocity
      this.velocity = this.animatedScroll - lastScroll
      this.direction = Math.sign(this.animatedScroll - lastScroll)
      // this.isSmooth = false
      this.isScrolling = this.__hasScrolled ? 'native' : false
      this.emit({ isSmooth: false })

      // console.log(this.velocity)

      if (this.velocity !== 0) {
        // const date = Date.now()

        this.__resetVelocityTimeout = setTimeout(() => {
          console.log('reset velocity')
          // console.log('reset velocity', Date.now() - date)
          this.lastVelocity = this.velocity
          this.velocity = 0
          this.isScrolling = false
          this.emit({ isSmooth: false })
        }, 400)
      }

      this.__hasScrolled = true
      // }, 50)
    }
  }

  private reset() {
    this.isLocked = false
    this.isScrolling = false
    this.animatedScroll = this.targetScroll = this.actualScroll
    this.lastVelocity = this.velocity = 0
    this.animate.stop()
  }

  start() {
    if (!this.isStopped) return
    this.isStopped = false

    this.reset()
  }

  stop() {
    if (this.isStopped) return
    this.isStopped = true
    this.animate.stop()

    this.reset()
  }

  raf(time: number) {
    const deltaTime = time - (this.time || time)
    this.time = time

    this.animate.advance(deltaTime * 0.001)
  }

  scrollTo(
    target: number | string | HTMLElement,
    {
      offset = 0,
      immediate = false,
      lock = false,
      duration = this.options.duration,
      easing = this.options.easing,
      lerp = !duration && this.options.lerp,
      onStart,
      onComplete,
      force = false, // scroll even if stopped
      programmatic = true, // called from outside of the class
      userData = {},
    }: {
      offset?: number
      immediate?: boolean
      lock?: boolean
      duration?: number
      easing?: EasingFunction
      lerp?: number
      onStart?: (lenis: Lenis) => void
      onComplete?: (lenis: Lenis) => void
      force?: boolean
      programmatic?: boolean
      userData?: object
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

    console.log(target, this.targetScroll)

    if (target === this.targetScroll) return

    if (!programmatic) {
      this.targetScroll = target
    }

    this.animate.fromTo(this.animatedScroll, target, {
      duration,
      easing,
      lerp,
      onStart: () => {
        // started
        if (lock) this.isLocked = true
        this.isScrolling = 'smooth'
        onStart?.(this)
      },
      onUpdate: (value: number, completed: boolean) => {
        this.isScrolling = 'smooth'

        // console.log('onUpdate', this.animatedScroll, target)

        // updated
        this.lastVelocity = this.velocity
        this.velocity = value - this.animatedScroll
        this.direction = Math.sign(this.velocity)

        this.animatedScroll = value
        this.setScroll(this.scroll)

        if (programmatic) {
          // wheel during programmatic should stop it
          this.targetScroll = value
        }

        if (!completed) this.emit({ isSmooth: true, userData })

        if (completed) {
          this.reset()
          this.emit({ isSmooth: true, userData })
          onComplete?.(this)

          // avoid emitting event twice
          this.__preventNextNativeScrollEvent = true
          // requestAnimationFrame(() => {
          //   delete this.__preventNextNativeScrollEvent
          // })
        }
      },
    })
  }

  get rootElement() {
    return this.options.wrapper === window
      ? document.documentElement
      : this.options.wrapper
  }

  get limit() {
    if (this.options.__experimental__naiveDimensions) {
      if (this.isHorizontal) {
        return this.rootElement.scrollWidth - this.rootElement.clientWidth
      } else {
        return this.rootElement.scrollHeight - this.rootElement.clientHeight
      }
    } else {
      return this.dimensions.limit[this.isHorizontal ? 'x' : 'y']
    }
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

  private set isSmooth(value: boolean) {
    if (this.__isSmooth !== value) {
      this.__isSmooth = value
      this.updateClassName()
    }
  }

  get isScrolling() {
    return this.__isScrolling
  }

  private set isScrolling(value: boolean) {
    if (this.__isScrolling !== value) {
      this.__isScrolling = value
      this.updateClassName()
    }
  }

  get isStopped() {
    return this.__isStopped
  }

  private set isStopped(value: boolean) {
    if (this.__isStopped !== value) {
      this.__isStopped = value
      this.updateClassName()
    }
  }

  get isLocked() {
    return this.__isLocked
  }

  private set isLocked(value: boolean) {
    if (this.__isLocked !== value) {
      this.__isLocked = value
      this.updateClassName()
    }
  }

  get className() {
    let className = 'lenis'
    if (this.isStopped) className += ' lenis-stopped'
    if (this.isLocked) className += ' lenis-locked'
    if (this.isScrolling) className += ' lenis-scrolling'
    if (this.isScrolling === 'smooth') className += ' lenis-smooth'
    // if (this.isScrolling === 'native') className += ' lenis-native'
    // if (this.isSmooth) className += ' lenis-smooth'
    return className
  }

  private updateClassName() {
    this.rootElement.className = this.className
    this.emitter.emit('className change', this)
  }

  // private toggleClassName(name: string, value: boolean) {
  //   // this.rootElement.classList.toggle(name, value)
  //   this.rootElement.className = this.className
  //   this.emitter.emit('className change', this)
  // }
}
