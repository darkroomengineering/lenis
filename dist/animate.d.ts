export class Animate {
    advance(deltaTime: any): void;
    value: any;
    stop(): void;
    isRunning: boolean | undefined;
    fromTo(from: any, to: any, { lerp, duration, easing, onStart, onUpdate }: {
        lerp: any;
        duration: any;
        easing: any;
        onStart: any;
        onUpdate: any;
    }): void;
    from: any;
    to: any;
    lerp: any;
    duration: any;
    easing: any;
    currentTime: number | undefined;
    onUpdate: any;
}
