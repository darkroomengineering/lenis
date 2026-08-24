import { version } from '../../../package.json'
import { Axis } from './axis'
import { debounce } from './debounce'
import { Emitter } from './emitter'
import { GesturesHandler } from './gestures-handler'
import { clamp } from './maths'
import { ScrollingBox } from './scrolling-box'
import type {
  EventCallback,
  GestureCallback,
  GestureData,
  LenisEvent,
  LenisOptions,
  Orientation,
  ScrollCallback,
  Scrolling,
  ScrollToOptions,
  UserData,
} from './types'
import { isScrollableElement } from './utils'

// How it works:
// - GesturesHandler normalizes wheel/touch events into gestures
// - onGesture routes each gesture to its axes (x and/or y) and animates their
//   targetScroll (smooth context), or lets the scroll stay native
// - each frame, raf() advances the axes and flushes their positions to the
//   wrapper in a single scrollTo call
// - onNativeScroll re-syncs the axes when the browser scrolls on its own
//   (scrollbar drag, keyboard, non-smooth gestures)

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>

const defaultEasing = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

// Every live instance keyed by its root element — the double-adoption guard
// for `nested.mode: 'smooth'` and the lookup behind `Lenis.get`.
const instancesRegistry = new WeakMap<Element, Lenis>()
// Elements vetoed by `nested.filter` — the filter runs once per element.
const nestedVetoed = new WeakSet<Element>()
export class Lenis {
  // ─── internal state ───

