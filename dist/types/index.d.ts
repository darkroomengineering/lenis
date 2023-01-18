export default class Lenis {
    /**
     * @typedef {(t: number) => number} EasingFunction
     * @typedef {'vertical' | 'horizontal'} Orientation
     * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
     *
     * @typedef LenisOptions
     * @property {Orientation} [direction]
     * @property {GestureOrientation} [gestureDirection]
     * @property {number} [mouseMultiplier]
     * @property {boolean} [smooth]
     *
     * @property {Window | HTMLElement} [wrapper]
     * @property {HTMLElement} [content]
     * @property {boolean} [smoothWheel]
     * @property {boolean} [smoothTouch]
     * @property {number} [duration]
     * @property {EasingFunction} [easing]
     * @property {number} [lerp]
     * @property {boolean} [infinite]
     * @property {Orientation} [orientation]
     * @property {GestureOrientation} [gestureOrientation]
     * @property {number} [touchMultiplier]
     * @property {number} [wheelMultiplier]
     * @property {number} [normalizeWheel]
     *
     * @param {LenisOptions}
     */
    constructor({ direction, gestureDirection, mouseMultiplier, smooth, wrapper, content, smoothWheel, smoothTouch, duration, easing, lerp, infinite, orientation, gestureOrientation, touchMultiplier, wheelMultiplier, normalizeWheel, }?: {
        direction?: "vertical" | "horizontal";
        gestureDirection?: "vertical" | "horizontal" | "both";
        mouseMultiplier?: number;
        smooth?: boolean;
        wrapper?: Window | HTMLElement;
        content?: HTMLElement;
        smoothWheel?: boolean;
        smoothTouch?: boolean;
        duration?: number;
        easing?: (t: number) => number;
        lerp?: number;
        infinite?: boolean;
        orientation?: "vertical" | "horizontal";
        gestureOrientation?: "vertical" | "horizontal" | "both";
        touchMultiplier?: number;
        wheelMultiplier?: number;
        normalizeWheel?: number;
    });
    destroy(): void;
    on(event: any, callback: any): import("nanoevents").Unsubscribe;
    emit(): void;
    start(): void;
    stop(): void;
    raf(time: any): void;
    scrollTo(target: any, { offset, immediate, lock, duration, easing, lerp, onComplete, }?: {
        offset?: number;
        immediate?: boolean;
        lock?: boolean;
        duration?: number;
        easing?: (t: number) => number;
        lerp?: number;
        onComplete: any;
    }, programmatic?: boolean): void;
    get options(): {
        wrapper: Window | HTMLElement;
        content: HTMLElement;
        smoothWheel: boolean;
        smoothTouch: boolean;
        duration: number;
        easing: (t: number) => number;
        lerp: number;
        infinite: boolean;
        gestureOrientation: "vertical" | "horizontal" | "both";
        orientation: "vertical" | "horizontal";
        touchMultiplier: number;
        wheelMultiplier: number;
        normalizeWheel: number;
    };
    get limit(): number;
    get isHorizontal(): boolean;
    get scroll(): number;
    get progress(): number;
    get velocity(): number;
    get direction(): any;
    get isSmooth(): any;
    get isScrolling(): any;
    get isStopped(): any;
    #private;
}
