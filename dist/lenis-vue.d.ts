import * as vue from 'vue';
import { InjectionKey, Ref, PropType, Plugin } from 'vue';
import Lenis, { ScrollCallback, LenisOptions } from 'lenis';

declare const LenisSymbol: InjectionKey<Ref<Lenis | undefined>>;
declare function useLenis(callback?: ScrollCallback): Ref<Lenis | undefined>;
type DivProps = Omit<JSX.IntrinsicElements['div'], 'ref'>;
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
    props?: DivProps;
}
declare const LenisVue: vue.DefineComponent<{
    root: {
        type: PropType<boolean>;
        default: boolean;
    };
    autoRaf: {
        type: PropType<boolean>;
        default: boolean;
    };
    options: {
        type: PropType<LenisOptions | undefined>;
        default: () => {};
    };
    props: {
        type: PropType<DivProps>;
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
        type: PropType<LenisOptions | undefined>;
        default: () => {};
    };
    props: {
        type: PropType<DivProps>;
        default: () => {};
    };
}>>, {
    props: DivProps;
    root: boolean;
    autoRaf: boolean;
    options: LenisOptions | undefined;
}, {}>;
declare module 'vue' {
    interface GlobalComponents {
        lenis: typeof LenisVue;
    }
}
declare const plugin: Plugin;

export { LenisSymbol, LenisVue, type LenisVueProps, plugin as default, useLenis };
