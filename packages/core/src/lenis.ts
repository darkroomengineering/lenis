import { version } from '../../../package.json'
import { Animate } from './animate'
import { Dimensions } from './dimensions'
import { Emitter } from './emitter'
import { GesturesHandler } from './gestures-handler'
import { clamp, modulo } from './maths'
import type {
  GestureCallback,
  GestureData,
  LenisEvent,
  LenisOptions,
  ScrollCallback,
  Scrolling,
  ScrollToOptions,
  UserData,
} from './types'
import { isScrollableElement } from './utils'

// Technical explanation
// - listen to 'wheel' events
// - prevent 'wheel' event to prevent scroll
// - normalize wheel delta
// - add delta to targetScroll
// - animate scroll to targetScroll (smooth context)
// - if animation is not running, listen to 'scroll' events (native context)

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>

const defaultEasing = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

export class Lenis {
  private _isScrolling: Scrolling = false // true when scroll is animating
  private _isStopped = false // true if user should not be able to scroll - enable/disable programmatically
  private _isLocked = false // same as isStopped but enabled/disabled when scroll reaches target
  private _preventNextNativeScrollEvent = false
  private _resetVelocityTimeout: ReturnType<typeof setTimeout> | null = null
  private _rafId: number | null = null

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
    'duration' | 'easing' | 'onGesture' | 'content' | 'dimensions'
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
  private readonly gesturesHandler: GesturesHandler
  private readonly isIOS: boolean

  constructor({
    wrapper = window,
    content,
    eventsTarget,
    wheel,
    touch,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal
    gestureOrientation = orientation === 'horizontal' ? 'both' : 'vertical', // vertical, horizontal, both
    onGesture,
    overscroll = true,
    autoRaf = true,
    anchors = true,
    autoToggle = true, // https://caniuse.com/?search=transition-behavior
    allowNestedScroll = true,
    dimensions,
    stopInertiaOnNavigate = true,
  }: LenisOptions = {}) {
    // Set version (deprecated)
    window.lenisVersion = version

    if (!window.lenis) {
      window.lenis = {}
    }

    window.lenis.version = version

    if (orientation === 'horizontal') {
      window.lenis.horizontal = true
    }

    if (touch?.smooth === true) {
      window.lenis.touch = true
    }

    // Check if wrapper is <html>, fallback to window
    if (!wrapper || wrapper === document.documentElement) {
      wrapper = window
    }

    // if (wrapper === window) {
    //   content = document.documentElement
    // }

    eventsTarget ??= wrapper

    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)

    // Setup options
    this.options = {
      wrapper,
      content,
      eventsTarget,
      wheel: {
        smooth: true,
        lerp: 0.1,
        multiplier: 1,
        ...wheel, // overwrite default values
      },
      touch: {
        smooth: false,
        lerp: 0.1,
        multiplier: 1,
        inertia: 2,
        ...(this.isIOS
          ? (touch?.ios ?? {
              inertia: 1.7,
              lerp: 0.05,
            })
          : touch), // overwrite default values if iOS
      },
      infinite,
      gestureOrientation,
      orientation,
      onGesture,
      overscroll,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      dimensions,
      stopInertiaOnNavigate,
    }

    // set default duration and easing if not provided
    if (
      this.options.wheel?.duration !== undefined ||
      this.options.wheel?.easing !== undefined
    ) {
      this.options.wheel.duration ??= 1
      this.options.wheel.easing ??= defaultEasing
    }

    // set default duration and easing if not provided
    if (
      this.options.touch?.duration !== undefined ||
      this.options.touch?.easing !== undefined
    ) {
      this.options.touch.duration ??= 1
      this.options.touch.easing ??= defaultEasing
    }

    this.dimensions = new Dimensions(
      this.rootElement,
      this.options.content,
      this.options.dimensions
    )

    // Setup class name
    this.updateClassName()

    // Set the initial scroll value for all scroll information
    this.targetScroll = this.animatedScroll = this.actualScroll

    // Add event listeners
    this.options.wrapper.addEventListener('scroll', this.onNativeScroll)

