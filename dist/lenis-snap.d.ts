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
type SnapOptions = {
    type?: 'mandatory' | 'proximity';
    lerp?: number;
    easing?: (t: number) => number;
    duration?: number;
    velocityThreshold?: number;
    onSnapStart?: (t: number) => number;
    onSnapComplete?: (t: number) => number;
};
declare class Snap {
    lenis: Lenis;
    options: SnapOptions;
    elements: Map<UID, SnapElement>;
    snaps: Map<UID, number>;
    viewport: Viewport;
    isStopped: Boolean;
    constructor(lenis: Lenis, { type, lerp, easing, duration, velocityThreshold, onSnapStart, onSnapComplete, }?: SnapOptions);
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: number): () => void;
    remove(id: UID): void;
    addElement(element: HTMLElement, options?: SnapElementOptions): () => void;
    removeElement(id: UID): void;
    onWindowResize: () => void;
    onScroll: ({ scroll, limit, lastVelocity, velocity, isScrolling, userData, isHorizontal, }: {
        scroll: any;
        limit: any;
        lastVelocity: any;
        velocity: any;
        isScrolling: any;
        userData: any;
        isHorizontal: any;
    }) => void;
}

export { type SnapOptions, Snap as default };
