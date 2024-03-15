import Lenis, { LenisOptions } from '@studio-freight/lenis';
import { ForwardRefExoticComponent, PropsWithoutRef, ReactNode, RefAttributes } from 'react';
export declare const LenisContext: Lenis | null;
export declare function useLenis(callback?: (lenis: Lenis) => void, deps?: Array<any>, priority?: number): Lenis | undefined;
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
export { ReactLenis as Lenis, ReactLenis };
export default ReactLenis;
