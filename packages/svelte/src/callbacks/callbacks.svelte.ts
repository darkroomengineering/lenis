import type Lenis from "lenis";

type Callback = {
    action: (lenis: Lenis) => void;
    priority: number
};

export class CallbackManager {

    callbacks = $state<Callback[]>([])

    constructor() {}

    add(callback: Callback) {
        this.callbacks.push(callback);
        this.callbacks.sort((a, b) => a.priority - b.priority);
    }

    remove(callback: Callback) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback)
    }

    forEach(byItem: (callback: Callback) => void) {
        this.callbacks.forEach(byItem);
    }
}

export default CallbackManager;