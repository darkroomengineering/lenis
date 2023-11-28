(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Lenis = factory());
})(this, (function () {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var version = "1.0.29";

  // Clamp a value between a minimum and maximum value
  function clamp(min, input, max) {
    return Math.max(min, Math.min(input, max));
  }

  // Linearly interpolate between two values using an amount (0 <= t <= 1)
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }

  // http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
  function damp(x, y, lambda, dt) {
    return lerp(x, y, 1 - Math.exp(-lambda * dt));
  }

  // Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
  // https://anguscroll.com/just/just-modulo
  function modulo(n, d) {
    return (n % d + d) % d;
  }

  // Animate class to handle value animations with lerping or easing
  var Animate = /*#__PURE__*/function () {
    function Animate() {}
    var _proto = Animate.prototype;
    // Advance the animation by the given delta time
    _proto.advance = function advance(deltaTime) {
      var _this$onUpdate;
      if (!this.isRunning) return;
      var completed = false;
      if (this.lerp) {
        this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
        if (Math.round(this.value) === this.to) {
          this.value = this.to;
          completed = true;
        }
      } else {
        this.currentTime += deltaTime;
        var linearProgress = clamp(0, this.currentTime / this.duration, 1);
        completed = linearProgress >= 1;
        var easedProgress = completed ? 1 : this.easing(linearProgress);
        this.value = this.from + (this.to - this.from) * easedProgress;
      }

      // Call the onUpdate callback with the current value and completed status
      (_this$onUpdate = this.onUpdate) == null ? void 0 : _this$onUpdate.call(this, this.value, completed);
      if (completed) {
        this.stop();
      }
    }

    // Stop the animation
    ;
    _proto.stop = function stop() {
      this.isRunning = false;
    }

    // Set up the animation from a starting value to an ending value
    // with optional parameters for lerping, duration, easing, and onUpdate callback
    ;
    _proto.fromTo = function fromTo(from, to, _ref) {
      var _ref$lerp = _ref.lerp,
        lerp = _ref$lerp === void 0 ? 0.1 : _ref$lerp,
        _ref$duration = _ref.duration,
        duration = _ref$duration === void 0 ? 1 : _ref$duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? function (t) {
          return t;
        } : _ref$easing,
        onStart = _ref.onStart,
        onUpdate = _ref.onUpdate;
      this.from = this.value = from;
      this.to = to;
      this.lerp = lerp;
      this.duration = duration;
      this.easing = easing;
      this.currentTime = 0;
      this.isRunning = true;
      onStart == null ? void 0 : onStart();
      this.onUpdate = onUpdate;
    };
    return Animate;
  }();

  function debounce(callback, delay) {
    var timer;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, delay);
    };
  }

  var Dimensions = /*#__PURE__*/function () {
    function Dimensions(_temp) {
      var _this = this;
      var _ref = _temp === void 0 ? {} : _temp,
        wrapper = _ref.wrapper,
        content = _ref.content,
        _ref$autoResize = _ref.autoResize,
        autoResize = _ref$autoResize === void 0 ? true : _ref$autoResize;
      this.resize = function () {
        _this.onWrapperResize();
        _this.onContentResize();
      };
      this.onWrapperResize = function () {
        if (_this.wrapper === window) {
          _this.width = window.innerWidth;
          _this.height = window.innerHeight;
        } else {
          _this.width = _this.wrapper.clientWidth;
          _this.height = _this.wrapper.clientHeight;
        }
      };
      this.onContentResize = function () {
        _this.scrollHeight = _this.content.scrollHeight;
        _this.scrollWidth = _this.content.scrollWidth;
      };
      this.wrapper = wrapper;
      this.content = content;
      if (autoResize) {
        var resize = debounce(this.resize, 250);
        if (this.wrapper !== window) {
          this.wrapperResizeObserver = new ResizeObserver(resize);
          this.wrapperResizeObserver.observe(this.wrapper);
        }
        this.contentResizeObserver = new ResizeObserver(resize);
        this.contentResizeObserver.observe(this.content);
      }
      this.resize();
    }
    var _proto = Dimensions.prototype;
    _proto.destroy = function destroy() {
      var _this$wrapperResizeOb, _this$contentResizeOb;
      (_this$wrapperResizeOb = this.wrapperResizeObserver) == null ? void 0 : _this$wrapperResizeOb.disconnect();
      (_this$contentResizeOb = this.contentResizeObserver) == null ? void 0 : _this$contentResizeOb.disconnect();
    };
    _createClass(Dimensions, [{
      key: "limit",
      get: function get() {
        return {
          x: this.scrollWidth - this.width,
          y: this.scrollHeight - this.height
        };
      }
    }]);
    return Dimensions;
  }();

  var Emitter = /*#__PURE__*/function () {
    function Emitter() {
      this.events = {};
    }
    var _proto = Emitter.prototype;
    _proto.emit = function emit(event) {
      var callbacks = this.events[event] || [];
      for (var i = 0, length = callbacks.length; i < length; i++) {
        callbacks[i].apply(callbacks, [].slice.call(arguments, 1));
      }
    };
    _proto.on = function on(event, cb) {
      var _this$events$event,
        _this = this;
      // Add the callback to the event's callback list, or create a new list with the callback
      ((_this$events$event = this.events[event]) == null ? void 0 : _this$events$event.push(cb)) || (this.events[event] = [cb]);

      // Return an unsubscribe function
      return function () {
        var _this$events$event2;
        _this.events[event] = (_this$events$event2 = _this.events[event]) == null ? void 0 : _this$events$event2.filter(function (i) {
          return cb !== i;
        });
      };
    };
    _proto.off = function off(event, callback) {
      var _this$events$event3;
      this.events[event] = (_this$events$event3 = this.events[event]) == null ? void 0 : _this$events$event3.filter(function (i) {
        return callback !== i;
      });
    };
    _proto.destroy = function destroy() {
      this.events = {};
    };
    return Emitter;
  }();

  var VirtualScroll = /*#__PURE__*/function () {
    function VirtualScroll(element, _ref) {
      var _this = this;
      var _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? 1 : _ref$wheelMultiplier,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 2 : _ref$touchMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? false : _ref$normalizeWheel;
      // Event handler for 'touchstart' event
      this.onTouchStart = function (event) {
        var _ref2 = event.targetTouches ? event.targetTouches[0] : event,
          clientX = _ref2.clientX,
          clientY = _ref2.clientY;
        _this.touchStart.x = clientX;
        _this.touchStart.y = clientY;
        _this.lastDelta = {
          x: 0,
          y: 0
        };
      };
      // Event handler for 'touchmove' event
      this.onTouchMove = function (event) {
        var _ref3 = event.targetTouches ? event.targetTouches[0] : event,
          clientX = _ref3.clientX,
          clientY = _ref3.clientY;
        var deltaX = -(clientX - _this.touchStart.x) * _this.touchMultiplier;
        var deltaY = -(clientY - _this.touchStart.y) * _this.touchMultiplier;
        _this.touchStart.x = clientX;
        _this.touchStart.y = clientY;
        _this.lastDelta = {
          x: deltaX,
          y: deltaY
        };
        _this.emitter.emit('scroll', {
          deltaX: deltaX,
          deltaY: deltaY,
          event: event
        });
      };
      this.onTouchEnd = function (event) {
        _this.emitter.emit('scroll', {
          deltaX: _this.lastDelta.x,
          deltaY: _this.lastDelta.y,
          event: event
        });
      };
      // Event handler for 'wheel' event
      this.onWheel = function (event) {
        var deltaX = event.deltaX,
          deltaY = event.deltaY;
        if (_this.normalizeWheel) {
          deltaX = clamp(-100, deltaX, 100);
          deltaY = clamp(-100, deltaY, 100);
        }
        deltaX *= _this.wheelMultiplier;
        deltaY *= _this.wheelMultiplier;
        _this.emitter.emit('scroll', {
          deltaX: deltaX,
          deltaY: deltaY,
          event: event
        });
      };
      this.element = element;
      this.wheelMultiplier = wheelMultiplier;
      this.touchMultiplier = touchMultiplier;
      this.normalizeWheel = normalizeWheel;
      this.touchStart = {
        x: null,
        y: null
      };
      this.emitter = new Emitter();
      this.element.addEventListener('wheel', this.onWheel, {
        passive: false
      });
      this.element.addEventListener('touchstart', this.onTouchStart, {
        passive: false
      });
      this.element.addEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
      this.element.addEventListener('touchend', this.onTouchEnd, {
        passive: false
      });
    }

    // Add an event listener for the given event and callback
    var _proto = VirtualScroll.prototype;
    _proto.on = function on(event, callback) {
      return this.emitter.on(event, callback);
    }

    // Remove all event listeners and clean up
    ;
    _proto.destroy = function destroy() {
      this.emitter.destroy();
      this.element.removeEventListener('wheel', this.onWheel, {
        passive: false
      });
      this.element.removeEventListener('touchstart', this.onTouchStart, {
        passive: false
      });
      this.element.removeEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
      this.element.removeEventListener('touchend', this.onTouchEnd, {
        passive: false
      });
    };
    return VirtualScroll;
  }();

  // Technical explanation
  // - listen to 'wheel' events
  // - prevent 'wheel' event to prevent scroll
  // - normalize wheel delta
  // - add delta to targetScroll
  // - animate scroll to targetScroll (smooth context)
  // - if animation is not running, listen to 'scroll' events (native context)
  var Lenis = /*#__PURE__*/function () {
    // isScrolling = true when scroll is animating
    // isStopped = true if user should not be able to scroll - enable/disable programmatically
    // isSmooth = true if scroll should be animated
    // isLocked = same as isStopped but enabled/disabled when scroll reaches target

    /**
     * @typedef {(t: number) => number} EasingFunction
     * @typedef {'vertical' | 'horizontal'} Orientation
     * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
     *
     * @typedef LenisOptions
     * @property {Window | HTMLElement} [wrapper]
     * @property {HTMLElement} [content]
     * @property {Window | HTMLElement} [wheelEventsTarget] // deprecated
     * @property {Window | HTMLElement} [eventsTarget]
     * @property {boolean} [smoothWheel]
     * @property {boolean} [smoothTouch]
     * @property {boolean} [syncTouch]
     * @property {number} [syncTouchLerp]
     * @property {number} [__iosNoInertiaSyncTouchLerp]
     * @property {number} [touchInertiaMultiplier]
     * @property {number} [duration]
     * @property {EasingFunction} [easing]
     * @property {number} [lerp]
     * @property {boolean} [infinite]
     * @property {Orientation} [orientation]
     * @property {GestureOrientation} [gestureOrientation]
     * @property {number} [touchMultiplier]
     * @property {number} [wheelMultiplier]
     * @property {boolean} [normalizeWheel]
     * @property {boolean} [autoResize]
     *
     * @param {LenisOptions}
     */
    function Lenis(_temp) {
      var _this = this;
      var _ref = _temp === void 0 ? {} : _temp,
        _ref$wrapper = _ref.wrapper,
        wrapper = _ref$wrapper === void 0 ? window : _ref$wrapper,
        _ref$content = _ref.content,
        content = _ref$content === void 0 ? document.documentElement : _ref$content,
        _ref$wheelEventsTarge = _ref.wheelEventsTarget,
        wheelEventsTarget = _ref$wheelEventsTarge === void 0 ? wrapper : _ref$wheelEventsTarge,
        _ref$eventsTarget = _ref.eventsTarget,
        eventsTarget = _ref$eventsTarget === void 0 ? wheelEventsTarget : _ref$eventsTarget,
        _ref$smoothWheel = _ref.smoothWheel,
        smoothWheel = _ref$smoothWheel === void 0 ? true : _ref$smoothWheel,
        _ref$smoothTouch = _ref.smoothTouch,
        smoothTouch = _ref$smoothTouch === void 0 ? false : _ref$smoothTouch,
        _ref$syncTouch = _ref.syncTouch,
        _syncTouch = _ref$syncTouch === void 0 ? false : _ref$syncTouch,
        _ref$syncTouchLerp = _ref.syncTouchLerp,
        syncTouchLerp = _ref$syncTouchLerp === void 0 ? 0.1 : _ref$syncTouchLerp,
        _ref$__iosNoInertiaSy = _ref.__iosNoInertiaSyncTouchLerp,
        __iosNoInertiaSyncTouchLerp = _ref$__iosNoInertiaSy === void 0 ? 0.4 : _ref$__iosNoInertiaSy,
        _ref$touchInertiaMult = _ref.touchInertiaMultiplier,
        touchInertiaMultiplier = _ref$touchInertiaMult === void 0 ? 35 : _ref$touchInertiaMult,
        duration = _ref.duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        } : _ref$easing,
        _ref$lerp = _ref.lerp,
        lerp = _ref$lerp === void 0 ? !duration && 0.1 : _ref$lerp,
        _ref$infinite = _ref.infinite,
        infinite = _ref$infinite === void 0 ? false : _ref$infinite,
        _ref$orientation = _ref.orientation,
        orientation = _ref$orientation === void 0 ? 'vertical' : _ref$orientation,
        _ref$gestureOrientati = _ref.gestureOrientation,
        gestureOrientation = _ref$gestureOrientati === void 0 ? 'vertical' : _ref$gestureOrientati,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 1 : _ref$touchMultiplier,
        _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? 1 : _ref$wheelMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? false : _ref$normalizeWheel,
        _ref$autoResize = _ref.autoResize,
        autoResize = _ref$autoResize === void 0 ? true : _ref$autoResize;
      this.onVirtualScroll = function (_ref2) {
        var deltaX = _ref2.deltaX,
          deltaY = _ref2.deltaY,
          event = _ref2.event;
        // keep zoom feature
        if (event.ctrlKey) return;
        var isTouch = event.type.includes('touch');
        var isWheel = event.type.includes('wheel');
        if (_this.options.gestureOrientation === 'both' && deltaX === 0 && deltaY === 0 ||
        // "touchend" events prevents "click"
        _this.options.gestureOrientation === 'vertical' && deltaY === 0 ||
        // trackpad previous/next page gesture
        _this.options.gestureOrientation === 'horizontal' && deltaX === 0 || isTouch && _this.options.gestureOrientation === 'vertical' && _this.scroll === 0 && !_this.options.infinite && deltaY <= 0 // touch pull to refresh
        ) return;

        // catch if scrolling on nested scroll elements
        var composedPath = event.composedPath();
        composedPath = composedPath.slice(0, composedPath.indexOf(_this.rootElement)); // remove parents elements

        if (!!composedPath.find(function (node) {
          var _node$classList;
          return (node.hasAttribute == null ? void 0 : node.hasAttribute('data-lenis-prevent')) || isTouch && (node.hasAttribute == null ? void 0 : node.hasAttribute('data-lenis-prevent-touch')) || isWheel && (node.hasAttribute == null ? void 0 : node.hasAttribute('data-lenis-prevent-wheel')) || ((_node$classList = node.classList) == null ? void 0 : _node$classList.contains('lenis'));
        } // nested lenis instance
        )) return;
        if (_this.isStopped || _this.isLocked) {
          event.preventDefault();
          return;
        }
        _this.isSmooth = (_this.options.smoothTouch || _this.options.syncTouch) && isTouch || _this.options.smoothWheel && isWheel;
        if (!_this.isSmooth) {
          _this.isScrolling = false;
          _this.animate.stop();
          return;
        }
        event.preventDefault();
        var delta = deltaY;
        if (_this.options.gestureOrientation === 'both') {
          delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
        } else if (_this.options.gestureOrientation === 'horizontal') {
          delta = deltaX;
        }
        var syncTouch = isTouch && _this.options.syncTouch;
        var isTouchEnd = isTouch && event.type === 'touchend';
        var hasTouchInertia = isTouchEnd && Math.abs(delta) > 1;
        if (hasTouchInertia) {
          delta = _this.velocity * _this.options.touchInertiaMultiplier;
        }
        _this.scrollTo(_this.targetScroll + delta, _extends({
          programmatic: false
        }, syncTouch && {
          lerp: hasTouchInertia ? _this.syncTouchLerp : _this.options.__iosNoInertiaSyncTouchLerp
        }));
      };
      this.onNativeScroll = function () {
        if (_this.__preventNextScrollEvent) return;
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
        smoothTouch: smoothTouch,
        syncTouch: _syncTouch,
        syncTouchLerp: syncTouchLerp,
        __iosNoInertiaSyncTouchLerp: __iosNoInertiaSyncTouchLerp,
        touchInertiaMultiplier: touchInertiaMultiplier,
        duration: duration,
        easing: easing,
        lerp: lerp,
        infinite: infinite,
        gestureOrientation: gestureOrientation,
        orientation: orientation,
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel,
        autoResize: autoResize
      };
      this.animate = new Animate();
      this.emitter = new Emitter();
      this.dimensions = new Dimensions({
        wrapper: wrapper,
        content: content,
        autoResize: autoResize
      });
      this.toggleClass('lenis', true);
      this.velocity = 0;
      this.isLocked = false;
      this.isStopped = false;
      this.isSmooth = _syncTouch || smoothWheel || smoothTouch;
      this.isScrolling = false;
      this.targetScroll = this.animatedScroll = this.actualScroll;
      this.options.wrapper.addEventListener('scroll', this.onNativeScroll, {
        passive: false
      });
      this.virtualScroll = new VirtualScroll(eventsTarget, {
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel
      });
      this.virtualScroll.on('scroll', this.onVirtualScroll);
    }
    var _proto = Lenis.prototype;
    _proto.destroy = function destroy() {
      this.emitter.destroy();
      this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, {
        passive: false
      });
      this.virtualScroll.destroy();
      this.dimensions.destroy();
      this.toggleClass('lenis', false);
      this.toggleClass('lenis-smooth', false);
      this.toggleClass('lenis-scrolling', false);
      this.toggleClass('lenis-stopped', false);
      this.toggleClass('lenis-locked', false);
    };
    _proto.on = function on(event, callback) {
      return this.emitter.on(event, callback);
    };
    _proto.off = function off(event, callback) {
      return this.emitter.off(event, callback);
    };
    _proto.setScroll = function setScroll(scroll) {
      // apply scroll value immediately
      if (this.isHorizontal) {
        this.rootElement.scrollLeft = scroll;
      } else {
        this.rootElement.scrollTop = scroll;
      }
    };
    _proto.resize = function resize() {
      this.dimensions.resize();
    };
    _proto.emit = function emit() {
      this.emitter.emit('scroll', this);
    };
    _proto.reset = function reset() {
      this.isLocked = false;
      this.isScrolling = false;
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.velocity = 0;
      this.animate.stop();
    };
    _proto.start = function start() {
      this.isStopped = false;
      this.reset();
    };
    _proto.stop = function stop() {
      this.isStopped = true;
      this.animate.stop();
      this.reset();
    };
    _proto.raf = function raf(time) {
      var deltaTime = time - (this.time || time);
      this.time = time;
      this.animate.advance(deltaTime * 0.001);
    };
    _proto.scrollTo = function scrollTo(target, _temp2) {
      var _this2 = this;
      var _ref3 = _temp2 === void 0 ? {} : _temp2,
        _ref3$offset = _ref3.offset,
        offset = _ref3$offset === void 0 ? 0 : _ref3$offset,
        _ref3$immediate = _ref3.immediate,
        immediate = _ref3$immediate === void 0 ? false : _ref3$immediate,
        _ref3$lock = _ref3.lock,
        lock = _ref3$lock === void 0 ? false : _ref3$lock,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === void 0 ? this.options.duration : _ref3$duration,
        _ref3$easing = _ref3.easing,
        easing = _ref3$easing === void 0 ? this.options.easing : _ref3$easing,
        _ref3$lerp = _ref3.lerp,
        lerp = _ref3$lerp === void 0 ? !duration && this.options.lerp : _ref3$lerp,
        _ref3$onComplete = _ref3.onComplete,
        onComplete = _ref3$onComplete === void 0 ? null : _ref3$onComplete,
        _ref3$force = _ref3.force,
        force = _ref3$force === void 0 ? false : _ref3$force,
        _ref3$programmatic = _ref3.programmatic,
        programmatic = _ref3$programmatic === void 0 ? true : _ref3$programmatic;
      if ((this.isStopped || this.isLocked) && !force) return;

      // keywords
      if (['top', 'left', 'start'].includes(target)) {
        target = 0;
      } else if (['bottom', 'right', 'end'].includes(target)) {
        target = this.limit;
      } else {
        var _target;
        var node;
        if (typeof target === 'string') {
          // CSS selector
          node = document.querySelector(target);
        } else if ((_target = target) != null && _target.nodeType) {
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
          target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
        }
      }
      if (typeof target !== 'number') return;
      target += offset;
      target = Math.round(target);
      if (this.options.infinite) {
        if (programmatic) {
          this.targetScroll = this.animatedScroll = this.scroll;
        }
      } else {
        target = clamp(0, target, this.limit);
      }
      if (immediate) {
        this.animatedScroll = this.targetScroll = target;
        this.setScroll(this.scroll);
        this.reset();
        onComplete == null ? void 0 : onComplete(this);
        return;
      }
      if (!programmatic) {
        if (target === this.targetScroll) return;
        this.targetScroll = target;
      }
      this.animate.fromTo(this.animatedScroll, target, {
        duration: duration,
        easing: easing,
        lerp: lerp,
        onStart: function onStart() {
          // started
          if (lock) _this2.isLocked = true;
          _this2.isScrolling = true;
        },
        onUpdate: function onUpdate(value, completed) {
          _this2.isScrolling = true;

          // updated
          _this2.velocity = value - _this2.animatedScroll;
          _this2.direction = Math.sign(_this2.velocity);
          _this2.animatedScroll = value;
          _this2.setScroll(_this2.scroll);
          if (programmatic) {
            // wheel during programmatic should stop it
            _this2.targetScroll = value;
          }
          if (!completed) _this2.emit();
          if (completed) {
            _this2.reset();
            _this2.emit();
            onComplete == null ? void 0 : onComplete(_this2);

            // avoid emitting event twice
            _this2.__preventNextScrollEvent = true;
            requestAnimationFrame(function () {
              delete _this2.__preventNextScrollEvent;
            });
          }
        }
      });
    };
    _proto.toggleClass = function toggleClass(name, value) {
      this.rootElement.classList.toggle(name, value);
      this.emitter.emit('className change', this);
    };
    _createClass(Lenis, [{
      key: "rootElement",
      get: function get() {
        return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
      }
    }, {
      key: "limit",
      get: function get() {
        return this.dimensions.limit[this.isHorizontal ? 'x' : 'y'];
      }
    }, {
      key: "isHorizontal",
      get: function get() {
        return this.options.orientation === 'horizontal';
      }
    }, {
      key: "actualScroll",
      get: function get() {
        // value browser takes into account
        return this.isHorizontal ? this.rootElement.scrollLeft : this.rootElement.scrollTop;
      }
    }, {
      key: "scroll",
      get: function get() {
        return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
      }
    }, {
      key: "progress",
      get: function get() {
        // avoid progress to be NaN
        return this.limit === 0 ? 1 : this.scroll / this.limit;
      }
    }, {
      key: "isSmooth",
      get: function get() {
        return this.__isSmooth;
      },
      set: function set(value) {
        if (this.__isSmooth !== value) {
          this.__isSmooth = value;
          this.toggleClass('lenis-smooth', value);
        }
      }
    }, {
      key: "isScrolling",
      get: function get() {
        return this.__isScrolling;
      },
      set: function set(value) {
        if (this.__isScrolling !== value) {
          this.__isScrolling = value;
          this.toggleClass('lenis-scrolling', value);
        }
      }
    }, {
      key: "isStopped",
      get: function get() {
        return this.__isStopped;
      },
      set: function set(value) {
        if (this.__isStopped !== value) {
          this.__isStopped = value;
          this.toggleClass('lenis-stopped', value);
        }
      }
    }, {
      key: "isLocked",
      get: function get() {
        return this.__isLocked;
      },
      set: function set(value) {
        if (this.__isLocked !== value) {
          this.__isLocked = value;
          this.toggleClass('lenis-locked', value);
        }
      }
    }, {
      key: "className",
      get: function get() {
        var className = 'lenis';
        if (this.isStopped) className += ' lenis-stopped';
        if (this.isLocked) className += ' lenis-locked';
        if (this.isScrolling) className += ' lenis-scrolling';
        if (this.isSmooth) className += ' lenis-smooth';
        return className;
      }
    }]);
    return Lenis;
  }();

  return Lenis;

}));
