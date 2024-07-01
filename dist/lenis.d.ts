declare class Animate {
    isRunning: boolean;
    value: number;
    from: number;
    to: number;
    lerp?: number;
    duration?: number;
    easing?: Function;
    currentTime: number;
    onUpdate?: Function;
    advance(deltaTime: number): void;
    stop(): void;
    fromTo(from: number, to: number, { lerp, duration, easing, onStart, onUpdate, }: {
        lerp?: number;
        duration?: number;
        easing?: Function;
        onStart?: Function;
        onUpdate?: Function;
    }): void;
}

type DimensionsOptions = {
    wrapper: Window | HTMLElement;
    content: HTMLElement;
    autoResize?: boolean;
    debounce?: number;
};
declare class Dimensions {
    wrapper: Window | HTMLElement;
    content: HTMLElement;
    width: number;
    height: number;
    scrollWidth: number;
    scrollHeight: number;
    debouncedResize?: Function;
    wrapperResizeObserver?: ResizeObserver;
    contentResizeObserver?: ResizeObserver;
    constructor({ wrapper, content, autoResize, debounce: debounceValue, }?: DimensionsOptions);
    destroy(): void;
    resize: () => void;
    onWrapperResize: () => void;
    onContentResize: () => void;
    get limit(): {
        x: number;
        y: number;
    };
}

declare class Emitter {
    events: Record<string, Function[]>;
    constructor();
    emit(event: string, ...args: any[]): void;
    on(event: string, callback: Function): () => void;
    off(event: string, callback: Function): void;
    destroy(): void;
}

declare class VirtualScroll {
    element: HTMLElement | Window;
    wheelMultiplier: number;
    touchMultiplier: number;
    touchStart: {
        x: number | null;
        y: number | null;
    };
    emitter: Emitter;
    lastDelta: {
        x: number;
        y: number;
    };
    windowWidth: number;
    windowHeight: number;
    constructor(element: HTMLElement | Window, { wheelMultiplier, touchMultiplier }: {
        wheelMultiplier?: number | undefined;
        touchMultiplier?: number | undefined;
    });
    on(event: string, callback: Function): () => void;
    destroy(): void;
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    onWheel: (event: WheelEvent) => void;
    onWindowResize: () => void;
}

type Overwrite<T, R> = Omit<T, keyof R> & R;
type EasingFunction = (t: number) => number;
type Orientation = 'vertical' | 'horizontal';
type GestureOrientation = 'vertical' | 'horizontal' | 'both';
type Scrolling = boolean | 'native' | 'smooth';
type onVirtualScrollOptions = {
    deltaX: number;
    deltaY: number;
    event: WheelEvent | TouchEvent;
};
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
    prevent: (node: Element) => boolean;
    virtualScroll: (data: onVirtualScrollOptions) => boolean;
    __experimental__naiveDimensions: boolean;
}>;
declare class Lenis {
    __isScrolling: Scrolling;
    __isStopped: boolean;
    __isLocked: boolean;
    __preventNextNativeScrollEvent?: boolean;
    __resetVelocityTimeout?: number;
    isTouching?: boolean;
    time: number;
    userData: Object;
    lastVelocity: number;
    velocity: number;
    direction: 1 | -1 | 0;
    options: Overwrite<LenisOptions, {
        wrapper: NonNullable<LenisOptions['wrapper']>;
    }>;
    targetScroll: number;
    animatedScroll: number;
    animate: Animate;
    emitter: Emitter;
    dimensions: Dimensions;
    virtualScroll: VirtualScroll;
    constructor({ wrapper, content, wheelEventsTarget, eventsTarget, smoothWheel, syncTouch, syncTouchLerp, touchInertiaMultiplier, duration, easing, lerp, infinite, orientation, gestureOrientation, touchMultiplier, wheelMultiplier, autoResize, prevent, virtualScroll, __experimental__naiveDimensions, }?: LenisOptions);
    destroy(): void;
    on(event: string, callback: Function): () => void;
    off(event: string, callback: Function): void;
    private setScroll;
    private onPointerDown;
    private onVirtualScroll;
    resize(): void;
    private emit;
    private onNativeScroll;
    private reset;
    start(): void;
    stop(): void;
    raf(time: number): void;
    scrollTo(target: number | string | HTMLElement, { offset, immediate, lock, duration, easing, lerp, onStart, onComplete, force, programmatic, userData, }?: {
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
    private preventNextNativeScrollEvent;
    get rootElement(): HTMLElement;
    get limit(): number;
    get isHorizontal(): boolean;
    get actualScroll(): number;
    get scroll(): number;
    get progress(): number;
    get isScrolling(): Scrolling;
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
