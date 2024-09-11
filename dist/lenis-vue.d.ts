import * as vue from 'vue';
import { PropType, HTMLAttributes, Plugin } from 'vue';
import * as lenis from 'lenis';
import { ScrollCallback } from 'lenis';

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
declare module '@vue/runtime-core' {
    interface GlobalComponents {
        'vue-lenis': typeof VueLenis;
    }
}

declare function useLenis(callback?: ScrollCallback, priority?: number): vue.ComputedRef<lenis.default | undefined>;

export { VueLenis as Lenis, VueLenis, vueLenisPlugin as default, useLenis };
