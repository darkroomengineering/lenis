export class Dimensions {
    constructor(wrapper: any, content: any);
    wrapper: any;
    content: any;
    wrapperResizeObserver: ResizeObserver;
    contentResizeObserver: ResizeObserver;
    onWindowResize: () => void;
    width: any;
    height: any;
    destroy(): void;
    onWrapperResize: () => void;
    onContentResize: () => void;
    scrollHeight: any;
    scrollWidth: any;
    get limit(): {
        x: number;
        y: number;
    };
}
