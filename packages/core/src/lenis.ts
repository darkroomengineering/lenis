import { version } from '../../../package.json'
import { Axis } from './axis'
import { Dimensions } from './dimensions'
import { Emitter } from './emitter'
import { GesturesHandler } from './gestures-handler'
import { clamp } from './maths'
import type {
  EventCallback,
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
  private _preventNextNativeScrollEvent = false
  private _resetVelocityTimeout: ReturnType<typeof setTimeout> | null = null
  private _rafId: number | null = null

  /**
   * Whether or not the last gesture was a touch
   */
  isTouch?: boolean
  /**
   * Whether the last gesture was a wheel
   */
  isWheel?: boolean
  /**
   * The time in ms since the lenis instance was created
   */
  time = 0
  /**
   * User data carried by the in-flight scroll-to animation, forwarded
   * through scroll callbacks. Reads through to the active axis's tag
   * ({@link Axis.userData}) — `x` when `orientation` is `'horizontal'`,
   * `y` otherwise. In `'both'` mode this is `y`, so consumers needing
   * per-axis precision should read `lenis.x.userData` and
   * `lenis.y.userData` directly.
   *
   * @example
   * lenis.scrollTo(100, {
   *   userData: {
   *     foo: 'bar'
   *   }
   * })
   */
  get userData(): UserData {
    return this.activeAxis.userData
  }
  /**
   * The options passed to the lenis instance
   */
  options: OptionalPick<
    Required<LenisOptions>,
    'duration' | 'easing' | 'onGesture' | 'content' | 'dimensions'
  >

  // Instanciated here as it doesn't need information from the options
  private readonly emitter = new Emitter()
  // Instanciated in the constructor as they need information from the options
  readonly dimensions: Dimensions // not private — used by the Snap class
  /** The horizontal scroll axis */
  readonly x: Axis
  /** The vertical scroll axis */
  readonly y: Axis
  private readonly gesturesHandler: GesturesHandler
  private readonly isIOS: boolean

  constructor({
    wrapper = window,
    content,
    eventsTarget,
    wheel,
    touch,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal, both
    gestureOrientation = orientation === 'vertical' ? 'vertical' : 'both', // vertical, horizontal, both — has no effect when orientation is 'both'
    onGesture,
    overscroll = true,
    autoRaf = true,
    anchors = true,
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

    if (wrapper === window) {
      content = document.documentElement
    }

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
        ...touch,
        ...(this.isIOS &&
          (touch?.ios ?? {
            inertia: 1.7,
            lerp: 0.05,
          })), // overwrite default values if iOS
      },
      infinite,
      gestureOrientation,
      orientation,
      onGesture,
      overscroll,
      autoRaf,
      anchors,
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

    this.x = new Axis('x', this)
    this.y = new Axis('y', this)

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

    // Setup gestures handler
    this.gesturesHandler = new GesturesHandler(eventsTarget as HTMLElement)
    this.gesturesHandler.on('gesture', this.onGesture)

    this.checkOverflow()
    this.rootElement.addEventListener('transitionend', this.onTransitionEnd)

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

    this.gesturesHandler.destroy()
    this.dimensions.destroy()
    this.x.destroy()
    this.y.destroy()

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
  on(event: LenisEvent, callback: EventCallback) {
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
  off(event: LenisEvent, callback: EventCallback) {
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

  private checkOverflow() {
    this.x.checkOverflow()
    this.y.checkOverflow()
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
    this.activeAxis.setScroll(scroll)
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
    this.emitter.emit('gesture', data)

    let { deltaX, deltaY, event, type } = data

    this.isTouch = type === 'touch'
    this.isWheel = type === 'wheel'

    // keep zoom feature
    if (event.ctrlKey) return
    // @ts-expect-error
    if (event.lenisStopPropagation) return

    if (this.isTouch) {
      deltaX *= this.options.touch.multiplier!
      deltaY *= this.options.touch.multiplier!
    } else if (this.isWheel) {
      deltaX *= this.options.wheel.multiplier!
      deltaY *= this.options.wheel.multiplier!
    }

    const isClickOrTap = deltaX === 0 && deltaY === 0

    const isTapToStop =
      this.options.touch.smooth &&
      this.isTouch &&
      event.type === 'touchstart' &&
      isClickOrTap &&
      this.isScrollable &&
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
            (this.isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
            (this.isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
            (this.options.allowNestedScroll &&
              isScrollableElement(node, {
                deltaX,
                deltaY,
              })))
      )
    )
      return

    if (!this.isScrollable || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault() // this will stop forwarding the event to the parent, this is problematic
      }
      return
    }

    const isSmooth =
      (this.options.touch.smooth && this.isTouch) ||
      (this.options.wheel.smooth && this.isWheel)

    if (!isSmooth) {
      this.isScrolling = 'native'
      this.animate.stop()
      // @ts-expect-error
      event.lenisStopPropagation = true
      return
    }

    // 2D routing — gestureOrientation has no effect; deltaX drives x, deltaY drives y.
    if (this.options.orientation === 'both') {
      const isTouchEnd = event.type === 'touchend'

      let dx = deltaX
      let dy = deltaY
      if (isTouchEnd) {
        const inertia = this.options.touch.inertia!
        dx = Math.sign(dx) * Math.abs(this.x.velocity) ** inertia
        dy = Math.sign(dy) * Math.abs(this.y.velocity) ** inertia
      }

      // Per-axis consumption: an axis "consumes" the gesture if it's scrollable AND
      // mid-range or pushing further into the boundary in the gesture's direction.
      // Mirrors the single-axis overscroll-edge check below.
      const consuming = (axis: Axis, delta: number) =>
        axis.isScrollable &&
        axis.limit > 0 &&
        ((axis.animatedScroll > 0 && axis.animatedScroll < axis.limit) ||
          (axis.animatedScroll === 0 && delta > 0) ||
          (axis.animatedScroll === axis.limit && delta < 0))

      if (
        !this.options.overscroll ||
        this.options.infinite ||
        (this.options.wrapper !== window &&
          (consuming(this.x, dx) || consuming(this.y, dy)))
      ) {
        // @ts-expect-error
        event.lenisStopPropagation = true
      }

      if (event.cancelable) event.preventDefault()

      const touchConfig = isTouchEnd
        ? {
            lerp: this.options.touch.lerp,
            duration: this.options.touch.duration,
            easing: this.options.touch.easing,
          }
        : { lerp: 1 }
      const wheelConfig = {
        lerp: this.options.wheel.lerp,
        duration: this.options.wheel.duration,
        easing: this.options.wheel.easing,
      }
      const config = this.isTouch ? touchConfig : wheelConfig

      // Drive each axis independently, but only if it's scrollable and not
      // currently locked. Programmatic `scrollTo` still works on a locked /
      // non-scrollable axis (matches the "scrollTo always runs" policy);
      // only user-initiated gestures are gated.
      if (dx !== 0 && this.x.isScrollable && !this.x.isLocked) {
        this.scrollAxisTo(this.x, this.x.targetScroll + dx, {
          programmatic: false,
          ...config,
        })
      }
      if (dy !== 0 && this.y.isScrollable && !this.y.isLocked) {
        this.scrollAxisTo(this.y, this.y.targetScroll + dy, {
          programmatic: false,
          ...config,
        })
      }
      return
    }

    // Per-axis lock for 1D mode: if the active axis is mid-snap/programmatic
    // lock, swallow the gesture. The blanket `this.isLocked` check above
    // handles the user-driven global lock; this handles the per-axis one.
    if (this.activeAxis.isLocked) {
      if (event.cancelable) event.preventDefault()
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

    const isTouchEnd = event.type === 'touchend'

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
      ...(this.isTouch ? touchConfig : wheelConfig),
    })
  }

  /**
   * Force lenis to recalculate the dimensions
   */
  resize() {
    this.dimensions.resize()
    this.reset()
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
      // Sync each axis to the browser's reported scroll position. In single-axis
      // mode the inactive axis just re-reads 0 (or whatever the user dragged via a
      // visible scrollbar); in `'both'` mode both axes track native scroll.
      let anyVelocity = false
      for (const axis of [this.x, this.y]) {
        const lastScroll = axis.animatedScroll
        axis.animatedScroll = axis.targetScroll = axis.actualScroll
        axis.lastVelocity = axis.velocity
        axis.velocity = axis.animatedScroll - lastScroll
        axis.direction = Math.sign(axis.velocity) as 1 | -1 | 0
        if (axis.velocity !== 0) anyVelocity = true
      }

      if (this.isScrollable) {
        this.isScrolling = 'native'
      }

      this.emit()

      if (anyVelocity) {
        this._resetVelocityTimeout = setTimeout(() => {
          if (this.isScrolling === 'native' || this.isScrolling === false) {
            this.reset()
            this.emit()
          }
          this._resetVelocityTimeout = null
        }, 400) // arbitrary timeout to reset the velocity
      }
    }
  }

  private reset() {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout)
      this._resetVelocityTimeout = null
    }

    this.isScrolling = false
    this.x.reset()
    this.y.reset()
  }

  /** Whether any axis currently has an animation running. */
  private get isAnyAxisAnimating() {
    return this.x.animate.isRunning || this.y.animate.isRunning
  }

  /**
   * Lock both scroll axes — user-initiated wheel/touch gestures are suppressed
   * on both `x` and `y`. Programmatic `scrollTo` still runs (matches the
   * "scrollTo always runs" policy). Pair with {@link unlock}.
   */
  lock() {
    this.x.isLocked = true
    this.y.isLocked = true
    this.updateClassName()
  }

  /** Release the lock on both axes. */
  unlock() {
    this.x.isLocked = false
    this.y.isLocked = false
    this.updateClassName()
  }

  /**
   * RequestAnimationFrame for lenis
   *
   * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
   */
  raf = (time: number) => {
    const deltaTime = time - (this.time || time)
    this.time = time

    const xActive = this.x.advance(deltaTime * 0.001)
    const yActive = this.y.advance(deltaTime * 0.001)

    // If either axis animated this frame, flush both axes' positions to the wrapper
    // in a single `scrollTo` call (instead of two per-axis writes).
    if (xActive || yActive) {
      this.flushScroll()
    }

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Apply the current per-axis scroll values to the wrapper in one call, only
   * writing the coordinate for each axis that's live (per `orientation`). This
   * avoids double-writes when both axes animate in `'both'` mode and avoids
   * clobbering the user's manual scroll on the inactive axis in single-axis mode.
   */
  private flushScroll() {
    const opts: { left?: number; top?: number; behavior: ScrollBehavior } = {
      behavior: 'instant',
    }
    if (this.options.orientation !== 'vertical') opts.left = this.x.scroll
    if (this.options.orientation !== 'horizontal') opts.top = this.y.scroll
    this.options.wrapper.scrollTo(opts)
  }

  /**
   * Scroll to a target value
   *
   * @param target Numeric target, scroll-keyword (`'top'`, `'bottom'`, …), CSS selector,
   *               `HTMLElement`, or `{ x?, y? }` to drive each axis independently.
   *               A bare number / element / selector targets the active axis (the vertical
   *               one in `orientation: 'both'` mode); pass `{ x, y }` to scroll both at once.
   * @param options The options for the scroll
   *
   * @example
   * lenis.scrollTo(100, { duration: 1 })
   * lenis.scrollTo('#section')
   * lenis.scrollTo({ x: 200, y: 800 })       // 2D, dispatches to both axes
   */
  scrollTo(
    target: number | string | HTMLElement,
    options?: ScrollToOptions
  ): void
  scrollTo(target: { x?: number; y?: number }, options?: ScrollToOptions): void
  scrollTo(
    _target: number | string | HTMLElement | { x?: number; y?: number },
    options: ScrollToOptions = {}
  ) {
    // 2D dispatch — bare `{ x?, y? }` object (excluding HTMLElement)
    if (
      typeof _target === 'object' &&
      _target !== null &&
      !(_target instanceof HTMLElement)
    ) {
      const { x, y } = _target
      if (x !== undefined) this.scrollAxisTo(this.x, x, options)
      if (y !== undefined) this.scrollAxisTo(this.y, y, options)
      return
    }

    const offset = options.offset ?? 0

    // Keywords — single-axis semantics (active axis). `top`/`left`/`start`/`#` → 0,
    // `bottom`/`right`/`end` → limit. Users wanting 2D keyword semantics pass `{ x, y }`.
    if (typeof _target === 'string') {
      if (['top', 'left', 'start', '#'].includes(_target)) {
        this.scrollAxisTo(this.activeAxis, offset, options)
        return
      }
      if (['bottom', 'right', 'end'].includes(_target)) {
        this.scrollAxisTo(
          this.activeAxis,
          this.activeAxis.limit + offset,
          options
        )
        return
      }
    }

    // Resolve a selector / HTMLElement to a `node`
    let node: Element | null = null
    if (typeof _target === 'string') {
      node = document.querySelector(_target)
      if (!node) {
        if (_target === '#top') {
          this.scrollAxisTo(this.activeAxis, offset, options)
        } else {
          console.warn('Lenis: Target not found', _target)
        }
        return
      }
    } else if (_target instanceof HTMLElement && _target.nodeType) {
      node = _target
    }

    if (node) {
      if (this.options.orientation === 'both') {
        // 2D: scroll the element into view on both axes.
        this.scrollAxisTo(
          this.x,
          this.resolveElementTarget(node, this.x, offset),
          options
        )
        this.scrollAxisTo(
          this.y,
          this.resolveElementTarget(node, this.y, offset),
          options
        )
      } else {
        this.scrollAxisTo(
          this.activeAxis,
          this.resolveElementTarget(node, this.activeAxis, offset),
          options
        )
      }
      return
    }

    // Bare number
    if (typeof _target === 'number') {
      this.scrollAxisTo(this.activeAxis, _target + offset, options)
    }
  }

  /**
   * Resolve an `Element`'s bounding rect to a numeric scroll target on the given
   * `axis`, accounting for wrapper offset (nested Lenis), `scroll-margin` on the
   * target, `scroll-padding` on the container, and the caller-provided `offset`.
   */
  private resolveElementTarget(
    node: Element,
    axis: Axis,
    offset: number
  ): number {
    let adjustedOffset = offset

    if (this.options.wrapper !== window) {
      // nested scroll offset correction
      const wrapperRect = this.rootElement.getBoundingClientRect()
      adjustedOffset -= axis.axis === 'x' ? wrapperRect.left : wrapperRect.top
    }

    const rect = node.getBoundingClientRect()

    // Account for scroll-margin CSS property on the target element
    const targetStyle = getComputedStyle(node)
    const scrollMargin =
      axis.axis === 'x'
        ? Number.parseFloat(targetStyle.scrollMarginLeft)
        : Number.parseFloat(targetStyle.scrollMarginTop)

    // Account for scroll-padding CSS property on the scroll container
    const containerStyle = getComputedStyle(this.rootElement)
    const scrollPadding =
      axis.axis === 'x'
        ? Number.parseFloat(containerStyle.scrollPaddingLeft)
        : Number.parseFloat(containerStyle.scrollPaddingTop)

    return (
      (axis.axis === 'x' ? rect.left : rect.top) +
      axis.animatedScroll -
      (Number.isNaN(scrollMargin) ? 0 : scrollMargin) -
      (Number.isNaN(scrollPadding) ? 0 : scrollPadding) +
      adjustedOffset
    )
  }

  /**
   * Drive the given `axis` to a numeric `target`. The animation state machine —
   * infinite-wrap, clamp, `immediate` vs animated branches, `onStart` / `onUpdate` /
   * `onComplete`, plus the `userData` tag — all per-axis. Lenis-level state
   * (`isScrolling`, `emit`, scrollend dispatch) lives on `this` and is shared.
   *
   * @internal exposed for `Axis.scrollTo` to delegate.
   */
  scrollAxisTo(
    axis: Axis,
    _target: number,
    {
      immediate = false,
      programmatic = true,
      lerp = programmatic ? this.options.wheel.lerp : undefined,
      duration = programmatic ? this.options.duration : undefined,
      easing = programmatic ? this.options.easing : undefined,
      lock = false,
      onStart,
      onComplete,
      userData,
    }: ScrollToOptions = {}
  ) {
    let target = _target

    if (this.options.infinite) {
      if (programmatic) {
        axis.targetScroll = axis.animatedScroll = axis.scroll

        const distance = target - axis.animatedScroll

        if (distance > axis.limit / 2) {
          target -= axis.limit
        } else if (distance < -axis.limit / 2) {
          target += axis.limit
        }
      }
    } else {
      target = clamp(0, target, axis.limit)
    }

    // Tag this axis with the caller's userData up front so it's visible on
    // the early-return path too. The `Lenis.userData` getter aggregates
    // across both axes, so 2D scrollTo keeps the tag readable until both
    // axes have finished animating — without us having to gate clears on
    // `isAnyAxisAnimating`.
    axis.userData = userData ?? {}

    if (target === axis.targetScroll) {
      onStart?.(this)
      onComplete?.(this)
      axis.userData = {}
      return
    }

    if (immediate) {
      axis.animatedScroll = axis.targetScroll = target
      axis.setScroll(axis.scroll)
      axis.reset()
      if (!this.isAnyAxisAnimating) this.isScrolling = false
      this.preventNextNativeScrollEvent()
      this.emit()
      onComplete?.(this)
      axis.userData = {}

      requestAnimationFrame(() => {
        this.dispatchScrollendEvent()
      })
      return
    }

    if (!programmatic) {
      axis.targetScroll = target
    }

    // flip to easing/time based animation if at least one of them is provided
    if (typeof duration === 'number' && typeof easing !== 'function') {
      easing = defaultEasing
    } else if (typeof easing === 'function' && typeof duration !== 'number') {
      duration = 1
    }

    axis.animate.fromTo(axis.animatedScroll, target, {
      duration,
      easing,
      lerp,
      onStart: () => {
        this.isScrolling = 'smooth'
        // Per-axis lock: suppresses wheel/touch on this axis only. The other
        // axis stays interactive even when both are animating (each lock
        // releases independently on its own animation's completion).
        if (lock) {
          axis.isLocked = true
          this.updateClassName()
        }
        onStart?.(this)
      },
      onUpdate: (value: number, completed: boolean) => {
        this.isScrolling = 'smooth'

        // updated
        axis.lastVelocity = axis.velocity
        axis.velocity = value - axis.animatedScroll
        axis.direction = Math.sign(axis.velocity) as 1 | -1 | 0

        axis.animatedScroll = value
        // DOM write is consolidated into a single `wrapper.scrollTo` per frame in `Lenis.raf`.

        if (programmatic) {
          // wheel during programmatic should stop it
          axis.targetScroll = value
        }

        if (!completed) this.emit()

        if (completed) {
          axis.reset()
          if (!this.isAnyAxisAnimating) this.isScrolling = false
          // Release the per-axis lock as soon as this axis finishes; the
          // other axis keeps its own lock until its own animation completes.
          if (lock) {
            axis.isLocked = false
            this.updateClassName()
          }
          this.emit()
          onComplete?.(this)
          axis.userData = {}

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
   * The active scroll axis — `x` when `orientation` is `horizontal`, otherwise `y`.
   * The single-axis scroll getters/setters on the instance delegate to it.
   */
  private get activeAxis() {
    return this.isHorizontal ? this.x : this.y
  }

  /** @internal the animation driving the active axis */
  private get animate() {
    return this.activeAxis.animate
  }

  /**
   * Whether or not the scroll is horizontal
   */
  get isHorizontal() {
    return this.options.orientation === 'horizontal'
  }

  /**
   * The target scroll value (active axis — `y` in `'vertical'`/`'both'`, `x` in `'horizontal'`).
   * In 2D mode read each axis directly via `lenis.x.targetScroll` / `lenis.y.targetScroll`.
   */
  get targetScroll() {
    return this.activeAxis.targetScroll
  }
  set targetScroll(value: number) {
    this.activeAxis.targetScroll = value
  }

  /**
   * The animated scroll value (active axis — see {@link targetScroll}).
   */
  get animatedScroll() {
    return this.activeAxis.animatedScroll
  }
  set animatedScroll(value: number) {
    this.activeAxis.animatedScroll = value
  }

  /**
   * The current velocity of the scroll (active axis — see {@link targetScroll}).
   * In 2D, each axis has its own velocity — `lenis.x.velocity` / `lenis.y.velocity`.
   */
  get velocity() {
    return this.activeAxis.velocity
  }
  set velocity(value: number) {
    this.activeAxis.velocity = value
  }

  /**
   * The last velocity of the scroll
   */
  get lastVelocity() {
    return this.activeAxis.lastVelocity
  }
  set lastVelocity(value: number) {
    this.activeAxis.lastVelocity = value
  }

  /**
   * The scroll direction on the active axis: `1` forward, `-1` backward, `0` idle.
   * Per-axis: `lenis.x.direction` / `lenis.y.direction`.
   */
  get direction() {
    return this.activeAxis.direction
  }
  set direction(value: 1 | -1 | 0) {
    this.activeAxis.direction = value
  }

  /**
   * The maximum scroll value for the active axis.
   */
  get limit() {
    return this.activeAxis.limit
  }

  /**
   * The scroll value the browser currently reports for the active axis.
   */
  get actualScroll() {
    return this.activeAxis.actualScroll
  }

  /**
   * The current (animated) scroll value for the active axis.
   * In 2D, read each axis directly via `lenis.x.scroll` / `lenis.y.scroll`.
   */
  get scroll() {
    return this.activeAxis.scroll
  }

  /**
   * Scroll progress (0..1) of the active axis relative to its `limit`.
   */
  get progress() {
    return this.activeAxis.progress
  }

  /**
   * Current scroll state: `'native'` while consuming a non-smooth native scroll,
   * `'smooth'` while a Lenis animation is driving any axis, `false` when idle.
   * In 2D, becomes `false` only once *no* axis is animating.
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
   * Whether the user can scroll: `true` when at least one live axis is scrollable
   * (cached per-axis on `lenis.x.isScrollable` / `lenis.y.isScrollable`, refreshed
   * at construction and on `overflow` `transitionend`). The `lenis-stopped` class is
   * applied when this is `false`.
   */
  get isScrollable() {
    const orientation = this.options.orientation
    if (orientation === 'horizontal') return this.x.isScrollable
    if (orientation === 'both')
      return this.x.isScrollable || this.y.isScrollable
    return this.y.isScrollable
  }

  /**
   * Whether user-initiated scrolling is suppressed.
   *
   * Composed from the per-axis locks (`lenis.x.isLocked`, `lenis.y.isLocked`):
   * - `orientation: 'vertical'` → mirrors `y.isLocked`
   * - `orientation: 'horizontal'` → mirrors `x.isLocked`
   * - `orientation: 'both'` → true only when **both** axes are locked
   *   (a partial lock from `scrollTo({ x }, { lock: true })` doesn't report
   *   the whole instance as locked, since the other axis is still interactive).
   */
  get isLocked() {
    const orientation = this.options.orientation
    if (orientation === 'horizontal') return this.x.isLocked
    if (orientation === 'both') return this.x.isLocked || this.y.isLocked
    return this.y.isLocked
  }

  /**
   * The class name applied to the wrapper element
   */
  get className() {
    let className = 'lenis'
    if (!this.isScrollable) className += ' lenis-stopped'
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
    for (const className of Array.from(this.rootElement.classList)) {
      if (className === 'lenis' || className.startsWith('lenis-')) {
        this.rootElement.classList.remove(className)
      }
    }
  }
}
