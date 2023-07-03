export class OverflowObserver {
    constructor(element: any, { orientation }?: {
        orientation: any;
    });
    element: any;
    orientation: any;
    emitter: Emitter;
    observer: MutationObserver;
    on(event: any, callback: any): () => void;
    check(): void;
    destroy(): void;
}
import { Emitter } from './emitter';
