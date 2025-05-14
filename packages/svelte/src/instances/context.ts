import type Lenis from "lenis";
import { getContext, hasContext, setContext } from "svelte";
import CallbackManager from "../callbacks/callbacks.svelte";
import { root } from "./root.svelte";

const LENIS_CONTEXT = Symbol('__LENIS_CONTEXT__');
type LenisContext = {
    instance: () => Lenis | undefined;
    callbackManager: CallbackManager;
}

const Root = {
    instance: () => root.value,
    callbackManager: new CallbackManager()
}

export const LenisContext = {
    get() {
        if (hasContext(LENIS_CONTEXT)) {
            return getContext<LenisContext>(LENIS_CONTEXT);
        } else {
            return Root
        }
    },
    set(lenis: LenisContext['instance']) {
        return setContext(LENIS_CONTEXT, {
            instance: lenis,
            callbackManager: new CallbackManager()
        });
    }
}

export default LenisContext;