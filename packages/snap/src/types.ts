import type { EasingFunction, UserData } from 'lenis'

export type SnapItem = {
  value: number
  userData: UserData
}

export type OnSnapCallback = (item: SnapItem) => void

export type SnapOptions = {
  type?: 'mandatory' | 'proximity'
  lerp?: number
  easing?: EasingFunction
  duration?: number
  velocityThreshold?: number
  debounce?: number
  onSnapStart?: OnSnapCallback
  onSnapComplete?: OnSnapCallback
}
