import type { EasingFunction } from 'lenis'

export type SnapItem = {
  value: number
}

export type OnSnapCallback = (item: SnapItem & { index?: number }) => void

export type SnapOptions = {
  /**
   * Snap type
   * @default 'proximity'
   */
  type?: 'mandatory' | 'proximity' | 'lock'
  /**
   * @description Linear interpolation (lerp) intensity (between 0 and 1)
   */
  lerp?: number
  /**
   * @description The easing function to use for the snap animation
   */
  easing?: EasingFunction
  /**
   * @description The duration of the snap animation (in s)
   */
  duration?: number
  /**
   * @default '50%'
   * @description The distance threshold from the snap point to the scroll position. Ignored when `type` is `mandatory`. If a percentage, it is relative to the viewport size. If a number, it is absolute.
   */
  distanceThreshold?: number | `${number}%`
  /**
   * @default 500
   * @description The debounce delay (in ms) to prevent snapping too often
   */
  debounce?: number
  /**
   * @description Called when the snap starts
   */
  onSnapStart?: OnSnapCallback
  /**
   * @description Called when the snap completes
   */
  onSnapComplete?: OnSnapCallback
}
