/**
 * Dimensions class to handle the size of the content and wrapper
 *
 * @example
 * const dimensions = new Dimensions(wrapper, content)
 * dimensions.on('resize', (e) => {
 *   console.log(e.width, e.height)
 * })
 */
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
    /**
     * Linear interpolation (lerp) intensity (between 0 and 1)
     * @default 0.1
     */
    lerp?: number;
    /**
     * The duration of the scroll animation (in s)
     * @default 1
     */
    duration?: number;
    /**
     * The easing function to use for the scroll animation
     * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
     */
    easing?: EasingFunction;
    /**
     * Called when the scroll starts
     */
    onStart?: OnStartCallback;
    /**
     * Called when the scroll progress changes
     */
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
    /**
     * The offset to apply to the target value
     * @default 0
     */
    offset?: number;
    /**
     * Skip the animation and jump to the target value immediately
     * @default false
     */
    immediate?: boolean;
    /**
     * Lock the scroll to the target value
     * @default false
     */
    lock?: boolean;
    /**
     * The duration of the scroll animation (in s)
     */
    duration?: number;
    /**
     * The easing function to use for the scroll animation
     * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
     */
    easing?: EasingFunction;
    /**
     * Linear interpolation (lerp) intensity (between 0 and 1)
     * @default 0.1
     */
    lerp?: number;
    /**
     * Called when the scroll starts
     */
    onStart?: (lenis: Lenis) => void;
    /**
     * Called when the scroll completes
     */
    onComplete?: (lenis: Lenis) => void;
    /**
     * Scroll even if stopped
     * @default false
     */
    force?: boolean;
    /**
     * Scroll initiated from outside of the lenis instance
     * @default false
     */
    programmatic?: boolean;
    /**
     * User data that will be forwarded through the scroll event
     */
    userData?: UserData;
};
type LenisOptions = {
    /**
     * The element that will be used as the scroll container
     * @default window
     */
    wrapper?: Window | HTMLElement;
    /**
     * The element that contains the content that will be scrolled, usually `wrapper`'s direct child
     * @default document.documentElement
     */
    content?: HTMLElement;
    /**
     * The element that will listen to `wheel` and `touch` events
     * @default window
     */
    eventsTarget?: Window | HTMLElement;
    /**
     * Smooth the scroll initiated by `wheel` events
     * @default true
     */
    smoothWheel?: boolean;
    /**
     * Mimic touch device scroll while allowing scroll sync
     * @default false
     */
    syncTouch?: boolean;
    /**
     * Linear interpolation (lerp) intensity (between 0 and 1)
     * @default 0.075
     */
    syncTouchLerp?: number;
    /**
     * Manage the the strength of `syncTouch` inertia
     * @default 35
     */
    touchInertiaMultiplier?: number;
    /**
     * Scroll duration in seconds
     */
    duration?: number;
    /**
     * Scroll easing function
     * @default (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
     */
    easing?: EasingFunction;
    /**
     * Linear interpolation (lerp) intensity (between 0 and 1)
     * @default 0.1
     */
    lerp?: number;
    /**
     * Enable infinite scrolling
     * @default false
     */
    infinite?: boolean;
    /**
     * The orientation of the scrolling. Can be `vertical` or `horizontal`
     * @default vertical
     */
    orientation?: Orientation;
    /**
     * The orientation of the gestures. Can be `vertical`, `horizontal` or `both`
     * @default vertical
     */
    gestureOrientation?: GestureOrientation;
    /**
     * The multiplier to use for mouse wheel events
     * @default 1
     */
    touchMultiplier?: number;
    /**
     * The multiplier to use for touch events
     * @default 1
     */
    wheelMultiplier?: number;
    /**
     * Resize instance automatically
     * @default true
     */
    autoResize?: boolean;
    /**
     * Manually prevent scroll to be smoothed based on elements traversed by events
     */
    prevent?: (node: HTMLElement) => boolean;
    /**
     * Manually modify the events before they get consumed
     */
    virtualScroll?: (data: VirtualScrollData) => boolean;
    /**
     * If `true`, Lenis will not try to detect the size of the content and wrapper
     * @default false
     */
    __experimental__naiveDimensions?: boolean;
};
declare global {
    interface Window {
        lenisVersion: string;
    }
}

type OptionalPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;
declare class Lenis {
    private _isScrolling;
    private _isStopped;
    private _isLocked;
    private _preventNextNativeScrollEvent;
    private _resetVelocityTimeout;
    /**
     * Whether or not the user is touching the screen
     */
    isTouching?: boolean;
    /**
     * The time in ms since the lenis instance was created
     */
    time: number;
    /**
     * User data that will be forwarded through the scroll event
     *
     * @example
     * lenis.scrollTo(100, {
     *   userData: {
     *     foo: 'bar'
     *   }
     * })
     */
    userData: UserData;
    /**
     * The last velocity of the scroll
     */
    lastVelocity: number;
    /**
     * The current velocity of the scroll
     */
    velocity: number;
    /**
     * The direction of the scroll
     */
    direction: 1 | -1 | 0;
    /**
     * The options passed to the lenis instance
     */
    options: OptionalPick<Required<LenisOptions>, 'duration' | 'prevent' | 'virtualScroll'>;
    /**
     * The target scroll value
     */
    targetScroll: number;
    /**
     * The animated scroll value
     */
    animatedScroll: number;
    private readonly animate;
    private readonly emitter;
    readonly dimensions: Dimensions;
    private readonly virtualScroll;
    constructor({ wrapper, content, eventsTarget, smoothWheel, syncTouch, syncTouchLerp, touchInertiaMultiplier, duration, // in seconds
    easing, lerp, infinite, orientation, // vertical, horizontal
    gestureOrientation, // vertical, horizontal, both
    touchMultiplier, wheelMultiplier, autoResize, prevent, virtualScroll, __experimental__naiveDimensions, }?: LenisOptions);
    /**
     * Destroy the lenis instance, remove all event listeners and clean up the class name
     */
    destroy(): void;
    /**
     * Add an event listener for the given event and callback
     *
     * @param event Event name
     * @param callback Callback function
     * @returns Unsubscribe function
     */
    on(event: 'scroll', callback: ScrollCallback): () => void;
    on(event: 'virtual-scroll', callback: VirtualScrollCallback): () => void;
    /**
     * Remove an event listener for the given event and callback
     *
     * @param event Event name
     * @param callback Callback function
     */
    off(event: 'scroll', callback: ScrollCallback): void;
    off(event: 'virtual-scroll', callback: VirtualScrollCallback): void;
    private setScroll;
    private onPointerDown;
    private onVirtualScroll;
    /**
     * Force lenis to recalculate the dimensions
     */
    resize(): void;
    private emit;
    private onNativeScroll;
    private reset;
    /**
     * Start lenis scroll after it has been stopped
     */
    start(): void;
    /**
     * Stop lenis scroll
     */
    stop(): void;
    /**
     * RequestAnimationFrame for lenis
     *
     * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
     */
    raf(time: number): void;
    /**
     * Scroll to a target value
     *
     * @param target The target value to scroll to
     * @param options The options for the scroll
     *
     * @example
     * lenis.scrollTo(100, {
     *   offset: 100,
     *   duration: 1,
     *   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
     *   lerp: 0.1,
     *   onStart: () => {
     *     console.log('onStart')
     *   },
     *   onComplete: () => {
     *     console.log('onComplete')
     *   },
     * })
     */
    scrollTo(target: number | string | HTMLElement, { offset, immediate, lock, duration, easing, lerp, onStart, onComplete, force, // scroll even if stopped
    programmatic, // called from outside of the class
    userData, }?: ScrollToOptions): void;
    private preventNextNativeScrollEvent;
    /**
     * The root element on which lenis is instanced
     */
    get rootElement(): HTMLElement;
    /**
     * The limit which is the maximum scroll value
     */
    get limit(): number;
    /**
     * Whether or not the scroll is horizontal
     */
    get isHorizontal(): boolean;
    /**
     * The actual scroll value
     */
    get actualScroll(): number;
    /**
     * The current scroll value
     */
    get scroll(): number;
    /**
     * The progress of the scroll relative to the limit
     */
    get progress(): number;
    /**
     * Current scroll state
     */
    get isScrolling(): Scrolling;
    private set isScrolling(value);
    /**
     * Check if lenis is stopped
     */
    get isStopped(): boolean;
    private set isStopped(value);
    /**
     * Check if lenis is locked
     */
    get isLocked(): boolean;
    private set isLocked(value);
    /**
     * Check if lenis is smooth scrolling
     */
    get isSmooth(): boolean;
    /**
     * The class name applied to the wrapper element
     */
    get className(): string;
    private updateClassName;
    private cleanUpClassName;
}

export { type EasingFunction, type FromToOptions, type GestureOrientation, type LenisEvent, type LenisOptions, type OnStartCallback, type OnUpdateCallback, type Orientation, type ScrollCallback, type ScrollToOptions, type Scrolling, type UserData, type VirtualScrollCallback, type VirtualScrollData, Lenis as default };
