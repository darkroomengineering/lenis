import Lenis, { LenisOptions } from 'lenis';
import { Action } from 'svelte/action';
import { Readable } from 'svelte/store';

type LenisConfig = Partial<{
    /**
     * Instance identifier
     */
    id: string;
    /**
     * If you want to run lenis.raf() by yourself, set it to `false`
     * @default true
     */
    autoRaf: boolean;
    /**
     * Lenis Options
     */
    options: LenisOptions;
}>;

interface WithInstanceGet {
    instance(id: string): Readable<Lenis | undefined>;
    root(): Readable<Lenis | undefined>;
}
declare const lenis: Action<HTMLElement, LenisConfig | undefined> & WithInstanceGet;

export { lenis };
