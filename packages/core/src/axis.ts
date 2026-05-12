import { Animate } from './animate'
import type { Lenis } from './lenis'
import { clamp, modulo } from './maths'

export class Axis {
  animatedScroll = 0
  targetScroll = 0
  private readonly animate = new Animate()
  constructor(
    private axis: 'x' | 'y',
    private lenis: Lenis
  ) {
    this.axis = axis
    this.lenis = lenis
    this.animate = new Animate()
  }

  get cssOverflow() {
    return !['hidden', 'clip'].includes(
      getComputedStyle(this.lenis.rootElement)[
        (this.axis === 'x'
          ? 'overflow-x'
          : 'overflow-y') as keyof CSSStyleDeclaration
      ] as string
    )
  }

  get overflow() {
    return this.axis === 'x'
      ? this.lenis.dimensions.scrollWidth! > this.lenis.dimensions.width!
      : this.lenis.dimensions.scrollHeight! > this.lenis.dimensions.height!
  }

  get isScrollable() {
    return this.cssOverflow && this.overflow
  }

  checkOverflow() {
    if (this.cssOverflow) {
      this.start()
    } else {
      this.stop()
    }
  }

  private start() {
    if (!this.isStopped) return

    this.reset()
    this.isStopped = false
    this.emit()
  }

  private stop() {
    if (this.isStopped) return

    this.reset()
    this.isStopped = true
    this.emit()
  }

  get limit() {
    return this.lenis.dimensions.limit[this.axis]!
  }

  get isStopped() {}

  get isLocked() {}

  get scroll() {
    return this.lenis.options.infinite
      ? modulo(this.animatedScroll, this.limit)
      : this.animatedScroll
  }

  setScroll(scroll: number) {
    this.lenis.options.wrapper.scrollTo({
      [this.axis === 'x' ? 'left' : 'top']: scroll,
      behavior: 'instant',
    })
  }

  scrollTo(
    _target: number,
    {
      programmatic = true,
      lerp = programmatic ? this.lenis.options.wheel.lerp : undefined,
      duration = programmatic ? this.lenis.options.duration : undefined,
      easing = programmatic ? this.lenis.options.easing : undefined,
    }
  ) {
    const target = clamp(0, _target, this.limit)

    console.log(this.targetScroll, target)
    this.targetScroll = target
    this.animate.fromTo(this.animatedScroll, target, {
      lerp,
      duration,
      easing,
      onUpdate: (value: number) => {
        this.animatedScroll = value
        this.setScroll(this.scroll)
      },
    })
  }

  advance(deltaTime: number) {
    this.animate.advance(deltaTime)
  }
}
