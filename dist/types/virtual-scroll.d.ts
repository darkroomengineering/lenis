export class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier, normalizeWheel }: {
        wheelMultiplier?: number;
        touchMultiplier?: number;
        normalizeWheel?: boolean;
    });
    element: any;
    wheelMultiplier: number;
    touchMultiplier: number;
    normalizeWheel: boolean;
    touchStart: {
        x: any;
        y: any;
    };
    emitter: {
        events: {};
        emit(event: any, ...args: any[]): void;
        on(event: any, cb: any): () => void;
    };
    on(event: any, callback: any): () => void;
    destroy(): void;
    onTouchStart: (event: any) => void;
    onTouchMove: (event: any) => void;
    lastDelta: {
        x: any;
        y: any;
    };
    onTouchEnd: (event: any) => void;
    onWheel: (event: any) => void;
}
