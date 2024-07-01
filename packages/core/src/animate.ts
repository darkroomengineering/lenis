import { clamp, damp } from './maths'

// Animate class to handle value animations with lerping or easing
export class Animate {
  isRunning: boolean = false
  value: number = 0
  from: number = 0
  to: number = 0
  lerp?: number
  duration?: number = 0
  easing?: Function
  currentTime: number = 0
  onUpdate?: Function

  // Advance the animation by the given delta time
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
      if (Math.round(this.value) === this.to) {
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

  // Stop the animation
  stop() {
    this.isRunning = false
  }

  // Set up the animation from a starting value to an ending value
  // with optional parameters for lerping, duration, easing, and onUpdate callback
  fromTo(
    from: number,
    to: number,
    {
      lerp,
      duration,
      easing,
      onStart,
      onUpdate,
    }: {
      lerp?: number
      duration?: number
      easing?: Function
      onStart?: Function
      onUpdate?: Function
    }
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
