export class Dimensions {
    constructor({ wrapper, content, autoResize }?: {
        wrapper: any;
        content: any;
        autoResize?: boolean;
    });
    wrapper: any;
    content: any;
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
