export class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier }: {
        wheelMultiplier?: number;
        touchMultiplier?: number;
    });
    element: any;
    on(event: any, callback: any): import("nanoevents").Unsubscribe;
    destroy(): void;
    #private;
}
