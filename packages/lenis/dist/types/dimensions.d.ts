export class Dimensions {
    constructor({ wrapper, content, autoResize }?: {
        wrapper: any;
        content: any;
        autoResize?: boolean | undefined;
    });
    wrapper: any;
    content: any;
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
