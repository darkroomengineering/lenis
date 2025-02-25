import type { LenisOptions } from "lenis"
import type { Snippet } from "svelte"

export type LenisProps = {
    root?: boolean
    options?: LenisOptions
    class?: string
    children: Snippet
}
  