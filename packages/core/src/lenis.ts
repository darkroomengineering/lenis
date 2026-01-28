import { version } from '../../../package.json'
import { Animate } from './animate'
import { Dimensions } from './dimensions'
import { Emitter } from './emitter'
import { clamp, modulo } from './maths'
import type {
  LenisEvent,
  LenisOptions,
  ScrollCallback,
  ScrollingState,
  ScrollToOptions,
  UserData,
  VirtualScrollCallback,
  VirtualScrollData,
} from './types'
import { VirtualScroll } from './virtual-scroll'

// WeakMap for DOM node caching to avoid polluting DOM nodes with custom properties
type LenisNodeCache = {
  time?: number
  computedStyle?: CSSStyleDeclaration
  hasOverflowX?: boolean
  hasOverflowY?: boolean
  isScrollableX?: boolean
  isScrollableY?: boolean
  scrollWidth?: number
  scrollHeight?: number
  clientWidth?: number
  clientHeight?: number
}
const lenisNodeCache = new WeakMap<HTMLElement, LenisNodeCache>()

// Technical explanation
// - listen to 'wheel' events
// - prevent 'wheel' event to prevent scroll
// - normalize wheel delta
// - add delta to targetScroll
// - animate scroll to targetScroll (smooth context)
// - if animation is not running, listen to 'scroll' events (native context)

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>

const defaultEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))

export class Lenis {
  private _isScrolling: ScrollingState = false // true when scroll is animating
  private _isStopped = false // true if user should not be able to scroll - enable/disable programmatically
  private _isLocked = false // same as isStopped but enabled/disabled when scroll reaches target
  private _isDestroyed = false // true after destroy() is called
  private _lockedRegions = new Set<string>() // regions that are locked
  private _preventNextNativeScrollEvent = false
  private _resetVelocityTimeout: ReturnType<typeof setTimeout> | null = null
  private _rafId: number | null = null
  // WeakSet to track processed events instead of polluting event objects with custom properties
  private processedEvents = new WeakSet<Event>()
  private reducedMotionMediaQuery?: MediaQueryList
  private originalLerp?: number
  private visibilityObserver?: IntersectionObserver
  // Cache for naiveDimensions limit calculation
  private _cachedLimit: number | null = null
  private _limitCacheTime = 0

  /**
   * Whether or not the user is touching the screen
   */
  isTouching?: boolean
  /**
   * The time in ms since the lenis instance was created
   */
  time = 0
  /**
   * User data that will be forwarded through the scroll event
   *
   * @example
   * lenis.scrollTo(100, {
   *   userData: {
   *     foo: 'bar'
   *   }
   * })
   */
  userData: UserData = {}
  /**
   * The last velocity of the scroll (before the current frame)
   * Useful for detecting velocity changes and implementing inertia-based effects
   */
  lastVelocity = 0
  /**
   * The current velocity of the scroll
   */
  velocity = 0
  /**
   * The direction of the scroll
   */
  direction: 1 | -1 | 0 = 0
  /**
   * The options passed to the lenis instance
   */
  options: OptionalPick<
    Required<LenisOptions>,
    'duration' | 'easing' | 'prevent' | 'virtualScroll'
  >
  /**
   * The target scroll value
   */
  targetScroll: number
  /**
   * The animated scroll value
   */
  animatedScroll: number

  // These are instanciated here as they don't need information from the options
  private readonly animate = new Animate()
  private readonly emitter = new Emitter()
  // These are instanciated in the constructor as they need information from the options
  readonly dimensions: Dimensions // This is not private because it's used in the Snap class
  private readonly virtualScroll: VirtualScroll

