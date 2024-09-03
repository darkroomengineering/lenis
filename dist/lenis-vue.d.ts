import * as vue from 'vue';
import { ShallowRef, PropType, HTMLAttributes, Plugin } from 'vue';
import * as lenis from 'lenis';
import lenis__default, { ScrollCallback } from 'lenis';

type LenisContextValue = {
    lenis: ShallowRef<lenis__default | null>;
    addCallback: ShallowRef<(callback: ScrollCallback, priority: number) => void>;
    removeCallback: ShallowRef<(callback: ScrollCallback) => void>;
};
declare module 'vue' {
    interface GlobalComponents {
        lenis: typeof VueLenis;
    }
}

declare const VueLenis: vue.DefineComponent<{
    root: {
        type: PropType<boolean>;
        default: boolean;
    };
    autoRaf: {
        type: PropType<boolean>;
        default: boolean;
    };
    rafPriority: {
        type: PropType<number>;
        default: number;
    };
    options: {
        type: PropType<lenis.LenisOptions | undefined>;
        default: () => {};
    };
    props: {
        type: PropType<HTMLAttributes>;
        default: () => {};
    };
}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    root: {
        type: PropType<boolean>;
        default: boolean;
    };
    autoRaf: {
        type: PropType<boolean>;
        default: boolean;
    };
    rafPriority: {
        type: PropType<number>;
        default: number;
    };
    options: {
        type: PropType<lenis.LenisOptions | undefined>;
        default: () => {};
    };
    props: {
        type: PropType<HTMLAttributes>;
        default: () => {};
    };
}>>, {
    props: HTMLAttributes;
    root: boolean;
    autoRaf: boolean;
    rafPriority: number;
    options: lenis.LenisOptions | undefined;
}, {}>;
declare const vueLenisPlugin: Plugin;

declare function useLenis(callback?: ScrollCallback, priority?: number, log?: string): vue.ShallowRef<lenis.default | null>;

export { VueLenis as Lenis, type LenisContextValue, VueLenis, vueLenisPlugin as default, useLenis };
