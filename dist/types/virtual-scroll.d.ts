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
    emitter: import("nanoevents").Emitter<import("nanoevents").DefaultEvents>;
    on(event: any, callback: any): import("nanoevents").Unsubscribe;
    destroy(): void;
    onTouchStart: (event: any) => void;
    onTouchMove: (event: any) => void;
    onWheel: (event: any) => void;
}
