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


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var version = "1.0.45-dev.0";

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
      constructor({
        wrapper,
        content,
        autoResize = true,
        debounce: debounceValue = 250,
      } = {}) {
        this.wrapper = wrapper;
        this.content = content;

        if (autoResize) {
          this.debouncedResize = debounce(this.resize, debounceValue);

          if (this.wrapper === window) {
            window.addEventListener('resize', this.debouncedResize, false);
          } else {
            this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
            this.wrapperResizeObserver.observe(this.wrapper);
          }

          this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
          this.contentResizeObserver.observe(this.content);
        }

        this.resize();
      }

      destroy() {
        this.wrapperResizeObserver?.disconnect();
        this.contentResizeObserver?.disconnect();
        window.removeEventListener('resize', this.debouncedResize, false);
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
        if (this.wrapper === window) {
          this.scrollHeight = this.content.scrollHeight;
          this.scrollWidth = this.content.scrollWidth;
        } else {
          this.scrollHeight = this.wrapper.scrollHeight;
          this.scrollWidth = this.wrapper.scrollWidth;
        }
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

    const LINE_HEIGHT = 100 / 6;

    class VirtualScroll {
      constructor(element, { wheelMultiplier = 1, touchMultiplier = 1 }) {
        this.element = element;
        this.wheelMultiplier = wheelMultiplier;
        this.touchMultiplier = touchMultiplier;

        this.touchStart = {
          x: null,
          y: null,
        };

        this.emitter = new Emitter();
        window.addEventListener('resize', this.onWindowResize, false);
        this.onWindowResize();

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

        window.removeEventListener('resize', this.onWindowResize, false);

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
        let { deltaX, deltaY, deltaMode } = event;

        const multiplierX =
          deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowWidth : 1;
        const multiplierY =
          deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowHeight : 1;

        deltaX *= multiplierX;
        deltaY *= multiplierY;

        deltaX *= this.wheelMultiplier;
        deltaY *= this.wheelMultiplier;

        this.emitter.emit('scroll', { deltaX, deltaY, event });
      }

      onWindowResize = () => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
      }
    }

    var Lenis = /** @class */ (function () {
        function Lenis(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.wrapper, wrapper = _c === void 0 ? window : _c, _d = _b.content, content = _d === void 0 ? document.documentElement : _d, _e = _b.wheelEventsTarget, wheelEventsTarget = _e === void 0 ? wrapper : _e, // deprecated
            _f = _b.eventsTarget, // deprecated
            eventsTarget = _f === void 0 ? wheelEventsTarget : _f, _g = _b.smoothWheel, smoothWheel = _g === void 0 ? true : _g, _h = _b.syncTouch, syncTouch = _h === void 0 ? false : _h, _j = _b.syncTouchLerp, syncTouchLerp = _j === void 0 ? 0.075 : _j, _k = _b.touchInertiaMultiplier, touchInertiaMultiplier = _k === void 0 ? 35 : _k, duration = _b.duration, // in seconds
            _l = _b.easing, // in seconds
            easing = _l === void 0 ? function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } : _l, _m = _b.lerp, lerp = _m === void 0 ? !duration && 0.1 : _m, _o = _b.infinite, infinite = _o === void 0 ? false : _o, _p = _b.orientation, orientation = _p === void 0 ? 'vertical' : _p, // vertical, horizontal
            _q = _b.gestureOrientation, // vertical, horizontal
            gestureOrientation = _q === void 0 ? 'vertical' : _q, // vertical, horizontal, both
            _r = _b.touchMultiplier, // vertical, horizontal, both
            touchMultiplier = _r === void 0 ? 1 : _r, _s = _b.wheelMultiplier, wheelMultiplier = _s === void 0 ? 1 : _s, _t = _b.autoResize, autoResize = _t === void 0 ? true : _t, _u = _b.__experimental__naiveDimensions, __experimental__naiveDimensions = _u === void 0 ? false : _u;
            var _this = this;
            this.__isSmooth = false; // true if scroll should be animated
            this.__isScrolling = false; // true when scroll is animating
            this.__isStopped = false; // true if user should not be able to scroll - enable/disable programmatically
            this.__isLocked = false; // same as isStopped but enabled/disabled when scroll reaches target
            this.onVirtualScroll = function (_a) {
                var deltaX = _a.deltaX, deltaY = _a.deltaY, event = _a.event;
                // keep zoom feature
                if (event.ctrlKey)
                    return;
                var isTouch = event.type.includes('touch');
                var isWheel = event.type.includes('wheel');
                var isTapToStop = _this.options.syncTouch &&
                    isTouch &&
                    event.type === 'touchstart' &&
                    !_this.isStopped &&
                    !_this.isLocked;
                if (isTapToStop) {
                    _this.reset();
                    return;
                }
                var isClick = deltaX === 0 && deltaY === 0; // click event
                // const isPullToRefresh =
                //   this.options.gestureOrientation === 'vertical' &&
                //   this.scroll === 0 &&
                //   !this.options.infinite &&
                //   deltaY <= 5 // touch pull to refresh, not reliable yet
                var isUnknownGesture = (_this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
                    (_this.options.gestureOrientation === 'horizontal' && deltaX === 0);
                if (isClick || isUnknownGesture) {
                    // console.log('prevent')
                    return;
                }
                // catch if scrolling on nested scroll elements
                var composedPath = event.composedPath();
                composedPath = composedPath.slice(0, composedPath.indexOf(_this.rootElement)); // remove parents elements
                if (!!composedPath.find(function (node) {
                    var _a, _b, _c, _d, _e;
                    return ((_a = node.hasAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'data-lenis-prevent')) ||
                        (isTouch && ((_b = node.hasAttribute) === null || _b === void 0 ? void 0 : _b.call(node, 'data-lenis-prevent-touch'))) ||
                        (isWheel && ((_c = node.hasAttribute) === null || _c === void 0 ? void 0 : _c.call(node, 'data-lenis-prevent-wheel'))) ||
                        (((_d = node.classList) === null || _d === void 0 ? void 0 : _d.contains('lenis')) &&
                            !((_e = node.classList) === null || _e === void 0 ? void 0 : _e.contains('lenis-stopped')));
                } // nested lenis instance
                ))
                    return;
                if (_this.isStopped || _this.isLocked) {
                    event.preventDefault(); // this will stop forwarding the event to the parent, this is problematic
                    return;
                }
                _this.isSmooth =
                    (_this.options.syncTouch && isTouch) ||
                        (_this.options.smoothWheel && isWheel);
                if (!_this.isSmooth) {
                    _this.isScrolling = false;
                    _this.animate.stop();
                    return;
                }
                event.preventDefault();
                var delta = deltaY;
                if (_this.options.gestureOrientation === 'both') {
                    delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
                }
                else if (_this.options.gestureOrientation === 'horizontal') {
                    delta = deltaX;
                }
                var syncTouch = isTouch && _this.options.syncTouch;
                var isTouchEnd = isTouch && event.type === 'touchend';
                var hasTouchInertia = isTouchEnd && Math.abs(delta) > 5;
                if (hasTouchInertia) {
                    delta = _this.velocity * _this.options.touchInertiaMultiplier;
                }
                _this.scrollTo(_this.targetScroll + delta, __assign({ programmatic: false }, (syncTouch
                    ? {
                        lerp: hasTouchInertia ? _this.options.syncTouchLerp : 1,
                    }
                    : {
                        lerp: _this.options.lerp,
                        duration: _this.options.duration,
                        easing: _this.options.easing,
                    })));
            };
            this.onNativeScroll = function () {
                if (_this.__preventNextScrollEvent)
                    return;
                if (!_this.isScrolling) {
                    var lastScroll = _this.animatedScroll;
                    _this.animatedScroll = _this.targetScroll = _this.actualScroll;
                    _this.velocity = 0;
                    _this.direction = Math.sign(_this.animatedScroll - lastScroll);
                    _this.emit();
                }
            };
            window.lenisVersion = version;
            // if wrapper is html or body, fallback to window
            if (wrapper === document.documentElement || wrapper === document.body) {
                wrapper = window;
            }
            this.options = {
                wrapper: wrapper,
                content: content,
                wheelEventsTarget: wheelEventsTarget,
                eventsTarget: eventsTarget,
                smoothWheel: smoothWheel,
                syncTouch: syncTouch,
                syncTouchLerp: syncTouchLerp,
                touchInertiaMultiplier: touchInertiaMultiplier,
                duration: duration,
                easing: easing,
                lerp: lerp,
                infinite: infinite,
                gestureOrientation: gestureOrientation,
                orientation: orientation,
                touchMultiplier: touchMultiplier,
                wheelMultiplier: wheelMultiplier,
                autoResize: autoResize,
                __experimental__naiveDimensions: __experimental__naiveDimensions,
            };
            this.animate = new Animate();
            this.emitter = new Emitter();
            this.dimensions = new Dimensions({ wrapper: wrapper, content: content, autoResize: autoResize });
            this.toggleClassName('lenis', true);
            this.velocity = 0;
            this.isLocked = false;
            this.isStopped = false;
            this.isSmooth = syncTouch || smoothWheel;
            this.isScrolling = false;
            this.targetScroll = this.animatedScroll = this.actualScroll;
            this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
            this.virtualScroll = new VirtualScroll(eventsTarget, {
                touchMultiplier: touchMultiplier,
                wheelMultiplier: wheelMultiplier,
            });
            this.virtualScroll.on('scroll', this.onVirtualScroll);
        }
        Lenis.prototype.destroy = function () {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, false);
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.toggleClassName('lenis', false);
            this.toggleClassName('lenis-smooth', false);
            this.toggleClassName('lenis-scrolling', false);
            this.toggleClassName('lenis-stopped', false);
            this.toggleClassName('lenis-locked', false);
        };
        Lenis.prototype.on = function (event, callback) {
            return this.emitter.on(event, callback);
        };
        Lenis.prototype.off = function (event, callback) {
            return this.emitter.off(event, callback);
        };
        Lenis.prototype.setScroll = function (scroll) {
            // apply scroll value immediately
            if (this.isHorizontal) {
                this.rootElement.scrollLeft = scroll;
            }
            else {
                this.rootElement.scrollTop = scroll;
            }
        };
        Lenis.prototype.resize = function () {
            this.dimensions.resize();
        };
        Lenis.prototype.emit = function () {
            this.emitter.emit('scroll', this);
        };
        Lenis.prototype.reset = function () {
            this.isLocked = false;
            this.isScrolling = false;
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.velocity = 0;
            this.animate.stop();
        };
        Lenis.prototype.start = function () {
            if (!this.isStopped)
                return;
            this.isStopped = false;
            this.reset();
        };
        Lenis.prototype.stop = function () {
            if (this.isStopped)
                return;
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        };
        Lenis.prototype.raf = function (time) {
            var deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * 0.001);
        };
        Lenis.prototype.scrollTo = function (target, _a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.offset, offset = _c === void 0 ? 0 : _c, _d = _b.immediate, immediate = _d === void 0 ? false : _d, _e = _b.lock, lock = _e === void 0 ? false : _e, _f = _b.duration, duration = _f === void 0 ? this.options.duration : _f, _g = _b.easing, easing = _g === void 0 ? this.options.easing : _g, _h = _b.lerp, lerp = _h === void 0 ? !duration && this.options.lerp : _h, onComplete = _b.onComplete, _j = _b.force, force = _j === void 0 ? false : _j, // scroll even if stopped
            _k = _b.programmatic, // scroll even if stopped
            programmatic = _k === void 0 ? true : _k;
            if ((this.isStopped || this.isLocked) && !force)
                return;
            // keywords
            if (['top', 'left', 'start'].includes(target)) {
                target = 0;
            }
            else if (['bottom', 'right', 'end'].includes(target)) {
                target = this.limit;
            }
            else {
                var node = void 0;
                if (typeof target === 'string') {
                    // CSS selector
                    node = document.querySelector(target);
                }
                else if (target === null || target === void 0 ? void 0 : target.nodeType) {
                    // Node element
                    node = target;
                }
                if (node) {
                    if (this.options.wrapper !== window) {
                        // nested scroll offset correction
                        var wrapperRect = this.options.wrapper.getBoundingClientRect();
                        offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
                    }
                    var rect = node.getBoundingClientRect();
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
                duration: duration,
                easing: easing,
                lerp: lerp,
                onStart: function () {
                    // started
                    if (lock)
                        _this.isLocked = true;
                    _this.isScrolling = true;
                },
                onUpdate: function (value, completed) {
                    _this.isScrolling = true;
                    // updated
                    _this.velocity = value - _this.animatedScroll;
                    _this.direction = Math.sign(_this.velocity);
                    _this.animatedScroll = value;
                    _this.setScroll(_this.scroll);
                    if (programmatic) {
                        // wheel during programmatic should stop it
                        _this.targetScroll = value;
                    }
                    if (!completed)
                        _this.emit();
                    if (completed) {
                        _this.reset();
                        _this.emit();
                        onComplete === null || onComplete === void 0 ? void 0 : onComplete(_this);
                        // avoid emitting event twice
                        _this.__preventNextScrollEvent = true;
                        requestAnimationFrame(function () {
                            delete _this.__preventNextScrollEvent;
                        });
                    }
                },
            });
        };
        Object.defineProperty(Lenis.prototype, "rootElement", {
            get: function () {
                return this.options.wrapper === window
                    ? document.documentElement
                    : this.options.wrapper;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "limit", {
            get: function () {
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
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "isHorizontal", {
            get: function () {
                return this.options.orientation === 'horizontal';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "actualScroll", {
            get: function () {
                // value browser takes into account
                return this.isHorizontal
                    ? this.rootElement.scrollLeft
                    : this.rootElement.scrollTop;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "scroll", {
            get: function () {
                return this.options.infinite
                    ? modulo(this.animatedScroll, this.limit)
                    : this.animatedScroll;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "progress", {
            get: function () {
                // avoid progress to be NaN
                return this.limit === 0 ? 1 : this.scroll / this.limit;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "isSmooth", {
            get: function () {
                return this.__isSmooth;
            },
            set: function (value) {
                if (this.__isSmooth !== value) {
                    this.__isSmooth = value;
                    this.toggleClassName('lenis-smooth', value);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "isScrolling", {
            get: function () {
                return this.__isScrolling;
            },
            set: function (value) {
                if (this.__isScrolling !== value) {
                    this.__isScrolling = value;
                    this.toggleClassName('lenis-scrolling', value);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "isStopped", {
            get: function () {
                return this.__isStopped;
            },
            set: function (value) {
                if (this.__isStopped !== value) {
                    this.__isStopped = value;
                    this.toggleClassName('lenis-stopped', value);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "isLocked", {
            get: function () {
                return this.__isLocked;
            },
            set: function (value) {
                if (this.__isLocked !== value) {
                    this.__isLocked = value;
                    this.toggleClassName('lenis-locked', value);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Lenis.prototype, "className", {
            get: function () {
                var className = 'lenis';
                if (this.isStopped)
                    className += ' lenis-stopped';
                if (this.isLocked)
                    className += ' lenis-locked';
                if (this.isScrolling)
                    className += ' lenis-scrolling';
                if (this.isSmooth)
                    className += ' lenis-smooth';
                return className;
            },
            enumerable: false,
            configurable: true
        });
        Lenis.prototype.toggleClassName = function (name, value) {
            this.rootElement.classList.toggle(name, value);
            this.emitter.emit('className change', this);
        };
        return Lenis;
    }());

    return Lenis;

}));
//# sourceMappingURL=lenis.js.map
