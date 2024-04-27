import * as react from 'react';
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, ReactNode } from 'react';
import Lenis, { LenisOptions } from 'lenis';

type LenisEventHandler = (lenis: Lenis) => void;
interface LenisContextValue {
    lenis: Lenis;
    addCallback: (handler: LenisEventHandler, priority: number) => void;
    removeCallback: (handler: LenisEventHandler) => void;
}
declare const LenisContext: react.Context<LenisContextValue | null>;
declare function useLenis(callback?: (lenis: Lenis) => void, deps?: Array<any>, priority?: number): Lenis | undefined;
type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type Props = {
    root?: boolean;
    options?: LenisOptions;
    autoRaf?: boolean;
    rafPriority?: number;
    className?: string;
    children?: ReactNode;
    props?: any;
};
type LenisRef = {
    wrapper?: HTMLElement;
    content?: HTMLElement;
    lenis?: Lenis;
};
declare const ReactLenis: ForwardRefComponent<Props, LenisRef>;

export { ReactLenis as Lenis, LenisContext, ReactLenis, ReactLenis as default, useLenis };
