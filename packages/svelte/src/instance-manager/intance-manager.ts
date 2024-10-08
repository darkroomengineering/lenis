import type Lenis from "lenis";
import { writable } from "svelte/store";

class LenisIntanceManager {
    intances = writable<Record<string, Lenis>>({});


    register(id: string, lenis: Lenis) {
        this.intances.update(intances => {
            intances[id] = lenis
            return intances
        })
    }


    unregister(id: string) {
        this.intances.update(intances => {
            delete intances[id];

            return intances
        })
    }

}

export default new LenisIntanceManager();
