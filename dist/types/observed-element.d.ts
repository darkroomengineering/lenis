export class ObservedElement {
    constructor(element: any);
    element: any;
    width: any;
    height: any;
    resizeObserver: ResizeObserver;
    destroy(): void;
    onResize: ([entry]: [any]) => void;
    onWindowResize: () => void;
}