  constructor({
    wrapper = window,
    content = document.documentElement,
    eventsTarget = wrapper,
    smoothWheel = true,
    syncTouch = false,
    syncTouchLerp = 0.075,
    touchInertiaExponent = 1.7,
    duration, // in seconds
    easing,
    lerp = 0.1,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal
    gestureOrientation = orientation === 'horizontal' ? 'both' : 'vertical', // vertical, horizontal, both
    touchMultiplier = 1,
    wheelMultiplier = 1,
    autoResize = true,
    prevent,
    virtualScroll,
    overscroll = true,
    autoRaf = false,
    anchors = false,
    autoToggle = false, // https://caniuse.com/?search=transition-behavior
    allowNestedScroll = false,
    // @ts-ignore: this will be deprecated in the future
    __experimental__naiveDimensions = false,
    naiveDimensions = __experimental__naiveDimensions,
    stopInertiaOnNavigate = false,
    ignoreReducedMotion = false,
    pauseWhenHidden = false,
  }: LenisOptions = {}) {
    // Deprecation warnings
    if (__experimental__naiveDimensions !== false) {
      console.warn('[Lenis] __experimental__naiveDimensions is deprecated, use naiveDimensions instead')
    }

    // Set version
    window.lenisVersion = version

    // Check if wrapper is <html>, fallback to window
    if (!wrapper || wrapper === document.documentElement) {
      wrapper = window
    }

    // flip to easing/time based animation if at least one of them is provided
    if (typeof duration === 'number' && typeof easing !== 'function') {
      easing = defaultEasing
    } else if (typeof easing === 'function' && typeof duration !== 'number') {
      duration = 1
    }

    // Setup options
    this.options = {
      wrapper,
      content,
      eventsTarget,
      smoothWheel,
      syncTouch,
      syncTouchLerp,
      touchInertiaExponent,
      duration,
      easing,
      lerp,
      infinite,
      gestureOrientation,
      orientation,
      touchMultiplier,
      wheelMultiplier,
      autoResize,
      prevent,
      virtualScroll,
      overscroll,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      naiveDimensions,
      stopInertiaOnNavigate,
      ignoreReducedMotion,
      pauseWhenHidden,
    }

    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotionMediaQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      )

      // Store original lerp for potential restoration
      this.originalLerp = lerp

      if (this.reducedMotionMediaQuery.matches && !ignoreReducedMotion) {
        this.options.lerp = 1
        this.options.duration = undefined
      }

