declare class Animate {
    advance(deltaTime: any): void;
    value: any;
    stop(): void;
    isRunning: boolean | undefined;
    fromTo(from: any, to: any, { lerp, duration, easing, onStart, onUpdate }: {
        lerp?: number | undefined;
        duration?: number | undefined;
        easing?: ((t: any) => any) | undefined;
        onStart: any;
        onUpdate: any;
    }): void;
    from: any;
    to: any;
    lerp: number | undefined;
    duration: number | undefined;
    easing: ((t: any) => any) | undefined;
    currentTime: number | undefined;
    onUpdate: any;
}

declare class Dimensions {
    constructor({ wrapper, content, autoResize, debounce: debounceValue, }?: {
        wrapper: any;
        content: any;
        autoResize?: boolean | undefined;
        debounce?: number | undefined;
    });
    wrapper: any;
    content: any;
    debouncedResize: ((...args: any[]) => void) | undefined;
    wrapperResizeObserver: ResizeObserver | undefined;
    contentResizeObserver: ResizeObserver | undefined;
    destroy(): void;
    resize: () => void;
    onWrapperResize: () => void;
    width: any;
    height: any;
    onContentResize: () => void;
    scrollHeight: any;
    scrollWidth: any;
    get limit(): {
        x: number;
        y: number;
    };
}

declare class Emitter {
    events: {};
    emit(event: any, ...args: any[]): void;
    on(event: any, cb: any): () => void;
    off(event: any, callback: any): void;
    destroy(): void;
}

declare class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier }: {
        wheelMultiplier?: number | undefined;
        touchMultiplier?: number | undefined;
    });
    element: any;
    wheelMultiplier: number;
    touchMultiplier: number;
    touchStart: {
        x: null;
        y: null;
    };
    emitter: Emitter;
    on(event: any, callback: any): () => void;
    destroy(): void;
    onTouchStart: (event: any) => void;
    lastDelta: {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    } | undefined;
    onTouchMove: (event: any) => void;
    onTouchEnd: (event: any) => void;
    onWheel: (event: any) => void;
    onWindowResize: () => void;
    windowWidth: number | undefined;
    windowHeight: number | undefined;
}

type EasingFunction = (t: number) => number;
type Orientation = 'vertical' | 'horizontal';
type GestureOrientation = 'vertical' | 'horizontal' | 'both';
type Overwrite<T, R> = Omit<T, keyof R> & R;
type LenisOptions = Partial<{
    wrapper: Window | HTMLElement;
    content: HTMLElement;
    wheelEventsTarget: Window | HTMLElement;
    eventsTarget: Window | HTMLElement;
    smoothWheel: boolean;
    syncTouch: boolean;
    syncTouchLerp: number;
    touchInertiaMultiplier: number;
    duration: number;
    easing: EasingFunction;
    lerp: number;
    infinite: boolean;
    orientation: Orientation;
    gestureOrientation: GestureOrientation;
    touchMultiplier: number;
    wheelMultiplier: number;
    autoResize: boolean;
    __experimental__naiveDimensions: boolean;
}>;
type LenisEvents = 'scroll';
declare class Lenis {
    __isSmooth: boolean;
    __isScrolling: boolean;
    __isStopped: boolean;
    __isLocked: boolean;
    __preventNextScrollEvent: boolean;
    options: Overwrite<LenisOptions, {
        wrapper: NonNullable<LenisOptions['wrapper']>;
    }>;
    animate: Animate;
    emitter: Emitter;
    dimensions: Dimensions;
    velocity: number;
    direction: number;
    targetScroll: number;
    animatedScroll: number;
    virtualScroll: VirtualScroll;
    time: number;
    constructor({ wrapper, content, wheelEventsTarget, eventsTarget, smoothWheel, syncTouch, syncTouchLerp, touchInertiaMultiplier, duration, easing, lerp, infinite, orientation, gestureOrientation, touchMultiplier, wheelMultiplier, autoResize, __experimental__naiveDimensions, }?: LenisOptions);
    destroy(): void;
    on(event: LenisEvents, callback: (lenis: Lenis) => unknown): () => void;
    off(event: LenisEvents, callback: (lenis: Lenis) => unknown): void;
    private setScroll;
    private onVirtualScroll;
    resize(): void;
    private emit;
    private onNativeScroll;
    private reset;
    start(): void;
    stop(): void;
    raf(time: number): void;
    scrollTo(target: number | string | HTMLElement, { offset, immediate, lock, duration, easing, lerp, onComplete, force, programmatic, }?: {
        offset?: number;
        immediate?: boolean;
        lock?: boolean;
        duration?: number;
        easing?: EasingFunction;
        lerp?: number;
        onComplete?: (lenis: Lenis) => void;
        force?: boolean;
        programmatic?: boolean;
    }): void;
    get rootElement(): HTMLElement;
    get limit(): number;
    get isHorizontal(): boolean;
    get actualScroll(): number;
    get scroll(): number;
    get progress(): number;
    get isSmooth(): boolean;
    private set isSmooth(value);
    get isScrolling(): boolean;
    private set isScrolling(value);
    get isStopped(): boolean;
    private set isStopped(value);
    get isLocked(): boolean;
    private set isLocked(value);
    get className(): string;
    private toggleClassName;
}

export { type LenisEvents, type LenisOptions, Lenis as default };
