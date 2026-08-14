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

export type UserData = Record<string, unknown>

export type Scrolling = boolean | 'native' | 'smooth'

export type LenisEvent = 'scroll' | 'gesture'
export type ScrollCallback = (lenis: Lenis) => void
export type GestureCallback = (data: GestureData) => void
export type EventCallback = ScrollCallback | GestureCallback

export type GestureData = {
  deltaX: number
  deltaY: number
  event: WheelEvent | TouchEvent | PointerEvent
  type: 'wheel' | 'touch' | 'drag'
}

export type Orientation = 'vertical' | 'horizontal' | 'both'
export type GestureOrientation = 'vertical' | 'horizontal' | 'both'
export type EasingFunction = (time: number) => number

export type ScrollToOptions = {
  /**
   * The offset to apply to the target value. A single number applies to every
   * driven axis; pass `{ x?, y? }` to offset each axis independently.
   * @default 0
   */
  offset?: number | { x?: number; y?: number }
  /**
   * Skip the animation and jump to the target value immediately
   * @default false
   */
  immediate?: boolean
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
   * Scroll initiated from outside of the lenis instance
   * @default false
   */
  programmatic?: boolean
  /**
   * User data that will be forwarded through the scroll event
   */
  userData?: UserData
  /**
   * Lock the scroll to the target value
   * @default false
   */
  lock?: boolean
}

export interface WheelOptions {
  /** Smooth the scroll initiated by wheel events @default true */
  smooth?: boolean
  /** Linear interpolation intensity (0-1) @default 0.1 */
  lerp?: number
  /** Multiplier for mouse wheel events @default 1 */
  multiplier?: number
  duration?: number
  easing?: EasingFunction
}

export interface TouchOptions {
  /** Mimic touch device scroll while allowing scroll sync @default false */
  smooth?: boolean
  /** Linear interpolation intensity (0-1) @default 0.1 */
  lerp?: number
  /** Multiplier for touch events @default 1 */
  multiplier?: number
  /** Strength of touch inertia @default 2 */
  inertia?: number
  duration?: number
  easing?: EasingFunction
  ios?: {
    /** Strength of touch inertia @default 1.7 */
    inertia?: number
    /** Linear interpolation intensity (0-1) @default 0.05 */
    lerp?: number
    duration?: number
    easing?: EasingFunction
  }
}

export interface DragOptions {
  /** Enable scroll-by-dragging with the mouse (grab the page like a touch surface) @default false */
  enabled?: boolean
  /** Multiplier for drag movement @default 1 */
  multiplier?: number
  /** Strength of the release fling @default 2 */
  inertia?: number
  /** Linear interpolation intensity applied to the release fling (0-1) @default 0.1 */
  lerp?: number
  duration?: number
  easing?: EasingFunction
}

export interface ProgrammaticOptions {
  /** Linear interpolation intensity (0-1) @default 0.1 */
  lerp?: number
  /** The duration of the scroll animation (in s) — switches to time-based animation */
  duration?: number
  /** The easing function to use for the scroll animation — switches to time-based animation */
  easing?: EasingFunction
}

export type DimensionsOptions = {
  mode?: 'observe' | 'read'
  autoResize?: boolean
  debounce?: number
}

export type LenisOptions = {
  /**
   * The element that will be used as the scroll container
   * @default window
   */
  wrapper?: Window | HTMLElement | Element
  /**
   * The element that contains the content that will be scrolled, usually `wrapper`'s direct child
   */
  content?: HTMLElement | Element | undefined
  /**
   * The element that will listen to `wheel` and `touch` events
   * @default window
   */
  eventsTarget?: Window | HTMLElement | Element
  /**
   * Wheel scroll options
   */
  wheel?: WheelOptions
  /**
   * Touch scroll options
   */
  touch?: TouchOptions
  /**
   * Mouse-drag scroll options — grab the page and fling it, like a touch
   * surface. Off by default; enable with `drag: { enabled: true }`.
   */
  drag?: DragOptions
  /**
   * Default animation for programmatic scrolls (`scrollTo`, anchors) — the
   * same shape as the per-call `scrollTo` options `lerp` / `duration` /
   * `easing`, which still override these per call
   */
  programmatic?: ProgrammaticOptions
  /**
   * Enable infinite scrolling
   * @default false
   */
  infinite?: boolean
  /**
   * The orientation of the scrolling. Can be `vertical`, `horizontal`, or `both` (2D).
   *
   * When `both`, `lenis.x` and `lenis.y` each handle one axis and `gestureOrientation`
   * has no effect (horizontal gestures drive `x`, vertical gestures drive `y`). The
   * single-axis getters on `lenis` (`scroll`, `progress`, `scrollTo(n)`, …) alias the
   * vertical axis.
   * @default vertical
   */
  orientation?: Orientation
  /**
   * The orientation of the gestures. Can be `vertical`, `horizontal` or `both`
   * @default vertical
   */
  gestureOrientation?: GestureOrientation
  /**
   * Called on every gesture event (wheel or touch)
   */
  onGesture?: (data: GestureData, lenis: Lenis) => GestureData | false | void
  /**
   * Wether or not to enable overscroll on a nested Lenis instance, similar to CSS overscroll-behavior (https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
   * @default true
   */
  overscroll?: boolean
  /**
   * If `true`, Lenis will automatically run `requestAnimationFrame` loop
   * @default true
   */
  autoRaf?: boolean
  /**
   * If `true`, Lenis will handle anchor links automatically
   * @default true
   */
  anchors?: boolean | ScrollToOptions
  /**
   * If `true`, Lenis will allow nested scroll
   * @default true
   */
  allowNestedScroll?: boolean
  /**
   * Dimensions calculation mode. 'read' uses naive dimensions (scrollHeight/clientHeight),
   * 'observe' uses ResizeObserver. Default: { autoResize: true, debounce: 500 } if content is undefined, { autoResize: true, debounce: 500 } if content is defined
   */
  dimensions?: DimensionsOptions
  /**
   * If `true`, Lenis will stop inertia when an internal link is clicked
   * @default true
   */
  stopInertiaOnNavigate?: boolean
  /**
   * If `true`, Lenis will honor the user's `prefers-reduced-motion` setting: smoothing is disabled (`lerp` forced to `1` so scroll tracks the input device 1:1) and programmatic scrolls become instant, while scroll keeps running on the main thread
   * @default true
   */
  respectReducedMotion?: boolean
}

declare global {
  interface Window {
    lenisVersion: string
    lenis: {
      version?: string
      horizontal?: boolean
      snap?: boolean
      touch?: boolean
    }
  }
}
