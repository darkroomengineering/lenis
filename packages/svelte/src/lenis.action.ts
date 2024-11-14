
import Lenis from 'lenis';
import type { Action } from 'svelte/action';
import { derived, type Readable } from 'svelte/store';
import type { LenisConfig } from './config/config.js';
import LenisInstanceManager from './instance-manager/intance-manager.js';

interface WithInstanceGet {
    instance(id: string): Readable<Lenis | undefined>;
    root(): Readable<Lenis | undefined>;
}

export const lenis: Action<HTMLElement, LenisConfig | undefined> & WithInstanceGet= (el, config = {}) => {
    const id = config.id || 'root';
    const isRoot = id === 'root';

    const lenis = new Lenis({
        ...config.options,
        ...(
            !isRoot && {
                wrapper: el,
                content: el.firstChild as HTMLElement,
            }
        )
    });

    LenisInstanceManager.register(id, lenis)

    return {
        destroy () {
            LenisInstanceManager.unregister(id);
        }
    };
};

lenis.instance = (id: string) => {
    if (!id) throw new Error(`lenis.instance(<id>) should be called with a <id>. Your <id> is ${id}`)
    return derived(LenisInstanceManager.intances, instances => instances[id])
};
lenis.root = () => lenis.instance('root');
