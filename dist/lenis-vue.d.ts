import * as vue from 'vue';
import { PropType, HTMLAttributes, Plugin } from 'vue';
import * as lenis from 'lenis';
import { LenisOptions, ScrollCallback } from 'lenis';

declare const VueLenis: vue.DefineComponent<{
    root: {
        type: PropType<boolean>;
        default: boolean;
    };
    autoRaf: {
        type: PropType<boolean>;
        default: boolean;
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
    options: lenis.LenisOptions | undefined;
}, {}>;
declare const vueLenisPlugin: Plugin;

interface LenisVueProps {
    /**
     * Setup a global instance of Lenis
     * @default false
     */
    root?: boolean;
    /**
     * Lenis options
     */
    options?: LenisOptions;
    /**
     * Auto-setup requestAnimationFrame
     * @default true
     */
    autoRaf?: boolean;
    /**
     * Additional props for the wrapper div
     *
     * When `root` is `false`, this will be applied to the wrapper div
     */
    props?: HTMLAttributes;
}
declare module 'vue' {
    interface GlobalComponents {
        lenis: typeof VueLenis;
    }
}

declare function useLenis(callback?: ScrollCallback): vue.Ref<lenis.default | undefined>;

export { VueLenis as Lenis, type LenisVueProps, VueLenis, vueLenisPlugin as default, useLenis };
