export class Emitter {
    events: {};
    emit(event: any, ...args: any[]): void;
    on(event: any, cb: any): () => void;
    destroy(): void;
}