      this.reducedMotionMediaQuery.addEventListener(
        'change',
        this.onReducedMotionChange,
        { passive: true }
      )
    }

    // Setup dimensions instance
    this.dimensions = new Dimensions(wrapper, content, { autoResize })

    // Setup class name
    this.updateClassName()

    // Set the initial scroll value for all scroll information
    this.targetScroll = this.animatedScroll = this.actualScroll

    // Add event listeners
    this.options.wrapper.addEventListener('scroll', this.onNativeScroll, {
      passive: true,
    })

    this.options.wrapper.addEventListener('scrollend', this.onScrollEnd, {
      capture: true,
    })

    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener(
        'click',
        this.onClick as EventListener,
        false
      )
    }

    this.options.wrapper.addEventListener(
      'pointerdown',
      this.onPointerDown as EventListener,
      { passive: true }
    )

    // Setup virtual scroll instance
    this.virtualScroll = new VirtualScroll(eventsTarget as HTMLElement, {
      touchMultiplier,
      wheelMultiplier,
    })
    this.virtualScroll.on('scroll', this.onVirtualScroll)

    if (this.options.autoToggle) {
      this.checkOverflow()
      this.rootElement.addEventListener('transitionend', this.onTransitionEnd, {
        passive: true,
      })
    }

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }

    // Setup visibility observer for pauseWhenHidden
    if (this.options.pauseWhenHidden) {
      this.visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            this.internalStart()
          } else {
            this.internalStop()
          }
        },
        { threshold: 0 }
      )
      this.visibilityObserver.observe(
        this.options.wrapper === window
          ? document.documentElement
          : (this.rootElement as Element)
      )
    }
  }

  /**
   * Destroy the lenis instance, remove all event listeners and clean up the class name
   */
  destroy() {
    if (this._isDestroyed) return
    this._isDestroyed = true

    this.emitter.destroy()

    this.options.wrapper.removeEventListener('scroll', this.onNativeScroll)

    this.options.wrapper.removeEventListener('scrollend', this.onScrollEnd, {
      capture: true,
    })

    this.options.wrapper.removeEventListener(
      'pointerdown',
      this.onPointerDown as EventListener
    )

    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.removeEventListener(
        'click',
        this.onClick as EventListener,
        false
      )
    }

    this.virtualScroll.destroy()
    this.dimensions.destroy()

    this.cleanUpClassName()

    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }

    this.reducedMotionMediaQuery?.removeEventListener(
      'change',
      this.onReducedMotionChange
    )

    this.visibilityObserver?.disconnect()
  }

  /**
   * Add an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  on(event: 'scroll', callback: ScrollCallback): () => void
  on(event: 'virtual-scroll', callback: VirtualScrollCallback): () => void
  on(event: LenisEvent, callback: ScrollCallback | VirtualScrollCallback) {
    return this.emitter.on(event, callback)
  }

  /**
   * Remove an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   */
  off(event: 'scroll', callback: ScrollCallback): void
  off(event: 'virtual-scroll', callback: VirtualScrollCallback): void
  off(event: LenisEvent, callback: ScrollCallback | VirtualScrollCallback) {
    return this.emitter.off(event, callback)
  }

  private onReducedMotionChange = (event: MediaQueryListEvent) => {
    if (!this.options.ignoreReducedMotion) {
      if (event.matches) {
        this.options.lerp = 1
        this.options.duration = undefined
      } else {
        // Restore original lerp or use sensible default
        this.options.lerp = this.originalLerp ?? 0.1
      }
    }
  }

  private onScrollEnd = (e: Event | CustomEvent) => {
    if (!(e instanceof CustomEvent)) {
      if (this.isScrolling === 'smooth' || this.isScrolling === false) {
        e.stopPropagation()
      }
    }
  }

  private dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(
      new CustomEvent('scrollend', {
        bubbles: this.options.wrapper === window,
        // cancelable: false,
        detail: {
          lenisScrollEnd: true,
        },
      })
    )
  }

  get overflow() {
    const property = this.isHorizontal ? 'overflow-x' : 'overflow-y'
    return getComputedStyle(this.rootElement)[
      property as keyof CSSStyleDeclaration
    ] as string
  }

  private checkOverflow() {
    if (['hidden', 'clip'].includes(this.overflow)) {
      this.internalStop()
    } else {
      this.internalStart()
    }
  }

  private onTransitionEnd = (event: TransitionEvent) => {
    if (event.propertyName.includes('overflow')) {
      this.checkOverflow()
    }
  }

  private setScroll(scroll: number) {
    // behavior: 'instant' bypasses the scroll-behavior CSS property

    if (this.isHorizontal) {
      this.options.wrapper.scrollTo({ left: scroll, behavior: 'instant' })
    } else {
      this.options.wrapper.scrollTo({ top: scroll, behavior: 'instant' })
    }
  }

  private onClick = (event: PointerEvent | MouseEvent) => {
    const path = event.composedPath()

    // filter anchor elements (elements with a valid href attribute)
    const anchorElements = path.filter(
      (node) => node instanceof HTMLAnchorElement && node.getAttribute('href')
    ) as HTMLAnchorElement[]

    if (this.options.anchors) {
      const anchor = anchorElements.find((node) =>
        node.getAttribute('href')?.includes('#')
      )
      if (anchor) {
        const href = anchor.getAttribute('href')

        if (href) {
          const options =
            typeof this.options.anchors === 'object' && this.options.anchors
              ? this.options.anchors
              : undefined

          const target = `#${href.split('#')[1]}`

          this.scrollTo(target, options)
        }
      }
    }

    if (this.options.stopInertiaOnNavigate) {
      const internalLink = anchorElements.find(
        (node) => node.host === window.location.host
      )

      if (internalLink) {
        this.reset()
      }
    }
  }

  private onPointerDown = (event: PointerEvent | MouseEvent) => {
    if (event.button === 1) {
      this.reset()
    }
  }

  private onVirtualScroll = (data: VirtualScrollData) => {
    if (
      typeof this.options.virtualScroll === 'function' &&
      this.options.virtualScroll(data) === false
    )
      return

    const { deltaX, deltaY, event } = data

    this.emitter.emit('virtual-scroll', { deltaX, deltaY, event })

    // keep zoom feature
    if (event.ctrlKey) return
    // Check if event was already processed (using WeakSet instead of polluting event object)
    if (this.processedEvents.has(event)) return

    const isTouch = event.type.includes('touch')
    const isWheel = event.type.includes('wheel')

    this.isTouching = event.type === 'touchstart' || event.type === 'touchmove'
    // if (event.type === 'touchend') {
    //   console.log('touchend', this.scroll)
    //   // this.lastVelocity = this.velocity
    //   // this.velocity = 0
    //   // this.isScrolling = false
    //   this.emit({ type: 'touchend' })
    //   // alert('touchend')
    //   return
    // }

    const isClickOrTap = deltaX === 0 && deltaY === 0

    const isTapToStop =
      this.options.syncTouch &&
      isTouch &&
      event.type === 'touchstart' &&
      isClickOrTap &&
      !this.isStopped &&
      !this.isLocked

    if (isTapToStop) {
      this.reset()
      return
    }

    // const isPullToRefresh =
    //   this.options.gestureOrientation === 'vertical' &&
    //   this.scroll === 0 &&
    //   !this.options.infinite &&
    //   deltaY <= 5 // touch pull to refresh, not reliable yet

    const isUnknownGesture =
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0)

    if (isClickOrTap || isUnknownGesture) {
      // console.log('prevent')
      return
    }

    // catch if scrolling on nested scroll elements
    let composedPath = event.composedPath()
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)) // remove parents elements

    const prevent = this.options.prevent

    if (
      !!composedPath.find(
        (node) =>
          node instanceof HTMLElement &&
          ((typeof prevent === 'function' && prevent?.(node)) ||
            node.hasAttribute?.('data-lenis-prevent') ||
            (isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
            (isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
            (this.options.allowNestedScroll &&
              this.checkNestedScroll(node, { deltaX, deltaY })))
      )
    )
      return

    if (this.isStopped || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault() // this will stop forwarding the event to the parent, this is problematic
      }
      return
    }

    const isSmooth =
      (this.options.syncTouch && isTouch) ||
      (this.options.smoothWheel && isWheel)

    if (!isSmooth) {
      this.isScrolling = 'native'
      this.animate.stop()
      this.processedEvents.add(event)
      return
    }

    let delta = deltaY
    if (this.options.gestureOrientation === 'both') {
      delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX
    } else if (this.options.gestureOrientation === 'horizontal') {
      delta = deltaX
    }

    if (
      !this.options.overscroll ||
      this.options.infinite ||
      (this.options.wrapper !== window &&
        this.limit > 0 &&
        ((this.animatedScroll > 0 && this.animatedScroll < this.limit) ||
          (this.animatedScroll === 0 && deltaY > 0) ||
          (this.animatedScroll === this.limit && deltaY < 0)))
    ) {
      this.processedEvents.add(event)
      // event.stopPropagation()
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    const isSyncTouch = isTouch && this.options.syncTouch
    const isTouchEnd = isTouch && event.type === 'touchend'

    const hasTouchInertia = isTouchEnd

    if (hasTouchInertia) {
      // delta = this.velocity * this.options.touchInertiaMultiplier
      delta =
        Math.sign(this.velocity) *
        Math.pow(Math.abs(this.velocity), this.options.touchInertiaExponent)
    }

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(isSyncTouch
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

  /**
   * Force lenis to recalculate the dimensions
   *
   * Call this method when the content size changes (e.g., after dynamically loading content)
   * or when the wrapper size changes (e.g., after a window resize if autoResize is disabled).
   * This will invalidate the cached limit and synchronize the scroll position.
   */
  resize() {
    this.dimensions.resize()
    this.invalidateLimitCache()
    this.animatedScroll = this.targetScroll = this.actualScroll
    this.emit()
  }

  private emit() {
    this.emitter.emit('scroll', this)
  }

  private onNativeScroll = () => {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout)
      this._resetVelocityTimeout = null
    }

    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false
      return
    }

    if (this.isScrolling === false || this.isScrolling === 'native') {
      const lastScroll = this.animatedScroll
      this.animatedScroll = this.targetScroll = this.actualScroll
      this.lastVelocity = this.velocity
      this.velocity = this.animatedScroll - lastScroll
      this.direction = Math.sign(
        this.animatedScroll - lastScroll
      ) as Lenis['direction']

      if (!this.isStopped) {
        this.isScrolling = 'native'
      }

      this.emit()

      if (this.velocity !== 0) {
        this._resetVelocityTimeout = setTimeout(() => {
          this.lastVelocity = this.velocity
          this.velocity = 0
          this.isScrolling = false
          this.emit()
        }, 400)
      }
    }
  }

  private reset() {
    this.isLocked = false
    this.isScrolling = false
    this.animatedScroll = this.targetScroll = this.actualScroll
    this.lastVelocity = this.velocity = 0
    this.animate.stop()
  }

  /**
   * Start lenis scroll after it has been stopped
   */
  start() {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call start() on a destroyed instance')
      return
    }
    if (!this.isStopped) return

    if (this.options.autoToggle) {
      this.rootElement.style.removeProperty('overflow')
      return
    }

    this.internalStart()
  }

  private internalStart() {
    if (!this.isStopped) return

    this.reset()
    this.isStopped = false
    this.virtualScroll.start()
    this.emit()
  }

  /**
   * Stop lenis scroll
   */
  stop() {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call stop() on a destroyed instance')
      return
    }
    if (this.isStopped) return

    if (this.options.autoToggle) {
      this.rootElement.style.setProperty('overflow', 'clip')
      return
    }

    this.internalStop()
  }

  private internalStop() {
    if (this.isStopped) return

    this.reset()
    this.isStopped = true
    this.virtualScroll.stop()
    this.emit()
  }

  /**
   * RequestAnimationFrame for lenis
   *
   * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
   */
  raf = (time: number) => {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call raf() on a destroyed instance')
      return
    }

    const deltaTime = time - (this.time || time)
    this.time = time

    this.animate.advance(deltaTime * 0.001)

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Scroll to a target value
   *
   * @param target The target value to scroll to
   * @param options The options for the scroll
   *
   * @example
   * lenis.scrollTo(100, {
   *   offset: 100,
   *   duration: 1,
   *   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
   *   lerp: 0.1,
   *   onStart: () => {
   *     console.log('onStart')
   *   },
   *   onComplete: () => {
   *     console.log('onComplete')
   *   },
   * })
   */
  scrollTo(
    target: number | string | HTMLElement,
    {
      offset = 0,
      immediate = false,
      lock = false,
      programmatic = true, // called from outside of the class
      lerp = programmatic ? this.options.lerp : undefined,
      duration = programmatic ? this.options.duration : undefined,
      easing = programmatic ? this.options.easing : undefined,
      onStart,
      onComplete,
      force = false, // scroll even if stopped
      userData,
    }: ScrollToOptions = {}
  ) {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call scrollTo() on a destroyed instance')
      return
    }
    if ((this.isStopped || this.isLocked) && !force) return

    // keywords
    if (
      typeof target === 'string' &&
      ['top', 'left', 'start', '#'].includes(target)
    ) {
      target = 0
    } else if (
      typeof target === 'string' &&
      ['bottom', 'right', 'end'].includes(target)
    ) {
      target = this.limit
    } else {
      let node

      if (typeof target === 'string') {
        // CSS selector
        // Only warn for selectors that could be injection vectors (contain special chars beyond # . and alphanumeric)
        if (/[[\]()=*^$|~]/.test(target)) {
          console.warn(
            'Lenis: CSS selector contains special characters. Ensure this is not user-controlled input to avoid potential security issues.'
          )
        }
        node = document.querySelector(target)

        if (!node) {
          if (target === '#top') {
            target = 0
          } else {
            console.warn('Lenis: Target not found', target)
          }
        }
      } else if (target instanceof HTMLElement && target?.nodeType) {
        // Node element
        node = target
      }

      if (node) {
        if (this.options.wrapper !== window) {
          // nested scroll offset correction
          const wrapperRect = this.rootElement.getBoundingClientRect()
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

        const distance = target - this.animatedScroll

        if (distance > this.limit / 2) {
          target = target - this.limit
        } else if (distance < -this.limit / 2) {
          target = target + this.limit
        }
      }
    } else {
      target = clamp(0, target, this.limit)
    }

    if (target === this.targetScroll) {
      onStart?.(this)
      onComplete?.(this)
      return
    }

    this.userData = userData ?? {}

    if (immediate) {
      this.animatedScroll = this.targetScroll = target
      this.setScroll(this.scroll)
      this.reset()
      this.preventNextNativeScrollEvent()
      this.emit()
      onComplete?.(this)
      this.userData = {}

      requestAnimationFrame(() => {
        this.dispatchScrollendEvent()
      })
      return
    }

    if (!programmatic) {
      this.targetScroll = target
    }

    // flip to easing/time based animation if at least one of them is provided
    if (typeof duration === 'number' && typeof easing !== 'function') {
      easing = defaultEasing
    } else if (typeof easing === 'function' && typeof duration !== 'number') {
      duration = 1
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

        // updated
        this.lastVelocity = this.velocity
        this.velocity = value - this.animatedScroll
        this.direction = Math.sign(this.velocity) as Lenis['direction']

        this.animatedScroll = value
        this.setScroll(this.scroll)

        if (programmatic) {
          // wheel during programmatic should stop it
          this.targetScroll = value
        }

        if (!completed) this.emit()

        if (completed) {
          this.reset()
          this.emit()
          onComplete?.(this)
          this.userData = {}

          requestAnimationFrame(() => {
            this.dispatchScrollendEvent()
          })

          // avoid emitting event twice
          this.preventNextNativeScrollEvent()
        }
      },
    })
  }

  /**
   * Scroll by a relative amount
   * @param delta - The amount to scroll by (positive = down/right, negative = up/left)
   * @param options - The options for the scroll
   */
  scrollBy(delta: number, options?: ScrollToOptions) {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call scrollBy() on a destroyed instance')
      return
    }
    return this.scrollTo(this.targetScroll + delta, options)
  }

  /**
   * Scroll to a percentage of the total scroll distance
   * @param progress - Value between 0 and 1
   * @param options - The options for the scroll
   */
  scrollToProgress(progress: number, options?: ScrollToOptions) {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call scrollToProgress() on a destroyed instance')
      return
    }
    const target = clamp(0, progress, 1) * this.limit
    return this.scrollTo(target, options)
  }

  /**
   * Scroll to the top (or left for horizontal)
   * @param options - The options for the scroll
   */
  scrollToTop(options?: ScrollToOptions) {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call scrollToTop() on a destroyed instance')
      return
    }
    return this.scrollTo(0, options)
  }

  /**
   * Scroll to the bottom (or right for horizontal)
   * @param options - The options for the scroll
   */
  scrollToBottom(options?: ScrollToOptions) {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call scrollToBottom() on a destroyed instance')
      return
    }
    return this.scrollTo(this.limit, options)
  }

  /**
   * Check if scrolled to top (within threshold)
   * @param threshold - The threshold in pixels (default: 0)
   */
  isAtTop(threshold = 0): boolean {
    return this.scroll <= threshold
  }

  /**
   * Check if scrolled to bottom (within threshold)
   * @param threshold - The threshold in pixels (default: 0)
   */
  isAtBottom(threshold = 0): boolean {
    return this.scroll >= this.limit - threshold
  }

  private preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true

    requestAnimationFrame(() => {
      this._preventNextNativeScrollEvent = false
    })
  }

  private checkNestedScroll(
    node: HTMLElement,
    { deltaX, deltaY }: { deltaX: number; deltaY: number }
  ) {
    const time = Date.now()

    let cache = lenisNodeCache.get(node)
    if (!cache) {
      cache = {}
      lenisNodeCache.set(node, cache)
    }

    let hasOverflowX: boolean | undefined,
      hasOverflowY: boolean | undefined,
      isScrollableX: boolean | undefined,
      isScrollableY: boolean | undefined,
      scrollWidth: number = 0,
      scrollHeight: number = 0,
      clientWidth: number = 0,
      clientHeight: number = 0

    const gestureOrientation = this.options.gestureOrientation

    if (time - (cache.time ?? 0) > 2000) {
      cache.time = Date.now()

      const computedStyle = window.getComputedStyle(node)
      cache.computedStyle = computedStyle

      const overflowXString = computedStyle.overflowX
      const overflowYString = computedStyle.overflowY

      hasOverflowX = ['auto', 'overlay', 'scroll'].includes(overflowXString)
      hasOverflowY = ['auto', 'overlay', 'scroll'].includes(overflowYString)
      cache.hasOverflowX = hasOverflowX
      cache.hasOverflowY = hasOverflowY

      if (!hasOverflowX && !hasOverflowY) return false // if no overflow, it's not scrollable no matter what, early return saves some computations
      if (gestureOrientation === 'vertical' && !hasOverflowY) return false
      if (gestureOrientation === 'horizontal' && !hasOverflowX) return false

      scrollWidth = node.scrollWidth
      scrollHeight = node.scrollHeight

      clientWidth = node.clientWidth
      clientHeight = node.clientHeight

      isScrollableX = scrollWidth > clientWidth
      isScrollableY = scrollHeight > clientHeight

      cache.isScrollableX = isScrollableX
      cache.isScrollableY = isScrollableY
      cache.scrollWidth = scrollWidth
      cache.scrollHeight = scrollHeight
      cache.clientWidth = clientWidth
      cache.clientHeight = clientHeight
    } else {
      isScrollableX = cache.isScrollableX
      isScrollableY = cache.isScrollableY
      hasOverflowX = cache.hasOverflowX
      hasOverflowY = cache.hasOverflowY
      scrollWidth = cache.scrollWidth ?? 0
      scrollHeight = cache.scrollHeight ?? 0
      clientWidth = cache.clientWidth ?? 0
      clientHeight = cache.clientHeight ?? 0
    }

    if (
      (!hasOverflowX && !hasOverflowY) ||
      (!isScrollableX && !isScrollableY)
    ) {
      return false
    }

    if (gestureOrientation === 'vertical' && (!hasOverflowY || !isScrollableY))
      return false

    if (
      gestureOrientation === 'horizontal' &&
      (!hasOverflowX || !isScrollableX)
    )
      return false

    let orientation: 'x' | 'y' | undefined

    if (gestureOrientation === 'horizontal') {
      orientation = 'x'
    } else if (gestureOrientation === 'vertical') {
      orientation = 'y'
    } else {
      const isScrollingX = deltaX !== 0
      const isScrollingY = deltaY !== 0

      if (isScrollingX && hasOverflowX && isScrollableX) {
        orientation = 'x'
      }

      if (isScrollingY && hasOverflowY && isScrollableY) {
        orientation = 'y'
      }
    }

    if (!orientation) return false

    let scroll, maxScroll, delta, hasOverflow, isScrollable

    if (orientation === 'x') {
      scroll = node.scrollLeft
      maxScroll = scrollWidth - clientWidth
      delta = deltaX

      hasOverflow = hasOverflowX
      isScrollable = isScrollableX
    } else if (orientation === 'y') {
      scroll = node.scrollTop
      maxScroll = scrollHeight - clientHeight
      delta = deltaY

      hasOverflow = hasOverflowY
      isScrollable = isScrollableY
    } else {
      return false
    }

    const willScroll = delta > 0 ? scroll < maxScroll : scroll > 0

    return willScroll && hasOverflow && isScrollable
  }

  /**
   * The root element on which lenis is instanced
   */
  get rootElement() {
    return (
      this.options.wrapper === window
        ? document.documentElement
        : this.options.wrapper
    ) as HTMLElement
  }

  /**
   * The limit which is the maximum scroll value
   */
  get limit() {
    if (this.options.naiveDimensions) {
      const now = performance.now()
      // Cache limit for 100ms to avoid repeated DOM reads
      if (this._cachedLimit === null || now - this._limitCacheTime > 100) {
        this._cachedLimit = this.isHorizontal
          ? this.rootElement.scrollWidth - this.rootElement.clientWidth
          : this.rootElement.scrollHeight - this.rootElement.clientHeight
        this._limitCacheTime = now
      }
      return this._cachedLimit
    } else {
      return this.dimensions.limit[this.isHorizontal ? 'x' : 'y']
    }
  }

  /**
   * Invalidate the cached limit (call after resize)
   */
  private invalidateLimitCache() {
    this._cachedLimit = null
  }

  /**
   * Whether or not the scroll is horizontal
   */
  get isHorizontal() {
    return this.options.orientation === 'horizontal'
  }

  /**
   * The actual scroll value
   */
  get actualScroll() {
    // value browser takes into account
    // it has to be this way because of DOCTYPE declaration
    const wrapper = this.options.wrapper as Window | HTMLElement

    return this.isHorizontal
      ? (wrapper as Window).scrollX ?? (wrapper as HTMLElement).scrollLeft
      : (wrapper as Window).scrollY ?? (wrapper as HTMLElement).scrollTop
  }

  /**
   * The current scroll value
   */
  get scroll() {
    return this.options.infinite
      ? modulo(this.animatedScroll, this.limit)
      : this.animatedScroll
  }

  /**
   * The progress of the scroll relative to the limit
   */
  get progress() {
    // avoid progress to be NaN
    return this.limit === 0 ? 1 : this.scroll / this.limit
  }

  /**
   * Current scroll state
   */
  get isScrolling() {
    return this._isScrolling
  }

  private set isScrolling(value: ScrollingState) {
    if (this._isScrolling !== value) {
      this._isScrolling = value
      this.updateClassName()
    }
  }

  /**
   * Check if lenis is stopped
   */
  get isStopped() {
    return this._isStopped
  }

  private set isStopped(value: boolean) {
    if (this._isStopped !== value) {
      this._isStopped = value
      this.updateClassName()
    }
  }

  /**
   * Check if lenis is locked
   */
  get isLocked() {
    return this._isLocked
  }

  private set isLocked(value: boolean) {
    if (this._isLocked !== value) {
      this._isLocked = value
      this.updateClassName()
    }
  }

  /**
   * Check if lenis is smooth scrolling
   */
  get isSmooth() {
    return this.isScrolling === 'smooth'
  }

  /**
   * Check if lenis instance has been destroyed
   */
  get isDestroyed() {
    return this._isDestroyed
  }

  /**
   * Lock scrolling for a specific region
   * Multiple regions can be locked simultaneously
   * @param region - The region identifier (default: 'default')
   */
  lock(region = 'default') {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call lock() on a destroyed instance')
      return
    }
    this._lockedRegions.add(region)
    this._isLocked = true
  }

  /**
   * Unlock scrolling for a specific region
   * Only fully unlocks when all regions are unlocked
   * @param region - The region identifier (default: 'default')
   */
  unlock(region = 'default') {
    if (this._isDestroyed) {
      console.warn('[Lenis] Cannot call unlock() on a destroyed instance')
      return
    }
    this._lockedRegions.delete(region)
    if (this._lockedRegions.size === 0) {
      this._isLocked = false
    }
  }

  /**
   * Check if a specific region is locked
   * @param region - The region identifier (default: 'default')
   */
  isRegionLocked(region = 'default'): boolean {
    return this._lockedRegions.has(region)
  }

  private updateClassName() {
    const cl = this.rootElement.classList
    cl.add('lenis')
    cl.toggle('lenis-autoToggle', !!this.options.autoToggle)
    cl.toggle('lenis-stopped', this.isStopped)
    cl.toggle('lenis-locked', this.isLocked)
    cl.toggle('lenis-scrolling', !!this.isScrolling)
    cl.toggle('lenis-smooth', this.isScrolling === 'smooth')
  }

  private cleanUpClassName() {
    this.rootElement.classList.remove(
      'lenis',
      'lenis-autoToggle',
      'lenis-stopped',
      'lenis-locked',
      'lenis-scrolling',
      'lenis-smooth'
    )
  }
}
