import { Animate } from './animate'
import type { Lenis } from './lenis'
import { modulo } from './maths'
import type { ScrollToOptions } from './types'

/**
 * A single scroll axis (`x` or `y`). `Lenis` owns one per direction; in single-axis
 * mode only the active one is used, with `orientation: 'both'` both are live.
 *
 * Holds the per-axis scroll state and the animation that drives it. It does not
 * touch gestures, events, class names or the options — that stays on `Lenis`.
 */
export class Axis {
  /** Animated (interpolated) scroll value */
  animatedScroll = 0
  /** Target scroll value the animation is moving toward */
  targetScroll = 0
  /** Current scroll velocity (delta since the last update) */
  velocity = 0
  /** Scroll velocity from the previous update */
  lastVelocity = 0
  /** Scroll direction: `1` forward, `-1` backward, `0` idle */
  direction: 1 | -1 | 0 = 0

  /** @internal the animation driving this axis */
  readonly animate = new Animate()

  constructor(
    /** Which axis this represents */
    readonly axis: 'x' | 'y',
    private readonly lenis: Lenis
  ) {}

  /** @internal */
  destroy() {
    this.animate.stop()
  }

  /**
   * Reset all scroll state to the browser's current scroll position and stop the animation.
   */
  reset() {
    this.animatedScroll = this.targetScroll = this.actualScroll
    this.lastVelocity = this.velocity = 0
    this.animate.stop()
  }

  /**
   * Advance the animation by `deltaTime` (in seconds). Returns `true` if the
   * animation was running this frame (i.e. `animatedScroll` may have changed and
   * the DOM needs to reflect it).
   */
  advance(deltaTime: number) {
    const wasRunning = this.animate.isRunning
    this.animate.advance(deltaTime)
    return wasRunning
  }

  /**
   * Scroll this axis to a numeric target. Thin wrapper around `lenis.scrollAxisTo`
   * so this axis is the one driven.
   */
  scrollTo(target: number, options?: ScrollToOptions) {
    this.lenis.scrollAxisTo(this, target, options)
  }

  /** Write a scroll value to the wrapper for this axis (bypasses `scroll-behavior`). */
  setScroll(value: number) {
    this.lenis.options.wrapper.scrollTo(
      this.axis === 'x'
        ? { left: value, behavior: 'instant' }
        : { top: value, behavior: 'instant' }
    )
  }

  /**
   * The scroll value the browser currently reports for this axis.
   *
   * It has to be read this way because of the DOCTYPE declaration: `window` exposes
   * `scrollX`/`scrollY`, scroll-container elements expose `scrollLeft`/`scrollTop`.
   */
  get actualScroll() {
    const wrapper = this.lenis.options.wrapper as Window | HTMLElement

    return this.axis === 'x'
      ? ((wrapper as Window).scrollX ?? (wrapper as HTMLElement).scrollLeft)
      : ((wrapper as Window).scrollY ?? (wrapper as HTMLElement).scrollTop)
  }

  /** The current scroll value (wrapped to `limit` when `infinite`). */
  get scroll() {
    return this.lenis.options.infinite
      ? modulo(this.animatedScroll, this.limit)
      : this.animatedScroll
  }

  /** The maximum scroll value for this axis. */
  get limit() {
    return this.lenis.dimensions.limit[this.axis]
  }

  /** Scroll progress relative to `limit`, `0..1`. */
  get progress() {
    // avoid progress being NaN
    return this.limit === 0 ? 1 : this.scroll / this.limit
  }

  /** Whether this axis's CSS `overflow` permits scrolling (not `hidden`/`clip`). */
  get cssOverflow() {
    const property = this.axis === 'x' ? 'overflow-x' : 'overflow-y'
    const value = getComputedStyle(this.lenis.rootElement)[
      property as keyof CSSStyleDeclaration
    ] as string

    return !['hidden', 'clip'].includes(value)
  }
}
