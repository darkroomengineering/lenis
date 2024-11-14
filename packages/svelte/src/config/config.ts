import type { LenisOptions } from "lenis";

export type LenisConfig =  Partial<{
    /**
     * Instance identifier
     */
    id: string;

    /**
     * Lenis Options
     */
    options: LenisOptions
}>;


