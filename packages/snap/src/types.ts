import type { EasingFunction, UserData } from 'lenis'

export type SnapItem = {
  value: number
  userData: UserData
}

export type OnSnapCallback = (item: SnapItem) => void

export type SnapOptions = {
  /**
   * Snap type
   * @default mandatory
   */
  type?: 'mandatory' | 'proximity'
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   */
  lerp?: number
  /**
   * The easing function to use for the snap animation
   */
  easing?: EasingFunction
  /**
   * The duration of the snap animation (in s)
   */
  duration?: number
  /**
   * The velocity threshold to trigger a snap
   */
  velocityThreshold?: number
  /**
   * The debounce delay (in ms) to prevent snapping too often
   */
  debounce?: number
  /**
   * Called when the snap starts
   */
  onSnapStart?: OnSnapCallback
  /**
   * Called when the snap completes
   */
  onSnapComplete?: OnSnapCallback
}
