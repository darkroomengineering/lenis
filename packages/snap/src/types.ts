import type { EasingFunction } from 'lenis'

/** Mirrors CSS `scroll-snap-align` — `'none'` skips that axis. */
export type SnapAlign = 'start' | 'center' | 'end' | 'none'

/**
 * A 2D snap target. `x` and `y` are optional so 1D snaps (single axis) and 2D
 * snaps (`orientation: 'both'`) can share the same shape — an undefined
 * coordinate is left untouched when scrolling.
 */
export type SnapItem = {
  x?: number
  y?: number
  /**
   * Per-target lock (from `addElement`'s `lock` option). Ignored when the
   * instance-level `lock` is set — instance overrides element.
   */
  lock?: boolean
  /**
   * Per-target callback, fired when the scroll lands on this point (same
   * timing as `onSnapComplete`). Stripped from callback payloads.
   */
  onSnap?: OnSnapCallback
}

export type OnSnapCallback = (item: SnapItem & { index?: number }) => void

export type SnapOptions = {
  /**
   * @description Whether to lock the scroll on the snap. When set (true or
   * false), overrides any per-element `lock`; leave unset to let each
   * element decide (elements without a `lock` default to false).
   * @default undefined
   */
  lock?: boolean
  /**
   * @description How a gesture is mapped to a snap target. Both modes
   * measure from the scroll's natural resting position (`targetScroll` —
   * where the in-flight inertia will land, wrapped in infinite mode).
   * - `'closest'` — snap to the nearest target within `distanceThreshold`
   *   of the resting position.
   * - `'directional'` — the gesture *direction* picks the halfspace; we then
   *   pick the snap closest to the resting position whose per-axis offset
   *   is within `distanceThreshold`. Pair with `lock: true` and
   *   `debounce: 0` for the tightest one-card-per-flick feel.
   *
   * @default 'directional'
   */
  mode?: 'closest' | 'directional'
  /**
   * @description Linear interpolation (lerp) intensity (between 0 and 1)
   */
  lerp?: number
  /**
   * @description The easing function to use for the snap animation
   */
  easing?: EasingFunction
  /**
   * @description The duration of the snap animation (in s)
   */
  duration?: number
  /**
   * @default '50%'
   * @description Per-axis "max reach" applied as `|snap - reference| ≤ value`,
   * where the reference is the scroll's natural resting position
   * (`targetScroll`) in both modes:
   * - `mode: 'closest'` — pass `Infinity` for "always snap to the nearest"
   *   (the former `type: 'mandatory'` behavior).
   * - `mode: 'directional'` — acts as a "max jump" so we don't leap over
   *   plausible neighbours. For viewport-sized cards, set this to `'100%'`
   *   (or higher) so the adjacent snap is reachable.
   *
   * Shape:
   * - Scalar (`number` or `'50%'`): applied to both axes. Percentages scale
   *   against each axis's viewport dimension independently (`x` → width,
   *   `y` → height), so `'50%'` is "half a viewport on each axis".
   * - Tuple `[x, y]`: separate value per axis. Each entry follows the same
   *   number-or-percentage rule.
   *
   * Coordinates left `undefined` on a snap item skip their axis check
   * (always pass).
   */
  distanceThreshold?:
    | number
    | `${number}%`
    | [number | `${number}%`, number | `${number}%`]
  /**
   * @default 500
   * @description The debounce delay (in ms) to prevent snapping too often.
   */
  debounce?: number
  /**
   * @description Called when the snap starts
   */
  onSnapStart?: OnSnapCallback
  /**
   * @description Called when the snap completes
   */
  onSnapComplete?: OnSnapCallback
}
