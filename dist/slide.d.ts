export default class Slide {
    constructor(element: any, { align, ignoreSticky, ignoreTransform }?: {
        align?: string[] | undefined;
        ignoreSticky?: boolean | undefined;
        ignoreTransform?: boolean | undefined;
    });
    element: any;
    ignoreSticky: boolean;
    ignoreTransform: boolean;
    align: string[];
    rect: {};
    wrapperResizeObserver: ResizeObserver;
    resizeObserver: ResizeObserver;
    destroy(): void;
    setRect({ top, left, width, height, element }: {
        top: any;
        left: any;
        width: any;
        height: any;
        element: any;
    }): void;
    onWrapperResize: () => void;
    onResize: ([entry]: [any]) => void;
}
