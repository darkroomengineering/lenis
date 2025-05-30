import type Lenis from "lenis";
import { untrack } from 'svelte';
import { LenisContext } from "./instances/context";

export const useLenis = (onScroll: (lenis: Lenis) => void, priority = 0) => {
    const context = LenisContext.get();

    $effect(() => {
        const callback = { action: onScroll, priority };
        untrack(() => {
            context.callbackManager.add(callback);
        })

        return () => {
            context.callbackManager.remove(callback);
        }
    })

    $effect(() => {
        const lenis = context.instance();

        if (!lenis) return;

        const onScroll = (lenis: Lenis) => {
            context.callbackManager.forEach(
                item => item.action(lenis)
            );
        }
        lenis.on('scroll', onScroll)

        return () => lenis.off('scroll', onScroll)
    })

    return {
        get current() {
            return context.instance()
        }
    };
}