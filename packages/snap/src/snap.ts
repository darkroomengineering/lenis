import type Lenis from 'lenis'
import type { GestureData } from 'lenis'
import { debounce } from './debounce'
import type { SnapElementOptions } from './element'
import { SnapElement } from './element'
import type { SnapItem, SnapOptions } from './types'
import type { UID } from './uid'
import { uid } from './uid'

// TODO:
// - fix wheel scrolling after limits (see console scroll to)
// - arrow, spacebar

type RequiredPick<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>

/**
 * Snap class. Every snap target is a 2D point `{ x?, y? }` — `undefined`
 * coordinates are left untouched when scrolling, so the same shape covers 1D
 * (`orientation: 'vertical' | 'horizontal'`) and 2D (`orientation: 'both'`).
 *
 * Detection is axis-agnostic: each gesture predicts the next 2D scroll
 * position and snaps to the closest target by Euclidean distance, no matter
 * whether the gesture was horizontal or vertical.
 *
 * @example
 * const snap = new Snap(lenis, { distanceThreshold: Infinity })
 *
 * // 1D: single coordinate, picked on the active axis
 * snap.add(500)
 *
 * // 2D: explicit point
 * snap.add(500, 800)
 *
 * // Element-driven: align[0] = xAlign, align[1] = yAlign
 * snap.addElement(section, { align: ['start', 'end'] })
 */
export class Snap {
  options: RequiredPick<SnapOptions, 'debounce' | 'mode'>
  elements = new Map<UID, SnapElement>()
  snaps = new Map<UID, SnapItem>()
  isStopped = false
  onSnapDebounced: (e: GestureData) => void
  currentSnapIndex?: number
  /**
   * Count of snap operations currently in flight. `scrollTo` fires `onStart` /
   * `onComplete` once per call (even for a 2D `{ x, y }` snap), so this is a
   * clean "is snapping" gate: incremented on start, decremented on complete.
   */
  private inFlight = 0

  /**
   * Wrapper dimensions. Reads directly from the parent Lenis instance which
   * keeps these in sync with a ResizeObserver on the wrapper element — so a
   * non-window wrapper (e.g. a scrollable div) reports its own client size,
   * not the window's.
   */
  get viewport(): { width: number; height: number } {
    return {
      width: this.lenis.dimensions.width!,
      height: this.lenis.dimensions.height!,
    }
  }

  constructor(
    private lenis: Lenis,
    {
      mode = 'closest',
      lerp,
      lock = false,
      easing,
      duration,
      distanceThreshold = '50%',
      debounce: debounceDelay = 500,
      onSnapStart,
      onSnapComplete,
    }: SnapOptions = {}
  ) {
    if (!window.lenis) {
      window.lenis = {}
    }

    window.lenis.snap = true

    this.options = {
      mode,
      lerp,
      easing,
      duration,
      lock,
      distanceThreshold,
      debounce: debounceDelay,
      onSnapStart,
      onSnapComplete,
    }

    this.onSnapDebounced = debounce(
      this.onSnap as (...args: unknown[]) => void,
      this.options.debounce
    )

    this.lenis.on('gesture', this.onSnapDebounced)
  }

  destroy() {
    this.lenis.off('gesture', this.onSnapDebounced)
    this.elements.forEach((element) => {
      element.destroy()
    })
  }

  start() {
    this.isStopped = false
  }

  stop() {
    this.isStopped = true
  }

  /**
   * Add a raw snap point.
   *
   * Two-argument form is a 2D point; one-argument form anchors on the active
   * axis (vertical unless the parent Lenis is horizontal).
   *
   * @example
   * snap.add(500)         // 1D: { y: 500 } (or { x: 500 } if horizontal)
   * snap.add(500, 800)    // 2D: { x: 500, y: 800 }
   */
  add(x: number, y?: number): () => void {
    const id = uid()
    const item: SnapItem =
      y === undefined
        ? this.lenis.options.orientation === 'horizontal'
          ? { x }
          : { y: x }
        : { x, y }
    this.snaps.set(id, item)
    return () => this.snaps.delete(id)
  }

  /**
   * Add an element. The element produces a single 2D snap target whose
   * coordinates are derived from its rect and the `align` option.
   *
   * `align` accepts:
   * - a single value applied to both axes: `'center'`, `['start']`
   * - a tuple `[xAlign, yAlign]`: `['start', 'end']`
   */
  addElement(
    element: HTMLElement,
    options: SnapElementOptions = {}
  ): () => void {
    const id = uid()

    this.elements.set(id, new SnapElement(element, options))

    return () => this.elements.delete(id)
  }

