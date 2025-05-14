import { version } from '../../../package.json'
import { Animate } from './animate'
import { Dimensions } from './dimensions'
import { Emitter } from './emitter'
import { clamp, modulo } from './maths'
import type {
  LenisEvent,
  LenisOptions,
  ScrollCallback,
  Scrolling,
  ScrollToOptions,
  UserData,
  VirtualScrollCallback,
  VirtualScrollData,
} from './types'
import { VirtualScroll } from './virtual-scroll'

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
  private _isScrolling: Scrolling = false // true when scroll is animating
  private _isStopped = false // true if user should not be able to scroll - enable/disable programmatically
  private _isLocked = false // same as isStopped but enabled/disabled when scroll reaches target
  private _preventNextNativeScrollEvent = false
  private _resetVelocityTimeout: ReturnType<typeof setTimeout> | null = null
  private __rafID: number | null = null

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
   * The last velocity of the scroll
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
    touchInertiaMultiplier = 35,
    duration, // in seconds
    easing,
    lerp = 0.1,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal
    gestureOrientation = 'vertical', // vertical, horizontal, both
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
    __experimental__naiveDimensions = false,
  }: LenisOptions = {}) {
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
      prevent,
      virtualScroll,
      overscroll,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      __experimental__naiveDimensions,
    }

    // Setup dimensions instance
    this.dimensions = new Dimensions(wrapper, content, { autoResize })

    // Setup class name
    this.updateClassName()

    // Set the initial scroll value for all scroll information
    this.targetScroll = this.animatedScroll = this.actualScroll

    // Add event listeners
    this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false)

    this.options.wrapper.addEventListener('scrollend', this.onScrollEnd, {
      capture: true,
    })

    if (this.options.anchors && this.options.wrapper === window) {
      this.options.wrapper.addEventListener(
        'click',
        this.onClick as EventListener,
        false
      )
    }

    this.options.wrapper.addEventListener(
      'pointerdown',
      this.onPointerDown as EventListener,
      false
    )

    // Setup virtual scroll instance
    this.virtualScroll = new VirtualScroll(eventsTarget as HTMLElement, {
      touchMultiplier,
      wheelMultiplier,
    })
    this.virtualScroll.on('scroll', this.onVirtualScroll)

    if (this.options.autoToggle) {
      this.rootElement.addEventListener('transitionend', this.onTransitionEnd, {
        passive: true,
      })
    }

    if (this.options.autoRaf) {
      this.__rafID = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Destroy the lenis instance, remove all event listeners and clean up the class name
   */
  destroy() {
    this.emitter.destroy()

    this.options.wrapper.removeEventListener(
      'scroll',
      this.onNativeScroll,
      false
    )

    this.options.wrapper.removeEventListener('scrollend', this.onScrollEnd, {
      capture: true,
    })

    this.options.wrapper.removeEventListener(
      'pointerdown',
      this.onPointerDown as EventListener,
      false
    )

    if (this.options.anchors && this.options.wrapper === window) {
      this.options.wrapper.removeEventListener(
        'click',
        this.onClick as EventListener,
        false
      )
    }

    this.virtualScroll.destroy()
    this.dimensions.destroy()

    this.cleanUpClassName()

    if (this.__rafID) {
      cancelAnimationFrame(this.__rafID)
    }
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
  on(event: LenisEvent, callback: any) {
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
  off(event: LenisEvent, callback: any) {
    return this.emitter.off(event, callback)
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

  private onTransitionEnd = (event: TransitionEvent) => {
    if (event.propertyName.includes('overflow')) {
      const property = this.isHorizontal ? 'overflow-x' : 'overflow-y'

      const overflow = getComputedStyle(this.rootElement)[
        property as keyof CSSStyleDeclaration
      ] as string

      if (['hidden', 'clip'].includes(overflow)) {
        this.stop()
      } else {
        this.start()
      }
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
    const anchor = path.find(
      (node) =>
        node instanceof HTMLAnchorElement &&
        (node.getAttribute('href')?.startsWith('#') ||
          node.getAttribute('href')?.startsWith('/#') ||
          node.getAttribute('href')?.startsWith('./#'))
    ) as HTMLAnchorElement | undefined
    if (anchor) {
      const id = anchor.getAttribute('href')

      if (id) {
        const options =
          typeof this.options.anchors === 'object' && this.options.anchors
            ? this.options.anchors
            : undefined

        let target: number | string = `#${id.split('#')[1]}`
        if (['#', '/#', './#', '#top', '/#top', './#top'].includes(id)) {
          target = 0
        }

        this.scrollTo(target, options)
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
    // @ts-ignore
    if (event.lenisStopPropagation) return

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
      event.preventDefault() // this will stop forwarding the event to the parent, this is problematic
      return
    }

    const isSmooth =
      (this.options.syncTouch && isTouch) ||
      (this.options.smoothWheel && isWheel)

    if (!isSmooth) {
      this.isScrolling = 'native'
      this.animate.stop()
      // @ts-ignore
      event.lenisStopPropagation = true
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
        ((this.animatedScroll > 0 && this.animatedScroll < this.limit) ||
          (this.animatedScroll === 0 && deltaY > 0) ||
          (this.animatedScroll === this.limit && deltaY < 0)))
    ) {
      // @ts-ignore
      event.lenisStopPropagation = true
      // event.stopPropagation()
    }

    event.preventDefault()

    const isSyncTouch = isTouch && this.options.syncTouch
    const isTouchEnd = isTouch && event.type === 'touchend'

    const hasTouchInertia = isTouchEnd && Math.abs(delta) > 5

    if (hasTouchInertia) {
      delta = this.velocity * this.options.touchInertiaMultiplier
    }

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(isSyncTouch
        ? {
            lerp: hasTouchInertia ? this.options.syncTouchLerp : 1,
            // immediate: !hasTouchInertia,
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
   */
  resize() {
    this.dimensions.resize()
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
    if (!this.isStopped) return
    this.reset()

    this.isStopped = false

    this.emit()
  }

  /**
   * Stop lenis scroll
   */
  stop() {
    if (this.isStopped) return
    this.reset()

    this.isStopped = true

    this.emit()
  }

  /**
   * RequestAnimationFrame for lenis
   *
   * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
   */
  raf = (time: number) => {
    const deltaTime = time - (this.time || time)
    this.time = time

    this.animate.advance(deltaTime * 0.001)

    if (this.options.autoRaf) {
      this.__rafID = requestAnimationFrame(this.raf)
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
      duration = this.options.duration,
      easing = this.options.easing,
      lerp = this.options.lerp,
      onStart,
      onComplete,
      force = false, // scroll even if stopped
      programmatic = true, // called from outside of the class
      userData,
    }: ScrollToOptions = {}
  ) {
    if ((this.isStopped || this.isLocked) && !force) return

    // keywords
    if (
      typeof target === 'string' &&
      ['top', 'left', 'start'].includes(target)
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
        node = document.querySelector(target)
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

    // @ts-ignore
    const cache = (node._lenis ??= {})

    let hasOverflowX,
      hasOverflowY,
      isScrollableX,
      isScrollableY,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight

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
      scrollWidth = cache.scrollWidth
      scrollHeight = cache.scrollHeight
      clientWidth = cache.clientWidth
      clientHeight = cache.clientHeight
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

  private set isScrolling(value: Scrolling) {
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
   * The class name applied to the wrapper element
   */
  get className() {
    let className = 'lenis'
    if (this.options.autoToggle) className += ' lenis-autoToggle'
    if (this.isStopped) className += ' lenis-stopped'
    if (this.isLocked) className += ' lenis-locked'
    if (this.isScrolling) className += ' lenis-scrolling'
    if (this.isScrolling === 'smooth') className += ' lenis-smooth'
    return className
  }

  private updateClassName() {
    this.cleanUpClassName()

    this.rootElement.className =
      `${this.rootElement.className} ${this.className}`.trim()
  }

  private cleanUpClassName() {
    this.rootElement.className = this.rootElement.className
      .replace(/lenis(-\w+)?/g, '')
      .trim()
  }
}
