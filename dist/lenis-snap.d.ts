import Lenis from 'lenis';

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

type UID = number;

type Viewport = {
    width: number;
    height: number;
};
type SnapItem = {
    value: number;
    userData: object;
};
type SnapOptions = {
    type?: 'mandatory' | 'proximity';
    lerp?: number;
    easing?: (t: number) => number;
    duration?: number;
    velocityThreshold?: number;
    debounce?: number;
    onSnapStart?: (t: SnapItem) => void;
    onSnapComplete?: (t: SnapItem) => void;
};
declare class Snap {
    lenis: Lenis;
    options: SnapOptions;
    elements: Map<UID, SnapElement>;
    snaps: Map<UID, SnapItem>;
    viewport: Viewport;
    isStopped: Boolean;
    onSnapDebounced: Function;
    constructor(lenis: Lenis, { type, lerp, easing, duration, velocityThreshold, debounce: debounceDelay, onSnapStart, onSnapComplete, }?: SnapOptions);
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: number, userData?: object): () => void;
    remove(id: UID): void;
    addElement(element: HTMLElement, options?: SnapElementOptions): () => void;
    removeElement(id: UID): void;
    private onWindowResize;
    private onScroll;
    private onSnap;
}

export { type SnapOptions, Snap as default };
