import type Lenis from 'lenis'
import type { VirtualScrollData } from 'lenis'
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
 * Snap class to handle the snap functionality
 *
 * @example
 * const snap = new Snap(lenis, {
 *   type: 'mandatory', // 'mandatory', 'proximity' or 'lock'
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
  onSnapDebounced: (e: VirtualScrollData) => void
  currentSnapIndex?: number

  constructor(
    private lenis: Lenis,
    {
      type = 'proximity',
      lerp,
      easing,
      duration,
      distanceThreshold = '50%', // useless when type is "mandatory"
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

    this.onSnapDebounced = debounce(this.onSnap, this.options.debounce)

    this.lenis.on(
      'virtual-scroll',
      this.options.type === 'lock' ? this.onSnap : this.onSnapDebounced
    )
  }

  /**
   * Destroy the snap instance
   */
  destroy() {
    this.lenis.off('virtual-scroll', this.onSnapDebounced)
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

  addElements(elements: HTMLElement[], options: SnapElementOptions = {}) {
    elements.forEach((element) => this.addElement(element, options))
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

  previous() {
    this.goTo((this.currentSnapIndex ?? 0) - 1)
  }

  next() {
    this.goTo((this.currentSnapIndex ?? 0) + 1)
  }

  goTo(index: number) {
    const snaps = this.computeSnaps()

    if (snaps.length === 0) return

    this.currentSnapIndex = Math.max(0, Math.min(index, snaps.length - 1))

    const currentSnap = snaps[this.currentSnapIndex]
    if (currentSnap === undefined) return

    this.lenis.scrollTo(currentSnap.value, {
      duration: this.options.duration,
      easing: this.options.easing,
      lerp: this.options.lerp,
      lock: this.options.type === 'lock',
      userData: { initiator: 'snap' },
      onStart: () => {
        this.options.onSnapStart?.({
          index: this.currentSnapIndex,
          ...currentSnap,
        })
      },
      onComplete: () => {
        this.options.onSnapComplete?.({
          index: this.currentSnapIndex,
          ...currentSnap,
        })
      },
    })
  }

  get distanceThreshold() {
    let distanceThreshold = Infinity
    if (this.options.type === 'mandatory') return Infinity

    const { isHorizontal } = this.lenis

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

    return distanceThreshold
  }

  private onSnap = (e: VirtualScrollData) => {
    if (this.isStopped) return

    if (e.event.type === 'touchmove') return

    if (
      this.options.type === 'lock' &&
      this.lenis.userData?.initiator === 'snap'
    )
      return

    let { scroll, isHorizontal } = this.lenis
    const delta = isHorizontal ? e.deltaX : e.deltaY
    scroll = Math.ceil(this.lenis.scroll + delta)

    const snaps = this.computeSnaps()

    if (snaps.length === 0) return

    let snapIndex

    const prevSnapIndex = snaps.findLastIndex(({ value }) => value < scroll)
    const nextSnapIndex = snaps.findIndex(({ value }) => value > scroll)

    if (this.options.type === 'lock') {
      if (delta > 0) {
        snapIndex = nextSnapIndex
      } else if (delta < 0) {
        snapIndex = prevSnapIndex
      }
    } else {
      const prevSnap = snaps[prevSnapIndex]!
      const distanceToPrevSnap = prevSnap
        ? Math.abs(scroll - prevSnap.value)
        : Infinity

      const nextSnap = snaps[nextSnapIndex]!
      const distanceToNextSnap = nextSnap
        ? Math.abs(scroll - nextSnap.value)
        : Infinity
      snapIndex =
        distanceToPrevSnap < distanceToNextSnap ? prevSnapIndex : nextSnapIndex
    }

    if (snapIndex === undefined) return
    if (snapIndex === -1) return

    snapIndex = Math.max(0, Math.min(snapIndex, snaps.length - 1))

    const snap = snaps[snapIndex]!

    const distance = Math.abs(scroll - snap.value)

    if (distance <= this.distanceThreshold) {
      this.goTo(snapIndex)
    }
  }

  resize() {
    this.elements.forEach((element) => element.onWrapperResize())
  }
}
