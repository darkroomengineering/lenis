export default class Lenis {
    /**
     * @typedef {(t: number) => number} EasingFunction
     * @typedef {'vertical' | 'horizontal'} Orientation
     * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
     *
     * @typedef LenisOptions
     * @property {Window | HTMLElement} [wrapper]
     * @property {HTMLElement} [content]
     * @property {Window | HTMLElement} [wheelEventsTarget] // deprecated
     * @property {Window | HTMLElement} [eventsTarget]
     * @property {boolean} [smoothWheel]
     * @property {boolean} [smoothTouch]
     * @property {boolean} [syncTouch]
     * @property {number} [syncTouchLerp]
     * @property {number} [__iosNoInertiaSyncTouchLerp]
     * @property {number} [touchInertiaMultiplier]
     * @property {number} [duration]
     * @property {EasingFunction} [easing]
     * @property {number} [lerp]
     * @property {boolean} [infinite]
     * @property {Orientation} [orientation]
     * @property {GestureOrientation} [gestureOrientation]
     * @property {number} [touchMultiplier]
     * @property {number} [wheelMultiplier]
     * @property {boolean} [normalizeWheel]
     * @property {boolean} [autoResize]
     *
     * @param {LenisOptions}
     */
    constructor({ wrapper, content, wheelEventsTarget, eventsTarget, smoothWheel, smoothTouch, syncTouch, syncTouchLerp, __iosNoInertiaSyncTouchLerp, touchInertiaMultiplier, duration, easing, lerp, infinite, orientation, gestureOrientation, touchMultiplier, wheelMultiplier, normalizeWheel, autoResize, }?: {
        wrapper?: Window | HTMLElement;
        content?: HTMLElement;
        wheelEventsTarget?: Window | HTMLElement;
        eventsTarget?: Window | HTMLElement;
        smoothWheel?: boolean;
        smoothTouch?: boolean;
        syncTouch?: boolean;
        syncTouchLerp?: number;
        __iosNoInertiaSyncTouchLerp?: number;
        touchInertiaMultiplier?: number;
        duration?: number;
        easing?: (t: number) => number;
        lerp?: number;
        infinite?: boolean;
        orientation?: "vertical" | "horizontal";
        gestureOrientation?: "vertical" | "horizontal" | "both";
        touchMultiplier?: number;
        wheelMultiplier?: number;
        normalizeWheel?: boolean;
        autoResize?: boolean;
    });
    options: {
        wrapper: Window | HTMLElement;
        content: HTMLElement;
        wheelEventsTarget: Window | HTMLElement;
        eventsTarget: Window | HTMLElement;
        smoothWheel: boolean;
        smoothTouch: boolean;
        syncTouch: boolean;
        syncTouchLerp: number;
        __iosNoInertiaSyncTouchLerp: number;
        touchInertiaMultiplier: number;
        duration: number;
        easing: (t: number) => number;
        lerp: number;
        infinite: boolean;
        gestureOrientation: "vertical" | "horizontal" | "both";
        orientation: "vertical" | "horizontal";
        touchMultiplier: number;
        wheelMultiplier: number;
        normalizeWheel: boolean;
        autoResize: boolean;
    };
    animate: Animate;
    emitter: Emitter;
    dimensions: Dimensions;
    velocity: number;
    set isLocked(arg: any);
    get isLocked(): any;
    set isStopped(arg: any);
    get isStopped(): any;
    set isSmooth(arg: any);
    get isSmooth(): any;
    set isScrolling(arg: any);
    get isScrolling(): any;
    targetScroll: any;
    animatedScroll: any;
    virtualScroll: VirtualScroll;
    destroy(): void;
    on(event: any, callback: any): () => void;
    off(event: any, callback: any): void;
    setScroll(scroll: any): void;
    onVirtualScroll: ({ deltaX, deltaY, event }: {
        deltaX: any;
        deltaY: any;
        event: any;
    }) => void;
    resize(): void;
    emit(): void;
    onNativeScroll: () => void;
    direction: number;
    reset(): void;
    start(): void;
    stop(): void;
    raf(time: any): void;
    time: any;
    scrollTo(target: any, { offset, immediate, lock, duration, easing, lerp, onComplete, force, programmatic, }?: {
        offset?: number;
        immediate?: boolean;
        lock?: boolean;
        duration?: number;
        easing?: (t: number) => number;
        lerp?: number;
        onComplete?: any;
        force?: boolean;
        programmatic?: boolean;
    }): void;
    __preventNextScrollEvent: boolean;
    get rootElement(): Window | HTMLElement;
    get limit(): number;
    get isHorizontal(): boolean;
    get actualScroll(): any;
    get scroll(): any;
    get progress(): number;
    __isSmooth: any;
    __isScrolling: any;
    __isStopped: any;
    __isLocked: any;
    get className(): string;
    toggleClass(name: any, value: any): void;
}
import { Animate } from './animate';
import { Emitter } from './emitter';
import { Dimensions } from './dimensions';
import { VirtualScroll } from './virtual-scroll';
