export class Animate {
    advance(deltaTime: any): void;
    value: any;
    stop(): void;
    isRunning: boolean | undefined;
    fromTo(from: any, to: any, { lerp, duration, easing, onStart, onUpdate }: {
        lerp?: number | undefined;
        duration?: number | undefined;
        easing?: ((t: any) => any) | undefined;
        onStart: any;
        onUpdate: any;
    }): void;
    from: any;
    to: any;
    lerp: number | undefined;
    duration: number | undefined;
    easing: ((t: any) => any) | undefined;
    currentTime: number | undefined;
    onUpdate: any;
}
