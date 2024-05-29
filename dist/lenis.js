(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    Object.defineProperty(exports, "__esModule", { value: true });
    const package_json_1 = require("../../../package.json");
    const animate_1 = require("./animate");
    const dimensions_1 = require("./dimensions");
    const emitter_1 = require("./emitter");
    const maths_1 = require("./maths");
    const virtual_scroll_1 = require("./virtual-scroll");
    function isHTMLElement(element) {
        return !!element && element !== window;
    }
    class Lenis {
        __isSmooth = false;
        __isScrolling = false;
        __isStopped = false;
        __isLocked = false;
        __preventNextScrollEvent = false;
        options;
        animate;
        emitter;
        dimensions;
        velocity;
        direction;
        targetScroll;
        animatedScroll;
        virtualScroll;
        time;
        constructor({ wrapper = window, content = document.documentElement, wheelEventsTarget = wrapper, eventsTarget = wheelEventsTarget, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaMultiplier = 35, duration, easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp = +!duration && 0.1, infinite = false, orientation = 'vertical', gestureOrientation = 'vertical', touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, __experimental__naiveDimensions = false, } = {}) {
            window.lenisVersion = package_json_1.version;
            if (!wrapper ||
                wrapper === document.documentElement ||
                wrapper === document.body) {
                wrapper = window;
            }
            this.options = {
                wrapper,
                content,
                wheelEventsTarget,
                eventsTarget,
                smoothWheel,
                syncTouch,
                syncTouchLerp,
                touchInertiaMultiplier,
                duration,
                easing,
                lerp,
                infinite,
                gestureOrientation,
                orientation,
                touchMultiplier,
                wheelMultiplier,
                autoResize,
                __experimental__naiveDimensions,
            };
            this.animate = new animate_1.Animate();
            this.emitter = new emitter_1.Emitter();
            this.dimensions = new dimensions_1.Dimensions({ wrapper, content, autoResize });
            this.toggleClassName('lenis', true);
            this.velocity = 0;
            this.isLocked = false;
            this.isStopped = false;
            this.isSmooth = syncTouch || smoothWheel;
            this.isScrolling = false;
            this.targetScroll = this.animatedScroll = this.actualScroll;
            this.direction = 0;
            this.time = 0;
            this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
            this.virtualScroll = new virtual_scroll_1.VirtualScroll(eventsTarget, {
                touchMultiplier,
                wheelMultiplier,
            });
            this.virtualScroll.on('scroll', this.onVirtualScroll);
        }
        destroy() {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, false);
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.toggleClassName('lenis', false);
            this.toggleClassName('lenis-smooth', false);
            this.toggleClassName('lenis-scrolling', false);
            this.toggleClassName('lenis-stopped', false);
            this.toggleClassName('lenis-locked', false);
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        off(event, callback) {
            return this.emitter.off(event, callback);
        }
        setScroll(scroll) {
            if (!isHTMLElement(this.rootElement))
                return;
            if (this.isHorizontal) {
                this.rootElement.scrollLeft = scroll;
            }
            else {
                this.rootElement.scrollTop = scroll;
            }
        }
        onVirtualScroll = ({ deltaX, deltaY, event, }) => {
            if (event.ctrlKey)
                return;
            const isTouch = event.type.includes('touch');
            const isWheel = event.type.includes('wheel');
            const isTapToStop = this.options.syncTouch &&
                isTouch &&
                event.type === 'touchstart' &&
                !this.isStopped &&
                !this.isLocked;
            if (isTapToStop) {
                this.reset();
                return;
            }
            const isClick = deltaX === 0 && deltaY === 0;
            const isUnknownGesture = (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
                (this.options.gestureOrientation === 'horizontal' && deltaX === 0);
            if (isClick || isUnknownGesture) {
                return;
            }
            let composedPath = event.composedPath();
            composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
            if (!!composedPath.find((node) => node instanceof Element &&
                (node.hasAttribute?.('data-lenis-prevent') ||
                    (isTouch && node.hasAttribute?.('data-lenis-prevent-touch')) ||
                    (isWheel && node.hasAttribute?.('data-lenis-prevent-wheel')) ||
                    (node.classList?.contains('lenis') &&
                        !node.classList?.contains('lenis-stopped')))))
                return;
            if (this.isStopped || this.isLocked) {
                event.preventDefault();
                return;
            }
            this.isSmooth = Boolean((this.options.syncTouch && isTouch) ||
                (this.options.smoothWheel && isWheel));
            if (!this.isSmooth) {
                this.isScrolling = false;
                this.animate.stop();
                return;
            }
            event.preventDefault();
            let delta = deltaY;
            if (this.options.gestureOrientation === 'both') {
                delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
            }
            else if (this.options.gestureOrientation === 'horizontal') {
                delta = deltaX;
            }
            const syncTouch = isTouch && this.options.syncTouch;
            const isTouchEnd = isTouch && event.type === 'touchend';
            const hasTouchInertia = isTouchEnd && Math.abs(delta) > 5;
            if (hasTouchInertia) {
                delta = this.velocity * (this.options.touchInertiaMultiplier ?? 1);
            }
            this.scrollTo(this.targetScroll + delta, {
                programmatic: false,
                ...(syncTouch
                    ? {
                        lerp: hasTouchInertia ? this.options.syncTouchLerp : 1,
                    }
                    : {
                        lerp: this.options.lerp,
                        duration: this.options.duration,
                        easing: this.options.easing,
                    }),
            });
        };
        resize() {
            this.dimensions.resize();
        }
        emit() {
            this.emitter.emit('scroll', this);
        }
        onNativeScroll = () => {
            if (this.__preventNextScrollEvent)
                return;
            if (!this.isScrolling) {
                const lastScroll = this.animatedScroll;
                this.animatedScroll = this.targetScroll = this.actualScroll;
                this.velocity = 0;
                this.direction = Math.sign(this.animatedScroll - lastScroll);
                this.emit();
            }
        };
        reset() {
            this.isLocked = false;
            this.isScrolling = false;
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.velocity = 0;
            this.animate.stop();
        }
        start() {
            if (!this.isStopped)
                return;
            this.isStopped = false;
            this.reset();
        }
        stop() {
            if (this.isStopped)
                return;
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        }
        raf(time) {
            const deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * 0.001);
        }
        scrollTo(target, { offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp = +!duration && this.options.lerp, onComplete, force = false, programmatic = true, } = {}) {
            if ((this.isStopped || this.isLocked) && !force)
                return;
            if (typeof target === 'string' &&
                ['top', 'left', 'start'].includes(target)) {
                target = 0;
            }
            else if (typeof target === 'string' &&
                ['bottom', 'right', 'end'].includes(target)) {
                target = this.limit;
            }
            else {
                let node;
                if (typeof target === 'string') {
                    node = document.querySelector(target);
                }
                else if (target instanceof HTMLElement && target?.nodeType) {
                    node = target;
                }
                if (node) {
                    if (this.options.wrapper !== window &&
                        !(this.options.wrapper instanceof Window)) {
                        const wrapperRect = this.options.wrapper.getBoundingClientRect();
                        offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
                    }
                    const rect = node.getBoundingClientRect();
                    target =
                        (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
                }
            }
            if (typeof target !== 'number')
                return;
            target += offset;
            target = Math.round(target);
            if (this.options.infinite) {
                if (programmatic) {
                    this.targetScroll = this.animatedScroll = this.scroll;
                }
            }
            else {
                target = (0, maths_1.clamp)(0, target, this.limit);
            }
            if (immediate) {
                this.animatedScroll = this.targetScroll = target;
                this.setScroll(this.scroll);
                this.reset();
                onComplete?.(this);
                return;
            }
            if (!programmatic) {
                if (target === this.targetScroll)
                    return;
                this.targetScroll = target;
            }
            this.animate.fromTo(this.animatedScroll, target, {
                duration,
                easing,
                lerp,
                onStart: () => {
                    if (lock)
                        this.isLocked = true;
                    this.isScrolling = true;
                },
                onUpdate: (value, completed) => {
                    this.isScrolling = true;
                    this.velocity = value - this.animatedScroll;
                    this.direction = Math.sign(this.velocity);
                    this.animatedScroll = value;
                    this.setScroll(this.scroll);
                    if (programmatic) {
                        this.targetScroll = value;
                    }
                    if (!completed)
                        this.emit();
                    if (completed) {
                        this.reset();
                        this.emit();
                        onComplete?.(this);
                        this.__preventNextScrollEvent = true;
                        requestAnimationFrame(() => {
                            this.__preventNextScrollEvent = false;
                        });
                    }
                },
            });
        }
        get rootElement() {
            return (this.options.wrapper === window
                ? document.documentElement
                : this.options.wrapper || document.documentElement);
        }
        get limit() {
            if (this.options.__experimental__naiveDimensions) {
                if (this.isHorizontal) {
                    return this.rootElement.scrollWidth - this.rootElement.clientWidth;
                }
                else {
                    return this.rootElement.scrollHeight - this.rootElement.clientHeight;
                }
            }
            else {
                return this.dimensions.limit[this.isHorizontal ? 'x' : 'y'];
            }
        }
        get isHorizontal() {
            return this.options.orientation === 'horizontal';
        }
        get actualScroll() {
            return this.isHorizontal
                ? this.rootElement.scrollLeft
                : this.rootElement.scrollTop;
        }
        get scroll() {
            return this.options.infinite
                ? (0, maths_1.modulo)(this.animatedScroll, this.limit)
                : this.animatedScroll;
        }
        get progress() {
            return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        get isSmooth() {
            return this.__isSmooth;
        }
        set isSmooth(value) {
            if (this.__isSmooth !== value) {
                this.__isSmooth = value;
                this.toggleClassName('lenis-smooth', value);
            }
        }
        get isScrolling() {
            return this.__isScrolling;
        }
        set isScrolling(value) {
            if (this.__isScrolling !== value) {
                this.__isScrolling = value;
                this.toggleClassName('lenis-scrolling', value);
            }
        }
        get isStopped() {
            return this.__isStopped;
        }
        set isStopped(value) {
            if (this.__isStopped !== value) {
                this.__isStopped = value;
                this.toggleClassName('lenis-stopped', value);
            }
        }
        get isLocked() {
            return this.__isLocked;
        }
        set isLocked(value) {
            if (this.__isLocked !== value) {
                this.__isLocked = value;
                this.toggleClassName('lenis-locked', value);
            }
        }
        get className() {
            let className = 'lenis';
            if (this.isStopped)
                className += ' lenis-stopped';
            if (this.isLocked)
                className += ' lenis-locked';
            if (this.isScrolling)
                className += ' lenis-scrolling';
            if (this.isSmooth)
                className += ' lenis-smooth';
            return className;
        }
        toggleClassName(name, value) {
            this.rootElement.classList.toggle(name, value);
            this.emitter.emit('className change', this);
        }
    }
    exports.default = Lenis;

}));
//# sourceMappingURL=lenis.js.map
