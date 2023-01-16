import { clamp, lerp } from './maths'

export class Animate {
  advance(deltaTime) {
    if (!this.isRunning) return

    if (this.value === this.from) {
      this.onStart?.(this.from)
    }

    let completed = false

    if (this.lerp) {
      this.value = lerp(this.value, this.to, this.lerp)
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

    this.onUpdate?.(this.value)

    if (completed) {
      this.onComplete?.(this.to)
      this.stop()
    }
  }

  // get progress() {
  //   return this.currentTime / this.duration
  // }

  stop() {
    this.isRunning = false
  }

  fromTo(
    from,
    to,
    {
      lerp = 0.1,
      duration = 1,
      easing = (t) => t,
      onStart,
      onUpdate,
      onComplete,
    }
  ) {
    this.from = this.value = from
    this.to = to
    this.lerp = lerp
    this.duration = duration
    this.easing = easing
    this.currentTime = 0
    this.isRunning = true

    this.onStart = onStart
    this.onUpdate = onUpdate
    this.onComplete = onComplete
  }
}
