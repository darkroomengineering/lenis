export class Animate {
    advance(deltaTime: any): void;
    value: any;
    stop(): void;
    isRunning: boolean;
    fromTo(from: any, to: any, { lerp, duration, easing, onUpdate }: {
        lerp?: number;
        duration?: number;
        easing?: (t: any) => any;
        onUpdate: any;
    }): void;
    from: any;
    to: any;
    lerp: number;
    duration: number;
    easing: (t: any) => any;
    currentTime: number;
    onUpdate: any;
}
