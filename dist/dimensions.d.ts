export class Dimensions {
    constructor({ wrapper, content, autoResize, debounce: debounceValue, }?: {
        wrapper: any;
        content: any;
        autoResize?: boolean | undefined;
        debounce?: number | undefined;
    });
    wrapper: any;
    content: any;
    debouncedResize: ((...args: any[]) => void) | undefined;
    wrapperResizeObserver: ResizeObserver | undefined;
    contentResizeObserver: ResizeObserver | undefined;
    destroy(): void;
    resize: () => void;
    onWrapperResize: () => void;
    width: any;
    height: any;
    onContentResize: () => void;
    scrollHeight: any;
    scrollWidth: any;
    get limit(): {
        x: number;
        y: number;
    };
}
