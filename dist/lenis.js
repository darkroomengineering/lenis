(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Lenis = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var version = "1.1.10";

    /**
     * Clamp a value between a minimum and maximum value
     *
     * @param min Minimum value
     * @param input Value to clamp
     * @param max Maximum value
     * @returns Clamped value
     */
    function clamp(min, input, max) {
        return Math.max(min, Math.min(input, max));
    }
    /**
     *  Linearly interpolate between two values using an amount (0 <= t <= 1)
     *
     * @param x First value
     * @param y Second value
     * @param t Amount to interpolate (0 <= t <= 1)
     * @returns Interpolated value
     */
    function lerp(x, y, t) {
        return (1 - t) * x + t * y;
    }
    /**
     * Damp a value over time using a damping factor
     * {@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}
     *
     * @param x Initial value
     * @param y Target value
     * @param lambda Damping factor
     * @param dt Time elapsed since the last update
     * @returns Damped value
     */
    function damp(x, y, lambda, deltaTime) {
        return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
    }
    /**
     * Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
     * {@link https://anguscroll.com/just/just-modulo}
     *
     * @param n Dividend
     * @param d Divisor
     * @returns Modulo
     */
    function modulo(n, d) {
        return ((n % d) + d) % d;
    }

    /**
     * Animate class to handle value animations with lerping or easing
     *
     * @example
     * const animate = new Animate()
     * animate.fromTo(0, 100, { duration: 1, easing: (t) => t })
     * animate.advance(0.5) // 50
     */
    class Animate {
        constructor() {
            this.isRunning = false;
            this.value = 0;
            this.from = 0;
            this.to = 0;
            this.currentTime = 0;
        }
        /**
         * Advance the animation by the given delta time
         *
         * @param deltaTime - The time in seconds to advance the animation
         */
        advance(deltaTime) {
            var _a;
            if (!this.isRunning)
                return;
            let completed = false;
            if (this.duration && this.easing) {
                this.currentTime += deltaTime;
                const linearProgress = clamp(0, this.currentTime / this.duration, 1);
                completed = linearProgress >= 1;
                const easedProgress = completed ? 1 : this.easing(linearProgress);
                this.value = this.from + (this.to - this.from) * easedProgress;
            }
            else if (this.lerp) {
                this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
                if (Math.round(this.value) === this.to) {
                    this.value = this.to;
                    completed = true;
                }
            }
            else {
                // If no easing or lerp, just jump to the end value
                this.value = this.to;
                completed = true;
            }
            if (completed) {
                this.stop();
            }
            // Call the onUpdate callback with the current value and completed status
            (_a = this.onUpdate) === null || _a === void 0 ? void 0 : _a.call(this, this.value, completed);
        }
        /** Stop the animation */
        stop() {
            this.isRunning = false;
        }
        /**
         * Set up the animation from a starting value to an ending value
         * with optional parameters for lerping, duration, easing, and onUpdate callback
         *
         * @param from - The starting value
         * @param to - The ending value
         * @param options - Options for the animation
         */
        fromTo(from, to, { lerp = 0.1, duration = 1, easing = (t) => t, onStart, onUpdate, }) {
            this.from = this.value = from;
            this.to = to;
            this.lerp = lerp;
            this.duration = duration;
            this.easing = easing;
            this.currentTime = 0;
            this.isRunning = true;
            onStart === null || onStart === void 0 ? void 0 : onStart();
            this.onUpdate = onUpdate;
        }
    }

    function debounce(callback, delay) {
        let timer;
        return function (...args) {
            let context = this;
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = undefined;
                callback.apply(context, args);
            }, delay);
        };
    }

    /**
     * Dimensions class to handle the size of the content and wrapper
     *
     * @example
     * const dimensions = new Dimensions(wrapper, content)
     * dimensions.on('resize', (e) => {
     *   console.log(e.width, e.height)
     * })
     */
    class Dimensions {
        constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
            this.wrapper = wrapper;
            this.content = content;
            this.width = 0;
            this.height = 0;
            this.scrollHeight = 0;
            this.scrollWidth = 0;
            this.resize = () => {
                this.onWrapperResize();
                this.onContentResize();
            };
            this.onWrapperResize = () => {
                if (this.wrapper instanceof Window) {
                    this.width = window.innerWidth;
                    this.height = window.innerHeight;
                }
                else {
                    this.width = this.wrapper.clientWidth;
                    this.height = this.wrapper.clientHeight;
                }
            };
            this.onContentResize = () => {
                if (this.wrapper instanceof Window) {
                    this.scrollHeight = this.content.scrollHeight;
                    this.scrollWidth = this.content.scrollWidth;
                }
                else {
                    this.scrollHeight = this.wrapper.scrollHeight;
                    this.scrollWidth = this.wrapper.scrollWidth;
                }
            };
            if (autoResize) {
                this.debouncedResize = debounce(this.resize, debounceValue);
                if (this.wrapper instanceof Window) {
                    window.addEventListener('resize', this.debouncedResize, false);
                }
                else {
                    this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
                    this.wrapperResizeObserver.observe(this.wrapper);
                }
                this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
                this.contentResizeObserver.observe(this.content);
            }
            this.resize();
        }
        destroy() {
            var _a, _b;
            (_a = this.wrapperResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
            (_b = this.contentResizeObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
            if (this.wrapper === window && this.debouncedResize) {
                window.removeEventListener('resize', this.debouncedResize, false);
            }
        }
        get limit() {
            return {
                x: this.scrollWidth - this.width,
                y: this.scrollHeight - this.height,
            };
        }
    }

    /**
     * Emitter class to handle events
     * @example
     * const emitter = new Emitter()
     * emitter.on('event', (data) => {
     *   console.log(data)
     * })
     * emitter.emit('event', 'data')
     */
    class Emitter {
        constructor() {
            this.events = {};
        }
        /**
         * Emit an event with the given data
         * @param event Event name
         * @param args Data to pass to the event handlers
         */
        emit(event, ...args) {
            var _a;
            let callbacks = this.events[event] || [];
            for (let i = 0, length = callbacks.length; i < length; i++) {
                (_a = callbacks[i]) === null || _a === void 0 ? void 0 : _a.call(callbacks, ...args);
            }
        }
        /**
         * Add a callback to the event
         * @param event Event name
         * @param cb Callback function
         * @returns Unsubscribe function
         */
        on(event, cb) {
            var _a;
            // Add the callback to the event's callback list, or create a new list with the callback
            ((_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.push(cb)) || (this.events[event] = [cb]);
            // Return an unsubscribe function
            return () => {
                var _a;
                this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => cb !== i);
            };
        }
        /**
         * Remove a callback from the event
         * @param event Event name
         * @param callback Callback function
         */
        off(event, callback) {
            var _a;
            this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => callback !== i);
        }
        /**
         * Remove all event listeners and clean up
         */
        destroy() {
            this.events = {};
        }
    }

    const LINE_HEIGHT = 100 / 6;
    const listenerOptions = { passive: false };
    class VirtualScroll {
        constructor(element, options = { wheelMultiplier: 1, touchMultiplier: 1 }) {
            this.element = element;
            this.options = options;
            this.touchStart = {
                x: 0,
                y: 0,
            };
            this.lastDelta = {
                x: 0,
                y: 0,
            };
            this.window = {
                width: 0,
                height: 0,
            };
            this.emitter = new Emitter();
            /**
             * Event handler for 'touchstart' event
             *
             * @param event Touch event
             */
            this.onTouchStart = (event) => {
                // @ts-expect-error - event.targetTouches is not defined
                const { clientX, clientY } = event.targetTouches
                    ? event.targetTouches[0]
                    : event;
                this.touchStart.x = clientX;
                this.touchStart.y = clientY;
                this.lastDelta = {
                    x: 0,
                    y: 0,
                };
                this.emitter.emit('scroll', {
                    deltaX: 0,
                    deltaY: 0,
                    event,
                });
            };
            /** Event handler for 'touchmove' event */
            this.onTouchMove = (event) => {
                // @ts-expect-error - event.targetTouches is not defined
                const { clientX, clientY } = event.targetTouches
                    ? event.targetTouches[0]
                    : event;
                const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
                const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
                this.touchStart.x = clientX;
                this.touchStart.y = clientY;
                this.lastDelta = {
                    x: deltaX,
                    y: deltaY,
                };
                this.emitter.emit('scroll', {
                    deltaX,
                    deltaY,
                    event,
                });
            };
            this.onTouchEnd = (event) => {
                this.emitter.emit('scroll', {
                    deltaX: this.lastDelta.x,
                    deltaY: this.lastDelta.y,
                    event,
                });
            };
            /** Event handler for 'wheel' event */
            this.onWheel = (event) => {
                let { deltaX, deltaY, deltaMode } = event;
                const multiplierX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1;
                const multiplierY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1;
                deltaX *= multiplierX;
                deltaY *= multiplierY;
                deltaX *= this.options.wheelMultiplier;
                deltaY *= this.options.wheelMultiplier;
                this.emitter.emit('scroll', { deltaX, deltaY, event });
            };
            this.onWindowResize = () => {
                this.window = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            };
            window.addEventListener('resize', this.onWindowResize, false);
            this.onWindowResize();
            this.element.addEventListener('wheel', this.onWheel, listenerOptions);
            this.element.addEventListener('touchstart', this.onTouchStart, listenerOptions);
            this.element.addEventListener('touchmove', this.onTouchMove, listenerOptions);
            this.element.addEventListener('touchend', this.onTouchEnd, listenerOptions);
        }
        /**
         * Add an event listener for the given event and callback
         *
         * @param event Event name
         * @param callback Callback function
         */
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        /** Remove all event listeners and clean up */
        destroy() {
            this.emitter.destroy();
            window.removeEventListener('resize', this.onWindowResize, false);
            this.element.removeEventListener('wheel', this.onWheel, listenerOptions);
            this.element.removeEventListener('touchstart', this.onTouchStart, listenerOptions);
            this.element.removeEventListener('touchmove', this.onTouchMove, listenerOptions);
            this.element.removeEventListener('touchend', this.onTouchEnd, listenerOptions);
        }
    }

    var _Lenis_isScrolling, _Lenis_isStopped, _Lenis_isLocked, _Lenis_preventNextNativeScrollEvent, _Lenis_resetVelocityTimeout;
    class Lenis {
        constructor({ wrapper = window, content = document.documentElement, eventsTarget = wrapper, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaMultiplier = 35, duration, // in seconds
        easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp = 0.1, infinite = false, orientation = 'vertical', // vertical, horizontal
        gestureOrientation = 'vertical', // vertical, horizontal, both
        touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, __experimental__naiveDimensions = false, } = {}) {
            _Lenis_isScrolling.set(this, false); // true when scroll is animating
            _Lenis_isStopped.set(this, false); // true if user should not be able to scroll - enable/disable programmatically
            _Lenis_isLocked.set(this, false); // same as isStopped but enabled/disabled when scroll reaches target
            _Lenis_preventNextNativeScrollEvent.set(this, false);
            _Lenis_resetVelocityTimeout.set(this, null
            /**
             * Whether or not the user is touching the screen
             */
            );
            /**
             * The time in ms since the lenis instance was created
             */
            this.time = 0;
            /**
             * User data that will be forwarded through the scroll event
             *
             * @example
             * lenis.scrollTo(100, {
             *   userData: {
             *     foo: 'bar'
             *   }
             * })
             */
            this.userData = {};
            /**
             * The last velocity of the scroll
             */
            this.lastVelocity = 0;
            /**
             * The current velocity of the scroll
             */
            this.velocity = 0;
            /**
             * The direction of the scroll
             */
            this.direction = 0;
            // These are instanciated here as they don't need information from the options
            this.animate = new Animate();
            this.emitter = new Emitter();
            this.onPointerDown = (event) => {
                if (event.button === 1) {
                    this.reset();
                }
            };
            this.onVirtualScroll = (data) => {
                if (typeof this.options.virtualScroll === 'function' &&
                    this.options.virtualScroll(data) === false)
                    return;
                const { deltaX, deltaY, event } = data;
                this.emitter.emit('virtual-scroll', { deltaX, deltaY, event });
                // keep zoom feature
                if (event.ctrlKey)
                    return;
                const isTouch = event.type.includes('touch');
                const isWheel = event.type.includes('wheel');
                this.isTouching = event.type === 'touchstart' || event.type === 'touchmove';
                // if (event.type === 'touchend') {
                //   console.log('touchend', this.scroll)
                //   // this.lastVelocity = this.velocity
                //   // this.velocity = 0
                //   // this.isScrolling = false
                //   this.emit({ type: 'touchend' })
                //   // alert('touchend')
                //   return
                // }
                const isTapToStop = this.options.syncTouch &&
                    isTouch &&
                    event.type === 'touchstart' &&
                    !this.isStopped &&
                    !this.isLocked;
                if (isTapToStop) {
                    this.reset();
                    return;
                }
                const isClick = deltaX === 0 && deltaY === 0; // click event
                // const isPullToRefresh =
                //   this.options.gestureOrientation === 'vertical' &&
                //   this.scroll === 0 &&
                //   !this.options.infinite &&
                //   deltaY <= 5 // touch pull to refresh, not reliable yet
                const isUnknownGesture = (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
                    (this.options.gestureOrientation === 'horizontal' && deltaX === 0);
                if (isClick || isUnknownGesture) {
                    // console.log('prevent')
                    return;
                }
                // catch if scrolling on nested scroll elements
                let composedPath = event.composedPath();
                composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement)); // remove parents elements
                const prevent = this.options.prevent;
                if (!!composedPath.find((node) => {
                    var _a, _b, _c, _d, _e;
                    return node instanceof HTMLElement &&
                        ((typeof prevent === 'function' && (prevent === null || prevent === void 0 ? void 0 : prevent(node))) ||
                            ((_a = node.hasAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'data-lenis-prevent')) ||
                            (isTouch && ((_b = node.hasAttribute) === null || _b === void 0 ? void 0 : _b.call(node, 'data-lenis-prevent-touch'))) ||
                            (isWheel && ((_c = node.hasAttribute) === null || _c === void 0 ? void 0 : _c.call(node, 'data-lenis-prevent-wheel'))) ||
                            (((_d = node.classList) === null || _d === void 0 ? void 0 : _d.contains('lenis')) &&
                                !((_e = node.classList) === null || _e === void 0 ? void 0 : _e.contains('lenis-stopped'))));
                } // nested lenis instance
                ))
                    return;
                if (this.isStopped || this.isLocked) {
                    event.preventDefault(); // this will stop forwarding the event to the parent, this is problematic
                    return;
                }
                const isSmooth = (this.options.syncTouch && isTouch) ||
                    (this.options.smoothWheel && isWheel);
                if (!isSmooth) {
                    this.isScrolling = 'native';
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
                    delta = this.velocity * this.options.touchInertiaMultiplier;
                }
                this.scrollTo(this.targetScroll + delta, Object.assign({ programmatic: false }, (syncTouch
                    ? {
                        lerp: hasTouchInertia ? this.options.syncTouchLerp : 1,
                    }
                    : {
                        lerp: this.options.lerp,
                        duration: this.options.duration,
                        easing: this.options.easing,
                    })));
            };
            this.onNativeScroll = () => {
                if (__classPrivateFieldGet(this, _Lenis_resetVelocityTimeout, "f") !== null) {
                    clearTimeout(__classPrivateFieldGet(this, _Lenis_resetVelocityTimeout, "f"));
                    __classPrivateFieldSet(this, _Lenis_resetVelocityTimeout, null, "f");
                }
                if (__classPrivateFieldGet(this, _Lenis_preventNextNativeScrollEvent, "f")) {
                    __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, false, "f");
                    return;
                }
                if (this.isScrolling === false || this.isScrolling === 'native') {
                    const lastScroll = this.animatedScroll;
                    this.animatedScroll = this.targetScroll = this.actualScroll;
                    this.lastVelocity = this.velocity;
                    this.velocity = this.animatedScroll - lastScroll;
                    this.direction = Math.sign(this.animatedScroll - lastScroll);
                    this.isScrolling = 'native';
                    this.emit();
                    if (this.velocity !== 0) {
                        __classPrivateFieldSet(this, _Lenis_resetVelocityTimeout, setTimeout(() => {
                            this.lastVelocity = this.velocity;
                            this.velocity = 0;
                            this.isScrolling = false;
                            this.emit();
                        }, 400), "f");
                    }
                }
            };
            // Set version
            window.lenisVersion = version;
            // Check if wrapper is html or body, fallback to window
            if (!wrapper ||
                wrapper === document.documentElement ||
                wrapper === document.body) {
                wrapper = window;
            }
            // Setup options
            this.options = {
                wrapper,
                content,
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
                prevent,
                virtualScroll,
                __experimental__naiveDimensions,
            };
            // Setup dimensions instance
            this.dimensions = new Dimensions(wrapper, content, { autoResize });
            // Setup class name
            this.updateClassName();
            // Set the initial scroll value for all scroll information
            this.targetScroll = this.animatedScroll = this.actualScroll;
            // Add event listeners
            this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
            this.options.wrapper.addEventListener('pointerdown', this.onPointerDown, false);
            // Setup virtual scroll instance
            this.virtualScroll = new VirtualScroll(eventsTarget, {
                touchMultiplier,
                wheelMultiplier,
            });
            this.virtualScroll.on('scroll', this.onVirtualScroll);
        }
        /**
         * Destroy the lenis instance, remove all event listeners and clean up the class name
         */
        destroy() {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, false);
            this.options.wrapper.removeEventListener('pointerdown', this.onPointerDown, false);
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.cleanUpClassName();
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        off(event, callback) {
            return this.emitter.off(event, callback);
        }
        setScroll(scroll) {
            // apply scroll value immediately
            if (this.isHorizontal) {
                this.rootElement.scrollLeft = scroll;
            }
            else {
                this.rootElement.scrollTop = scroll;
            }
        }
        /**
         * Force lenis to recalculate the dimensions
         */
        resize() {
            this.dimensions.resize();
        }
        emit() {
            this.emitter.emit('scroll', this);
        }
        reset() {
            this.isLocked = false;
            this.isScrolling = false;
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.lastVelocity = this.velocity = 0;
            this.animate.stop();
        }
        /**
         * Start lenis scroll after it has been stopped
         */
        start() {
            if (!this.isStopped)
                return;
            this.isStopped = false;
            this.reset();
        }
        /**
         * Stop lenis scroll
         */
        stop() {
            if (this.isStopped)
                return;
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        }
        /**
         * RequestAnimationFrame for lenis
         *
         * @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
         */
        raf(time) {
            const deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * 0.001);
        }
        /**
         * Scroll to a target value
         *
         * @param target The target value to scroll to
         * @param options The options for the scroll
         *
         * @example
         * lenis.scrollTo(100, {
         *   offset: 100,
         *   duration: 1,
         *   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
         *   lerp: 0.1,
         *   onStart: () => {
         *     console.log('onStart')
         *   },
         *   onComplete: () => {
         *     console.log('onComplete')
         *   },
         * })
         */
        scrollTo(target, { offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp = this.options.lerp, onStart, onComplete, force = false, // scroll even if stopped
        programmatic = true, // called from outside of the class
        userData, } = {}) {
            if ((this.isStopped || this.isLocked) && !force)
                return;
            // keywords
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
                    // CSS selector
                    node = document.querySelector(target);
                }
                else if (target instanceof HTMLElement && (target === null || target === void 0 ? void 0 : target.nodeType)) {
                    // Node element
                    node = target;
                }
                if (node) {
                    if (this.options.wrapper !== window) {
                        // nested scroll offset correction
                        const wrapperRect = this.rootElement.getBoundingClientRect();
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
                target = clamp(0, target, this.limit);
            }
            if (target === this.targetScroll)
                return;
            this.userData = userData !== null && userData !== void 0 ? userData : {};
            if (immediate) {
                this.animatedScroll = this.targetScroll = target;
                this.setScroll(this.scroll);
                this.reset();
                this.preventNextNativeScrollEvent();
                this.emit();
                onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
                this.userData = {};
                return;
            }
            if (!programmatic) {
                this.targetScroll = target;
            }
            this.animate.fromTo(this.animatedScroll, target, {
                duration,
                easing,
                lerp,
                onStart: () => {
                    // started
                    if (lock)
                        this.isLocked = true;
                    this.isScrolling = 'smooth';
                    onStart === null || onStart === void 0 ? void 0 : onStart(this);
                },
                onUpdate: (value, completed) => {
                    this.isScrolling = 'smooth';
                    // updated
                    this.lastVelocity = this.velocity;
                    this.velocity = value - this.animatedScroll;
                    this.direction = Math.sign(this.velocity);
                    this.animatedScroll = value;
                    this.setScroll(this.scroll);
                    if (programmatic) {
                        // wheel during programmatic should stop it
                        this.targetScroll = value;
                    }
                    if (!completed)
                        this.emit();
                    if (completed) {
                        this.reset();
                        this.emit();
                        onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
                        this.userData = {};
                        // avoid emitting event twice
                        this.preventNextNativeScrollEvent();
                    }
                },
            });
        }
        preventNextNativeScrollEvent() {
            __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, true, "f");
            requestAnimationFrame(() => {
                __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, false, "f");
            });
        }
        /**
         * The root element on which lenis is instanced
         */
        get rootElement() {
            return (this.options.wrapper === window
                ? document.documentElement
                : this.options.wrapper);
        }
        /**
         * The limit which is the maximum scroll value
         */
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
        /**
         * Whether or not the scroll is horizontal
         */
        get isHorizontal() {
            return this.options.orientation === 'horizontal';
        }
        /**
         * The actual scroll value
         */
        get actualScroll() {
            // value browser takes into account
            return this.isHorizontal
                ? this.rootElement.scrollLeft
                : this.rootElement.scrollTop;
        }
        /**
         * The current scroll value
         */
        get scroll() {
            return this.options.infinite
                ? modulo(this.animatedScroll, this.limit)
                : this.animatedScroll;
        }
        /**
         * The progress of the scroll relative to the limit
         */
        get progress() {
            // avoid progress to be NaN
            return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        /**
         * Current scroll state
         */
        get isScrolling() {
            return __classPrivateFieldGet(this, _Lenis_isScrolling, "f");
        }
        set isScrolling(value) {
            if (__classPrivateFieldGet(this, _Lenis_isScrolling, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isScrolling, value, "f");
                this.updateClassName();
            }
        }
        /**
         * Check if lenis is stopped
         */
        get isStopped() {
            return __classPrivateFieldGet(this, _Lenis_isStopped, "f");
        }
        set isStopped(value) {
            if (__classPrivateFieldGet(this, _Lenis_isStopped, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isStopped, value, "f");
                this.updateClassName();
            }
        }
        /**
         * Check if lenis is locked
         */
        get isLocked() {
            return __classPrivateFieldGet(this, _Lenis_isLocked, "f");
        }
        set isLocked(value) {
            if (__classPrivateFieldGet(this, _Lenis_isLocked, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isLocked, value, "f");
                this.updateClassName();
            }
        }
        /**
         * Check if lenis is smooth scrolling
         */
        get isSmooth() {
            return this.isScrolling === 'smooth';
        }
        /**
         * The class name applied to the wrapper element
         */
        get className() {
            let className = 'lenis';
            if (this.isStopped)
                className += ' lenis-stopped';
            if (this.isLocked)
                className += ' lenis-locked';
            if (this.isScrolling)
                className += ' lenis-scrolling';
            if (this.isScrolling === 'smooth')
                className += ' lenis-smooth';
            return className;
        }
        updateClassName() {
            this.cleanUpClassName();
            this.rootElement.className =
                `${this.rootElement.className} ${this.className}`.trim();
        }
        cleanUpClassName() {
            this.rootElement.className = this.rootElement.className
                .replace(/lenis(-\w+)?/g, '')
                .trim();
        }
    }
    _Lenis_isScrolling = new WeakMap(), _Lenis_isStopped = new WeakMap(), _Lenis_isLocked = new WeakMap(), _Lenis_preventNextNativeScrollEvent = new WeakMap(), _Lenis_resetVelocityTimeout = new WeakMap();

    return Lenis;

}));
//# sourceMappingURL=lenis.js.map
