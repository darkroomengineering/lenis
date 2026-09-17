import { Axis, type AxisHost } from '../../core/src/axis'
import { clamp } from '../../core/src/maths'
import { ScrollingBox } from '../../core/src/scrolling-box'
import type { DimensionsOptions, EasingFunction } from '../../core/src/types'
import { Emitter } from '../../utils/emitter'

// How it works (ScrollSmoother-style, see SMOOTH-WRAPPER.md):
// - the window scrolls natively. Body height mirrors the content and nothing
//   is intercepted, so wheel, touch, keyboard, scrollbar, iframes and every
//   platform gesture stay the browser's
// - the wrapper is what the user sees. By default it is <body>, which sync
//   makes a pinned 100dvh box itself (position: sticky; top: 0; overflow:
//   hidden — sticky rather than fixed so the browser's scroll-into-view walk,
//   find-in-page included, can continue past it to the root), while <html>
//   gets the content height and keeps the page scrollbar. No markup needed.
//   Each frame the wrapper is scrolled toward the window position with
//   scrollTo. Invariant: window position == target, wrapper position == scroll
// - a wrapper scroll Lenis didn't write (focus, anchor, scrollIntoView, scroll
//   anchoring) is adopted, and the window is brought along
// - nested: any overflow: auto element can be the native scroller instead of
//   the window. Its child is the wrapper: sync pins it (sticky, height 100%
//   of the scroller) and appends a spacer that gives the scroller the
//   content's range, the way html's height does for the page. Two elements,
//   one option, no CSS

const defaultEasing = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

// 0 and 1 both mean 1:1. Animate's damp with lerp 1 still leaves 37% of the
// distance per frame, so 1 is treated as a jump as well.
const isSmooth = (lerp: number) => lerp > 0 && lerp < 1

export type LenisSyncOptions = {
  /**
   * The native scroller that owns the input and the target: `window` for the
   * page, or an `overflow: auto` element for a nested panel.
   * @default window
   */
  scroller?: Window | HTMLElement
  /**
   * The element sync scrolls, what the user sees: the scroller's child. Sync
   * pins it itself (`position: sticky`, `overflow: hidden`, one viewport of
   * the scroller high) and gives the scroller the content's range, through
   * `html`'s height for the page or a spacer it appends for a panel.
   * @default body for the window, the scroller's first element child otherwise
   */
  wrapper?: HTMLElement | Element
  /**
   * Optional element whose size drives the content height through a
   * ResizeObserver. Without it the wrapper's `scrollHeight` is checked once
   * per frame.
   */
  content?: HTMLElement | Element
  /**
   * Smoothing for wheel, keyboard and scrollbar. `0` (default) mirrors the
   * window every frame: pure scroll sync, no smoothing. `0 < lerp < 1` lerps
   * toward the window position.
   * @default 0
   */
  lerp?: number
  /** Same for touch. `0` (default) keeps the platform's own inertia @default { lerp: 0 } */
  touch?: { lerp?: number }
  /** Run the animation loop internally; pass `false` to drive it with `raf(time)` @default true */
  autoRaf?: boolean
  dimensions?: DimensionsOptions
}

export type LenisSyncScrollToOptions = {
  offset?: number
  /** Jump instead of animating @default false */
  immediate?: boolean
  /** `0 < lerp < 1` animates; otherwise the scroll jumps unless `duration` or `easing` is given @default options.lerp */
  lerp?: number
  /** Switches to a time-based animation (in s) */
  duration?: number
  easing?: EasingFunction
  onComplete?: (lenis: LenisSync) => void
}

export class LenisSync implements AxisHost {
  readonly options: {
    wrapper: HTMLElement | Element
    scroller: Window | HTMLElement
    content?: HTMLElement | Element
    infinite: false
    lerp: number
    touch: { lerp: number }
    autoRaf: boolean
    dimensions?: DimensionsOptions
  }
  readonly scrollingBox: ScrollingBox
  /** The vertical scroll axis (the only one, for now) */
  readonly y: Axis
  private readonly emitter = new Emitter()
  private readonly abortController = new AbortController()
  private rafId = 0
  private time = 0
  /** Lerp of the current input; swapped by passive wheel/keyboard/touch tags */
  private inputLerp: number
  /** Undoes the inline styles applied to the wrapper (and html for body) */
  private restoreStyles?: () => void
  /** Nested only: the sibling that gives the scroller the content's range */
  private spacer?: HTMLElement
  private lastClientHeight = 0
  /** Last scrollable extent written to html (content-less change detection) */
  private lastScrollHeight = 0

