export class Animate {
    advance(deltaTime: any): void;
    value: any;
    stop(): void;
    isRunning: boolean;
    fromTo(from: any, to: any, { lerp, duration, easing, onStart, onUpdate, onComplete, }: {
        lerp?: number;
        duration?: number;
        easing?: (t: any) => any;
        onStart: any;
        onUpdate: any;
        onComplete: any;
    }): void;
    from: any;
    to: any;
    lerp: number;
    duration: number;
    easing: (t: any) => any;
    currentTime: number;
    onStart: any;
    onUpdate: any;
    onComplete: any;
}
