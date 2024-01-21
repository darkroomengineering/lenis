import Lenis, { LenisOptions } from '@studio-freight/lenis';
import React, { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
export declare const LenisContext: any;
export declare function useLenis(callback: Function, deps?: never[], priority?: number): any;
type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type Props = {
    root?: boolean;
    options?: LenisOptions;
    autoRaf?: boolean;
    rafPriority?: number;
    className?: string;
    children?: React.ReactNode;
    props?: any;
};
type LenisRef = {
    wrapper?: HTMLElement;
    content?: HTMLElement;
    lenis?: Lenis;
};
declare const ReactLenis: ForwardRefComponent<Props, LenisRef>;
export { ReactLenis as Lenis, ReactLenis };
export default ReactLenis;
