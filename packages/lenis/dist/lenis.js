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

    var version = "1.0.36-dev.0";

    // Clamp a value between a minimum and maximum value
    function clamp(min, input, max) {
      return Math.max(min, Math.min(input, max))
    }

    // Linearly interpolate between two values using an amount (0 <= t <= 1)
    function lerp(x, y, t) {
      return (1 - t) * x + t * y
    }

    // http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
    function damp(x, y, lambda, dt) {
      return lerp(x, y, 1 - Math.exp(-lambda * dt))
    }

    // Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
    // https://anguscroll.com/just/just-modulo
    function modulo(n, d) {
      return ((n % d) + d) % d
    }

    // Animate class to handle value animations with lerping or easing
    class Animate {
      // Advance the animation by the given delta time
      advance(deltaTime) {
        if (!this.isRunning) return

        let completed = false;

        if (this.lerp) {
          this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
          if (Math.round(this.value) === this.to) {
            this.value = this.to;
            completed = true;
          }
        } else {
          this.currentTime += deltaTime;
          const linearProgress = clamp(0, this.currentTime / this.duration, 1);

          completed = linearProgress >= 1;
          const easedProgress = completed ? 1 : this.easing(linearProgress);
          this.value = this.from + (this.to - this.from) * easedProgress;
        }

        // Call the onUpdate callback with the current value and completed status
        this.onUpdate?.(this.value, completed);

        if (completed) {
          this.stop();
        }
      }

      // Stop the animation
      stop() {
        this.isRunning = false;
      }

      // Set up the animation from a starting value to an ending value
      // with optional parameters for lerping, duration, easing, and onUpdate callback
      fromTo(
        from,
        to,
        { lerp = 0.1, duration = 1, easing = (t) => t, onStart, onUpdate }
      ) {
        this.from = this.value = from;
        this.to = to;
        this.lerp = lerp;
        this.duration = duration;
        this.easing = easing;
        this.currentTime = 0;
        this.isRunning = true;

        onStart?.();
        this.onUpdate = onUpdate;
      }
    }

    function debounce(callback, delay) {
      let timer;
      return function () {
        let args = arguments;
        let context = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
          callback.apply(context, args);
        }, delay);
      }
    }

    class Dimensions {
      constructor({ wrapper, content, autoResize = true } = {}) {
        this.wrapper = wrapper;
        this.content = content;

        if (autoResize) {
          const resize = debounce(this.resize, 250);

          if (this.wrapper !== window) {
            this.wrapperResizeObserver = new ResizeObserver(resize);
            this.wrapperResizeObserver.observe(this.wrapper);
          }

          this.contentResizeObserver = new ResizeObserver(resize);
          this.contentResizeObserver.observe(this.content);
        }

        this.resize();
      }

      destroy() {
        this.wrapperResizeObserver?.disconnect();
        this.contentResizeObserver?.disconnect();
      }

      resize = () => {
        this.onWrapperResize();
        this.onContentResize();
      }

      onWrapperResize = () => {
        if (this.wrapper === window) {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
        } else {
          this.width = this.wrapper.clientWidth;
          this.height = this.wrapper.clientHeight;
        }
      }

      onContentResize = () => {
        this.scrollHeight = this.content.scrollHeight;
        this.scrollWidth = this.content.scrollWidth;
      }

      get limit() {
        return {
          x: this.scrollWidth - this.width,
          y: this.scrollHeight - this.height,
        }
      }
    }

    class Emitter {
      constructor() {
        this.events = {};
      }

      emit(event, ...args) {
        let callbacks = this.events[event] || [];
        for (let i = 0, length = callbacks.length; i < length; i++) {
          callbacks[i](...args);
        }
      }

      on(event, cb) {
        // Add the callback to the event's callback list, or create a new list with the callback
        this.events[event]?.push(cb) || (this.events[event] = [cb]);

        // Return an unsubscribe function
        return () => {
          this.events[event] = this.events[event]?.filter((i) => cb !== i);
        }
      }

      off(event, callback) {
        this.events[event] = this.events[event]?.filter((i) => callback !== i);
      }

      destroy() {
        this.events = {};
      }
    }

    class VirtualScroll {
      constructor(
        element,
        { wheelMultiplier = 1, touchMultiplier = 2, normalizeWheel = false }
      ) {
        this.element = element;
        this.wheelMultiplier = wheelMultiplier;
        this.touchMultiplier = touchMultiplier;
        this.normalizeWheel = normalizeWheel;

        this.touchStart = {
          x: null,
          y: null,
        };

        this.emitter = new Emitter();

        this.element.addEventListener('wheel', this.onWheel, { passive: false });
        this.element.addEventListener('touchstart', this.onTouchStart, {
          passive: false,
        });
        this.element.addEventListener('touchmove', this.onTouchMove, {
          passive: false,
        });
        this.element.addEventListener('touchend', this.onTouchEnd, {
          passive: false,
        });
      }

      // Add an event listener for the given event and callback
      on(event, callback) {
        return this.emitter.on(event, callback)
      }

      // Remove all event listeners and clean up
      destroy() {
        this.emitter.destroy();

        this.element.removeEventListener('wheel', this.onWheel, {
          passive: false,
        });
        this.element.removeEventListener('touchstart', this.onTouchStart, {
          passive: false,
        });
        this.element.removeEventListener('touchmove', this.onTouchMove, {
          passive: false,
        });
        this.element.removeEventListener('touchend', this.onTouchEnd, {
          passive: false,
        });
      }

      // Event handler for 'touchstart' event
      onTouchStart = (event) => {
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
      }

      // Event handler for 'touchmove' event
      onTouchMove = (event) => {
        const { clientX, clientY } = event.targetTouches
          ? event.targetTouches[0]
          : event;

        const deltaX = -(clientX - this.touchStart.x) * this.touchMultiplier;
        const deltaY = -(clientY - this.touchStart.y) * this.touchMultiplier;

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
      }

      onTouchEnd = (event) => {
        this.emitter.emit('scroll', {
          deltaX: this.lastDelta.x,
          deltaY: this.lastDelta.y,
          event,
        });
      }

      // Event handler for 'wheel' event
      onWheel = (event) => {
        let { deltaX, deltaY } = event;

        if (this.normalizeWheel) {
          deltaX = clamp(-100, deltaX, 100);
          deltaY = clamp(-100, deltaY, 100);
        }

        deltaX *= this.wheelMultiplier;
        deltaY *= this.wheelMultiplier;

        this.emitter.emit('scroll', { deltaX, deltaY, event });
      }
    }

    var _Lenis_isSmooth, _Lenis_isScrolling, _Lenis_isStopped, _Lenis_isLocked;
    class Lenis {
        constructor({ wrapper = window, content = document.documentElement, wheelEventsTarget = wrapper, eventsTarget = wheelEventsTarget, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaMultiplier = 35, duration, easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp = !duration && 0.1, infinite = false, orientation = 'vertical', gestureOrientation = 'vertical', touchMultiplier = 1, wheelMultiplier = 1, normalizeWheel = false, autoResize = true, } = {}) {
            _Lenis_isSmooth.set(this, false);
            _Lenis_isScrolling.set(this, false);
            _Lenis_isStopped.set(this, false);
            _Lenis_isLocked.set(this, false);
            this.onVirtualScroll = ({ deltaX, deltaY, event }) => {
                if (event.ctrlKey)
                    return;
                const isTouch = event.type.includes('touch');
                const isWheel = event.type.includes('wheel');
                const isTapToStop = this.options.syncTouch && isTouch && event.type === 'touchstart';
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
                if (!!composedPath.find((node) => {
                    var _a, _b, _c, _d;
                    return ((_a = node.hasAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'data-lenis-prevent')) ||
                        (isTouch && ((_b = node.hasAttribute) === null || _b === void 0 ? void 0 : _b.call(node, 'data-lenis-prevent-touch'))) ||
                        (isWheel && ((_c = node.hasAttribute) === null || _c === void 0 ? void 0 : _c.call(node, 'data-lenis-prevent-wheel'))) ||
                        ((_d = node.classList) === null || _d === void 0 ? void 0 : _d.contains('lenis'));
                }))
                    return;
                if (this.isStopped || this.isLocked) {
                    event.preventDefault();
                    return;
                }
                this.isSmooth =
                    (this.options.syncTouch && isTouch) ||
                        (this.options.smoothWheel && isWheel);
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
            window.lenisVersion = version;
            if (wrapper === document.documentElement || wrapper === document.body) {
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
                normalizeWheel,
                autoResize,
            };
            this.animate = new Animate();
            this.emitter = new Emitter();
            this.dimensions = new Dimensions({ wrapper, content, autoResize });
            this.toggleClass('lenis', true);
            this.velocity = 0;
            this.isLocked = false;
            this.isStopped = false;
            this.isSmooth = syncTouch || smoothWheel;
            this.isScrolling = false;
            this.targetScroll = this.animatedScroll = this.actualScroll;
            this.options.wrapper.addEventListener('scroll', this.onNativeScroll, {
                passive: false,
            });
            this.virtualScroll = new VirtualScroll(eventsTarget, {
                touchMultiplier,
                wheelMultiplier,
                normalizeWheel,
            });
            this.virtualScroll.on('scroll', this.onVirtualScroll);
        }
        destroy() {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, {
                passive: false,
            });
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.toggleClass('lenis', false);
            this.toggleClass('lenis-smooth', false);
            this.toggleClass('lenis-scrolling', false);
            this.toggleClass('lenis-stopped', false);
            this.toggleClass('lenis-locked', false);
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        off(event, callback) {
            return this.emitter.off(event, callback);
        }
        setScroll(scroll) {
            if (this.isHorizontal) {
                this.rootElement.scrollLeft = scroll;
            }
            else {
                this.rootElement.scrollTop = scroll;
            }
        }
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
            this.velocity = 0;
            this.animate.stop();
        }
        start() {
            this.isStopped = false;
            this.reset();
        }
        stop() {
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        }
        raf(time) {
            const deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * 0.001);
        }
        scrollTo(target, { offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp = !duration && this.options.lerp, onComplete, force = false, programmatic = true, } = {}) {
            if ((this.isStopped || this.isLocked) && !force)
                return;
            if (['top', 'left', 'start'].includes(target)) {
                target = 0;
            }
            else if (['bottom', 'right', 'end'].includes(target)) {
                target = this.limit;
            }
            else {
                let node;
                if (typeof target === 'string') {
                    node = document.querySelector(target);
                }
                else if (target === null || target === void 0 ? void 0 : target.nodeType) {
                    node = target;
                }
                if (node) {
                    if (this.options.wrapper !== window) {
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
                target = clamp(0, target, this.limit);
            }
            if (immediate) {
                this.animatedScroll = this.targetScroll = target;
                this.setScroll(this.scroll);
                this.reset();
                onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
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
                        onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
                        this.__preventNextScrollEvent = true;
                        requestAnimationFrame(() => {
                            delete this.__preventNextScrollEvent;
                        });
                    }
                },
            });
        }
        get rootElement() {
            return this.options.wrapper === window
                ? document.documentElement
                : this.options.wrapper;
        }
        get limit() {
            return this.dimensions.limit[this.isHorizontal ? 'x' : 'y'];
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
                ? modulo(this.animatedScroll, this.limit)
                : this.animatedScroll;
        }
        get progress() {
            return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        get isSmooth() {
            return __classPrivateFieldGet(this, _Lenis_isSmooth, "f");
        }
        set isSmooth(value) {
            if (__classPrivateFieldGet(this, _Lenis_isSmooth, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isSmooth, value, "f");
                this.toggleClass('lenis-smooth', value);
            }
        }
        get isScrolling() {
            return __classPrivateFieldGet(this, _Lenis_isScrolling, "f");
        }
        set isScrolling(value) {
            if (__classPrivateFieldGet(this, _Lenis_isScrolling, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isScrolling, value, "f");
                this.toggleClass('lenis-scrolling', value);
            }
        }
        get isStopped() {
            return __classPrivateFieldGet(this, _Lenis_isStopped, "f");
        }
        set isStopped(value) {
            if (__classPrivateFieldGet(this, _Lenis_isStopped, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isStopped, value, "f");
                this.toggleClass('lenis-stopped', value);
            }
        }
        get isLocked() {
            return __classPrivateFieldGet(this, _Lenis_isLocked, "f");
        }
        set isLocked(value) {
            if (__classPrivateFieldGet(this, _Lenis_isLocked, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isLocked, value, "f");
                this.toggleClass('lenis-locked', value);
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
        toggleClass(name, value) {
            this.rootElement.classList.toggle(name, value);
            this.emitter.emit('className change', this);
        }
    }
    _Lenis_isSmooth = new WeakMap(), _Lenis_isScrolling = new WeakMap(), _Lenis_isStopped = new WeakMap(), _Lenis_isLocked = new WeakMap();

    return Lenis;

}));
