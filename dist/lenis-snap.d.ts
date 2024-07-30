import Lenis, { UserData, EasingFunction } from 'lenis';

type SnapElementOptions = {
    align?: string[];
    ignoreSticky?: boolean;
    ignoreTransform?: boolean;
};
type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
    x: number;
    y: number;
    bottom: number;
    right: number;
    element: HTMLElement;
};
declare class SnapElement {
    element: HTMLElement;
    options: SnapElementOptions;
    align: string[];
    rect: Rect;
    wrapperResizeObserver: ResizeObserver;
    resizeObserver: ResizeObserver;
    constructor(element: HTMLElement, { align, ignoreSticky, ignoreTransform, }?: SnapElementOptions);
    destroy(): void;
    setRect({ top, left, width, height, element, }?: {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
        element?: HTMLElement;
    }): void;
    onWrapperResize: () => void;
    onResize: ([entry]: ResizeObserverEntry[]) => void;
}

type SnapItem = {
    value: number;
    userData: UserData;
};
type OnSnapCallback = (item: SnapItem) => void;
type SnapOptions = {
    /**
     * Snap type
     * @default mandatory
     */
    type?: 'mandatory' | 'proximity';
    /**
     * Linear interpolation (lerp) intensity (between 0 and 1)
     */
    lerp?: number;
    /**
     * The easing function to use for the snap animation
     */
    easing?: EasingFunction;
    /**
     * The duration of the snap animation (in s)
     */
    duration?: number;
    /**
     * The velocity threshold to trigger a snap
     */
    velocityThreshold?: number;
    /**
     * The debounce delay (in ms) to prevent snapping too often
     */
    debounce?: number;
    /**
     * Called when the snap starts
     */
    onSnapStart?: OnSnapCallback;
    /**
     * Called when the snap completes
     */
    onSnapComplete?: OnSnapCallback;
};

type UID = number;

type RequiredPick<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>;
/**
 * Snap class to handle the snap functionality
 *
 * @example
 * const snap = new Snap(lenis, {
 *   type: 'mandatory', // 'mandatory', 'proximity'
 *   lerp: 0.1,
 *   duration: 1,
 *   easing: (t) => t,
 *   onSnapStart: (snap) => {
 *     console.log('onSnapStart', snap)
 *   },
 *   onSnapComplete: (snap) => {
 *     console.log('onSnapComplete', snap)
 *   },
 * })
 *
 * snap.add(500) // snap at 500px
 *
 * const removeSnap = snap.add(500)
 *
 * if (someCondition) {
 *   removeSnap()
 * }
 */
declare class Snap {
    private lenis;
    options: RequiredPick<SnapOptions, 'type' | 'velocityThreshold' | 'debounce'>;
    elements: Map<number, SnapElement>;
    snaps: Map<number, SnapItem>;
    viewport: {
        width: number;
        height: number;
    };
    isStopped: boolean;
    onSnapDebounced: () => void;
    constructor(lenis: Lenis, { type, lerp, easing, duration, velocityThreshold, debounce: debounceDelay, onSnapStart, onSnapComplete, }?: SnapOptions);
    /**
     * Destroy the snap instance
     */
    destroy(): void;
    /**
     * Start the snap after it has been stopped
     */
    start(): void;
    /**
     * Stop the snap
     */
    stop(): void;
    /**
     * Add a snap to the snap instance
     *
     * @param value The value to snap to
     * @param userData User data that will be forwarded through the snap event
     * @returns Unsubscribe function
     */
    add(value: number, userData?: UserData): () => void;
    /**
     * Remove a snap from the snap instance
     *
     * @param id The snap id of the snap to remove
     */
    remove(id: UID): void;
    /**
     * Add an element to the snap instance
     *
     * @param element The element to add
     * @param options The options for the element
     * @returns Unsubscribe function
     */
    addElement(element: HTMLElement, options?: SnapElementOptions): () => void;
    /**
     * Remove an element from the snap instance
     *
     * @param id The snap id of the snap element to remove
     */
    removeElement(id: UID): void;
    private onWindowResize;
    private onScroll;
    private onSnap;
}

export { type OnSnapCallback, type SnapItem, type SnapOptions, Snap as default };
