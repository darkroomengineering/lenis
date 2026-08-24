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
  /**
   * Raw animated (interpolated) scroll value, unwrapped in infinite mode.
   * Public consumers read {@link scroll} instead.
   */
  rawScroll = 0
  /**
   * Raw target the animation is moving toward, in the same unwrapped space as
   * `rawScroll` (accumulates past `maxScroll` in infinite mode). Public
   * consumers read {@link targetScroll} instead.
   */
  rawTargetScroll = 0
  /**
   * Previous update's `rawScroll` — the history slot behind the derived
   * {@link velocity}. Update sites rotate it before writing `rawScroll`;
   * teleport writes (reset, immediate scrollTo, infinite rebase) sync it
   * instead, so a jump never registers as motion.
   */
  rawLastScroll = 0

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
    this.rawScroll =
      this.rawTargetScroll =
      this.rawLastScroll =
        this.actualScroll
    this.animate.stop()
  }

  /**
   * Advance the animation by `deltaTime` (in seconds). Returns `true` if the
   * animation was running this frame (i.e. `rawScroll` may have changed and
   * the DOM needs to reflect it).
   */
  advance(deltaTime: number) {
    const wasRunning = this.animate.isRunning
    this.animate.advance(deltaTime)
    return wasRunning
  }

  /**
   * Scroll this axis to a numeric target. Routes through `lenis.scrollTo` so
   * the call gets the same single-fire orchestration (`onStart` / `onComplete`,
   * `userData`, `lock`) as any other `scrollTo`.
   */
  scrollTo(target: number, options?: ScrollToOptions) {
    return this.lenis.scrollTo(
      this.axis === 'x' ? { x: target } : { y: target },
      options
    )
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
   * The current scroll value (wrapped to `maxScroll` when `infinite`). Stays full-float —
   * the browser quantizes the DOM write per device pixel ratio at `scrollTo` time, so
   * downstream consumers (transforms, WebGL, etc.) get the full-precision value.
   */
  get scroll() {
    return this.lenis.options.infinite
      ? modulo(this.rawScroll, this.maxScroll)
      : this.rawScroll
  }

  /**
   * The scroll value this axis is heading to rest at — `rawTargetScroll`
   * wrapped to `maxScroll` when `infinite`, mirroring {@link scroll}. The raw
   * value can sit outside `[0, maxScroll]` in infinite mode, so consumers
   * comparing against document positions (e.g. snap) read this.
   */
  get targetScroll() {
    return this.lenis.options.infinite
      ? modulo(this.rawTargetScroll, this.maxScroll)
      : this.rawTargetScroll
  }

  /**
   * Scroll delta since the last update — derived:
   * `rawScroll - rawLastScroll`. Raw space, so it stays seam-free in
   * infinite mode; zero at rest and after teleports.
   */
  get velocity() {
    return this.rawScroll - this.rawLastScroll
  }

  /**
   * Scroll direction: `1` forward, `-1` backward, `0` idle. Derived from
   * actual motion (the {@link velocity} sign), so it only flips once the
   * scroll really reverses — not the frame an opposing gesture retargets it.
   */
  get direction(): 1 | -1 | 0 {
    return Math.sign(this.velocity) as 1 | -1 | 0
  }

  /** The maximum scroll value for this axis. */
  get maxScroll() {
    return this.lenis.scrollingBox.maxScroll[this.axis]
  }

  /**
   * Whether this axis can currently scroll: the wrapper is a scroll container
   * with overflowing content on this axis (delegates to `ScrollingBox`).
   */
  get isScrollable() {
    return this.lenis.scrollingBox.isScrollable[this.axis]
  }

  /** Scroll progress relative to `maxScroll`, `0..1`. */
  get progress() {
    // avoid progress being NaN
    return this.maxScroll === 0 ? 0 : this.scroll / this.maxScroll
  }
}
