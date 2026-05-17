import type { EasingFunction } from 'lenis'

export type SnapAlign = 'start' | 'center' | 'end'

/**
 * A 2D snap target. `x` and `y` are optional so 1D snaps (single axis) and 2D
 * snaps (`orientation: 'both'`) can share the same shape — an undefined
 * coordinate is left untouched when scrolling.
 */
export type SnapItem = {
  x?: number
  y?: number
}

export type OnSnapCallback = (item: SnapItem & { index?: number }) => void

export type SnapOptions = {
  /**
   * @description Whether to lock the scroll on the snap
   * @default false
   */
  lock?: boolean
  /**
   * @description How a gesture is mapped to a snap target.
   * - `'closest'` — predict the post-gesture scroll position from the
   *   gesture delta and snap to the nearest target within
   *   `distanceThreshold` (velocity-aware).
   * - `'directional'` — the gesture *direction* picks the halfspace; we then
   *   pick the snap closest to the current scroll position whose per-axis
   *   offset is within `distanceThreshold` (gesture *magnitude* is
   *   ignored — every directional flick advances by one snap if a
   *   reachable candidate exists). Pair with `lock: true` and
   *   `debounce: 0` for the tightest one-card-per-flick feel.
   *
   * @default 'closest'
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
   * where the reference depends on `mode`:
   * - `mode: 'closest'` — reference is the *predicted* post-gesture scroll
   *   position. Pass `Infinity` for "always snap to the nearest" (the
   *   former `type: 'mandatory'` behavior).
   * - `mode: 'directional'` — reference is the *current* scroll position.
   *   Acts as a "max jump" so we don't leap over plausible neighbours.
   *   For viewport-sized cards, set this to `'100%'` (or higher) so the
   *   adjacent snap is reachable.
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
