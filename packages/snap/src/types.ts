import type { EasingFunction } from 'lenis'

/** Mirrors CSS `scroll-snap-align` — `'none'` skips that axis. */
export type SnapAlign = 'start' | 'center' | 'end' | 'none'

/**
 * `align` option of `snap.add(element)`. A value or list applies to the
 * active axis (vertical unless the parent Lenis is horizontal) — every entry
 * adds one snap point for the same element (`['start', 'end']` snaps to both
 * edges). `{ x, y }` aligns each axis on its own; an omitted axis is `'none'`.
 * In `orientation: 'both'` a value or list applies to both axes and the x
 * and y lists combine, every x with every y — `['start', 'end']` equals
 * `{ x: ['start', 'end'], y: ['start', 'end'] }`, the four corners.
 */
export type SnapAlignOption =
  | SnapAlign
  | SnapAlign[]
  | { x?: SnapAlign | SnapAlign[]; y?: SnapAlign | SnapAlign[] }

/** A distance in px, or a percentage of the viewport on that axis. */
export type SnapThreshold = number | `${number}%`

/**
 * A 2D snap target. `x` and `y` are optional so 1D snaps (single axis) and 2D
 * snaps (`orientation: 'both'`) can share the same shape — an undefined
 * coordinate is left untouched when scrolling.
 */
export type SnapItem = {
  x?: number
  y?: number
  /**
   * Per-target grab (from `snap.add(element)`'s `lock` option): the moment this
   * target is picked in the gesture's direction of travel, snap to it
   * immediately (no debounce wait) and hold the scroll until it lands —
   * like CSS `scroll-snap-stop: always`. Ignored when the instance-level
   * `lock` is set — instance overrides element.
   */
  lock?: boolean
  /**
   * Per-target callback, fired when the scroll lands on this point (same
   * timing as the `'complete'` event). Stripped from callback payloads.
   */
  onSnap?: OnSnapCallback
  /**
   * Per-target animation overrides: win over the instance-level `lerp` /
   * `duration` / `easing` when snapping to this target. Stripped from
   * callback payloads.
   */
  lerp?: number
  duration?: number
  easing?: EasingFunction
}

/** Per-target options every `snap.add` form accepts: grab, callback, animation overrides. */
export type SnapTargetOptions = Pick<
  SnapItem,
  'lock' | 'onSnap' | 'lerp' | 'duration' | 'easing'
>

export type OnSnapCallback = (item: SnapItem & { index?: number }) => void

/** `'start'`: the scroll starts moving toward a target. `'complete'`: it landed. */
export type SnapEvent = 'start' | 'complete'

export type SnapOptions = {
  /**
   * @description Locked targets grab: the moment one is picked in the
   * gesture's direction of travel, the snap fires immediately (no debounce
   * wait) and holds the scroll until it lands — like CSS `scroll-snap-stop:
   * always`. `true` makes every target grab; when set (true or false) it
   * overrides any per-element `lock`; leave unset to let each element
   * decide (elements without a `lock` default to false).
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
   *   is within `distanceThreshold`. Pair with `lock: true` for the
   *   tightest one-card-per-flick feel.
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
   * - `{ x, y }`: separate value per axis, same number-or-percentage rule.
   *   An omitted axis uses the default.
   *
   * Coordinates left `undefined` on a snap item skip their axis check
   * (always pass).
   */
  distanceThreshold?: SnapThreshold | { x?: SnapThreshold; y?: SnapThreshold }
  /**
   * @default 500
   * @description The debounce delay (in ms) to prevent snapping too often.
   */
  debounce?: number
}
