import { ComponentOptionsMixin } from 'vue';
import { default as default_2 } from 'lenis';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { LenisOptions } from 'lenis';
import { Plugin as Plugin_2 } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';
import { RendererElement } from 'vue';
import { RendererNode } from 'vue';
import { VNode } from 'vue';

export declare const LenisSymbol: unique symbol;

export declare const LenisVue: DefineComponent<    {
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
}, () => VNode<RendererNode, RendererElement, {
[key: string]: any;
}> | VNode<RendererNode, RendererElement, {
[key: string]: any;
}>[] | undefined, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<    {
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
}>>, {
root: boolean;
autoRaf: boolean;
options: LenisOptions | undefined;
}, {}>;

export declare interface LenisVueProps {
    root?: boolean;
    autoRaf?: boolean;
    options?: ConstructorParameters<typeof default_2>[0];
}

declare const plugin: Plugin_2;
export default plugin;

export declare function useLenis(callback?: () => void): Ref<default_2>;

export { }


declare module 'vue' {
    interface GlobalComponents {
        lenis: typeof LenisVue;
    }
}
