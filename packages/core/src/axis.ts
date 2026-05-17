import { Animate } from './animate'
import type { Lenis } from './lenis'
import { modulo } from './maths'
import type { ScrollToOptions, UserData } from './types'

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
   * Cached "is this axis scrollable per its CSS overflow" — read on every gesture, so
   * we don't hit `getComputedStyle` per frame. Refreshed by {@link checkOverflow},
   * which `Lenis` invokes at construction and on `overflow` `transitionend`.
   */
  isScrollable = true

  /**
   * Per-axis lock. When `true`, user-initiated gestures (wheel/touch) targeted at
   * this axis are suppressed; the other axis stays interactive. Flipped on by
   * `Lenis.scrollAxisTo` when invoked with `{ lock: true }` and cleared on
   * animation completion. Independent from `Lenis.isLocked` (the global,
   * user-driven `lock()` / `unlock()` flag).
   */
  isLocked = false

  /**
   * Per-axis user data. Set by `Lenis.scrollAxisTo` from the caller's
   * `userData` option and cleared when this axis's animation completes.
   * Carried through scroll callbacks via the {@link Lenis.userData} getter,
   * which prefers `x.userData` when non-empty so a 2D `scrollTo` keeps the
   * tag visible until *both* axes have finished animating.
   */
  userData: UserData = {}

  /**
   * Re-read the live CSS `overflow` for this axis into {@link isScrollable}. Resets
   * the axis if it just flipped to non-scrollable (so an in-flight animation halts).
   *
   * Returns `true` when {@link isScrollable} changed.
   */
  checkOverflow() {
    this.isScrollable = this.cssOverflow
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

  /**
   * The current scroll value (wrapped to `limit` when `infinite`). Stays full-float —
   * the browser quantizes the DOM write per device pixel ratio at `scrollTo` time, so
   * downstream consumers (transforms, WebGL, etc.) get the full-precision value.
   */
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

  /**
   * Live read of this axis's CSS `overflow` (not `hidden` / `clip`). Touches
   * `getComputedStyle` — prefer the cached {@link isScrollable} on hot paths.
   */
  get cssOverflow() {
    const property = this.axis === 'x' ? 'overflow-x' : 'overflow-y'
    const value = getComputedStyle(this.lenis.rootElement)[
      property as keyof CSSStyleDeclaration
    ] as string

    return !['hidden', 'clip'].includes(value)
  }
}
