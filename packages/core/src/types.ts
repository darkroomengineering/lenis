export type OnUpdateCallback = (value: number, completed: boolean) => void
export type OnStartCallback = () => void
export type EasingFunction = (t: number) => number

export type FromToOptions = {
  lerp?: number
  duration?: number
  easing?: EasingFunction
  onStart?: OnStartCallback
  onUpdate?: OnUpdateCallback
}
