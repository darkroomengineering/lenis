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

const defaultEasing = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

// 0 and 1 both mean 1:1. Animate's damp with lerp 1 still leaves 37% of the
// distance per frame, so 1 is treated as a jump as well.
const isSmooth = (lerp: number) => lerp > 0 && lerp < 1

export type LenisSyncOptions = {
  /**
   * The element sync scrolls, what the user sees. Defaults to `body`, which
   * sync styles itself (a pinned `position: sticky` box, `overflow: hidden`,
   * with `html` carrying the content height). Pass your own fixed or sticky,
   * `overflow: hidden` element to keep control of the styles.
   * @default document.body
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
  /** Undoes the inline html/body styles applied when body is the wrapper */
  private restoreStyles?: () => void
  /** Last scrollable extent written to html (content-less change detection) */
  private lastScrollHeight = 0

  constructor({
    wrapper = document.body,
    content,
    lerp = 0.1,
    touch,
    autoRaf = true,
    // no content element to observe: read the extent fresh on every access,
    // so `limit` never lags a content change
    dimensions = content ? undefined : { debounce: 0 },
  }: LenisSyncOptions = {}) {
    if (wrapper === document.body) this.styleBody()

    this.options = {
      wrapper,
      content,
      infinite: false,
      lerp,
      touch: { lerp: touch?.lerp ?? 0 },
      autoRaf,
      dimensions,
    }
    this.inputLerp = lerp

    this.scrollingBox = new ScrollingBox(wrapper, content, dimensions)
    this.scrollingBox.on('resize', this.onResize)
    this.onResize()

    this.y = new Axis('y', this)
    // boot on the window position (scroll restoration), zero velocity
    this.teleport(clamp(0, scrollY, this.limit))

    const { signal } = this.abortController
    addEventListener('scroll', this.onWindowScroll, { signal })
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
      this.options.wrapper.scrollHeight !== this.lastScrollHeight
    ) {
      this.resize()
    }

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
    window.scrollTo({ top: value, behavior: 'instant' })

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
    // wrapper is fixed at inset 0, so viewport coords are wrapper coords
    return element
      ? element.getBoundingClientRect().top + this.y.actualScroll
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
    document.documentElement.style.height = `${this.lastScrollHeight}px`
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

  private onWindowScroll = () => {
    // scrollY goes negative during iOS rubber-band
    const target = clamp(0, scrollY, this.limit)
    if (target === this.y.rawTargetScroll) return // echo of our own window write

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
    window.scrollTo({ top: actual, behavior: 'instant' })
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
