import Lenis from 'lenis';

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
    elements: Map<number, Node>;
    snaps: Map<number, number>;
    viewport: Viewport;
    isStopped: Boolean;
    constructor(lenis: Lenis, { type, lerp, easing, duration, velocityThreshold, onSnapStart, onSnapComplete, }?: SnapOptions);
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: number): () => void;
    remove(id: UID): void;
    addElement(element: Node, options?: {}): () => void;
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