  constructor({
    scroller = window,
    wrapper = scroller === window
      ? document.body
      : ((scroller as HTMLElement).firstElementChild as HTMLElement),
    content,
    lerp = 0.1,
    touch,
    autoRaf = true,
    // no content element to observe: read the extent fresh on every access,
    // so `limit` never lags a content change
    dimensions = content ? undefined : { debounce: 0 },
  }: LenisSyncOptions = {}) {
    if (wrapper === document.body) {
      // html gets the content height first, while body is still in flow, so
      // no layout ever sees a 100dvh document and clamps the window to 0.
      // Scroll restoration already ran on the plain page and survives this;
      // the first raf mirrors it (see the watchdog in `raf`).
      document.documentElement.style.height = `${document.body.scrollHeight}px`
      this.styleBody()
    } else {
      if (!wrapper)
        throw new Error('lenis/sync: the scroller has no child to pin')
      this.styleWrapper(wrapper as HTMLElement, scroller as HTMLElement)
    }

    this.options = {
      wrapper,
      scroller,
      content,
      infinite: false,
      lerp,
      touch: { lerp: touch?.lerp ?? 0 },
      autoRaf,
      dimensions,
    }
    // no input seen yet: window scrolls are the browser's own (scroll
    // restoration, a hash in the URL) and are mirrored verbatim. The first
    // wheel, key or touch switches to the configured lerp.
    this.inputLerp = 0

    this.scrollingBox = new ScrollingBox(wrapper, content, dimensions)
    this.scrollingBox.on('resize', this.onResize)
    this.onResize()

    this.y = new Axis('y', this)

    const { signal } = this.abortController
    scroller.addEventListener('scroll', this.onScrollerScroll, { signal })
    wrapper.addEventListener('scroll', this.onWrapperScroll, { signal })
    // passive tags only, nothing is intercepted
    addEventListener('wheel', this.tagPointer, { passive: true, signal })
    addEventListener('keydown', this.tagPointer, { signal })
    addEventListener('touchstart', this.tagTouch, { passive: true, signal })

    if (autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  destroy() {
    this.abortController.abort()
    cancelAnimationFrame(this.rafId)
    this.y.destroy()
    this.scrollingBox.destroy()
    this.emitter.destroy()
    document.documentElement.style.height = ''
    this.restoreStyles?.()
  }

  // ─── events ───

  on(event: 'scroll', callback: (lenis: LenisSync) => void) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
  }

  off(event: 'scroll', callback: (lenis: LenisSync) => void) {
    this.emitter.off(event, callback as (...args: unknown[]) => void)
  }

  private emit() {
    this.emitter.emit('scroll', this)
  }

  // ─── loop ───

  raf = (time: number) => {
    const deltaTime = (time - (this.time || time)) * 0.001
    this.time = time

    // ponytail: without a content element there is nothing to observe, so
    // poll the scrollable extent once per frame (a layout read only when
    // dirty). Compared against our own last value: the dimensions cache is
    // refreshed silently by every `limit` read, so it can't be the reference.
    if (
      !this.options.content &&
      (this.options.wrapper.scrollHeight !== this.lastScrollHeight ||
        this.options.wrapper.clientHeight !== this.lastClientHeight)
    ) {
      this.resize()
    }

    // restoration can land after boot without a scroll event: catch any
    // silent scroller change (reading the offset is not a layout read)
    if (this.scrollerPosition !== this.y.rawTargetScroll)
      this.onScrollerScroll()

    if (this.y.advance(deltaTime)) this.y.setScroll(this.y.scroll)

    if (this.options.autoRaf) this.rafId = requestAnimationFrame(this.raf)
  }

  /** Force a dimensions recalculation (also resizes the body) */
  resize() {
    this.scrollingBox.resize()
  }

  // ─── scrollTo ───

  /**
   * Scroll to a number, `'top'` / `'bottom'`, a CSS selector, an element, or
   * `{ y }`. The window jumps to the target at once (that is the invariant);
   * the wrapper animates toward it.
   */
  scrollTo(
    target:
      | number
      | string
      | HTMLElement
      | Element
      | { x?: number; y?: number },
    options: LenisSyncScrollToOptions = {}
  ) {
    const {
      offset = 0,
      immediate = false,
      lerp = this.options.lerp,
      duration,
      easing,
      onComplete,
    } = options

    let value: number | undefined
    if (typeof target === 'number') value = target
    else if (target === 'top') value = 0
    else if (target === 'bottom') value = this.limit
    else if (typeof target === 'string')
      value = this.elementTop(document.querySelector(target))
    else if (target instanceof Element) value = this.elementTop(target)
    else value = target.y
    if (value === undefined) return

    value = clamp(0, value + offset, this.limit)
    this.writeScroller(value)

    const animated =
      duration !== undefined || easing !== undefined || isSmooth(lerp)

    if (immediate || !animated) {
      this.teleport(value)
      this.emit()
      onComplete?.(this)
    } else if (value === this.y.rawTargetScroll) {
      onComplete?.(this)
    } else {
      this.animateTo(value, { lerp, duration, easing }, () =>
        onComplete?.(this)
      )
    }
  }

  private elementTop(element: Element | null) {
    // viewport coords relative to the pinned wrapper, plus its scroll offset
    return element
      ? element.getBoundingClientRect().top -
          this.options.wrapper.getBoundingClientRect().top +
          this.y.actualScroll
      : undefined
  }

  // ─── getters ───

  /** Smoothed scroll value (the wrapper's position) */
  get scroll() {
    return this.y.scroll
  }

  /** Where the scroll is heading (the window's position) */
  get targetScroll() {
    return this.y.targetScroll
  }

  get actualScroll() {
    return this.y.actualScroll
  }

  get velocity() {
    return this.y.velocity
  }

  get direction() {
    return this.y.direction
  }

  get progress() {
    return this.y.progress
  }

  get limit() {
    return this.y.maxScroll
  }

  // ponytail: no 'native' state — with lerp 0 (default) the browser drives and
  // nothing animates. Add a settle debounce if consumers need it.
  get isScrolling(): 'smooth' | false {
    return this.y.animate.isRunning ? 'smooth' : false
  }

  get rootElement() {
    return this.options.wrapper as HTMLElement
  }

  // ─── internals ───

  private onResize = () => {
    // html carries the content height (and so the page scrollbar): the
    // window's max scroll equals the wrapper's by construction
    this.lastScrollHeight = this.scrollingBox.scrollHeight!
    this.lastClientHeight = this.scrollingBox.height!
    if (this.spacer) {
      // the scroller's range: the content minus the one viewport that is pinned
      this.spacer.style.height = `${this.lastScrollHeight - this.lastClientHeight}px`
    } else {
      document.documentElement.style.height = `${this.lastScrollHeight}px`
    }
  }

  /** A nested panel: pin the wrapper inside its scroller, add the range with a spacer */
  private styleWrapper(wrapper: HTMLElement, scroller: HTMLElement) {
    const style = wrapper.style
    const previous = {
      position: style.position,
      top: style.top,
      height: style.height,
      overflow: style.overflow,
    }
    style.position = 'sticky'
    style.top = '0'
    style.height = '100%' // one viewport of the scroller, whatever its size
    style.overflow = 'hidden'
    this.spacer = document.createElement('div')
    scroller.append(this.spacer)
    this.restoreStyles = () => {
      Object.assign(style, previous)
      this.spacer?.remove()
    }
  }

  /** The native scroller's position, the target */
  private get scrollerPosition() {
    const { scroller } = this.options
    return scroller === window ? scrollY : (scroller as HTMLElement).scrollTop
  }

  private writeScroller(value: number) {
    this.options.scroller.scrollTo({ top: value, behavior: 'instant' })
  }

  /** body as the wrapper: a pinned viewport-high box, html owns the page scroll */
  private styleBody() {
    const html = document.documentElement.style
    const body = document.body.style
    const previous = {
      htmlOverflow: html.overflow,
      position: body.position,
      top: body.top,
      height: body.height,
      overflow: body.overflow,
    }
    // html must own a non-visible overflow, otherwise body's `hidden` would
    // propagate to the viewport and kill the page scroll
    html.overflow = 'auto'
    // sticky, not fixed: a fixed box ends the browser's scroll-into-view walk
    // (find-in-page, focus) before it reaches the root; a sticky one lets the
    // window scroll, and the mirror turns that into the body revealing it
    body.position = 'sticky'
    body.top = '0'
    body.height = '100dvh'
    body.overflow = 'hidden'
    this.restoreStyles = () => {
      html.overflow = previous.htmlOverflow
      body.position = previous.position
      body.top = previous.top
      body.height = previous.height
      body.overflow = previous.overflow
    }
  }

  private onScrollerScroll = () => {
    // the offset goes negative during iOS rubber-band
    const target = clamp(0, this.scrollerPosition, this.limit)
    if (target === this.y.rawTargetScroll) return // echo of our own scroller write

    if (isSmooth(this.inputLerp)) {
      this.animateTo(target, { lerp: this.inputLerp })
    } else {
      // no smoothing: mirror the window in this same frame
      this.teleport(target)
      this.emit()
    }
  }

  private onWrapperScroll = () => {
    const actual = this.y.actualScroll
    if (Math.abs(actual - this.y.rawScroll) < 1) return // our own write

    // the browser moved the wrapper itself (focus, anchor, scrollIntoView,
    // scroll anchoring): adopt it and bring the window along
    this.teleport(actual)
    this.writeScroller(actual)
    this.emit()
  }

  private tagPointer = () => {
    this.inputLerp = this.options.lerp
  }

  private tagTouch = () => {
    this.inputLerp = this.options.touch.lerp
  }

  /** Jump the axis to `value` with zero velocity and write it to the wrapper */
  private teleport(value: number) {
    this.y.animate.stop()
    this.y.rawScroll = this.y.rawTargetScroll = this.y.rawLastScroll = value
    this.y.setScroll(value)
  }

  private animateTo(
    target: number,
    {
      lerp,
      duration,
      easing,
    }: { lerp?: number; duration?: number; easing?: EasingFunction },
    onComplete?: () => void
  ) {
    this.y.rawTargetScroll = target

    // time-based when either is given, mirroring core
    if (duration !== undefined) easing ??= defaultEasing
    else if (easing !== undefined) duration = 1

    this.y.animate.fromTo(this.y.rawScroll, target, {
      lerp: duration === undefined ? lerp : undefined,
      duration,
      easing,
      onUpdate: (value, completed) => {
        // rotate the history slot, then write — velocity/direction derive
        this.y.rawLastScroll = this.y.rawScroll
        this.y.rawScroll = value
        this.emit()
        if (completed) onComplete?.()
      },
    })
  }
}
