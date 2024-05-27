declare class Snap {
    constructor(lenis: any, { type, lerp, easing, duration, velocityThreshold, onSnapStart, onSnapComplete, }?: {
        type?: string;
        lerp: any;
        easing: any;
        duration: any;
        velocityThreshold?: number;
        onSnapStart: any;
        onSnapComplete: any;
    });
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: any): () => void;
    remove(id: any): void;
    addElement(element: any, options?: {}): () => void;
    removeElement(id: any): void;
    onWindowResize: () => void;
    onScroll: ({ scroll, limit, lastVelocity, velocity, isScrolling, isTouching, userData, }: {
        scroll: any;
        limit: any;
        lastVelocity: any;
        velocity: any;
        isScrolling: any;
        isTouching: any;
        userData: any;
    }) => void;
}

export { Snap as default };
