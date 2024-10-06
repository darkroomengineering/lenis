import type { LenisOptions } from "lenis";

export type LenisConfig =  Partial<{
    /**
     * Instance identifier
     */
    id: string;
    /**
     * If you want to run lenis.raf() by yourself, set it to `false`
     * @default true
     */
    autoRaf: boolean,

    /**
     * Lenis Options
     */
    options: LenisOptions
}>;


