type EasingFunction = (t: number) => number;
type Orientation = 'vertical' | 'horizontal';
type GestureOrientation = 'vertical' | 'horizontal' | 'both';
type LenisOptions = {
    wrapper?: Window | HTMLElement;
    content?: HTMLElement;
    wheelEventsTarget?: Window | HTMLElement;
    eventsTarget?: Window | HTMLElement;
    smoothWheel?: boolean;
    syncTouch?: boolean;
    syncTouchLerp?: number;
    touchInertiaMultiplier?: number;
    duration?: number;
    easing?: EasingFunction;
    lerp?: number;
    infinite?: boolean;
    orientation?: Orientation;
    gestureOrientation?: GestureOrientation;
    touchMultiplier?: number;
    wheelMultiplier?: number;
    autoResize?: boolean;
    prevent?: boolean | ((node: Element) => boolean);
    __experimental__naiveDimensions?: boolean;
};
declare class Lenis {
    __isScrolling: boolean | 'native' | 'smooth';
    __isStopped: boolean;
    __isLocked: boolean;
    time: number;
    userData: object;
    lastVelocity: number;
    velocity: number;
    direction: 1 | -1 | undefined;
    options: LenisOptions;
    targetScroll: number;
    animatedScroll: number;
    constructor({ wrapper, content, wheelEventsTarget, // deprecated
    eventsTarget, smoothWheel, syncTouch, syncTouchLerp, touchInertiaMultiplier, duration, // in seconds
    easing, lerp, infinite, orientation, // vertical, horizontal
    gestureOrientation, // vertical, horizontal, both
    touchMultiplier, wheelMultiplier, autoResize, prevent, __experimental__naiveDimensions, }?: LenisOptions);
    destroy(): void;
    on(event: string, callback: Function): any;
    off(event: string, callback: Function): any;
    private setScroll;
    private onVirtualScroll;
    resize(): void;
    private emit;
    private onNativeScroll;
    private reset;
    start(): void;
    stop(): void;
    raf(time: number): void;
    scrollTo(target: number | string | HTMLElement, { offset, immediate, lock, duration, easing, lerp, onStart, onComplete, force, // scroll even if stopped
    programmatic, // called from outside of the class
    userData, }?: {
        offset?: number;
        immediate?: boolean;
        lock?: boolean;
        duration?: number;
        easing?: EasingFunction;
        lerp?: number;
        onStart?: (lenis: Lenis) => void;
        onComplete?: (lenis: Lenis) => void;
        force?: boolean;
        programmatic?: boolean;
        userData?: object;
    }): void;
    get rootElement(): Window | HTMLElement;
    get limit(): any;
    get isHorizontal(): boolean;
    get actualScroll(): number;
    get scroll(): number;
    get progress(): number;
    get isScrolling(): boolean;
    private set isScrolling(value);
    get isStopped(): boolean;
    private set isStopped(value);
    get isLocked(): boolean;
    private set isLocked(value);
    get isSmooth(): boolean;
    get className(): string;
    private updateClassName;
    private cleanUpClassName;
}

export { type LenisOptions, Lenis as default };
