import type Lenis from 'lenis'
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
  options: RequiredPick<SnapOptions, 'type' | 'debounce'>
  elements = new Map<UID, SnapElement>()
  snaps = new Map<UID, SnapItem>()
  viewport: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  isStopped = false
  onSnapDebounced?: () => void
  currentSnapIndex = 0 // used for slide type

  constructor(
    private lenis: Lenis,
    {
      type = 'proximity',
      lerp,
      easing,
      duration,
      distanceThreshold = '50%',
      debounce: debounceDelay = 500,
      onSnapStart,
      onSnapComplete,
    }: SnapOptions = {}
  ) {
    this.options = {
      type,
      lerp,
      easing,
      duration,
      distanceThreshold,
      debounce: debounceDelay,
      onSnapStart,
      onSnapComplete,
    }

    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize, false)

    if (this.options.type === 'slide') {
      this.lenis.on('scroll', this.onSlide)
    } else {
      this.onSnapDebounced = debounce(this.onSnap, this.options.debounce)

      // this.lenis.on('scroll', this.onScroll)
      this.lenis.on('virtual-scroll', this.onSnapDebounced)
    }
  }

  /**
   * Destroy the snap instance
   */
  destroy() {
    // this.lenis.off('scroll', this.onScroll)
    this.lenis.off('virtual-scroll', this.onSnapDebounced!)
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
  add(value: number) {
    const id = uid()

    this.snaps.set(id, { value })

    return () => this.snaps.delete(id)
  }

  /**
   * Add an element to the snap instance
   *
   * @param element The element to add
   * @param options The options for the element
   * @returns Unsubscribe function
   */
  addElement(element: HTMLElement, options: SnapElementOptions = {}) {
    const id = uid()

    this.elements.set(id, new SnapElement(element, options))

    return () => this.elements.delete(id)
  }

  private onWindowResize = () => {
    this.viewport.width = window.innerWidth
    this.viewport.height = window.innerHeight
  }

  private computeSnaps = () => {
    const { isHorizontal } = this.lenis

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
          snaps.push({ value: Math.ceil(value) })
        }
      })
    })

    snaps = snaps.sort((a, b) => Math.abs(a.value) - Math.abs(b.value))

    return snaps
  }

  private onSlide = () => {
    const { direction, userData } = this.lenis

    if (userData?.initiator === 'snap') return

    const snaps = this.computeSnaps()

    if (snaps.length === 0) return

    if (direction === 1) {
      this.currentSnapIndex += 1
    } else if (direction === -1) {
      this.currentSnapIndex -= 1
    }

    this.currentSnapIndex = Math.max(
      0,
      Math.min(this.currentSnapIndex, snaps.length - 1)
    )

    const currentSnap = snaps[this.currentSnapIndex]

    if (currentSnap === undefined) return

    this.lenis.scrollTo(currentSnap.value, {
      duration: this.options.duration,
      easing: this.options.easing,
      lerp: this.options.lerp,
      lock: true,
      userData: { initiator: 'snap' },
      onStart: () => {
        this.options.onSnapStart?.(currentSnap)
      },
      onComplete: () => {
        this.options.onSnapComplete?.(currentSnap)
      },
    })
  }

  private onSnap = () => {
    let { scroll, isHorizontal } = this.lenis
    scroll = Math.ceil(this.lenis.scroll)

    const snaps = this.computeSnaps()

    if (snaps.length === 0) return

    let prevSnap = snaps.findLast(({ value }) => value <= scroll)
    if (prevSnap === undefined) prevSnap = snaps[0]!
    const distanceToPrevSnap = Math.abs(scroll - prevSnap.value)

    let nextSnap = snaps.find(({ value }) => value >= scroll)
    if (nextSnap === undefined) nextSnap = snaps[snaps.length - 1]!
    const distanceToNextSnap = Math.abs(scroll - nextSnap.value)

    const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap

    const distance = Math.abs(scroll - snap.value)

    let distanceThreshold

    const axis = isHorizontal ? 'width' : 'height'

    if (
      typeof this.options.distanceThreshold === 'string' &&
      this.options.distanceThreshold.endsWith('%')
    ) {
      distanceThreshold =
        (Number(this.options.distanceThreshold.replace('%', '')) / 100) *
        this.viewport[axis]
    } else if (typeof this.options.distanceThreshold === 'number') {
      distanceThreshold = this.options.distanceThreshold
    } else {
      distanceThreshold = this.viewport[axis]
    }

    if (
      this.options.type === 'mandatory' ||
      (this.options.type === 'proximity' && distance <= distanceThreshold)
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
