import Lenis from 'lenis'
import { SnapElement, SnapElementOptions } from './element'
import { UID, uid } from './uid'

// TODO:
// - horizontal
// - fix trackpad snapping too soon due to velocity (fuck Apple)
// - fix wheel scrolling after limits (see console scroll to)
// - fix touch scroll, do not snap when not released
// - arrow, spacebar

type Viewport = {
  width: number
  height: number
}

export type SnapOptions = {
  type?: 'mandatory' | 'proximity'
  lerp?: number
  easing?: (t: number) => number
  duration?: number
  velocityThreshold?: number
  onSnapStart?: (t: number) => number
  onSnapComplete?: (t: number) => number
}

export default class Snap {
  lenis: Lenis
  options: SnapOptions
  elements: Map<UID, SnapElement>
  snaps: Map<UID, number>
  viewport: Viewport
  isStopped: Boolean = false

  constructor(
    lenis: Lenis,
    {
      type = 'mandatory',
      lerp,
      easing,
      duration,
      velocityThreshold = 1,
      onSnapStart,
      onSnapComplete,
    }: SnapOptions = {}
  ) {
    this.lenis = lenis

    this.options = {
      type,
      lerp,
      easing,
      duration,
      velocityThreshold,
      onSnapStart,
      onSnapComplete,
    }

    this.elements = new Map()
    this.snaps = new Map()

    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize)

    this.lenis.on('scroll', this.onScroll)
  }

  // debug() {
  //   const element = document.createElement('div')
  //   element.style.cssText = `
  //     position: fixed;
  //     background: red;
  //     border-bottom: 1px solid red;
  //     left: 0;
  //     right: 0;
  //     top: 0;
  //     z-index: 9999;
  //   `
  //   document.body.appendChild(element)
  // }

  destroy() {
    this.lenis.off('scroll', this.onScroll)
    window.removeEventListener('resize', this.onWindowResize)
    this.elements.forEach((element) => element.destroy())
  }

  start() {
    this.isStopped = false
  }

  stop() {
    this.isStopped = true
  }

  add(value: number) {
    const id = uid()

    this.snaps.set(id, value)

    return () => this.remove(id)
  }

  remove(id: UID) {
    this.snaps.delete(id)
  }

  addElement(element: HTMLElement, options = {} as SnapElementOptions) {
    const id = uid()

    this.elements.set(id, new SnapElement(element, options))

    return () => this.removeElement(id)
  }

  removeElement(id: UID) {
    this.elements.delete(id)
  }

  onWindowResize = () => {
    this.viewport.width = window.innerWidth
    this.viewport.height = window.innerHeight
  }

  onScroll = ({
    scroll,
    limit,
    lastVelocity,
    velocity,
    isScrolling,
    userData,
    isHorizontal,
  }) => {
    if (this.isStopped) return
    // console.log(scroll, velocity, type)

    // return
    const isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity)
    const isTurningBack =
      Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0

    // console.log({ lastVelocity, velocity, isTurningBack, isDecelerating })

    // console.log('onScroll')

    if (
      Math.abs(velocity) < this.options.velocityThreshold &&
      // !isTouching &&
      isDecelerating &&
      !isTurningBack &&
      userData?.initiator !== 'snap'
    ) {
      scroll = Math.ceil(scroll)

      let snaps = [0, ...this.snaps.values(), limit] as number[]

      this.elements.forEach(({ rect, align }) => {
        let snap: number | undefined

        align.forEach((align) => {
          if (align === 'start') {
            snap = rect.top
          } else if (align === 'center') {
            snap = isHorizontal
              ? rect.left + rect.width / 2 - this.viewport.width / 2
              : rect.top + rect.height / 2 - this.viewport.height / 2
          } else if (align === 'end') {
            snap = isHorizontal
              ? rect.left + rect.width - this.viewport.width
              : rect.top + rect.height - this.viewport.height
          }

          if (snap !== undefined) {
            snaps.push(Math.ceil(snap))
          }
        })
      })

      snaps = snaps.sort((a, b) => Math.abs(a) - Math.abs(b))

      let prevSnap = snaps.findLast((snap) => snap <= scroll)
      if (prevSnap === undefined) prevSnap = snaps[0]
      const distanceToPrevSnap = Math.abs(scroll - prevSnap)

      let nextSnap = snaps.find((snap) => snap >= scroll)
      if (nextSnap === undefined) nextSnap = snaps[snaps.length - 1]
      const distanceToNextSnap = Math.abs(scroll - nextSnap)

      const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap

      const distance = Math.abs(scroll - snap)

      if (
        this.options.type === 'mandatory' ||
        (this.options.type === 'proximity' && distance <= this.viewport.height)
      ) {
        // this.__isScrolling = true
        // this.onSnapStart?.(snap)

        // console.log('scroll to')

        this.lenis.scrollTo(snap, {
          lerp: this.options.lerp,
          easing: this.options.easing,
          duration: this.options.duration,
          userData: { initiator: 'snap' },
          onStart: () => {
            this.options.onSnapStart?.(snap)
          },
          onComplete: () => {
            this.options.onSnapComplete?.(snap)
          },
        })
      }

      // console.timeEnd('scroll')
    }
  }
}