  addElements(
    elements: HTMLElement[] | NodeListOf<HTMLElement>,
    options: SnapElementOptions = {}
  ): () => void {
    const map = Array.from(elements).map((element) =>
      this.addElement(element, options)
    )
    return () => {
      map.forEach((remove) => {
        remove()
      })
    }
  }

  /**
   * Compute every 2D snap target. Elements contribute one point each (their
   * `align`-resolved coordinates); raw `snap.add` items pass through as-is.
   * Identical points are deduped so the cursor / proximity math sees a clean
   * sequence even when many elements share the same column/row.
   */
  private computeSnaps = (): SnapItem[] => {
    const horizontalOnly = this.lenis.options.orientation === 'horizontal'
    const isTwoAxis = this.lenis.options.orientation === 'both'

    const collected: SnapItem[] = []

    for (const snap of this.snaps.values()) {
      collected.push(snap)
    }

    this.elements.forEach(({ rect, align }) => {
      const [xAlign, yAlign] = align

      const resolveX = () => {
        if (xAlign === 'start') return rect.left
        if (xAlign === 'center')
          return rect.left + rect.width / 2 - this.viewport.width / 2
        return rect.left + rect.width - this.viewport.width
      }
      const resolveY = () => {
        if (yAlign === 'start') return rect.top
        if (yAlign === 'center')
          return rect.top + rect.height / 2 - this.viewport.height / 2
        return rect.top + rect.height - this.viewport.height
      }

      // In 1D mode only emit the active axis coord; in 2D emit both.
      let item: SnapItem
      if (isTwoAxis) {
        item = { x: Math.ceil(resolveX()), y: Math.ceil(resolveY()) }
      } else if (horizontalOnly) {
        item = { x: Math.ceil(resolveX()) }
      } else {
        item = { y: Math.ceil(resolveY()) }
      }
      collected.push(item)
    })

    // Sort by (x, y) lexicographically — gives `next/previous` a stable order
    // and lets us dedupe consecutive identical points.
    collected.sort((a, b) => {
      const ax = a.x ?? Number.NEGATIVE_INFINITY
      const bx = b.x ?? Number.NEGATIVE_INFINITY
      if (ax !== bx) return ax - bx
      const ay = a.y ?? Number.NEGATIVE_INFINITY
      const by = b.y ?? Number.NEGATIVE_INFINITY
      return ay - by
    })

    const snaps: SnapItem[] = []
    for (const item of collected) {
      const last = snaps[snaps.length - 1]
      if (!last || last.x !== item.x || last.y !== item.y) {
        snaps.push(item)
      }
    }
    return snaps
  }

  previous() {
    this.goTo((this.currentSnapIndex ?? 0) - 1)
  }

  next() {
    this.goTo((this.currentSnapIndex ?? 0) + 1)
  }

  goTo(index: number) {
    const snaps = this.computeSnaps()
    if (snaps.length === 0) return

    const clamped = Math.max(0, Math.min(index, snaps.length - 1))
    this.currentSnapIndex = clamped

    const currentSnap = snaps[clamped]
    if (currentSnap === undefined) return

    const target: { x?: number; y?: number } = {}
    if (currentSnap.x !== undefined) target.x = currentSnap.x
    if (currentSnap.y !== undefined) target.y = currentSnap.y

    // `scrollTo` runs the 2D target as one operation, firing onStart/onComplete
    // once for the whole snap — so onSnapStart/onSnapComplete fire once each.
    this.lenis.scrollTo(target, {
      duration: this.options.duration,
      easing: this.options.easing,
      lerp: this.options.lerp,
      lock: this.options.lock,
      onStart: () => {
        this.inFlight++
        this.options.onSnapStart?.({
          index: clamped,
          ...currentSnap,
        })
      },
      onComplete: () => {
        this.inFlight = Math.max(0, this.inFlight - 1)
        this.options.onSnapComplete?.({
          index: clamped,
          ...currentSnap,
        })
      },
    })
  }

