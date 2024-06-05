export type SnapElementOptions = {
    align?: string[];
    ignoreSticky?: boolean;
    ignoreTransform?: boolean;
};
type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
    x: number;
    y: number;
    bottom: number;
    right: number;
    element: HTMLElement;
};
export declare class SnapElement {
    element: HTMLElement;
    options: SnapElementOptions;
    align: string[];
    rect: Rect;
    wrapperResizeObserver: ResizeObserver;
    resizeObserver: ResizeObserver;
    constructor(element: HTMLElement, { align, ignoreSticky, ignoreTransform, }?: SnapElementOptions);
    destroy(): void;
    setRect({ top, left, width, height, element, }?: {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
        element?: HTMLElement;
    }): void;
    onWrapperResize: () => void;
    onResize: ([entry]: ResizeObserverEntry[]) => void;
}
export {};
