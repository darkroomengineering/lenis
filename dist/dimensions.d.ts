export class Dimensions {
    constructor({ wrapper, content, autoResize, debounce: debounceValue, }?: {
        wrapper: any;
        content: any;
        autoResize?: boolean;
        debounce?: number;
    });
    wrapper: any;
    content: any;
    debouncedResize: (...args: any[]) => void;
    wrapperResizeObserver: ResizeObserver;
    contentResizeObserver: ResizeObserver;
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