  /**
   * Resolve a single threshold entry against a base dimension. Percentages
   * scale against `base`; numbers pass through as pixels.
   */
  private resolveThresholdValue(
    value: number | `${number}%` | undefined,
    base: number
  ): number {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (Number(value.replace('%', '')) / 100) * base
    }
    if (typeof value === 'number') return value
    return base
  }

  /**
   * Threshold expressed as per-axis pixel values. Scalar / percentage inputs
   * resolve against each axis's viewport dimension independently. Pass
   * `Infinity` (per axis or scalar) to disable the gate entirely.
   */
  private get resolvedThreshold(): { x: number; y: number } {
    const { distanceThreshold } = this.options
    const [xRaw, yRaw] = Array.isArray(distanceThreshold)
      ? distanceThreshold
      : [distanceThreshold, distanceThreshold]

    return {
      x: this.resolveThresholdValue(xRaw, this.viewport.width),
      y: this.resolveThresholdValue(yRaw, this.viewport.height),
    }
  }

  private onSnap = (e: GestureData) => {
    if (this.isStopped) return
    if (e.event.type === 'touchmove') return
    // `lock: true` ⇒ ignore gestures while a snap animation is still running,
    // so a flick mid-snap can't kick off a competing snap.
    if (this.options.lock === true && this.inFlight > 0) return

    const snaps = this.computeSnaps()
    if (snaps.length === 0) return

    const threshold = this.resolvedThreshold
    const bestIndex =
      this.options.mode === 'directional'
        ? this.pickDirectional(snaps, e, threshold)
        : this.pickClosest(snaps, e, threshold)

    if (bestIndex === -1) return
    this.goTo(bestIndex)
  }

  /**
   * Predict the post-gesture 2D scroll position and pick the snap closest to
   * it. Per-axis threshold gates the nearest-neighbour search so a snap can't
   * win just by being close on one axis.
   */
  private pickClosest(
    snaps: SnapItem[],
    e: GestureData,
    threshold: { x: number; y: number }
  ): number {
    // The gesture event fires before per-axis routing in core, so adding the
    // gesture delta to the current scroll mirrors what Lenis is about to do.
    const predicted = {
      x: Math.ceil(this.lenis.x.scroll + e.deltaX),
      y: Math.ceil(this.lenis.y.scroll + e.deltaY),
    }

    let bestIndex = -1
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i]!
      const dx = snap.x === undefined ? 0 : snap.x - predicted.x
      const dy = snap.y === undefined ? 0 : snap.y - predicted.y

      if (snap.x !== undefined && Math.abs(dx) > threshold.x) continue
      if (snap.y !== undefined && Math.abs(dy) > threshold.y) continue

      const distance = Math.hypot(dx, dy)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
    }
    return bestIndex
  }

  /**
   * Slideshow / carousel selection. The gesture's *direction* (per axis)
   * picks the halfspace; we then return the snap closest to the current
   * scroll position in that halfspace whose per-axis offset is within
   * `distanceThreshold`. The gesture *magnitude* is irrelevant — every
   * directional flick advances by one snap as long as a reachable
   * candidate exists.
   */
  private pickDirectional(
    snaps: SnapItem[],
    e: GestureData,
    threshold: { x: number; y: number }
  ): number {
    const dirX = Math.sign(e.deltaX) as -1 | 0 | 1
    const dirY = Math.sign(e.deltaY) as -1 | 0 | 1
    if (dirX === 0 && dirY === 0) return -1

    // With `gestureOrientation: 'both'`, a gesture on either axis can drive the
    // scroll, so detection is axis-agnostic and a zero-direction axis must not
    // block a snap. Otherwise (single-axis gestures), a snap that needs to move
    // on a zero-direction axis isn't reachable — a horizontal flick can't
    // trigger a vertical snap.
    const anyDirection = this.lenis.options.gestureOrientation === 'both'

    const current = {
      x: this.lenis.x.scroll,
      y: this.lenis.y.scroll,
    }

    let bestIndex = -1
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i]!
      const dx = snap.x === undefined ? 0 : snap.x - current.x
      const dy = snap.y === undefined ? 0 : snap.y - current.y

      // Skip the snap we're already on (within sub-pixel rounding).
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue

      // Direction gate: every defined axis that needs to move must do so in
      // the gesture's direction on that axis. A zero-direction axis blocks a
      // snap that needs to move along it — unless `anyDirection` (then the
      // gesture may drive any axis, so skip the gate for that axis).
      if (
        snap.x !== undefined &&
        Math.abs(dx) >= 1 &&
        !(anyDirection && dirX === 0) &&
        Math.sign(dx) !== dirX
      )
        continue
      if (
        snap.y !== undefined &&
        Math.abs(dy) >= 1 &&
        !(anyDirection && dirY === 0) &&
        Math.sign(dy) !== dirY
      )
        continue

      // Reach gate: snap must sit within `distanceThreshold` of the current
      // scroll on each axis with a defined coord. Acts as a "max jump" so
      // we don't leap past plausible neighbours into a far-off target.
      if (snap.x !== undefined && Math.abs(dx) > threshold.x) continue
      if (snap.y !== undefined && Math.abs(dy) > threshold.y) continue

      const distance = Math.hypot(dx, dy)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
    }
    return bestIndex
  }

  resize() {
    this.elements.forEach((element) => {
      element.onWrapperResize()
    })
  }
}