    this.options.wrapper.addEventListener('scrollend', this.onScrollEnd, {
      capture: true,
    })

    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener(
        'click',
        this.onClick as EventListener
      )
    }

    this.options.wrapper.addEventListener(
      'pointerdown',
      this.onPointerDown as EventListener
    )

    // Setup virtual scroll instance
    this.gesturesHandler = new GesturesHandler(eventsTarget as HTMLElement)
    this.gesturesHandler.on('gesture', this.onGesture)

    if (this.options.autoToggle) {
      this.checkOverflow()
      this.rootElement.addEventListener('transitionend', this.onTransitionEnd)
    }

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Destroy the lenis instance, remove all event listeners and clean up the class name
   */
  destroy() {
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
        this.onClick as EventListener
      )
    }

    // this.virtualScroll.destroy()
    this.gesturesHandler.destroy()
    this.dimensions.destroy()

    this.cleanUpClassName()

    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
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
  on(event: 'gesture', callback: GestureCallback): () => void
  on(event: LenisEvent, callback: ScrollCallback | GestureCallback) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
  }

  /**
   * Remove an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   */
  off(event: 'scroll', callback: ScrollCallback): void
  off(event: 'gesture', callback: GestureCallback): void
  off(event: LenisEvent, callback: ScrollCallback | GestureCallback) {
    return this.emitter.off(event, callback as (...args: unknown[]) => void)
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
    if (
      event.propertyName?.includes('overflow') &&
      event.target === this.rootElement
    ) {
      this.checkOverflow()
    }
  }

  private setScroll(scroll: number) {
    // behavior: 'instant' bypasses the scroll-behavior CSS property

    if (this.isHorizontal) {
      this.options.wrapper.scrollTo({
        left: scroll,
        behavior: 'instant',
      })
    } else {
      this.options.wrapper.scrollTo({
        top: scroll,
        behavior: 'instant',
      })
    }
  }

  private onClick = (event: PointerEvent | MouseEvent) => {
    const path = event.composedPath()

    // filter anchor elements (elements with a valid href attribute)
    const linkElements = path.filter(
      (node) => node instanceof HTMLAnchorElement && node.href
    ) as HTMLAnchorElement[]
    const linkElementsUrls = linkElements.map(
      (element) => new URL(element.href)
    )

    const currentUrl = new URL(window.location.href)

    if (this.options.anchors) {
      const anchorElementUrl = linkElementsUrls.find(
        (targetUrl) =>
          currentUrl.host === targetUrl.host &&
          currentUrl.pathname === targetUrl.pathname &&
          targetUrl.hash
      )

      if (anchorElementUrl) {
        const options =
          typeof this.options.anchors === 'object' && this.options.anchors
            ? this.options.anchors
            : undefined

        const target = `#${anchorElementUrl.hash.split('#')[1]}`

        this.scrollTo(target, options)
        return
      }
    }

    if (this.options.stopInertiaOnNavigate) {
      const hasPageLinkElementUrl = linkElementsUrls.some(
        (targetUrl) =>
          currentUrl.host === targetUrl.host &&
          currentUrl.pathname !== targetUrl.pathname
      )

      if (hasPageLinkElementUrl) {
        this.reset()
        return
      }
    }
  }

  private onPointerDown = (event: PointerEvent | MouseEvent) => {
    if (event.button === 1) {
      this.reset()
    }
  }

  private onGesture = (_data: GestureData) => {
    // return = false -> stop execution
    // return modified data -> modify the data and continue execution
    const data = this.options.onGesture?.(_data, this) ?? _data

    if (data === false) return

    let { deltaX, deltaY, event, type } = data

    this.emitter.emit('gesture', { deltaX, deltaY, event, type })

    // keep zoom feature
    if (event.ctrlKey) return
    // @ts-expect-error
    if (event.lenisStopPropagation) return

    const isTouch = type === 'touch'
    const isWheel = type === 'wheel'

    if (isTouch) {
      deltaX *= this.options.touch.multiplier!
      deltaY *= this.options.touch.multiplier!
    } else if (isWheel) {
      deltaX *= this.options.wheel.multiplier!
      deltaY *= this.options.wheel.multiplier!
    }

    this.isTouching = event.type === 'touchstart' || event.type === 'touchmove'

    const isClickOrTap = deltaX === 0 && deltaY === 0

    const isTapToStop =
      this.options.touch.smooth &&
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

    // most likely a touchpad gesture, this keep prev/next page navigation working
    const isUnknownGesture =
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0)

    if (isClickOrTap || isUnknownGesture) {
      return
    }

    // catch if scrolling on nested scroll elements
    let composedPath = event.composedPath()
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)) // remove parents elements

    const gestureOrientation =
      Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'

    if (
      composedPath.find(
        (node) =>
          node instanceof HTMLElement &&
          (node.hasAttribute?.('data-lenis-prevent') ||
            (gestureOrientation === 'vertical' &&
              node.hasAttribute?.('data-lenis-prevent-vertical')) ||
            (gestureOrientation === 'horizontal' &&
              node.hasAttribute?.('data-lenis-prevent-horizontal')) ||
            (isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
            (isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
            (this.options.allowNestedScroll &&
              isScrollableElement(node, {
                deltaX,
                deltaY,
              })))
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
      (this.options.touch.smooth && isTouch) ||
      (this.options.wheel.smooth && isWheel)

    if (!isSmooth) {
      this.isScrolling = 'native'
      this.animate.stop()
      // @ts-expect-error
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
        this.limit > 0 &&
        ((this.animatedScroll > 0 && this.animatedScroll < this.limit) ||
          (this.animatedScroll === 0 && deltaY > 0) ||
          (this.animatedScroll === this.limit && deltaY < 0)))
    ) {
      // @ts-expect-error
      event.lenisStopPropagation = true
      // event.stopPropagation()
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    const isTouchEnd = isTouch && event.type === 'touchend'

    if (isTouchEnd) {
      delta =
        Math.sign(delta) *
        Math.abs(this.velocity) ** this.options.touch.inertia!
    }

    const touchConfig = isTouchEnd
      ? {
          lerp: this.options.touch.lerp,
          duration: this.options.touch.duration,
          easing: this.options.touch.easing,
        }
      : {
          lerp: 1,
        }

    const wheelConfig = {
      lerp: this.options.wheel.lerp,
      duration: this.options.wheel.duration,
      easing: this.options.wheel.easing,
    }

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(isTouch ? touchConfig : wheelConfig),
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
    this.setScroll(Math.round(this.scroll))
    this.animatedScroll = this.targetScroll = this.actualScroll
    this.lastVelocity = this.velocity = 0
    this.animate.stop()
  }

  /**
   * Start lenis scroll after it has been stopped
   */
  start() {
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
    this.emit()
  }

  /**
   * Stop lenis scroll
   */
  stop() {
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
    _target: number | string | HTMLElement,
    {
      offset = 0,
      immediate = false,
      lock = false,
      programmatic = true, // called from outside of the class
      lerp = programmatic ? this.options.wheel.lerp : undefined,
      duration = programmatic ? this.options.duration : undefined,
      easing = programmatic ? this.options.easing : undefined,
      onStart,
      onComplete,
      force = false, // scroll even if stopped
      userData,
    }: ScrollToOptions = {}
  ) {
    if ((this.isStopped || this.isLocked) && !force) return

    let target: number | string | HTMLElement = _target
    let adjustedOffset = offset

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
      let node: Element | null = null

      if (typeof target === 'string') {
        // CSS selector
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
          adjustedOffset -= this.isHorizontal
            ? wrapperRect.left
            : wrapperRect.top
        }

        const rect = node.getBoundingClientRect()

        // Account for scroll-margin CSS property on the target element
        const targetStyle = getComputedStyle(node)
        const scrollMargin = this.isHorizontal
          ? Number.parseFloat(targetStyle.scrollMarginLeft)
          : Number.parseFloat(targetStyle.scrollMarginTop)

        // Account for scroll-padding CSS property on the scroll container
        const containerStyle = getComputedStyle(this.rootElement)
        const scrollPadding = this.isHorizontal
          ? Number.parseFloat(containerStyle.scrollPaddingLeft)
          : Number.parseFloat(containerStyle.scrollPaddingTop)

        target =
          (this.isHorizontal ? rect.left : rect.top) +
          this.animatedScroll -
          (Number.isNaN(scrollMargin) ? 0 : scrollMargin) -
          (Number.isNaN(scrollPadding) ? 0 : scrollPadding)
      }
    }

    if (typeof target !== 'number') return

    target += adjustedOffset
    // target = Math.round(target)

    if (this.options.infinite) {
      if (programmatic) {
        this.targetScroll = this.animatedScroll = this.scroll

        const distance = target - this.animatedScroll

        if (distance > this.limit / 2) {
          target -= this.limit
        } else if (distance < -this.limit / 2) {
          target += this.limit
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
    return this.dimensions.limit[this.isHorizontal ? 'x' : 'y']
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
      ? ((wrapper as Window).scrollX ?? (wrapper as HTMLElement).scrollLeft)
      : ((wrapper as Window).scrollY ?? (wrapper as HTMLElement).scrollTop)
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

    this.className.split(' ').forEach((className) => {
      this.rootElement.classList.add(className)
    })
  }

  private cleanUpClassName() {
    this.rootElement.classList.forEach((className) => {
      if (className.startsWith('lenis')) {
        this.rootElement.classList.remove(className)
      }
    })
  }
}
