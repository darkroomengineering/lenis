export default class Snap {
    constructor(lenis: any);
    destroy(): void;
    add(element: any, options?: {}): void;
    remove(element: any): void;
    onWindowResize: () => void;
    onScroll: (e: any) => void;
}
