import Lenis from '.'

export type OnUpdateCallback = (value: number, completed: boolean) => void
export type OnStartCallback = () => void

export type FromToOptions = {
  lerp?: number
  duration?: number
  easing?: EasingFunction
  onStart?: OnStartCallback
  onUpdate?: OnUpdateCallback
}

export type Scrolling = boolean | 'native' | 'smooth'

export type LenisEvent = 'scroll' | 'virtual-scroll'
export type ScrollCallback<UD extends Record<string, any>> = (
  lenis: Lenis<UD>
) => void
export type VirtualScrollCallback = (data: VirtualScrollData) => void

export type VirtualScrollData = {
  deltaX: number
  deltaY: number
  event: WheelEvent | TouchEvent
}

export type Orientation = 'vertical' | 'horizontal'
export type GestureOrientation = 'vertical' | 'horizontal' | 'both'
export type EasingFunction = (time: number) => number

export type ScrollToOptions<UD> = {
  offset?: number
  immediate?: boolean
  lock?: boolean
  duration?: number
  easing?: EasingFunction
  lerp?: number
  onStart?: (lenis: Lenis) => void
  onComplete?: (lenis: Lenis) => void
  force?: boolean
  programmatic?: boolean
  userData?: UD
}

export type LenisOptions = Partial<{
  /**
   * The element that will be used as the scroll container
   * @default window
   */
  wrapper: Window | HTMLElement
  /**
   * The element that contains the content that will be scrolled, usually `wrapper`'s direct child
   * @default document.documentElement
   */
  content: HTMLElement
  /**
   * The element that will listen to `wheel` and `touch` events
   * @deprecated Use `eventsTarget` instead
   */
  wheelEventsTarget: Window | HTMLElement
  /**
   * The element that will listen to `wheel` and `touch` events
   * @default window
   */
  eventsTarget: Window | HTMLElement
  /**
   * Smooth the scroll initiated by `wheel` events
   * @default true
   */
  smoothWheel: boolean
  /**
   * Mimic touch device scroll while allowing scroll sync
   * @default false
   */
  syncTouch: boolean
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.075
   */
  syncTouchLerp: number
  /**
   * Manage the the strength of `syncTouch` inertia
   * @default 35
   */
  touchInertiaMultiplier: number
  /**
   * Scroll duration in seconds
   */
  duration: number
  /**
   * Scroll easing function
   * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
   */
  easing: EasingFunction
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.1
   */
  lerp: number
  /**
   * Enable infinite scrolling
   * @default false
   */
  infinite: boolean
  /**
   * The orientation of the scrolling. Can be `vertical` or `horizontal`
   * @default vertical
   */
  orientation: Orientation
  /**
   * The orientation of the gestures. Can be `vertical`, `horizontal` or `both`
   * @default vertical
   */
  gestureOrientation: GestureOrientation
  /**
   * The multiplier to use for mouse wheel events
   * @default 1
   */
  touchMultiplier: number
  /**
   * The multiplier to use for touch events
   * @default 1
   */
  wheelMultiplier: number
  /**
   * Resize instance automatically
   * @default true
   */
  autoResize: boolean
  /**
   * Manually prevent scroll to be smoothed based on elements traversed by events
   */
  prevent: (node: HTMLElement) => boolean
  /**
   * Manually modify the events before they get consumed
   */
  virtualScroll: (data: VirtualScrollData) => boolean
  /**
   * If `true`, Lenis will not try to detect the size of the content and wrapper
   * @default false
   */
  __experimental__naiveDimensions: boolean
}>

declare global {
  interface Window {
    lenisVersion: string
  }
}
