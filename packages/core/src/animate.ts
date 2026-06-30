import { clamp, damp } from './maths'
import type { EasingFunction, FromToOptions, OnUpdateCallback } from './types'

// Lerping asymptotically approaches the target but never exactly reaches it,
// so the raw value keeps trailing very long floating-point decimals. QUANTIZE
// snaps both value and target to a coarse grid (1/QUANTIZE) when comparing, so
// once they're within ~0.1 the animation is considered completed and snapped to
// the exact target — preventing an effectively infinite, never-ending animation.
const QUANTIZE = 10

/**
 * Animate class to handle value animations with lerping or easing
 *
 * @example
 * const animate = new Animate()
 * animate.fromTo(0, 100, { duration: 1, easing: (t) => t })
 * animate.advance(0.5) // 50
 */
export class Animate {
  isRunning = false
  value = 0
  from = 0
  to = 0
  currentTime = 0

  // These are instanciated in the fromTo method
  lerp?: number
  duration?: number
  easing?: EasingFunction
  onUpdate?: OnUpdateCallback

  /**
   * Advance the animation by the given delta time
   *
   * @param deltaTime - The time in seconds to advance the animation
   */
  advance(deltaTime: number) {
    if (!this.isRunning) return

    let completed = false

    if (this.duration && this.easing) {
      this.currentTime += deltaTime
      const linearProgress = clamp(0, this.currentTime / this.duration, 1)

      completed = linearProgress >= 1
      const easedProgress = completed ? 1 : this.easing(linearProgress)
      this.value = this.from + (this.to - this.from) * easedProgress
    } else if (this.lerp) {
      this.value = damp(this.value, this.to, this.lerp * 60, deltaTime)
      if (
        Math.round(this.value * QUANTIZE) / QUANTIZE ===
        Math.round(this.to * QUANTIZE) / QUANTIZE
      ) {
        this.value = this.to
        completed = true
      }
    } else {
      // If no easing or lerp, just jump to the end value
      this.value = this.to
      completed = true
    }

    if (completed) {
      this.stop()
    }

    // Call the onUpdate callback with the current value and completed status
    this.onUpdate?.(this.value, completed)
  }

  /** Stop the animation */
  stop() {
    this.isRunning = false
  }

  /**
   * Set up the animation from a starting value to an ending value
   * with optional parameters for lerping, duration, easing, and onUpdate callback
   *
   * @param from - The starting value
   * @param to - The ending value
   * @param options - Options for the animation
   */
  fromTo(
    from: number,
    to: number,
    { lerp, duration, easing, onStart, onUpdate }: FromToOptions
  ) {
    this.from = this.value = from
    this.to = to
    this.lerp = lerp
    this.duration = duration
    this.easing = easing
    this.currentTime = 0
    this.isRunning = true

    onStart?.()
    this.onUpdate = onUpdate
  }
}
