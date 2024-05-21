declare class Snap {
    constructor(lenis: any, { type, velocityThreshold, onSnapStart, onSnapComplete, }?: {
        type?: string;
        velocityThreshold?: number;
        onSnapStart: any;
        onSnapComplete: any;
    });
    destroy(): void;
    add(value: any): () => void;
    remove(id: any): void;
    addElement(element: any, options?: {}): () => void;
    removeElement(id: any): void;
    onWindowResize: () => void;
    onScroll: ({ scroll, limit, lastVelocity, velocity, isScrolling, isTouching }: {
        scroll: any;
        limit: any;
        lastVelocity: any;
        velocity: any;
        isScrolling: any;
        isTouching: any;
    }, { userData, isSmooth, type }: {
        userData: any;
        isSmooth: any;
        type: any;
    }) => void;
}

export { Snap as default };
