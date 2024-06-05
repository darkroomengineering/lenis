export class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier }: {
        wheelMultiplier?: number;
        touchMultiplier?: number;
    });
    element: any;
    wheelMultiplier: number;
    touchMultiplier: number;
    touchStart: {
        x: any;
        y: any;
    };
    emitter: Emitter;
    on(event: any, callback: any): () => void;
    destroy(): void;
    onTouchStart: (event: any) => void;
    lastDelta: {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    };
    onTouchMove: (event: any) => void;
    onTouchEnd: (event: any) => void;
    onWheel: (event: any) => void;
    onWindowResize: () => void;
    windowWidth: number;
    windowHeight: number;
}
import { Emitter } from './emitter';
