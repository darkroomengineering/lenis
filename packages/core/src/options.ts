import type { EasingFunction, LenisOptions } from './types'

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>

export type ResolvedOptions = OptionalPick<
  Required<LenisOptions>,
  | 'duration'
  | 'easing'
  | 'prevent'
  | 'virtualScroll'
  | '__experimental__naiveDimensions'
>

const defaultEasing: EasingFunction = (t) => Math.min(1, 1.001 - 2 ** (-10 * t))

const defaults = {
  smoothWheel: true,
  syncTouch: false,
  syncTouchLerp: 0.075,
  touchInertiaExponent: 1.7,
  lerp: 0.1,
  infinite: false,
  orientation: 'vertical',
  touchMultiplier: 1,
  wheelMultiplier: 1,
  autoResize: true,
  overscroll: true,
  autoRaf: false,
  anchors: false,
  autoToggle: false, // https://caniuse.com/?search=transition-behavior
  allowNestedScroll: false,
  stopInertiaOnNavigate: false,
  respectReducedMotion: true,
} satisfies LenisOptions

/**
 * One of duration and easing is enough to switch from lerp to a timed
 * animation, the other one gets a default
 */
export function resolveTiming(duration?: number, easing?: EasingFunction) {
  if (typeof duration === 'number' && typeof easing !== 'function') {
    easing = defaultEasing
  } else if (typeof easing === 'function' && typeof duration !== 'number') {
    duration = 1
  }

  return { duration, easing }
}

export function resolveOptions({
  __experimental__naiveDimensions = false,
  ...input
}: LenisOptions = {}) {
  const options: LenisOptions = { ...defaults }

  // an option set to `undefined` keeps its default
  Object.assign(
    options,
    Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined)
    )
  )

  const wrapper = options.wrapper || window
  options.eventsTarget ??= wrapper
  // Check if wrapper is <html>, fallback to window
  options.wrapper = wrapper === document.documentElement ? window : wrapper
  options.content ??= document.documentElement
  options.gestureOrientation ??=
    options.orientation === 'horizontal' ? 'both' : 'vertical'
  options.naiveDimensions ??= __experimental__naiveDimensions

  Object.assign(options, resolveTiming(options.duration, options.easing))

  return options as ResolvedOptions
}
