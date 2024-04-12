export default class Lenis {}

export type LenisOptions = {
  wrapper?: Window | HTMLElement
  content?: HTMLElement
  wheelEventsTarget?: Window | HTMLElement
  eventsTarget?: Window | HTMLElement
  smoothWheel?: boolean
  syncTouch?: boolean
  syncTouchLerp?: number
  touchInertiaMultiplier?: number
  duration?: number
  easing?: EasingFunction
  lerp?: number
  infinite?: boolean
  orientation?: Orientation
  gestureOrientation?: GestureOrientation
  touchMultiplier?: number
  wheelMultiplier?: number
  autoResize?: boolean
  __experimental__naiveDimensions?: boolean
}
