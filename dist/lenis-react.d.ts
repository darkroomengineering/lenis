/// <reference types="react" />
import * as react from 'react';
import { ReactNode, ComponentPropsWithoutRef } from 'react';
import Lenis, { ScrollCallback, LenisOptions } from 'lenis';

type LenisContextValue = {
    lenis: Lenis;
    addCallback: (callback: ScrollCallback, priority: number) => void;
    removeCallback: (callback: ScrollCallback) => void;
};
type LenisProps = {
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
     * Children
     */
    children?: ReactNode;
    /**
     * Class name for the wrapper div
     *
     * When `root` is `false`, this will be applied to the wrapper div
     */
    className?: string;
    /**
     * Additional props for the wrapper div
     *
     * When `root` is `false`, this will be applied to the wrapper div
     */
    props?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;
};
type LenisRef = {
    /**
     * The wrapper div element
     *
     * Will only be defined if `root` is `false`
     */
    wrapper: HTMLDivElement | null;
    /**
     * The content div element
     *
     * Will only be defined if `root` is `false`
     */
    content: HTMLDivElement | null;
    /**
     * The lenis instance
     */
    lenis?: Lenis;
};

declare const LenisContext: react.Context<LenisContextValue | null>;
/**
 * Hook to access the Lenis instance and its methods
 *
 * @example <caption>Scroll callback</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...')
 *            }
 *
 *            if (lenis.progress === 1) {
 *              console.log('At the end!')
 *            }
 *          })
 *
 * @example <caption>Scroll callback with dependencies</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...', someDependency)
 *            }
 *          }, [someDependency])
 * @example <caption>Scroll callback with priority</caption>
 *          useLenis((lenis) => {
 *            if (lenis.isScrolling) {
 *              console.log('Scrolling...')
 *            }
 *          }, [], 1)
 * @example <caption>Instance access</caption>
 *          const lenis = useLenis()
 *
 *          handleClick() {
 *            lenis.scrollTo(100, {
 *              lerp: 0.1,
 *              duration: 1,
 *              easing: (t) => t,
 *              onComplete: () => {
 *                console.log('Complete!')
 *              }
 *            })
 *          }
 */
declare function useLenis(callback?: ScrollCallback, deps?: any[], priority?: number): Lenis | undefined;
/**
 * React component to setup a Lenis instance
 */
declare const ReactLenis: react.ForwardRefExoticComponent<LenisProps & react.RefAttributes<LenisRef>>;

export { ReactLenis as Lenis, LenisContext, type LenisContextValue, type LenisProps, type LenisRef, ReactLenis, ReactLenis as default, useLenis };
