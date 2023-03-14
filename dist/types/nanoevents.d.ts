export function createNanoEvents(): {
    events: {};
    emit(event: any, ...args: any[]): void;
    on(event: any, cb: any): () => void;
};
