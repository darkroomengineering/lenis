import type Lenis from 'lenis'
import type { UserData } from 'lenis'
import { debounce } from './debounce'
import type { SnapElementOptions } from './element'
import { SnapElement } from './element'
import type { SnapItem, SnapOptions } from './types'
import type { UID } from './uid'
import { uid } from './uid'

// TODO:
// - horizontal
// - fix trackpad snapping too soon due to velocity (fuck Apple)
// - fix wheel scrolling after limits (see console scroll to)
// - fix touch scroll, do not snap when not released
// - arrow, spacebar

type RequiredPick<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>

/**
 * Snap class to handle the snap functionality
 *
 * @example
 * const snap = new Snap(lenis, {
 *   type: 'mandatory', // 'mandatory', 'proximity'
 *   lerp: 0.1,
 *   duration: 1,
 *   easing: (t) => t,
 *   onSnapStart: (snap) => {
 *     console.log('onSnapStart', snap)
 *   },
 *   onSnapComplete: (snap) => {
 *     console.log('onSnapComplete', snap)
 *   },
 * })
 *
 * snap.add(500) // snap at 500px
 *
 * const removeSnap = snap.add(500)
 *
 * if (someCondition) {
 *   removeSnap()
 * }
 */
export class Snap {
  options: RequiredPick<SnapOptions, 'type' | 'velocityThreshold' | 'debounce'>
  elements = new Map<UID, SnapElement>()
  snaps = new Map<UID, SnapItem>()
  viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  isStopped = false
  onSnapDebounced: () => void

  constructor(
    private lenis: Lenis,
    {
      type = 'mandatory',
      lerp,
      easing,
      duration,
      velocityThreshold = 1,
      debounce: debounceDelay = 0,
      onSnapStart,
      onSnapComplete,
    }: SnapOptions = {}
  ) {
    this.options = {
      type,
      lerp,
      easing,
      duration,
      velocityThreshold,
      debounce: debounceDelay,
      onSnapStart,
      onSnapComplete,
    }

    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize, false)

    this.onSnapDebounced = debounce(this.onSnap, this.options.debounce)

    this.lenis.on('scroll', this.onScroll)
  }

  /**
   * Destroy the snap instance
   */
  destroy() {
    this.lenis.off('scroll', this.onScroll)
    window.removeEventListener('resize', this.onWindowResize, false)
    this.elements.forEach((element) => element.destroy())
  }

  /**
   * Start the snap after it has been stopped
   */
  start() {
    this.isStopped = false
  }

  /**
   * Stop the snap
   */
  stop() {
    this.isStopped = true
  }

  /**
   * Add a snap to the snap instance
   *
   * @param value The value to snap to
   * @param userData User data that will be forwarded through the snap event
   * @returns Unsubscribe function
   */
  add(value: number, userData: UserData = {}) {
    const id = uid()

    this.snaps.set(id, { value, userData })

    return () => this.remove(id)
  }

  /**
   * Remove a snap from the snap instance
   *
   * @param id The snap id of the snap to remove
   */
  remove(id: UID) {
    this.snaps.delete(id)
  }

  /**
   * Add an element to the snap instance
   *
   * @param element The element to add
   * @param options The options for the element
   * @returns Unsubscribe function
   */
  addElement(element: HTMLElement, options = {} as SnapElementOptions) {
    const id = uid()

    this.elements.set(id, new SnapElement(element, options))

    return () => this.removeElement(id)
  }

  /**
   * Remove an element from the snap instance
   *
   * @param id The snap id of the snap element to remove
   */
  removeElement(id: UID) {
    this.elements.delete(id)
  }

  private onWindowResize = () => {
    this.viewport.width = window.innerWidth
    this.viewport.height = window.innerHeight
  }

  private onScroll = ({
    // scroll,
    // limit,
    lastVelocity,
    velocity,
    // isScrolling,
    userData,
  }: // isHorizontal,
  Lenis) => {
    if (this.isStopped) return

    // return
    const isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity)
    const isTurningBack =
      Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0

    if (
      Math.abs(velocity) < this.options.velocityThreshold &&
      // !isTouching &&
      isDecelerating &&
      !isTurningBack &&
      userData?.initiator !== 'snap'
    ) {
      this.onSnapDebounced()
    }
  }

  private onSnap = () => {
    let { scroll, isHorizontal } = this.lenis
    scroll = Math.ceil(this.lenis.scroll)

    let snaps = [...this.snaps.values()] as SnapItem[]

    this.elements.forEach(({ rect, align }) => {
      let value: number | undefined

      align.forEach((align) => {
        if (align === 'start') {
          value = rect.top
        } else if (align === 'center') {
          value = isHorizontal
            ? rect.left + rect.width / 2 - this.viewport.width / 2
            : rect.top + rect.height / 2 - this.viewport.height / 2
        } else if (align === 'end') {
          value = isHorizontal
            ? rect.left + rect.width - this.viewport.width
            : rect.top + rect.height - this.viewport.height
        }

        if (typeof value === 'number') {
          snaps.push({ value: Math.ceil(value), userData: {} })
        }
      })
    })

    snaps = snaps.sort((a, b) => Math.abs(a.value) - Math.abs(b.value))

    let prevSnap = snaps.findLast(({ value }) => value <= scroll)
    if (prevSnap === undefined) prevSnap = snaps[0]!
    const distanceToPrevSnap = Math.abs(scroll - prevSnap.value)

    let nextSnap = snaps.find(({ value }) => value >= scroll)
    if (nextSnap === undefined) nextSnap = snaps[snaps.length - 1]!
    const distanceToNextSnap = Math.abs(scroll - nextSnap.value)

    const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap

    const distance = Math.abs(scroll - snap.value)

    if (
      this.options.type === 'mandatory' ||
      (this.options.type === 'proximity' &&
        distance <=
          (isHorizontal
            ? this.lenis.dimensions.width
            : this.lenis.dimensions.height))
    ) {
      // this.__isScrolling = true
      // this.onSnapStart?.(snap)

      // console.log('scroll to')

      this.lenis.scrollTo(snap.value, {
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
