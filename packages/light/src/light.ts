import { Axis, type AxisHost } from '../../core/src/axis'
import { clamp } from '../../core/src/maths'
import { ScrollingBox } from '../../core/src/scrolling-box'
import type { DimensionsOptions, EasingFunction } from '../../core/src/types'
import { Emitter } from '../../utils/emitter'

// How it works (ScrollSmoother-style, see SMOOTH-WRAPPER.md):
// - the window scrolls natively. Body height mirrors the content and nothing
//   is intercepted, so wheel, touch, keyboard, scrollbar, iframes and every
//   platform gesture stay the browser's
// - the wrapper (position: fixed; inset: 0; overflow: hidden) is what the user
//   sees. Each frame it is scrolled toward the window position with scrollTo.
//   Invariant: window position == target, wrapper position == scroll
// - a wrapper scroll Lenis didn't write (focus, anchor, scrollIntoView, scroll
//   anchoring) is adopted, and the window is brought along

const defaultEasing = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

// 0 and 1 both mean 1:1. Animate's damp with lerp 1 still leaves 37% of the
// distance per frame, so 1 is treated as a jump as well.
const isSmooth = (lerp: number) => lerp > 0 && lerp < 1

export type LenisLightOptions = {
  /** The fixed, `overflow: hidden` element that shows the content @default #smooth-wrapper */
  wrapper?: HTMLElement | Element
  /** The wrapper's child holding the page content; its height sizes the body @default #smooth-content */
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

export type LenisLightScrollToOptions = {
  offset?: number
  /** Jump instead of animating @default false */
  immediate?: boolean
  /** `0 < lerp < 1` animates; otherwise the scroll jumps unless `duration` or `easing` is given @default options.lerp */
  lerp?: number
  /** Switches to a time-based animation (in s) */
  duration?: number
  easing?: EasingFunction
  onComplete?: (lenis: LenisLight) => void
}

export class LenisLight implements AxisHost {
  readonly options: {
    wrapper: HTMLElement | Element
    content: HTMLElement | Element
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

  constructor({
    wrapper = document.getElementById('smooth-wrapper') as HTMLElement,
    content = document.getElementById('smooth-content') as HTMLElement,
    lerp = 0,
    touch,
    autoRaf = true,
    dimensions,
  }: LenisLightOptions = {}) {
    if (!(wrapper && content)) {
      throw new Error(
        'lenis/light: wrapper and content are required (#smooth-wrapper > #smooth-content)'
      )
    }

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
    document.body.style.height = ''
  }

  // ─── events ───

  on(event: 'scroll', callback: (lenis: LenisLight) => void) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
  }

  off(event: 'scroll', callback: (lenis: LenisLight) => void) {
    this.emitter.off(event, callback as (...args: unknown[]) => void)
  }

  private emit() {
    this.emitter.emit('scroll', this)
  }

  // ─── loop ───

  raf = (time: number) => {
    const deltaTime = (time - (this.time || time)) * 0.001
    this.time = time

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
    options: LenisLightScrollToOptions = {}
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
    // body height mirrors the wrapper's scrollable extent, so the window's max
    // scroll equals the wrapper's by construction
    document.body.style.height = `${this.scrollingBox.scrollHeight}px`
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
