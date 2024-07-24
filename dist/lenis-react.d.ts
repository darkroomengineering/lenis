/// <reference types="react" />
import * as lenis from 'lenis';
import lenis__default, { ScrollCallback, LenisOptions } from 'lenis';
export { default } from 'lenis';
import * as react from 'react';
import { PropsWithChildren, ComponentPropsWithoutRef } from 'react';

type LenisContextValue = {
    lenis: lenis__default;
    addCallback: (callback: ScrollCallback, priority: number) => void;
    removeCallback: (callback: ScrollCallback) => void;
};
type LenisProps = PropsWithChildren<{
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
     * RequestAnimationFrame priority
     * @default 0
     */
    rafPriority?: number;
    /**
     * Class name for the wrapper div
     */
    className?: string;
    /**
     * Additional props for the wrapper div
     */
    props?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;
}>;
type LenisRef = {
    wrapper: HTMLDivElement | null;
    content: HTMLDivElement | null;
    lenis?: lenis__default;
};

declare const LenisContext: react.Context<LenisContextValue | null>;
declare function useLenis(callback?: ScrollCallback, deps?: any[], priority?: number): lenis__default | undefined;
declare const ReactLenis: react.ForwardRefExoticComponent<{
    root?: boolean | undefined;
    options?: Partial<{
        wrapper: HTMLElement | Window;
        content: HTMLElement;
        wheelEventsTarget: HTMLElement | Window;
        eventsTarget: HTMLElement | Window;
        smoothWheel: boolean;
        syncTouch: boolean;
        syncTouchLerp: number;
        touchInertiaMultiplier: number;
        duration: number;
        easing: lenis.EasingFunction;
        lerp: number;
        infinite: boolean;
        orientation: lenis.Orientation;
        gestureOrientation: lenis.GestureOrientation;
        touchMultiplier: number;
        wheelMultiplier: number;
        autoResize: boolean;
        prevent: (node: HTMLElement) => boolean;
        virtualScroll: (data: lenis.VirtualScrollData) => boolean;
        __experimental__naiveDimensions: boolean;
    }> | undefined;
    autoRaf?: boolean | undefined;
    rafPriority?: number | undefined;
    className?: string | undefined;
    props?: Omit<Omit<react.DetailedHTMLProps<react.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref">, "className" | "children"> | undefined;
} & {
    children?: react.ReactNode;
} & react.RefAttributes<LenisRef>>;

export { ReactLenis as Lenis, LenisContext, type LenisContextValue, type LenisProps, type LenisRef, ReactLenis, useLenis };
