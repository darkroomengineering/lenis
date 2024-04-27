export declare class Store {
    private state;
    private listeners;
    constructor(state: any);
    set(state: any): void;
    subscribe(listener: (state: any) => any): () => void;
    get(): any;
}
export declare function useStore(store: Store): any;
