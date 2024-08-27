import { AllowedComponentProps } from 'vue';
import { ComponentCustomProps } from 'vue';
import { ComponentOptionsBase } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { CreateComponentPublicInstance } from 'vue';
import { ExtractPropTypes } from 'vue';
import { Plugin as Plugin_2 } from 'vue';
import { VNodeProps } from 'vue';

declare const _default: SFCWithInstall<{
    new (...args: any[]): CreateComponentPublicInstance<Readonly<ExtractPropTypes<    {
    root: {
    type: BooleanConstructor;
    default: () => boolean;
    };
    instance: {
    type: StringConstructor;
    };
    options: {
    type: ObjectConstructor;
    default: () => void;
    };
    }>>, {}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, VNodeProps & AllowedComponentProps & ComponentCustomProps & Readonly<ExtractPropTypes<    {
    root: {
    type: BooleanConstructor;
    default: () => boolean;
    };
    instance: {
    type: StringConstructor;
    };
    options: {
    type: ObjectConstructor;
    default: () => void;
    };
    }>>, {
    root: boolean;
    options: Record<string, any>;
    }, true, {}, {}, {
    P: {};
    B: {};
    D: {};
    C: {};
    M: {};
    Defaults: {};
    }, Readonly<ExtractPropTypes<    {
    root: {
    type: BooleanConstructor;
    default: () => boolean;
    };
    instance: {
    type: StringConstructor;
    };
    options: {
    type: ObjectConstructor;
    default: () => void;
    };
    }>>, {}, {}, {}, {}, {
    root: boolean;
    options: Record<string, any>;
    }>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & ComponentOptionsBase<Readonly<ExtractPropTypes<    {
root: {
type: BooleanConstructor;
default: () => boolean;
};
instance: {
type: StringConstructor;
};
options: {
type: ObjectConstructor;
default: () => void;
};
}>>, {}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, {
root: boolean;
options: Record<string, any>;
}, {}, string, {}> & VNodeProps & AllowedComponentProps & ComponentCustomProps & (new () => {
    $slots: {
        default?(_: {}): any;
        default?(_: {}): any;
    };
})>;
export default _default;

declare type SFCWithInstall<T> = T & Plugin_2;

export { }
