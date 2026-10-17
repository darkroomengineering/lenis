// UIScrollView's release physics. Constants come from Telegram-iOS's decoded
// replica (CoreList/ScrollPhysics: PanRecognizer, ReleaseDecision,
// Deceleration), units are px and ms like UIKit's points and ms.

/** Below this release velocity (px/ms, both axes together) the scroll just stops — `_endPanNormal:` */
export const MIN_FLING_VELOCITY = 0.25
/** The glide ends once its velocity decays under this (px/ms) */
const STOP_VELOCITY = 0.01
/**
 * A pointer idle this long before release had stopped: no fling (ms). iOS's
 * cutoff isn't public, this is Android/Chromium's `ASSUME_POINTER_STOPPED_TIME`.
 */
const STALE_TIME = 40

/**
 * Release velocity of a held touch/drag on one axis, estimated like
 * `UIPanGestureRecognizer` + `UIScrollView`: each event gives a sample
 * `delta / dt`, the recognizer reports `0.2·sample + 0.8·previous sample`, and
 * the release low-passes its last two reports `0.25·latest + 0.75·previous`.
 */
export class VelocityTracker {
  private time = 0
  private pending = 0
  private sample = 0
  private latest = 0
  private previous = 0

  reset(time: number) {
    this.time = time
    this.pending = this.sample = this.latest = this.previous = 0
  }

  add(delta: number, time: number) {
    this.pending += delta
    const dt = time - this.time
    if (dt <= 0) return // same-timestamp events fold into the next sample

    const sample = this.pending / dt
    this.previous = this.latest
    this.latest = 0.2 * sample + 0.8 * this.sample
    this.sample = sample
    this.pending = 0
    this.time = time
  }

  /** `latest` decides whether to fling (see {@link MIN_FLING_VELOCITY}), `velocity` is the fling's */
  release(time: number) {
    if (time - this.time > STALE_TIME) return { latest: 0, velocity: 0 }
    return {
      latest: this.latest,
      velocity: this.previous
        ? 0.75 * this.previous + 0.25 * this.latest
        : this.latest,
    }
  }
}

/**
 * UIScrollView's deceleration as a duration + easing: velocity decays by `rate`
 * per ms (`UIScrollView.DecelerationRate`), so the glide is
 * `x(t) = reach·(1 − rateᵗ)` with `reach = |v| / −ln(rate)`. It ends once the
 * velocity is under {@link STOP_VELOCITY} — or early, still at speed, after
 * `room` px (the scroll limit).
 *
 * With `q = rate^duration` the easing is `(1 − qᵖ) / (1 − q)`: frame-rate
 * independent, and its initial slope matches the release velocity.
 */
export function glide(
  velocity: number,
  rate: number,
  room = Number.POSITIVE_INFINITY
) {
  const lnRate = Math.log(rate)
  const reach = Math.abs(velocity) / -lnRate
  const distance = Math.min(reach - STOP_VELOCITY / -lnRate, room)
  if (!(distance > 0)) return

  const q = 1 - distance / reach
  return {
    distance: Math.sign(velocity) * distance,
    duration: Math.log(q) / lnRate / 1000, // s
    easing: (p: number) => (1 - q ** p) / (1 - q),
  }
}
