export class Dimensions {
    constructor(wrapper: any, content: any);
    wrapper: any;
    content: any;
    width: any;
    height: any;
    scrollHeight: any;
    scrollWidth: any;
    wrapperResizeObserver: ResizeObserver;
    contentResizeObserver: ResizeObserver;
    onWindowResize: () => void;
    destroy(): void;
    onWrapperResize: () => void;
    onContentResize: () => void;
    get limit(): {
        x: number;
        y: number;
    };
}