  private _isScrolling: Scrolling = false // true when scroll is animating
  /** Instance-wide lock — both axes are locked together or neither is. @see {@link isLocked} */
  private _isLocked = false
  /** True while the lock is held by a `scrollTo({ lock: true })` operation (vs a manual `lock()`), so `reset` can release it if the operation is interrupted mid-flight. */
  private _scrollToLocked = false
  private _preventNextNativeScrollEvent = false
  /** Pending frame for a scrollend dispatch — one per frame at most. @see {@link scheduleScrollendEvent} */
  private _scrollendRafId: number | null = null
  private _rafId: number | null = null
  private _isDragging = false // true while a mouse drag is scrolling (drag option)
  private _isDraggingSelection = false // true while a touch is dragging an iOS selection handle
  // Safari shipped `scrollend` late — where it's missing, Lenis synthesizes one
  // on the native path so consumers get the event everywhere.
  private readonly supportsScrollend = 'onscrollend' in window
  // `.matches` is read at scroll time so preference changes apply live, no listener needed
  private readonly reducedMotionMediaQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  )
  // aborting removes every wrapper listener at once — see destroy
  private readonly abortController = new AbortController()

  // ─── public state ───

  /**
   * Whether or not the last gesture was a touch
   */
  isTouch?: boolean
  /**
   * Whether the last gesture was a wheel
   */
  isWheel?: boolean
  /**
   * Whether the last gesture was a mouse drag
   */
  isDrag?: boolean
  /**
   * The time in ms since the lenis instance was created
   */
  time = 0
  /**
   * User data carried by the in-flight `scrollTo` operation, forwarded through
   * scroll callbacks. Set once per call — a 2D `scrollTo({ x, y })` shares one
   * `userData` across both axes and keeps it readable until the whole
   * operation completes (not wiped when the first axis lands).
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
   * The options passed to the lenis instance
   */
  options: OptionalPick<
    Required<LenisOptions>,
    'onGesture' | 'content' | 'dimensions'
  >

  // ─── subsystems ───

  // Instanciated here as it doesn't need information from the options
  private readonly emitter = new Emitter()
  // Instanciated in the constructor as they need information from the options
  readonly scrollingBox: ScrollingBox // not private — used by the Snap class
  /** The horizontal scroll axis */
  readonly x: Axis
  /** The vertical scroll axis */
  readonly y: Axis
  private readonly gesturesHandler: GesturesHandler
  private readonly isIOS: boolean
  /** Instances adopted via `nested.mode: 'smooth'`, driven by this instance's raf. */
  private readonly nestedInstances = new Set<Lenis>()
  private _nestedSweepFrame = 0 // frame counter gating the disconnect sweep

  // ─── lifecycle ───

  /**
   * The Lenis instance mounted on `element` — adopted via `nested.mode: 'smooth'` or
   * created manually — if any.
   */
  static get(element: Element): Lenis | undefined {
    return instancesRegistry.get(element)
  }

  constructor({
    wrapper = window,
    content,
    eventsTarget,
    wheel,
    touch,
    drag,
    programmatic,
    infinite = false,
    orientation = 'vertical', // vertical, horizontal, both
    gestureOrientation = orientation === 'vertical' ? 'vertical' : 'both', // vertical, horizontal, both — has no effect when orientation is 'both'
    onGesture,
    overscroll = true,
    autoRaf = true,
    anchors = true,
    nested,
    dimensions,
    stopInertiaOnNavigate = true,
    respectReducedMotion = true,
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
      drag: {
        enabled: false,
        multiplier: 1,
        inertia: 1.7,
        lerp: 0.1,
        ...drag, // overwrite default values
      },
      programmatic: {
        lerp: 0.1,
        ...programmatic, // overwrite default values
      },
      infinite,
      gestureOrientation,
      orientation,
      onGesture,
      overscroll,
      autoRaf,
      anchors,
      nested: {
        mode: 'native',
        ...nested, // overwrite default values
      },
      dimensions,
      stopInertiaOnNavigate,
      respectReducedMotion,
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

    // set default duration and easing if not provided
    if (
      this.options.drag?.duration !== undefined ||
      this.options.drag?.easing !== undefined
    ) {
      this.options.drag.duration ??= 1
      this.options.drag.easing ??= defaultEasing
    }

    this.scrollingBox = new ScrollingBox(
      this.rootElement,
      this.options.content,
      this.options.dimensions
    )

    this.x = new Axis('x', this)
    this.y = new Axis('y', this)

    // Reset an axis when its CSS overflow flips (halts an in-flight animation on
    // a now non-scrollable axis, re-syncs to the browser position otherwise)
    this.scrollingBox.on('overflow style changed', this.onOverflowStyleChange)

    instancesRegistry.set(this.rootElement, this)

    // Setup class name
    this.updateClassName()

    // Set the initial scroll value for all scroll information (both axes,
    // history slot included — a page restored mid-scroll must boot with
    // zero velocity)
    this.x.reset()
    this.y.reset()

    // Add event listeners (all removed at once via abortController in destroy)
    const signal = this.abortController.signal

    this.options.wrapper.addEventListener('scroll', this.onNativeScroll, {
      signal,
    })

    this.options.wrapper.addEventListener(
      'scroll',
      this.debouncedNativeScrollReset,
      { signal }
    )

    // Always on `window`, even for element wrappers: `scrollend` doesn't bubble
    // from an element, and a listener on the target node can't stopPropagation
    // its siblings. The capture phase walks every ancestor either way, so this
    // is the only place the event can be stopped before user listeners see it.
    window.addEventListener('scrollend', this.onScrollEnd, {
      capture: true,
      signal,
    })

    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener(
        'click',
        this.onClick as EventListener,
        { signal }
      )
    }

    this.options.wrapper.addEventListener(
      'pointerdown',
      this.onPointerDown as EventListener,
      { signal }
    )

    // Setup gestures handler
    this.gesturesHandler = new GesturesHandler(eventsTarget as HTMLElement, {
      drag: this.options.drag.enabled,
    })
    this.gesturesHandler.on('gesture', this.onGesture)
    // drag start/end drives the `lenis-dragging` class via updateClassName
    this.gesturesHandler.on(
      'dragging',
      this.onDraggingChange as unknown as GestureCallback
    )

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Destroy the lenis instance, remove all event listeners and clean up the class name
   */
  destroy() {
    // adopted instances live and die with their adopter
    for (const child of this.nestedInstances) {
      child.destroy()
    }
    this.nestedInstances.clear()
    if (instancesRegistry.get(this.rootElement) === this) {
      instancesRegistry.delete(this.rootElement)
    }

    this.emitter.destroy()
    this.abortController.abort()

    this.debouncedNativeScrollReset.cancel()

    if (this._scrollendRafId !== null) {
      cancelAnimationFrame(this._scrollendRafId)
      this._scrollendRafId = null
    }

    this.gesturesHandler.destroy()
    this.scrollingBox.destroy()
    this.x.destroy()
    this.y.destroy()

    this.cleanUpClassName()

    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }
  }

  // ─── events ───

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

  private emit() {
    this.emitter.emit('scroll', this)
  }

  // ─── public api ───

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
  ): Promise<boolean>
  scrollTo(
    target: { x?: number; y?: number },
    options?: ScrollToOptions
  ): Promise<boolean>
  scrollTo(
    _target: number | string | HTMLElement | { x?: number; y?: number },
    options: ScrollToOptions = {}
  ): Promise<boolean> {
    return this.dispatchScrollTo(
      this.resolveScrollTargets(_target, options),
      options
    )
  }

  /**
   * Lock scrolling — user-initiated wheel/touch gestures are suppressed on both
   * axes. Programmatic `scrollTo` still runs (matches the "scrollTo always runs"
   * policy). Pair with {@link unlock}.
   */
  lock() {
    this.isLocked = true
  }

  /** Release the lock. */
  unlock() {
    this.isLocked = false
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

    // advance adopted nested instances on this clock (they never own a raf loop)
    if (this.nestedInstances.size > 0) {
      for (const child of this.nestedInstances) {
        child.raf(time)
      }

      // destroy instances whose element left the DOM (unmounted modals,
      // recycled list nodes) — gated to ~1/s, isConnected is cheap but not free
      if (++this._nestedSweepFrame >= 60) {
        this._nestedSweepFrame = 0
        this.sweepNestedInstances()
      }
    }

    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf)
    }
  }

  /**
   * Force lenis to recalculate the dimensions
   */
  resize() {
    this.scrollingBox.resize()
    this.sweepNestedInstances()
    this.reset()
    this.emit()
  }

  // ─── getters ───

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
   * Whether or not the scroll is horizontal
   */
  get isHorizontal() {
    return this.options.orientation === 'horizontal'
  }

  /**
   * The active scroll axis — `x` when `orientation` is `horizontal`, otherwise `y`.
   * The single-axis scroll getters/setters on the instance delegate to it.
   */
  private get activeAxis() {
    return this.isHorizontal ? this.x : this.y
  }

  /**
   * The current (animated) scroll value for the active axis.
   * In 2D, read each axis directly via `lenis.x.scroll` / `lenis.y.scroll`.
   */
  get scroll() {
    return this.activeAxis.scroll
  }

  /**
   * The target scroll value (active axis — `y` in `'vertical'`/`'both'`, `x` in `'horizontal'`).
   * In 2D mode read each axis directly via `lenis.x.targetScroll` / `lenis.y.targetScroll`.
   */
  get targetScroll() {
    return this.activeAxis.targetScroll
  }
  set targetScroll(value: number) {
    this.activeAxis.rawTargetScroll = value
  }

  /**
   * The raw animated scroll value, unwrapped in infinite mode (active axis —
   * see {@link scroll} for the wrapped view).
   */
  get rawScroll() {
    return this.activeAxis.rawScroll
  }
  set rawScroll(value: number) {
    this.activeAxis.rawScroll = value
  }

  /**
   * The raw target scroll value, unwrapped in infinite mode (active axis —
   * see {@link targetScroll} for the wrapped view).
   */
  get rawTargetScroll() {
    return this.activeAxis.rawTargetScroll
  }
  set rawTargetScroll(value: number) {
    this.activeAxis.rawTargetScroll = value
  }

  /**
   * The scroll value the browser currently reports for the active axis.
   */
  get actualScroll() {
    return this.activeAxis.actualScroll
  }

  /**
   * The current velocity of the scroll (active axis — see {@link targetScroll}).
   * Derived per update from the raw scroll history. In 2D, each axis has its
   * own velocity — `lenis.x.velocity` / `lenis.y.velocity`.
   */
  get velocity() {
    return this.activeAxis.velocity
  }

  /**
   * The scroll direction on the active axis: `1` forward, `-1` backward, `0` idle.
   * Derived from actual motion (the velocity sign).
   * Per-axis: `lenis.x.direction` / `lenis.y.direction`.
   */
  get direction() {
    return this.activeAxis.direction
  }

  /**
   * The maximum scroll value for the active axis.
   */
  get maxScroll() {
    return this.activeAxis.maxScroll
  }

  /**
   * Scroll progress (0..1) of the active axis relative to its `maxScroll`.
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
   * Whether Lenis is currently smooth-scrolling (a Lenis animation is driving a
   * scroll, on any axis) — i.e. {@link isScrolling} is `'smooth'`.
   */
  get isSmooth() {
    return this.isScrolling === 'smooth'
  }

  /**
   * Whether a mouse drag is currently scrolling (see the `drag` option).
   * Mirrored on the root element as the `lenis-dragging` class.
   */
  get isDragging() {
    return this._isDragging
  }

  private set isDragging(value: boolean) {
    if (this._isDragging !== value) {
      this._isDragging = value
      this.updateClassName()
    }
  }

  /**
   * Whether the user can scroll: `true` when at least one live axis is scrollable
   * per `dimensions.isScrollable` (a scroll container with overflowing content,
   * refreshed by `ScrollingBox` on resize and `overflow` transitions).
   */
  get isScrollable() {
    const orientation = this.options.orientation
    if (orientation === 'horizontal') return this.x.isScrollable
    if (orientation === 'both')
      return this.x.isScrollable || this.y.isScrollable
    return this.y.isScrollable
  }

  /**
   * Whether user-initiated scrolling is suppressed. Instance-wide and
   * all-or-nothing — both axes are locked together or neither is. Set via
   * {@link lock} / {@link unlock} or a `scrollTo({ lock: true })` (for the
   * lifetime of that scroll). Programmatic `scrollTo` runs regardless.
   */
  get isLocked() {
    return this._isLocked
  }

  set isLocked(value: boolean) {
    if (value === this._isLocked) return
    this._isLocked = value
    this.updateClassName()
  }

  /**
   * Whether the user prefers reduced motion and lenis is honoring it (see `respectReducedMotion` option)
   */
  get prefersReducedMotion() {
    return (
      this.options.respectReducedMotion && this.reducedMotionMediaQuery.matches
    )
  }

  /**
   * The class name applied to the wrapper element
   */
  get className() {
    let className = 'lenis'
    if (this.isLocked) className += ' lenis-locked'
    if (this.isScrolling) className += ' lenis-scrolling'
    if (this.isScrolling === 'smooth') className += ' lenis-smooth'
    if (this.options.drag.enabled) className += ' lenis-draggable'
    if (this.isDragging) className += ' lenis-dragging'
    return className
  }

  /** Whether any axis currently has an animation running. */
  private get isAnyAxisAnimating() {
    return this.x.animate.isRunning || this.y.animate.isRunning
  }

  // ─── gesture pipeline ───

  private onGesture = (_data: GestureData) => {
    // return = false -> stop execution
    // return modified data -> modify the data and continue execution
    const data = this.options.onGesture?.(_data, this) ?? _data

    if (data === false) return
    this.emitter.emit('gesture', data)

    let { deltaX, deltaY, event, type } = data

    this.isTouch = type === 'touch'
    this.isWheel = type === 'wheel'
    this.isDrag = type === 'drag'

    // keep zoom feature
    if (event.ctrlKey) return
    // @ts-expect-error
    if (event.lenisStopPropagation) return

    // If the touch grabbed an iOS text-selection handle, let the OS adjust the
    // selection instead of scrolling. Latched on touchstart, held until touchend.
    if (this.isTouch && this.isIOS) {
      if (event.type === 'touchstart') {
        this._isDraggingSelection = this.isTouchOnSelectionHandle(
          event as TouchEvent
        )
      }
      if (this._isDraggingSelection) {
        if (event.type === 'touchend') this._isDraggingSelection = false
        return
      }
    }

    if (this.isTouch) {
      deltaX *= this.options.touch.multiplier!
      deltaY *= this.options.touch.multiplier!
    } else if (this.isWheel) {
      deltaX *= this.options.wheel.multiplier!
      deltaY *= this.options.wheel.multiplier!
    } else if (this.isDrag) {
      deltaX *= this.options.drag.multiplier!
      deltaY *= this.options.drag.multiplier!
    }

    const isClickOrTap = deltaX === 0 && deltaY === 0

    // touch: a tap stops the inertia; drag: grabbing the page stops the fling
    const isTapToStop =
      ((this.options.touch.smooth &&
        this.isTouch &&
        event.type === 'touchstart') ||
        (this.isDrag && event.type === 'pointerdown')) &&
      isClickOrTap &&
      this.isScrollable &&
      !this.isLocked

    if (isTapToStop) {
      this.reset()
      return
    }

    if (isClickOrTap) {
      return
    }

    // catch if scrolling on nested scroll elements. This must run before the
    // unknown-gesture bail-out below: an off-axis gesture (e.g. a horizontal
    // swipe on a vertical page) may be aimed at a nested scroller and has to
    // reach the adoption / native-chaining logic
    let composedPath = event.composedPath()
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)) // remove parents elements

    const gestureOrientation =
      Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'

    for (const node of composedPath) {
      if (!(node instanceof HTMLElement)) continue

      if (
        node.hasAttribute?.('data-lenis-prevent') ||
        (gestureOrientation === 'vertical' &&
          node.hasAttribute?.('data-lenis-prevent-vertical')) ||
        (gestureOrientation === 'horizontal' &&
          node.hasAttribute?.('data-lenis-prevent-horizontal')) ||
        (this.isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
        (this.isWheel && node.hasAttribute?.('data-lenis-prevent-wheel'))
      )
        return

      if (
        this.options.nested.mode !== 'none' &&
        isScrollableElement(node, { deltaX, deltaY })
      ) {
        // `nested.mode: 'smooth'` — everything everywhere all at once: adopt the
        // scroller with its own Lenis instance and hand it the in-flight
        // gesture, so even the first tick is smooth. Drags never adopt: the
        // child's pointer tracking can only start on its own pointerdown,
        // and native mouse drag is a no-op anyway. Already-adopted scrollers
        // never reach this point mid-range (their instance flags the event
        // via lenisStopPropagation); at their edges falling through to
        // `return` chains to this instance like any native scroller.
        if (
          this.options.nested.mode === 'smooth' &&
          !this.isDrag &&
          this.isNestedAdoptable(node)
        ) {
          this.adoptNestedScroller(node, data)
        }
        return
      }
    }

    // most likely a touchpad gesture, this keep prev/next page navigation working
    const isUnknownGesture =
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0)

    if (isUnknownGesture) {
      return
    }

    if (!this.isScrollable || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault() // this will stop forwarding the event to the parent, this is problematic
      }
      return
    }

    const isSmooth =
      (this.options.touch.smooth && this.isTouch) ||
      (this.options.wheel.smooth && this.isWheel) ||
      // drag gestures only arrive when enabled, and dragging is inherently smooth
      this.isDrag

    if (!isSmooth) {
      this.isScrolling = 'native'
      // halt any in-flight animation on every axis, not just the active one —
      // a 2D scrollTo can be animating x even in single-axis mode
      this.x.animate.stop()
      this.y.animate.stop()
      // @ts-expect-error
      event.lenisStopPropagation = true
      return
    }

    // Route the gesture to its axes: in 2D, deltaX drives x and deltaY drives y
    // (gestureOrientation has no effect); in single-axis mode gestureOrientation
    // picks which delta drives the active axis.
    let axes: { axis: Axis; delta: number }[]
    if (this.options.orientation === 'both') {
      axes = [
        { axis: this.x, delta: deltaX },
        { axis: this.y, delta: deltaY },
      ]
    } else {
      let delta = deltaY
      if (this.options.gestureOrientation === 'both') {
        delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX
      } else if (this.options.gestureOrientation === 'horizontal') {
        delta = deltaX
      }
      axes = [{ axis: this.activeAxis, delta }]
    }

    // Release inertia: on touchend/pointerup the raw delta is replaced by a
    // fling based on each driven axis's own velocity.
    const isRelease =
      event.type === 'touchend' ||
      event.type === 'pointerup' ||
      event.type === 'pointercancel'
    const pointerOptions = this.isDrag ? this.options.drag : this.options.touch
    if (isRelease) {
      const inertia = pointerOptions.inertia!
      for (const entry of axes) {
        entry.delta =
          Math.sign(entry.delta) * Math.abs(entry.axis.velocity) ** inertia
      }
    }

    // An axis "consumes" the gesture if it's scrollable AND mid-range or pushing
    // further into the boundary in the delta's direction.
    // Scroll values can be fractional while maxScroll derives from rounded values,
    // so the end check needs a 1px threshold instead of strict equality (and native
    // overscroll can push the value outside [0, maxScroll]).
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
    const consuming = ({ axis, delta }: { axis: Axis; delta: number }) => {
      if (!axis.isScrollable) return false
      const atStart = axis.rawScroll <= 0
      const atEnd = axis.maxScroll - axis.rawScroll <= 1
      // consume if the axis can scroll further in the delta's direction
      if (delta > 0) return !atEnd
      if (delta < 0) return !atStart
      return !(atStart || atEnd)
    }

    if (
      !this.options.overscroll ||
      this.options.infinite ||
      (this.options.wrapper !== window && axes.some(consuming))
    ) {
      // @ts-expect-error
      event.lenisStopPropagation = true
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    const pointerConfig = isRelease
      ? {
          lerp: pointerOptions.lerp,
          duration: pointerOptions.duration,
          easing: pointerOptions.easing,
        }
      : { lerp: 1 } // 1:1 finger/pointer tracking while the gesture is held
    const wheelConfig = {
      lerp: this.options.wheel.lerp,
      duration: this.options.wheel.duration,
      easing: this.options.wheel.easing,
    }
    const config = this.isWheel ? wheelConfig : pointerConfig

    // Drive each axis independently. The isScrollable/isLocked gate above covers
    // the instance; in 2D a non-scrollable axis still has to be skipped here.
    for (const { axis, delta } of axes) {
      if (delta !== 0 && axis.isScrollable) {
        this.scrollAxisTo(axis, axis.rawTargetScroll + delta, {
          programmatic: false,
          ...config,
        })
      }
    }
  }

  /**
   * Destroy adopted instances whose element left the DOM. `destroy` cascades,
   * so grandchildren of an unmounted subtree go down with their adopter.
   */
  private sweepNestedInstances() {
    for (const child of this.nestedInstances) {
      if (!child.rootElement.isConnected) {
        this.nestedInstances.delete(child)
        child.destroy()
      }
    }
  }

  /** Whether a nested scroller is eligible for `nested.mode: 'smooth'` adoption. */
  private isNestedAdoptable(element: HTMLElement) {
    // one instance per element — covers manual instances too
    if (instancesRegistry.has(element)) return false
    if (nestedVetoed.has(element)) return false
    // native scroll UX on form fields / editable content is load-bearing
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      element.isContentEditable
    )
      return false

    const filter = this.options.nested.filter
    if (filter && filter(element) === false) {
      nestedVetoed.add(element)
      return false
    }

    return true
  }

  /**
   * `nested.mode: 'smooth'`: mount a Lenis instance on the scroller the user just
   * gestured on, inheriting this instance's config (including `nested` —
   * that's the recursion), and hand it the in-flight gesture so the very
   * first tick is already smooth. The child is driven by this instance's raf
   * and destroyed with it; from the next gesture on, the child's own
   * element-level listeners take over via `lenisStopPropagation`.
   */
  private adoptNestedScroller(element: HTMLElement, data: GestureData) {
    // orientation is detected from the element's scrollable axes, not inherited
    const style = getComputedStyle(element)
    const scrollableX =
      ['auto', 'overlay', 'scroll'].includes(style.overflowX) &&
      element.scrollWidth > element.clientWidth
    const scrollableY =
      ['auto', 'overlay', 'scroll'].includes(style.overflowY) &&
      element.scrollHeight > element.clientHeight

    let orientation: Orientation = 'vertical'
    if (scrollableX && scrollableY) orientation = 'both'
    else if (scrollableX) orientation = 'horizontal'

    const child = new Lenis({
      wrapper: element,
      eventsTarget: element,
      orientation,
      gestureOrientation: orientation,
      wheel: this.options.wheel,
      touch: this.options.touch,
      drag: this.options.drag,
      programmatic: this.options.programmatic,
      overscroll: this.options.overscroll,
      nested: this.options.nested,
      onGesture: this.options.onGesture,
      respectReducedMotion: this.options.respectReducedMotion,
      // page-level concerns stay on the instance the user created
      infinite: false,
      anchors: false,
      stopInertiaOnNavigate: false,
      // driven by this instance's raf — an own loop would outlive the element
      autoRaf: false,
    })

    this.nestedInstances.add(child)

    // Hand off the in-flight gesture. For touch, seed the child's tracking
    // with this instance's last touch position so the child's next touchmove
    // delta is continuous (the child never saw touchstart).
    if (data.type === 'touch') {
      child.gesturesHandler.touchStart.x = this.gesturesHandler.touchStart.x
      child.gesturesHandler.touchStart.y = this.gesturesHandler.touchStart.y
    }
    child.onGesture(data)
  }

  // iOS renders text-selection handles at the start and end points of the
  // selection. A touch starting within a handle-sized radius of either point is
  // the user grabbing a handle, not scrolling.
  private isTouchOnSelectionHandle(event: TouchEvent) {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0)
      return false

    const touch = event.targetTouches[0] ?? event.changedTouches[0]
    if (!touch) return false

    const rects = selection.getRangeAt(0).getClientRects()
    if (rects.length === 0) return false

    const first = rects[0]!
    const last = rects[rects.length - 1]!
    const HANDLE_RADIUS = 40 // px — handles are large, finger-sized touch targets

    const nearStart =
      Math.hypot(touch.clientX - first.left, touch.clientY - first.top) <=
      HANDLE_RADIUS
    const nearEnd =
      Math.hypot(touch.clientX - last.right, touch.clientY - last.bottom) <=
      HANDLE_RADIUS

    return nearStart || nearEnd
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

        // hash is URL-encoded (e.g. `#footnote-%E2%80%A0`); decode so it
        // matches the raw HTML id in scrollTo's getElementById
        const target = decodeURIComponent(anchorElementUrl.hash)

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

  private onDraggingChange = (dragging: boolean) => {
    this.isDragging = dragging
  }

  private onNativeScroll = () => {
    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false
      return
    }

    if (this.isScrolling !== 'smooth') {
      // Sync each axis to the browser's reported scroll position. In single-axis
      // mode the inactive axis just re-reads 0 (or whatever the user dragged via a
      // visible scrollbar); in `'both'` mode both axes track native scroll.
      for (const axis of [this.x, this.y]) {
        // rotate the history slot, then write — velocity/direction derive
        axis.rawLastScroll = axis.rawScroll
        axis.rawScroll = axis.rawTargetScroll = axis.actualScroll
      }

      if (this.isScrollable) {
        this.isScrolling = 'native'
      }

      this.emit()
    }
  }

  // Runs on every native scroll event, even ones onNativeScroll ignores:
  // no event for 400ms → settle the whole system. Re-check the state at fire
  // time — a lerp tail can move <1px/frame and stop producing native scroll
  // events while a smooth scrollTo is still in flight.
  private debouncedNativeScrollReset = debounce(() => {
    if (this.isScrolling !== 'smooth') {
      // read before `reset`, which clears `isScrolling` to false
      const wasNative = this.isScrolling === 'native'

      this.reset()
      this.emit()

      // ponytail: reuses the 400ms settle window, so the polyfilled event lands
      // later than a browser's own (~100ms). Give it its own shorter debounce if
      // that latency shows up.
      if (wasNative && !this.supportsScrollend) this.scheduleScrollendEvent()
    }
  }, 400)

  private onScrollEnd = (e: Event | CustomEvent) => {
    if (e instanceof CustomEvent) return
    // window-level listener: ignore scrollend from any other scroller
    const wrapper = this.options.wrapper
    if (e.target !== (wrapper === window ? document : wrapper)) return

    if (this.isScrolling === 'smooth' || this.isScrolling === false) {
      e.stopPropagation()
    }
  }

  private onOverflowStyleChange = (changed: { x: boolean; y: boolean }) => {
    if (changed.x) this.x.reset()
    if (changed.y) this.y.reset()
    // The other axis may still be mid-flight (multi-axis): leave it and its
    // scrollTo lock alone. Otherwise settle instance state — isScrolling and
    // the lenis-scrolling/lenis-smooth classes, the scrollTo lock, the debounce
    if (!this.isAnyAxisAnimating) this.reset()
  }

  private reset() {
    this.debouncedNativeScrollReset.cancel()

    // A reset interrupts any in-flight `scrollTo` — release its operation lock
    // (a manual `lock()` survives; only the scrollTo-scoped lock is dropped).
    if (this._scrollToLocked) {
      this._scrollToLocked = false
      this.isLocked = false
    }

    this.isScrolling = false
    this.x.reset()
    this.y.reset()
  }

  // ─── scrollTo pipeline ───

  /**
   * Resolve a `scrollTo` target into the concrete `{ axis, target }` pairs to
   * drive. A bare `{ x?, y? }` (or an element in `'both'` mode) yields one
   * entry per axis; everything else yields a single entry on the active axis.
   * Returns `[]` when there's nothing to scroll (e.g. unresolved selector).
   */
  private resolveScrollTargets(
    _target: number | string | HTMLElement | { x?: number; y?: number },
    options: ScrollToOptions
  ): { axis: Axis; target: number }[] {
    // Per-axis offset: a scalar applies to every axis, `{ x?, y? }` per axis.
    const offsetFor = (axis: Axis) => this.resolveOffset(options.offset, axis)
    const active = this.activeAxis

    // 2D dispatch — bare `{ x?, y? }` object (excluding HTMLElement).
    if (
      typeof _target === 'object' &&
      _target !== null &&
      !(_target instanceof HTMLElement)
    ) {
      const { x, y } = _target
      const targets: { axis: Axis; target: number }[] = []
      if (x !== undefined)
        targets.push({ axis: this.x, target: x + offsetFor(this.x) })
      if (y !== undefined)
        targets.push({ axis: this.y, target: y + offsetFor(this.y) })
      return targets
    }

    // Keywords — single-axis semantics (active axis). `top`/`left`/`start`/`#` → 0,
    // `bottom`/`right`/`end` → maxScroll. Users wanting 2D keyword semantics pass `{ x, y }`.
    if (typeof _target === 'string') {
      if (['top', 'left', 'start', '#'].includes(_target)) {
        return [{ axis: active, target: offsetFor(active) }]
      }
      if (['bottom', 'right', 'end'].includes(_target)) {
        return [{ axis: active, target: active.maxScroll + offsetFor(active) }]
      }
    }

    // Resolve a selector / HTMLElement to a `node`
    let node: Element | null = null
    if (typeof _target === 'string') {
      // getElementById accepts any valid HTML id (e.g. `#footnote-†`),
      // querySelector would reject it as an invalid CSS selector
      node = _target.startsWith('#')
        ? document.getElementById(_target.slice(1))
        : document.querySelector(_target)
      if (!node) {
        if (_target === '#top') {
          return [{ axis: active, target: offsetFor(active) }]
        }
        console.warn('Lenis: Target not found', _target)
        return []
      }
    } else if (_target instanceof HTMLElement && _target.nodeType) {
      node = _target
    }

    if (node) {
      if (this.options.orientation === 'both') {
        // 2D: scroll the element into view on both axes.
        return [
          {
            axis: this.x,
            target: this.resolveElementTarget(node, this.x, offsetFor(this.x)),
          },
          {
            axis: this.y,
            target: this.resolveElementTarget(node, this.y, offsetFor(this.y)),
          },
        ]
      }
      return [
        {
          axis: active,
          target: this.resolveElementTarget(node, active, offsetFor(active)),
        },
      ]
    }

    // Bare number
    if (typeof _target === 'number') {
      return [{ axis: active, target: _target + offsetFor(active) }]
    }

    return []
  }

  /** Resolve the `offset` option to a number for a given axis. */
  private resolveOffset(offset: ScrollToOptions['offset'], axis: Axis): number {
    if (typeof offset === 'number') return offset
    if (!offset) return 0
    return (axis.axis === 'x' ? offset.x : offset.y) ?? 0
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

    // Account for scroll-padding CSS property on the scroll container.
    // Percentages resolve against the scrollport dimension on the axis.
    const containerStyle = getComputedStyle(this.rootElement)
    const scrollPaddingRaw =
      axis.axis === 'x'
        ? containerStyle.scrollPaddingLeft
        : containerStyle.scrollPaddingTop
    const scrollPadding = scrollPaddingRaw.endsWith('%')
      ? (Number.parseFloat(scrollPaddingRaw) / 100) *
        ((axis.axis === 'x'
          ? this.scrollingBox.width
          : this.scrollingBox.height) ?? 0)
      : Number.parseFloat(scrollPaddingRaw)

    return (
      (axis.axis === 'x' ? rect.left : rect.top) +
      axis.rawScroll -
      (Number.isNaN(scrollMargin) ? 0 : scrollMargin) -
      (Number.isNaN(scrollPadding) ? 0 : scrollPadding) +
      adjustedOffset
    )
  }

  /**
   * Run one logical `scrollTo` across one or more axes as a single operation:
   * `userData`, `lock`, and the `onStart` / `onComplete` callbacks apply once
   * for the whole call, not once per driven axis. Each axis still animates on
   * its own `Animate` instance under the hood; this layer coordinates their
   * shared lifecycle — `onStart` fires once when the first axis starts and
   * `onComplete` once when the last axis settles.
   *
   * Resolves `true` once every axis reaches its target, `false` as soon as any
   * axis is interrupted (gesture, reset, destroy) or there's nothing to scroll.
   */
  private dispatchScrollTo(
    targets: { axis: Axis; target: number }[],
    {
      onStart,
      onComplete,
      userData,
      lock = false,
      ...options
    }: ScrollToOptions = {}
  ): Promise<boolean> {
    if (targets.length === 0) return Promise.resolve(false)

    // Operation-scoped userData: stays readable through every scroll callback
    // until the whole operation finishes (not wiped when the first axis lands).
    this.userData = userData ?? {}

    // Operation-scoped lock: suppress gestures (on both axes) for the lifetime
    // of the call, then release when it completes (or when `reset` interrupts it).
    if (lock) {
      this.isLocked = true
      this._scrollToLocked = true
    }

    let started = false
    let pending = targets.length

    const handleStart = () => {
      if (started) return
      started = true
      onStart?.(this)
    }

    return new Promise((resolve) => {
      const handleComplete = () => {
        if (--pending > 0) return
        this.userData = {}
        if (lock) {
          this.isLocked = false
          this._scrollToLocked = false
        }
        onComplete?.(this)
        resolve(true)
      }

      for (const { axis, target } of targets) {
        this.scrollAxisTo(axis, target, {
          ...options,
          onStart: handleStart,
          onComplete: handleComplete,
          onCancel: () => resolve(false),
        })
      }
    })
  }

  /**
   * Drive a single `axis` to a numeric `target` — the per-axis animation state
   * machine (infinite-wrap, clamp, `immediate` vs animated branches, the
   * `onStart` / `onUpdate` / `onComplete` hooks). Lenis-level state
   * (`isScrolling`, `emit`, scrollend dispatch) lives on `this` and is shared.
   *
   * Operation-level concerns — `userData`, `lock`, and firing the *caller's*
   * `onStart` / `onComplete` exactly once — are owned by {@link dispatchScrollTo},
   * which is the only caller. The `onStart` / `onComplete` passed here are that
   * orchestrator's per-axis settle hooks.
   */
  private scrollAxisTo(
    axis: Axis,
    _target: number,
    {
      immediate = false,
      programmatic = true,
      lerp = programmatic ? this.options.programmatic.lerp : undefined,
      duration = programmatic ? this.options.programmatic.duration : undefined,
      easing = programmatic ? this.options.programmatic.easing : undefined,
      onStart,
      onComplete,
      onCancel,
    }: ScrollToOptions & { onCancel?: () => void } = {}
  ) {
    if (this.prefersReducedMotion) {
      if (programmatic) {
        // jump cut instead of animation
        immediate = true
      } else {
        // 1:1 input tracking, same mechanism as touch-smooth finger tracking
        lerp = 1
        duration = undefined
        easing = undefined
      }
    }

    let target = _target

    if (this.options.infinite) {
      if (programmatic) {
        // teleport, not motion — sync the velocity history alongside
        axis.rawTargetScroll = axis.rawScroll = axis.rawLastScroll = axis.scroll

        const distance = target - axis.rawScroll

        if (distance > axis.maxScroll / 2) {
          target -= axis.maxScroll
        } else if (distance < -axis.maxScroll / 2) {
          target += axis.maxScroll
        }
      }
    } else {
      target = clamp(0, target, axis.maxScroll)
    }

    if (target === axis.rawTargetScroll) {
      onStart?.(this)
      onComplete?.(this)
      this.scheduleScrollendEvent()
      return
    }

    if (immediate) {
      axis.rawScroll = axis.rawTargetScroll = target
      axis.setScroll(axis.scroll)
      axis.reset()
      if (!this.isAnyAxisAnimating) this.isScrolling = false
      this.preventNextNativeScrollEvent()
      this.emit()
      onStart?.(this)
      onComplete?.(this)

      this.scheduleScrollendEvent()
      return
    }

    if (!programmatic) {
      axis.rawTargetScroll = target
    }

    // flip to easing/time based animation if at least one of them is provided
    if (typeof duration === 'number' && typeof easing !== 'function') {
      easing = defaultEasing
    } else if (typeof easing === 'function' && typeof duration !== 'number') {
      duration = 1
    }

    axis.animate.fromTo(axis.rawScroll, target, {
      duration,
      easing,
      lerp,
      onCancel,
      onStart: () => {
        this.isScrolling = 'smooth'
        onStart?.(this)
      },
      onUpdate: (value: number, completed: boolean) => {
        this.isScrolling = 'smooth'

        // rotate the history slot, then write — velocity/direction derive
        axis.rawLastScroll = axis.rawScroll
        axis.rawScroll = value
        // DOM write is consolidated into a single `wrapper.scrollTo` per frame in `Lenis.raf`.

        if (programmatic) {
          // wheel during programmatic should stop it
          axis.rawTargetScroll = value
        }

        if (!completed) this.emit()

        if (completed) {
          axis.reset()
          if (!this.isAnyAxisAnimating) this.isScrolling = false
          this.emit()
          onComplete?.(this)

          this.scheduleScrollendEvent()

          // avoid emitting event twice
          this.preventNextNativeScrollEvent()
        }
      },
    })
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

  // ─── scrollend plumbing ───

  /**
   * Queue a `scrollend` for the next frame — the frame's delay lets the browser
   * flush the final scroll position first, so listeners read the settled value.
   *
   * Coalescing and the re-check are what keep this to one event per actual end:
   * both axes of a 2D `scrollTo` landing together collapse into a single frame,
   * and a scroll that restarts before the frame lands (a held drag whose lerp
   * settles between two `touchmove`s) never ended at all.
   */
  private scheduleScrollendEvent() {
    if (this._scrollendRafId !== null) return

    this._scrollendRafId = requestAnimationFrame(() => {
      this._scrollendRafId = null
      if (this.isScrolling) return
      this.dispatchScrollendEvent()
    })
  }

  private dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(
      new CustomEvent('scrollend', {
        bubbles: this.options.wrapper === window,
        detail: {
          lenis: this,
        },
      })
    )
  }

  private preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true

    requestAnimationFrame(() => {
      this._preventNextNativeScrollEvent = false
    })
  }

  // ─── class names ───

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
