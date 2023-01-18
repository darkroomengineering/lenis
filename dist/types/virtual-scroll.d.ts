export class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier, normalizeWheel }: {
        wheelMultiplier?: number;
        touchMultiplier?: number;
        normalizeWheel?: boolean;
    });
    element: any;
    on(event: any, callback: any): import("nanoevents").Unsubscribe;
    destroy(): void;
    #private;
}
