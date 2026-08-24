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
 * snap.add({ x: 500, y: 800 })
 *
 * // Element-driven: align[0] = xAlign, align[1] = yAlign
 * snap.add(section, { align: ['start', 'end'] })
 */
export class Snap {
  options: RequiredPick<SnapOptions, 'debounce' | 'mode'>
  elements = new Map<UID, SnapElement>()
  snaps = new Map<UID, SnapItem>()
  isStopped = false
  onSnapDebounced: ((e: GestureData) => void) & { cancel: () => void }
  currentSnapIndex?: number
  /**
   * CSS `scroll-padding` of the wrapper, resolved to px. Insets the snapport
   * when aligning elements. Cached — recomputed on `resize()`.
   */
  private padding = { top: 0, right: 0, bottom: 0, left: 0 }

  /**
   * Wrapper dimensions. Reads directly from the parent Lenis instance which
   * keeps these in sync with a ResizeObserver on the wrapper element — so a
   * non-window wrapper (e.g. a scrollable div) reports its own client size,
   * not the window's.
   */
  get viewport(): { width: number; height: number } {
    return {
      width: this.lenis.scrollingBox.width!,
      height: this.lenis.scrollingBox.height!,
    }
  }

  constructor(
    private lenis: Lenis,
    {
      mode = 'directional',
      lerp,
      lock,
      easing,
      duration,
      distanceThreshold = '50%',
      debounce: debounceDelay = 300,
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

    this.updatePadding()

    this.lenis.on('gesture', this.onGesture)
  }

  /**
   * Read the wrapper's CSS `scroll-padding` and resolve it to px. Percentages
   * resolve against the matching viewport dimension; `auto` → 0.
   */
  private updatePadding() {
    const style = getComputedStyle(this.lenis.rootElement)
    const resolve = (value: string, base: number) =>
      value.endsWith('%')
        ? (Number.parseFloat(value) / 100) * base
        : Number.parseFloat(value) || 0
    this.padding = {
      top: resolve(style.scrollPaddingTop, this.viewport.height),
      right: resolve(style.scrollPaddingRight, this.viewport.width),
      bottom: resolve(style.scrollPaddingBottom, this.viewport.height),
      left: resolve(style.scrollPaddingLeft, this.viewport.width),
    }
  }

  destroy() {
    // Debounced handlers may already be queued — isStopped makes them no-ops.
    this.isStopped = true
    this.lenis.off('gesture', this.onGesture)
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
   * Add a snap target: a raw point, an element, or a list of elements.
   * Returns a function that removes what was added.
   *
   * Points: a number anchors on the active axis (vertical unless the parent
   * Lenis is horizontal); an object `{ x?, y? }` sets each axis explicitly.
   * `options.onSnap` fires when the scroll lands on this point.
   *
   * Elements: each produces a single 2D target derived from its rect and
   * the `align` option — a single value applied to both axes (`'center'`,
   * `['start']`) or a tuple `[xAlign, yAlign]` (`['start', 'end']`).
   *
   * @example
   * snap.add(500)                          // { y: 500 } (or { x: 500 } if horizontal)
   * snap.add({ x: 500, y: 800 })           // 2D point
   * snap.add(500, { onSnap })              // with callback
   * snap.add(section, { align: 'center' })
   * snap.add(document.querySelectorAll('.section'), { align: 'start' })
   */
  add(
    point: number | Pick<SnapItem, 'x' | 'y'>,
    options?: Pick<SnapItem, 'onSnap'>
  ): () => void
  add(element: HTMLElement, options?: SnapElementOptions): () => void
  add(
    elements: Iterable<HTMLElement>,
    options?: SnapElementOptions
  ): () => void
  add(
    target:
      | number
      | Pick<SnapItem, 'x' | 'y'>
      | HTMLElement
      | Iterable<HTMLElement>,
    options: Pick<SnapItem, 'onSnap'> | SnapElementOptions = {}
  ): () => void {
    const id = uid()

    // `nodeType` tells a single element apart from a list (NodeList/array):
    // some elements (form, select) are iterable too.
    if (typeof target === 'object' && 'nodeType' in target) {
      this.elements.set(
        id,
        new SnapElement(target, options, this.lenis.rootElement)
      )
      return () => this.elements.delete(id)
    }

    if (typeof target === 'object' && Symbol.iterator in target) {
      const removers = Array.from(target, (el) => this.add(el, options))
      return () => removers.forEach((remove) => remove())
    }

    const item: SnapItem =
      typeof target === 'number'
        ? this.lenis.options.orientation === 'horizontal'
          ? { x: target }
          : { y: target }
        : { ...target }
    if (options.onSnap) item.onSnap = options.onSnap
    this.snaps.set(id, item)
    return () => this.snaps.delete(id)
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

    this.elements.forEach(({ element, rect, align, lock, onSnap }) => {
      const [xAlign, yAlign] = align
      if (xAlign === 'none' && yAlign === 'none') return

      // CSS `scroll-margin` outsets the element's snap area. Read fresh here
      // (not cached on the element) so style changes are picked up; margins
      // are px-only per spec, so no percentage resolution is needed.
      const style = getComputedStyle(element)
      const margin = {
        top: Number.parseFloat(style.scrollMarginTop) || 0,
        right: Number.parseFloat(style.scrollMarginRight) || 0,
        bottom: Number.parseFloat(style.scrollMarginBottom) || 0,
        left: Number.parseFloat(style.scrollMarginLeft) || 0,
      }

      // Snap area (margin-outset rect) aligned against the snapport
      // (padding-inset viewport) — mirrors CSS scroll snap positioning.
      const resolveX = () => {
        const areaStart = rect.left - margin.left
        const areaEnd = rect.right + margin.right
        const portStart = this.padding.left
        const portEnd = this.viewport.width - this.padding.right
        if (xAlign === 'start') return areaStart - portStart
        if (xAlign === 'center')
          return (areaStart + areaEnd) / 2 - (portStart + portEnd) / 2
        return areaEnd - portEnd
      }
      const resolveY = () => {
        const areaStart = rect.top - margin.top
        const areaEnd = rect.bottom + margin.bottom
        const portStart = this.padding.top
        const portEnd = this.viewport.height - this.padding.bottom
        if (yAlign === 'start') return areaStart - portStart
        if (yAlign === 'center')
          return (areaStart + areaEnd) / 2 - (portStart + portEnd) / 2
        return areaEnd - portEnd
      }

      // In 1D mode only emit the active axis coord; in 2D emit both. An axis
      // aligned 'none' contributes nothing.
      let item: SnapItem
      if (isTwoAxis) {
        item = {}
        if (xAlign !== 'none') item.x = Math.ceil(resolveX())
        if (yAlign !== 'none') item.y = Math.ceil(resolveY())
      } else if (horizontalOnly) {
        if (xAlign === 'none') return
        item = { x: Math.ceil(resolveX()) }
      } else {
        if (yAlign === 'none') return
        item = { y: Math.ceil(resolveY()) }
      }
      if (lock !== undefined) item.lock = lock
      if (onSnap) item.onSnap = onSnap
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

    // Infinite mode has no endpoints — wrap the index so `next()` from the
    // last target reaches the first across the seam (and vice versa); core's
    // scrollTo then animates the short way over it. Otherwise clamp.
    const clamped = this.lenis.options.infinite
      ? ((index % snaps.length) + snaps.length) % snaps.length
      : Math.max(0, Math.min(index, snaps.length - 1))
    this.currentSnapIndex = clamped

    const currentSnap = snaps[clamped]
    if (currentSnap === undefined) return

    const target: { x?: number; y?: number } = {}
    if (currentSnap.x !== undefined) target.x = currentSnap.x
    if (currentSnap.y !== undefined) target.y = currentSnap.y

    // Instance `lock` (when set) overrides the target's own `lock`.
    const lock = this.options.lock ?? currentSnap.lock ?? false

    // Callback payloads carry the snap's data, not its function.
    const { onSnap, ...snapData } = currentSnap

    // `scrollTo` runs the 2D target as one operation, firing onStart/onComplete
    // once for the whole snap — so onSnapStart/onSnapComplete fire once each.
    this.lenis.scrollTo(target, {
      duration: this.options.duration,
      easing: this.options.easing,
      lerp: this.options.lerp,
      lock,
      onStart: () => {
        this.options.onSnapStart?.({
          index: clamped,
          ...snapData,
        })
      },
      onComplete: () => {
        this.options.onSnapComplete?.({
          index: clamped,
          ...snapData,
        })
        onSnap?.({
          index: clamped,
          ...snapData,
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

  /** Common gate shared by the immediate (lock) and debounced snap paths. */
  private shouldSnap(e: GestureData): boolean {
    if (this.isStopped) return false
    if (e.event.type === 'touchmove') return false
    // drag-to-scroll: snap only on release — never while the pointer is held
    // (a mid-drag pause longer than the debounce must not kick off a snap)
    if (
      e.type === 'drag' &&
      e.event.type !== 'pointerup' &&
      e.event.type !== 'pointercancel'
    )
      return false
    // Lenis locked (locked snap in flight, or a manual `lenis.lock()`) ⇒
    // core swallows gestures, so acting on them here would act on ghost
    // input — a flick mid-snap can't kick off a competing snap.
    if (this.lenis.isLocked) return false
    return true
  }

  /**
   * Could any target resolve to `lock: true`? Cheap gate so the immediate
   * path doesn't run computeSnaps (style reads) on every gesture event when
   * nothing can grab. Instance-level `lock` overrides per-target values.
   */
  private get hasLocks(): boolean {
    if (this.options.lock !== undefined) return this.options.lock
    for (const snap of this.snaps.values()) if (snap.lock) return true
    for (const element of this.elements.values()) if (element.lock) return true
    return false
  }

  private onGesture = (e: GestureData) => {
    // A `lock` target grabs (CSS `scroll-snap-stop: always`): the moment it's
    // the pick, snap immediately — no debounce wait — and hold until landed.
    // Always direction-gated (pickDirectional), even in 'closest' mode: a
    // grab only makes sense for a target you're heading toward — measuring
    // plain proximity would rubber-band you back onto the target you're
    // scrolling away from. pickDirectional also skips the point you're
    // resting on (<1px), so a lock target lets you leave it.
    if (this.hasLocks && this.shouldSnap(e)) {
      const snaps = this.computeSnaps()
      if (snaps.length > 0) {
        const index = this.pickDirectional(snaps, e, this.resolvedThreshold)
        const target = index === -1 ? undefined : snaps[index]
        if (target && (this.options.lock ?? target.lock ?? false)) {
          // Cancel the queued debounced snap so it can't re-fire after the
          // grab and land somewhere else.
          this.onSnapDebounced.cancel()
          this.goTo(index)
          return
        }
      }
    }
    this.onSnapDebounced(e)
  }

  private onSnap = (e: GestureData) => {
    if (!this.shouldSnap(e)) return

    const snaps = this.computeSnaps()
    if (snaps.length === 0) return

    const threshold = this.resolvedThreshold
    const bestIndex =
      this.options.mode === 'directional'
        ? this.pickDirectional(snaps, e, threshold)
        : this.pickClosest(snaps, threshold)

    if (bestIndex === -1) return
    this.goTo(bestIndex)
  }

  /**
   * Per-axis offset from `current` to a snap coordinate. In infinite mode
   * positions live on a circle of length `maxScroll`, so take the shortest
   * signed arc — targets across the seam stay reachable (scrolling up from
   * the first section picks the last one), matching core's own shortest-path
   * rebase in `scrollTo`. `undefined` coords contribute 0 (axis untouched).
   */
  private snapDelta(
    coord: number | undefined,
    current: number,
    period: number
  ): number {
    if (coord === undefined) return 0
    const delta = coord - current
    if (this.lenis.options.infinite && period > 0) {
      return delta - Math.round(delta / period) * period
    }
    return delta
  }

  /**
   * Pick the snap closest to the scroll's natural resting position. Per-axis
   * threshold gates the nearest-neighbour search so a snap can't win just by
   * being close on one axis.
   */
  private pickClosest(
    snaps: SnapItem[],
    threshold: { x: number; y: number }
  ): number {
    // By the time the debounced handler runs, core has folded every gesture
    // delta into targetScroll (the resting point, wrapped to maxScroll in
    // infinite mode) — exact regardless of lerp/debounce timing. No delta
    // math needed.
    const predicted = {
      x: Math.ceil(this.lenis.x.targetScroll),
      y: Math.ceil(this.lenis.y.targetScroll),
    }

    let bestIndex = -1
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i]!
      const dx = this.snapDelta(snap.x, predicted.x, this.lenis.x.maxScroll)
      const dy = this.snapDelta(snap.y, predicted.y, this.lenis.y.maxScroll)

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
   * picks the halfspace; we then return the snap closest to where the
   * scroll is heading (targetScroll) in that halfspace whose per-axis
   * offset is within `distanceThreshold`. A flick advances one snap from
   * the heading position — a fling hard enough to overshoot the adjacent
   * snap lands on the one past it.
   */
  private pickDirectional(
    snaps: SnapItem[],
    e: GestureData,
    threshold: { x: number; y: number }
  ): number {
    // Direction comes from the scroll's actual motion (lenis.direction =
    // velocity sign — immune to trackpad recoil deltas and seam-free in
    // infinite mode), falling back to the last gesture's sign once the
    // animation has settled (velocity = 0).
    const dirX = (this.lenis.x.direction || Math.sign(e.deltaX)) as -1 | 0 | 1
    const dirY = (this.lenis.y.direction || Math.sign(e.deltaY)) as -1 | 0 | 1
    if (dirX === 0 && dirY === 0) return -1

    // With `gestureOrientation: 'both'`, a gesture on either axis can drive the
    // scroll, so detection is axis-agnostic and a zero-direction axis must not
    // block a snap. Otherwise (single-axis gestures), a snap that needs to move
    // on a zero-direction axis isn't reachable — a horizontal flick can't
    // trigger a vertical snap.
    const anyDirection = this.lenis.options.gestureOrientation === 'both'

    const current = {
      x: this.lenis.x.targetScroll,
      y: this.lenis.y.targetScroll,
    }

    let bestIndex = -1
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i]!
      const dx = this.snapDelta(snap.x, current.x, this.lenis.x.maxScroll)
      const dy = this.snapDelta(snap.y, current.y, this.lenis.y.maxScroll)

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
    this.updatePadding()
    this.elements.forEach((element) => {
      element.onWrapperResize()
    })
  }
}
