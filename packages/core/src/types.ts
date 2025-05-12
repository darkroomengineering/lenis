import type { Lenis } from './lenis'

export type OnUpdateCallback = (value: number, completed: boolean) => void
export type OnStartCallback = () => void

export type FromToOptions = {
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.1
   */
  lerp?: number
  /**
   * The duration of the scroll animation (in s)
   * @default 1
   */
  duration?: number
  /**
   * The easing function to use for the scroll animation
   * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
   */
  easing?: EasingFunction
  /**
   * Called when the scroll starts
   */
  onStart?: OnStartCallback
  /**
   * Called when the scroll progress changes
   */
  onUpdate?: OnUpdateCallback
}

export type UserData = Record<string, any>

export type Scrolling = boolean | 'native' | 'smooth'

export type LenisEvent = 'scroll' | 'virtual-scroll'
export type ScrollCallback = (lenis: Lenis) => void
export type VirtualScrollCallback = (data: VirtualScrollData) => void

export type VirtualScrollData = {
  deltaX: number
  deltaY: number
  event: WheelEvent | TouchEvent
}

export type Orientation = 'vertical' | 'horizontal'
export type GestureOrientation = 'vertical' | 'horizontal' | 'both'
export type EasingFunction = (time: number) => number

export type ScrollToOptions = {
  /**
   * The offset to apply to the target value
   * @default 0
   */
  offset?: number
  /**
   * Skip the animation and jump to the target value immediately
   * @default false
   */
  immediate?: boolean
  /**
   * Lock the scroll to the target value
   * @default false
   */
  lock?: boolean
  /**
   * The duration of the scroll animation (in s)
   */
  duration?: number
  /**
   * The easing function to use for the scroll animation
   * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
   */
  easing?: EasingFunction
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.1
   */
  lerp?: number
  /**
   * Called when the scroll starts
   */
  onStart?: (lenis: Lenis) => void
  /**
   * Called when the scroll completes
   */
  onComplete?: (lenis: Lenis) => void
  /**
   * Scroll even if stopped
   * @default false
   */
  force?: boolean
  /**
   * Scroll initiated from outside of the lenis instance
   * @default false
   */
  programmatic?: boolean
  /**
   * User data that will be forwarded through the scroll event
   */
  userData?: UserData
}

export type LenisOptions = {
  /**
   * The element that will be used as the scroll container
   * @default window
   */
  wrapper?: Window | HTMLElement | Element
  /**
   * The element that contains the content that will be scrolled, usually `wrapper`'s direct child
   * @default document.documentElement
   */
  content?: HTMLElement | Element
  /**
   * The element that will listen to `wheel` and `touch` events
   * @default window
   */
  eventsTarget?: Window | HTMLElement | Element
  /**
   * Smooth the scroll initiated by `wheel` events
   * @default true
   */
  smoothWheel?: boolean
  /**
   * Mimic touch device scroll while allowing scroll sync
   * @default false
   */
  syncTouch?: boolean
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.075
   */
  syncTouchLerp?: number
  /**
   * Manage the the strength of `syncTouch` inertia
   * @default 35
   */
  touchInertiaMultiplier?: number
  /**
   * Scroll duration in seconds
   */
  duration?: number
  /**
   * Scroll easing function
   * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
   */
  easing?: EasingFunction
  /**
   * Linear interpolation (lerp) intensity (between 0 and 1)
   * @default 0.1
   */
  lerp?: number
  /**
   * Enable infinite scrolling
   * @default false
   */
  infinite?: boolean
  /**
   * The orientation of the scrolling. Can be `vertical` or `horizontal`
   * @default vertical
   */
  orientation?: Orientation
  /**
   * The orientation of the gestures. Can be `vertical`, `horizontal` or `both`
   * @default vertical
   */
  gestureOrientation?: GestureOrientation
  /**
   * The multiplier to use for mouse wheel events
   * @default 1
   */
  touchMultiplier?: number
  /**
   * The multiplier to use for touch events
   * @default 1
   */
  wheelMultiplier?: number
  /**
   * Resize instance automatically
   * @default true
   */
  autoResize?: boolean
  /**
   * Manually prevent scroll to be smoothed based on elements traversed by events
   */
  prevent?: (node: HTMLElement) => boolean
  /**
   * Manually modify the events before they get consumed
   */
  virtualScroll?: (data: VirtualScrollData) => boolean
  /**
   * Wether or not to enable overscroll on a nested Lenis instance, similar to CSS overscroll-behavior (https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
   * @default true
   */
  overscroll?: boolean
  /**
   * If `true`, Lenis will not try to detect the size of the content and wrapper
   * @default false
   */
  autoRaf?: boolean
  /**
   * If `true`, Lenis will automatically run `requestAnimationFrame` loop
   * @default false
   */
  anchors?: boolean | ScrollToOptions
  /**
   * If `true`, Lenis will automatically start/stop based on wrapper's overflow property
   * @default false
   */
  autoToggle?: boolean
  /**
   * If `true`, Lenis will allow nested scroll
   * @default false
   */
  allowNestedScroll?: boolean
  /**
   * If `true`, Lenis will use naive dimensions calculation
   * @default false
   */
  __experimental__naiveDimensions?: boolean
}

declare global {
  interface Window {
    lenisVersion: string
  }
}
