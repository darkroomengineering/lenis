export type EasingFunction = (t: number) => number;
export type Orientation = 'vertical' | 'horizontal';
export type GestureOrientation = 'vertical' | 'horizontal' | 'both';

export type LenisOptions = {
  wrapper?: Window | HTMLElement;
  content?: HTMLElement;
  wheelEventsTarget?: Window | HTMLElement;
  eventsTarget?: Window | HTMLElement;
  smoothWheel?: boolean;
  smoothTouch?: boolean;
  syncTouch?: boolean;
  syncTouchLerp?: number;
  // __iosNoInertiaSyncTouchLerp?: number;
  touchInertiaMultiplier?: number;
  duration?: number;
  easing?: EasingFunction;
  lerp?: number;
  infinite?: boolean;
  gestureOrientation?: Orientation;
  orientation?: Orientation;
  touchMultiplier?: number;
  wheelMultiplier?: number;
  normalizeWheel?: boolean;
  autoResize?: boolean;
};