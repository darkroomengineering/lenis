export class VirtualScroll {
    constructor(element: any, { wheelMultiplier, touchMultiplier }: {
        wheelMultiplier?: number | undefined;
        touchMultiplier?: number | undefined;
    });
    element: any;
    wheelMultiplier: number;
    touchMultiplier: number;
    touchStart: {
        x: null;
        y: null;
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
    } | undefined;
    onTouchMove: (event: any) => void;
    onTouchEnd: (event: any) => void;
    onWheel: (event: any) => void;
    onWindowResize: () => void;
    windowWidth: number | undefined;
    windowHeight: number | undefined;
}
import { Emitter } from './emitter';
