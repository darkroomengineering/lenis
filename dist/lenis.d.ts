declare class Dimensions {
    private wrapper;
    private content;
    width: number;
    height: number;
    scrollHeight: number;
    scrollWidth: number;
    private debouncedResize?;
    private wrapperResizeObserver?;
    private contentResizeObserver?;
    constructor(wrapper: HTMLElement | Window, content: HTMLElement, { autoResize, debounce: debounceValue }?: {
        autoResize?: boolean | undefined;
        debounce?: number | undefined;
    });
    destroy(): void;
    resize: () => void;
    onWrapperResize: () => void;
    onContentResize: () => void;
    get limit(): {
        x: number;
        y: number;
    };
}

type OnUpdateCallback = (value: number, completed: boolean) => void;
type OnStartCallback = () => void;
type FromToOptions = {
    lerp?: number;
    duration?: number;
    easing?: EasingFunction;
    onStart?: OnStartCallback;
    onUpdate?: OnUpdateCallback;
};
type UserData = Record<string, any>;
type Scrolling = boolean | 'native' | 'smooth';
type LenisEvent = 'scroll' | 'virtual-scroll';
type ScrollCallback = (lenis: Lenis) => void;
type VirtualScrollCallback = (data: VirtualScrollData) => void;
type VirtualScrollData = {
    deltaX: number;
    deltaY: number;
    event: WheelEvent | TouchEvent;
};
type Orientation = 'vertical' | 'horizontal';
type GestureOrientation = 'vertical' | 'horizontal' | 'both';
type EasingFunction = (time: number) => number;
type ScrollToOptions = {
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
    userData?: UserData;
};
type LenisOptions = {
    wrapper?: Window | HTMLElement;
    content?: HTMLElement;
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
    prevent?: (node: HTMLElement) => boolean;
    virtualScroll?: (data: VirtualScrollData) => boolean;
    __experimental__naiveDimensions?: boolean;
};
declare global {
    interface Window {
        lenisVersion: string;
    }
}

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;
declare class Lenis {
    #private;
    isTouching?: boolean;
    time: number;
    userData: UserData;
    lastVelocity: number;
    velocity: number;
    direction: 1 | -1 | 0;
    options: OptionalPick<Required<LenisOptions>, 'duration' | 'prevent' | 'virtualScroll'>;
    targetScroll: number;
    animatedScroll: number;
    private readonly animate;
    private readonly emitter;
    readonly dimensions: Dimensions;
    private readonly virtualScroll;
    constructor({ wrapper, content, eventsTarget, smoothWheel, syncTouch, syncTouchLerp, touchInertiaMultiplier, duration, easing, lerp, infinite, orientation, gestureOrientation, touchMultiplier, wheelMultiplier, autoResize, prevent, virtualScroll, __experimental__naiveDimensions, }?: LenisOptions);
    destroy(): void;
    on(event: 'scroll', callback: ScrollCallback): () => void;
    on(event: 'virtual-scroll', callback: VirtualScrollCallback): () => void;
    off(event: 'scroll', callback: ScrollCallback): void;
    off(event: 'virtual-scroll', callback: VirtualScrollCallback): void;
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
    scrollTo(target: number | string | HTMLElement, { offset, immediate, lock, duration, easing, lerp, onStart, onComplete, force, programmatic, userData, }?: ScrollToOptions): void;
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

export { type EasingFunction, type FromToOptions, type GestureOrientation, type LenisEvent, type LenisOptions, type OnStartCallback, type OnUpdateCallback, type Orientation, type ScrollCallback, type ScrollToOptions, type Scrolling, type UserData, type VirtualScrollCallback, type VirtualScrollData, Lenis as default };
