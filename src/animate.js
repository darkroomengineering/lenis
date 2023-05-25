import { clamp, damp } from './maths'

// Animate class to handle value animations with lerping or easing
export class Animate {
  // Advance the animation by the given delta time
  advance(deltaTime) {
    if (!this.isRunning) return

    let completed = false

    if (this.lerp) {
      this.value = damp(this.value, this.to, this.lerp * 60, deltaTime)
      if (Math.round(this.value) === this.to) {
        this.value = this.to
        completed = true
      }
    } else {
      this.currentTime += deltaTime
      const linearProgress = clamp(0, this.currentTime / this.duration, 1)

      completed = linearProgress >= 1
      const easedProgress = completed ? 1 : this.easing(linearProgress)
      this.value = this.from + (this.to - this.from) * easedProgress
    }

    // Call the onUpdate callback with the current value and completed status
    this.onUpdate?.(this.value, { completed })

    if (completed) {
      this.stop()
    }
  }

  // Stop the animation
  stop() {
    this.isRunning = false
  }

  // Set up the animation from a starting value to an ending value
  // with optional parameters for lerping, duration, easing, and onUpdate callback
  fromTo(from, to, { lerp = 0.1, duration = 1, easing = (t) => t, onUpdate }) {
    this.from = this.value = from
    this.to = to
    this.lerp = lerp
    this.duration = duration
    this.easing = easing
    this.currentTime = 0
    this.isRunning = true

    this.onUpdate = onUpdate
  }
}
