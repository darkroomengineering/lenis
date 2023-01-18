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
  var id = 0;
  function _classPrivateFieldLooseKey(name) {
    return "__private_" + id++ + "_" + name;
  }
  function _classPrivateFieldLooseBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }
    return receiver;
  }

  let createNanoEvents = () => ({
    events: {},
    emit(event, ...args) {
      let callbacks = this.events[event] || [];
      for (let i = 0, length = callbacks.length; i < length; i++) {
        callbacks[i](...args);
      }
    },
    on(event, cb) {
      this.events[event]?.push(cb) || (this.events[event] = [cb]);
      return () => {
        this.events[event] = this.events[event]?.filter(i => cb !== i);
      }
    }
  });

  var version = "1.0.0-dev.4";

  function clamp(min, input, max) {
    return Math.max(min, Math.min(input, max));
  }
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
  function clampedModulo(dividend, divisor) {
    var remainder = dividend % divisor;
    if (divisor > 0 && remainder < 0 || divisor < 0 && remainder > 0) {
      remainder += divisor;
    }
    return remainder;
  }

  var Animate = /*#__PURE__*/function () {
    function Animate() {}
    var _proto = Animate.prototype;
    _proto.advance = function advance(deltaTime) {
      var _this$onUpdate;
      if (!this.isRunning) return;
      if (this.value === this.from) {
        var _this$onStart;
        (_this$onStart = this.onStart) == null ? void 0 : _this$onStart.call(this, this.from);
      }
      var completed = false;
      if (this.lerp) {
        this.value = lerp(this.value, this.to, this.lerp);
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
      (_this$onUpdate = this.onUpdate) == null ? void 0 : _this$onUpdate.call(this, this.value);
      if (completed) {
        var _this$onComplete;
        (_this$onComplete = this.onComplete) == null ? void 0 : _this$onComplete.call(this, this.to);
        this.stop();
      }
    };
    _proto.stop = function stop() {
      this.isRunning = false;
    };
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
        onUpdate = _ref.onUpdate,
        onComplete = _ref.onComplete;
      this.from = this.value = from;
      this.to = to;
      this.lerp = lerp;
      this.duration = duration;
      this.easing = easing;
      this.currentTime = 0;
      this.isRunning = true;
      this.onStart = onStart;
      this.onUpdate = onUpdate;
      this.onComplete = onComplete;
    };
    return Animate;
  }();

  var _resizeObserver = /*#__PURE__*/_classPrivateFieldLooseKey("resizeObserver");
  var _onResize = /*#__PURE__*/_classPrivateFieldLooseKey("onResize");
  var _onWindowResize = /*#__PURE__*/_classPrivateFieldLooseKey("onWindowResize");
  var ObservedElement = /*#__PURE__*/function () {
    function ObservedElement(element) {
      var _this = this;
      Object.defineProperty(this, _resizeObserver, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _onResize, {
        writable: true,
        value: function value(_ref) {
          var entry = _ref[0];
          if (entry) {
            var _entry$contentRect = entry.contentRect,
              width = _entry$contentRect.width,
              height = _entry$contentRect.height;
            _this.width = width;
            _this.height = height;
          }
        }
      });
      Object.defineProperty(this, _onWindowResize, {
        writable: true,
        value: function value() {
          _this.width = window.innerWidth;
          _this.height = window.innerHeight;
        }
      });
      this.element = element;
      if (element === window) {
        window.addEventListener('resize', _classPrivateFieldLooseBase(this, _onWindowResize)[_onWindowResize]);
        _classPrivateFieldLooseBase(this, _onWindowResize)[_onWindowResize]();
      } else {
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        _classPrivateFieldLooseBase(this, _resizeObserver)[_resizeObserver] = new ResizeObserver(_classPrivateFieldLooseBase(this, _onResize)[_onResize]);
        _classPrivateFieldLooseBase(this, _resizeObserver)[_resizeObserver].observe(this.element);
      }
    }
    var _proto = ObservedElement.prototype;
    _proto.destroy = function destroy() {
      window.removeEventListener('resize', this.onWindowResize);
      _classPrivateFieldLooseBase(this, _resizeObserver)[_resizeObserver].disconnect();
    };
    return ObservedElement;
  }();

  var _wheelMultiplier = /*#__PURE__*/_classPrivateFieldLooseKey("wheelMultiplier");
  var _touchMultiplier = /*#__PURE__*/_classPrivateFieldLooseKey("touchMultiplier");
  var _normalizeWheel = /*#__PURE__*/_classPrivateFieldLooseKey("normalizeWheel");
  var _touchStart = /*#__PURE__*/_classPrivateFieldLooseKey("touchStart");
  var _emitter$1 = /*#__PURE__*/_classPrivateFieldLooseKey("emitter");
  var _onTouchStart = /*#__PURE__*/_classPrivateFieldLooseKey("onTouchStart");
  var _onTouchMove = /*#__PURE__*/_classPrivateFieldLooseKey("onTouchMove");
  var _onWheel = /*#__PURE__*/_classPrivateFieldLooseKey("onWheel");
  var VirtualScroll = /*#__PURE__*/function () {
    function VirtualScroll(element, _ref) {
      var _this = this;
      var _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? 1 : _ref$wheelMultiplier,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 2 : _ref$touchMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? false : _ref$normalizeWheel;
      Object.defineProperty(this, _wheelMultiplier, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _touchMultiplier, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _normalizeWheel, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _touchStart, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _emitter$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _onTouchStart, {
        writable: true,
        value: function value(event) {
          var _ref2 = event.targetTouches ? event.targetTouches[0] : event,
            pageX = _ref2.pageX,
            pageY = _ref2.pageY;
          _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].x = pageX;
          _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].y = pageY;
        }
      });
      Object.defineProperty(this, _onTouchMove, {
        writable: true,
        value: function value(event) {
          var _ref3 = event.targetTouches ? event.targetTouches[0] : event,
            pageX = _ref3.pageX,
            pageY = _ref3.pageY;
          var deltaX = -(pageX - _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].x) * _classPrivateFieldLooseBase(_this, _touchMultiplier)[_touchMultiplier];
          var deltaY = -(pageY - _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].y) * _classPrivateFieldLooseBase(_this, _touchMultiplier)[_touchMultiplier];
          _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].x = pageX;
          _classPrivateFieldLooseBase(_this, _touchStart)[_touchStart].y = pageY;
          _classPrivateFieldLooseBase(_this, _emitter$1)[_emitter$1].emit('scroll', {
            type: 'touch',
            deltaX: deltaX,
            deltaY: deltaY,
            event: event
          });
        }
      });
      Object.defineProperty(this, _onWheel, {
        writable: true,
        value: function value(event) {
          var deltaX = event.deltaX,
            deltaY = event.deltaY;
          if (_classPrivateFieldLooseBase(_this, _normalizeWheel)[_normalizeWheel]) {
            deltaX = clamp(-100, deltaX, 100);
            deltaY = clamp(-100, deltaY, 100);
          }
          deltaX *= _classPrivateFieldLooseBase(_this, _wheelMultiplier)[_wheelMultiplier];
          deltaY *= _classPrivateFieldLooseBase(_this, _wheelMultiplier)[_wheelMultiplier];
          _classPrivateFieldLooseBase(_this, _emitter$1)[_emitter$1].emit('scroll', {
            type: 'wheel',
            deltaX: deltaX,
            deltaY: deltaY,
            event: event
          });
        }
      });
      this.element = element;
      _classPrivateFieldLooseBase(this, _wheelMultiplier)[_wheelMultiplier] = wheelMultiplier;
      _classPrivateFieldLooseBase(this, _touchMultiplier)[_touchMultiplier] = touchMultiplier;
      _classPrivateFieldLooseBase(this, _normalizeWheel)[_normalizeWheel] = normalizeWheel;
      _classPrivateFieldLooseBase(this, _touchStart)[_touchStart] = {
        x: null,
        y: null
      };
      _classPrivateFieldLooseBase(this, _emitter$1)[_emitter$1] = createNanoEvents();
      this.element.addEventListener('wheel', _classPrivateFieldLooseBase(this, _onWheel)[_onWheel], {
        passive: false
      });
      this.element.addEventListener('touchstart', _classPrivateFieldLooseBase(this, _onTouchStart)[_onTouchStart], {
        passive: false
      });
      this.element.addEventListener('touchmove', _classPrivateFieldLooseBase(this, _onTouchMove)[_onTouchMove], {
        passive: false
      });
    }
    var _proto = VirtualScroll.prototype;
    _proto.on = function on(event, callback) {
      return _classPrivateFieldLooseBase(this, _emitter$1)[_emitter$1].on(event, callback);
    };
    _proto.destroy = function destroy() {
      _classPrivateFieldLooseBase(this, _emitter$1)[_emitter$1].events = {};
      this.element.removeEventListener('wheel', _classPrivateFieldLooseBase(this, _onWheel)[_onWheel], {
        passive: false
      });
      this.element.removeEventListener('touchstart', _classPrivateFieldLooseBase(this, _onTouchStart)[_onTouchStart], {
        passive: false
      });
      this.element.removeEventListener('touchmove', _classPrivateFieldLooseBase(this, _onTouchMove)[_onTouchMove], {
        passive: false
      });
    };
    return VirtualScroll;
  }();

  var _options = /*#__PURE__*/_classPrivateFieldLooseKey("options");
  var _wrapper = /*#__PURE__*/_classPrivateFieldLooseKey("wrapper");
  var _content = /*#__PURE__*/_classPrivateFieldLooseKey("content");
  var _animate = /*#__PURE__*/_classPrivateFieldLooseKey("animate");
  var _emitter = /*#__PURE__*/_classPrivateFieldLooseKey("emitter");
  var _virtualScroll = /*#__PURE__*/_classPrivateFieldLooseKey("virtualScroll");
  var _time = /*#__PURE__*/_classPrivateFieldLooseKey("time");
  var _velocity = /*#__PURE__*/_classPrivateFieldLooseKey("velocity");
  var _direction = /*#__PURE__*/_classPrivateFieldLooseKey("direction");
  var _animatedScroll = /*#__PURE__*/_classPrivateFieldLooseKey("animatedScroll");
  var _targetScroll = /*#__PURE__*/_classPrivateFieldLooseKey("targetScroll");
  var _isScrolling = /*#__PURE__*/_classPrivateFieldLooseKey("_isScrolling");
  var _isStopped = /*#__PURE__*/_classPrivateFieldLooseKey("_isStopped");
  var _isSmooth = /*#__PURE__*/_classPrivateFieldLooseKey("_isSmooth");
  var _isLocked = /*#__PURE__*/_classPrivateFieldLooseKey("isLocked");
  var _setScroll = /*#__PURE__*/_classPrivateFieldLooseKey("setScroll");
  var _onVirtualScroll = /*#__PURE__*/_classPrivateFieldLooseKey("onVirtualScroll");
  var _onScroll = /*#__PURE__*/_classPrivateFieldLooseKey("onScroll");
  var _classElement = /*#__PURE__*/_classPrivateFieldLooseKey("classElement");
  var _actualScroll = /*#__PURE__*/_classPrivateFieldLooseKey("actualScroll");
  var _isSmooth2 = /*#__PURE__*/_classPrivateFieldLooseKey("isSmooth");
  var _isScrolling2 = /*#__PURE__*/_classPrivateFieldLooseKey("isScrolling");
  var _isStopped2 = /*#__PURE__*/_classPrivateFieldLooseKey("isStopped");
  var Lenis = /*#__PURE__*/function () {
    // element with hidden overflow
    // wrapper direct child with scrollable content

    // value used for animation
    // value to reach
    // true when scroll is animated programatically
    // true if user should not be able to scroll - enable/disable programatically
    // true if scroll shoul be animated
    // same as isStopped - enable/disable when scroll reaches target

    /**
     * @typedef {(t: number) => number} EasingFunction
     * @typedef {'vertical' | 'horizontal'} Orientation
     * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
     *
     * @typedef LenisOptions
     * @property {Orientation} [direction]
     * @property {GestureOrientation} [gestureDirection]
     * @property {number} [mouseMultiplier]
     * @property {boolean} [smooth]
     *
     * @property {Window | HTMLElement} [wrapper]
     * @property {HTMLElement} [content]
     * @property {boolean} [smoothWheel]
     * @property {boolean} [smoothTouch]
     * @property {number} [duration]
     * @property {EasingFunction} [easing]
     * @property {number} [lerp]
     * @property {boolean} [infinite]
     * @property {Orientation} [orientation]
     * @property {GestureOrientation} [gestureOrientation]
     * @property {number} [touchMultiplier]
     * @property {number} [wheelMultiplier]
     * @property {number} [normalizeWheel]
     *
     * @param {LenisOptions}
     */
    function Lenis(_temp) {
      var _this = this;
      var _ref = _temp === void 0 ? {} : _temp,
        direction = _ref.direction,
        gestureDirection = _ref.gestureDirection,
        mouseMultiplier = _ref.mouseMultiplier,
        smooth = _ref.smooth,
        _ref$wrapper = _ref.wrapper,
        wrapper = _ref$wrapper === void 0 ? window : _ref$wrapper,
        _ref$content = _ref.content,
        content = _ref$content === void 0 ? document.documentElement : _ref$content,
        _ref$smoothWheel = _ref.smoothWheel,
        smoothWheel = _ref$smoothWheel === void 0 ? smooth != null ? smooth : true : _ref$smoothWheel,
        _ref$smoothTouch = _ref.smoothTouch,
        smoothTouch = _ref$smoothTouch === void 0 ? false : _ref$smoothTouch,
        duration = _ref.duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        } : _ref$easing,
        _ref$lerp = _ref.lerp,
        lerp = _ref$lerp === void 0 ? duration ? null : 0.1 : _ref$lerp,
        _ref$infinite = _ref.infinite,
        infinite = _ref$infinite === void 0 ? false : _ref$infinite,
        _ref$orientation = _ref.orientation,
        orientation = _ref$orientation === void 0 ? direction != null ? direction : 'vertical' : _ref$orientation,
        _ref$gestureOrientati = _ref.gestureOrientation,
        gestureOrientation = _ref$gestureOrientati === void 0 ? gestureDirection != null ? gestureDirection : 'vertical' : _ref$gestureOrientati,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 2 : _ref$touchMultiplier,
        _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? mouseMultiplier != null ? mouseMultiplier : 1 : _ref$wheelMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? true : _ref$normalizeWheel;
      Object.defineProperty(this, _isStopped2, {
        get: void 0,
        set: _set_isStopped
      });
      Object.defineProperty(this, _isScrolling2, {
        get: void 0,
        set: _set_isScrolling
      });
      Object.defineProperty(this, _isSmooth2, {
        get: void 0,
        set: _set_isSmooth
      });
      Object.defineProperty(this, _actualScroll, {
        get: _get_actualScroll,
        set: void 0
      });
      Object.defineProperty(this, _classElement, {
        get: _get_classElement,
        set: void 0
      });
      Object.defineProperty(this, _setScroll, {
        value: _setScroll2
      });
      Object.defineProperty(this, _options, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _wrapper, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _content, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _animate, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _emitter, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _virtualScroll, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _time, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _velocity, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _direction, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _animatedScroll, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _targetScroll, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isScrolling, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isStopped, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isSmooth, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isLocked, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _onVirtualScroll, {
        writable: true,
        value: function value(_ref2) {
          var type = _ref2.type,
            deltaX = _ref2.deltaX,
            deltaY = _ref2.deltaY,
            event = _ref2.event;
          // keep zoom feature
          if (event.ctrlKey) return;

          // keep previous/next page gesture on trackpads
          if (_classPrivateFieldLooseBase(_this, _options)[_options].gestureOrientation === 'vertical' && deltaY === 0 || _classPrivateFieldLooseBase(_this, _options)[_options].gestureOrientation === 'horizontal' && deltaX === 0) return;

          // catch if scrolling on nested scroll elements
          if (!!event.composedPath().find(function (node) {
            return node == null ? void 0 : node.hasAttribute == null ? void 0 : node.hasAttribute('data-lenis-prevent');
          })) return;
          if (_this.isStopped || _classPrivateFieldLooseBase(_this, _isLocked)[_isLocked]) {
            event.preventDefault();
            return;
          }
          _classPrivateFieldLooseBase(_this, _isSmooth2)[_isSmooth2] = _classPrivateFieldLooseBase(_this, _options)[_options].smoothTouch && type === 'touch' || _classPrivateFieldLooseBase(_this, _options)[_options].smoothWheel && type === 'wheel';
          if (!_this.isSmooth) return;
          event.preventDefault();
          var delta = deltaY;
          if (_classPrivateFieldLooseBase(_this, _options)[_options].gestureOrientation === 'both') {
            delta = deltaX + deltaY;
          } else if (_classPrivateFieldLooseBase(_this, _options)[_options].gestureOrientation === 'horizontal') {
            delta = deltaX;
          }
          _this.scrollTo(_classPrivateFieldLooseBase(_this, _targetScroll)[_targetScroll] + delta, {}, false);
        }
      });
      Object.defineProperty(this, _onScroll, {
        writable: true,
        value: function value() {
          if (!_this.isScrolling) {
            var lastScroll = _classPrivateFieldLooseBase(_this, _animatedScroll)[_animatedScroll];
            _classPrivateFieldLooseBase(_this, _animatedScroll)[_animatedScroll] = _classPrivateFieldLooseBase(_this, _targetScroll)[_targetScroll] = _classPrivateFieldLooseBase(_this, _actualScroll)[_actualScroll];
            _classPrivateFieldLooseBase(_this, _velocity)[_velocity] = 0;
            _classPrivateFieldLooseBase(_this, _direction)[_direction] = Math.sign(_classPrivateFieldLooseBase(_this, _animatedScroll)[_animatedScroll] - lastScroll);
            _this.emit();
          }
        }
      });
      // warn about legacy options
      if (direction) {
        console.warn('Lenis: `direction` option is deprecated, use `orientation` instead');
      }
      if (gestureDirection) {
        console.warn('Lenis: `gestureDirection` option is deprecated, use `gestureOrientation` instead');
      }
      if (mouseMultiplier) {
        console.warn('Lenis: `mouseMultiplier` option is deprecated, use `wheelMultiplier` instead');
      }
      if (smooth) {
        console.warn('Lenis: `smooth` option is deprecated, use `smoothWheel` instead');
      }
      window.lenisVersion = version;

      // if wrapper is html or body, fallback to window
      if (wrapper === document.documentElement || wrapper === document.body) {
        wrapper = window;
      }
      _classPrivateFieldLooseBase(this, _options)[_options] = {
        wrapper: wrapper,
        content: content,
        smoothWheel: smoothWheel,
        smoothTouch: smoothTouch,
        duration: duration,
        easing: easing,
        lerp: lerp,
        infinite: infinite,
        gestureOrientation: gestureOrientation,
        orientation: orientation,
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel
      };
      _classPrivateFieldLooseBase(this, _wrapper)[_wrapper] = new ObservedElement(wrapper);
      _classPrivateFieldLooseBase(this, _content)[_content] = new ObservedElement(content);
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].classList.add('lenis');
      _classPrivateFieldLooseBase(this, _velocity)[_velocity] = 0;
      _classPrivateFieldLooseBase(this, _isStopped2)[_isStopped2] = false;
      _classPrivateFieldLooseBase(this, _isSmooth2)[_isSmooth2] = smoothWheel || smoothTouch;
      _classPrivateFieldLooseBase(this, _isScrolling2)[_isScrolling2] = false;
      _classPrivateFieldLooseBase(this, _targetScroll)[_targetScroll] = _classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll] = _classPrivateFieldLooseBase(this, _actualScroll)[_actualScroll];
      _classPrivateFieldLooseBase(this, _animate)[_animate] = new Animate();
      _classPrivateFieldLooseBase(this, _emitter)[_emitter] = createNanoEvents();
      _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element.addEventListener('scroll', _classPrivateFieldLooseBase(this, _onScroll)[_onScroll], {
        passive: false
      });
      _classPrivateFieldLooseBase(this, _virtualScroll)[_virtualScroll] = new VirtualScroll(wrapper, {
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel
      });
      _classPrivateFieldLooseBase(this, _virtualScroll)[_virtualScroll].on('scroll', _classPrivateFieldLooseBase(this, _onVirtualScroll)[_onVirtualScroll]);
    }
    var _proto = Lenis.prototype;
    _proto.destroy = function destroy() {
      _classPrivateFieldLooseBase(this, _emitter)[_emitter].events = {};
      _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element.removeEventListener('scroll', _classPrivateFieldLooseBase(this, _onScroll)[_onScroll], {
        passive: false
      });
      _classPrivateFieldLooseBase(this, _virtualScroll)[_virtualScroll].destroy();
    };
    _proto.on = function on(event, callback) {
      return _classPrivateFieldLooseBase(this, _emitter)[_emitter].on(event, callback);
    };
    _proto.emit = function emit() {
      _classPrivateFieldLooseBase(this, _emitter)[_emitter].emit('scroll', this);
    };
    _proto.start = function start() {
      _classPrivateFieldLooseBase(this, _isStopped2)[_isStopped2] = false;
    };
    _proto.stop = function stop() {
      _classPrivateFieldLooseBase(this, _isStopped2)[_isStopped2] = true;
    };
    _proto.raf = function raf(time) {
      var deltaTime = time - (_classPrivateFieldLooseBase(this, _time)[_time] || time);
      _classPrivateFieldLooseBase(this, _time)[_time] = time;
      _classPrivateFieldLooseBase(this, _animate)[_animate].advance(deltaTime * 0.001);
    };
    _proto.scrollTo = function scrollTo(target, _temp2, programmatic // called from outside of the class
    ) {
      var _this2 = this;
      var _ref3 = _temp2 === void 0 ? {} : _temp2,
        _ref3$offset = _ref3.offset,
        offset = _ref3$offset === void 0 ? 0 : _ref3$offset,
        _ref3$immediate = _ref3.immediate,
        immediate = _ref3$immediate === void 0 ? false : _ref3$immediate,
        _ref3$lock = _ref3.lock,
        lock = _ref3$lock === void 0 ? false : _ref3$lock,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === void 0 ? _classPrivateFieldLooseBase(this, _options)[_options].duration : _ref3$duration,
        _ref3$easing = _ref3.easing,
        easing = _ref3$easing === void 0 ? _classPrivateFieldLooseBase(this, _options)[_options].easing : _ref3$easing,
        _ref3$lerp = _ref3.lerp,
        lerp = _ref3$lerp === void 0 ? _classPrivateFieldLooseBase(this, _options)[_options].lerp : _ref3$lerp,
        _onComplete = _ref3.onComplete;
      if (programmatic === void 0) {
        programmatic = true;
      }
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
          if (_classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element !== window) {
            // nested scroll offset correction
            var wrapperRect = _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element.getBoundingClientRect();
            offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
          }
          var rect = node.getBoundingClientRect();
          target = (this.isHorizontal ? rect.left : rect.top) + _classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll];
        }
      }
      if (typeof target !== 'number') return;
      target += offset;
      if (_classPrivateFieldLooseBase(this, _options)[_options].infinite) {
        if (programmatic) {
          _classPrivateFieldLooseBase(this, _targetScroll)[_targetScroll] = _classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll] = this.scroll;
        }
      } else {
        target = clamp(0, target, this.limit);
      }

      // if (this.#scroll === target) {
      if (_classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll] === target) {
        _onComplete == null ? void 0 : _onComplete();
        return;
      }
      if (immediate) {
        _classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll] = _classPrivateFieldLooseBase(this, _targetScroll)[_targetScroll] = target;
        _classPrivateFieldLooseBase(this, _setScroll)[_setScroll](target);
        this.emit();
        _onComplete == null ? void 0 : _onComplete();
        return;
      }
      if (!programmatic) {
        _classPrivateFieldLooseBase(this, _targetScroll)[_targetScroll] = target;
      }
      _classPrivateFieldLooseBase(this, _animate)[_animate].fromTo(_classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll], target, {
        duration: duration,
        easing: easing,
        lerp: lerp,
        onStart: function onStart() {
          // user is scrolling
          if (lock) _classPrivateFieldLooseBase(_this2, _isLocked)[_isLocked] = true;
          _classPrivateFieldLooseBase(_this2, _isScrolling2)[_isScrolling2] = true;
        },
        onUpdate: function onUpdate(value) {
          _classPrivateFieldLooseBase(_this2, _velocity)[_velocity] = value - _classPrivateFieldLooseBase(_this2, _animatedScroll)[_animatedScroll];
          _classPrivateFieldLooseBase(_this2, _direction)[_direction] = Math.sign(_classPrivateFieldLooseBase(_this2, _velocity)[_velocity]);
          _classPrivateFieldLooseBase(_this2, _animatedScroll)[_animatedScroll] = value;
          _classPrivateFieldLooseBase(_this2, _setScroll)[_setScroll](value);
          if (programmatic) {
            // fix velocity during programmatic scrollTo
            // wheel during programmatic should stop it
            _classPrivateFieldLooseBase(_this2, _targetScroll)[_targetScroll] = value;
          }
          _this2.emit();
        },
        onComplete: function onComplete(value) {
          // user is not scrolling anymore
          if (lock) _classPrivateFieldLooseBase(_this2, _isLocked)[_isLocked] = false;
          requestAnimationFrame(function () {
            _classPrivateFieldLooseBase(_this2, _isScrolling2)[_isScrolling2] = false;
          });
          _classPrivateFieldLooseBase(_this2, _velocity)[_velocity] = 0;
          _this2.emit();
          _onComplete == null ? void 0 : _onComplete();
        }
      });
    };
    _createClass(Lenis, [{
      key: "options",
      get: function get() {
        return _extends({}, _classPrivateFieldLooseBase(this, _options)[_options]);
      }
    }, {
      key: "limit",
      get: function get() {
        return this.isHorizontal ? _classPrivateFieldLooseBase(this, _content)[_content].width - _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].width : _classPrivateFieldLooseBase(this, _content)[_content].height - _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].height;
      }
    }, {
      key: "isHorizontal",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _options)[_options].orientation === 'horizontal';
      }
    }, {
      key: "scroll",
      get: function get() {
        return clampedModulo(_classPrivateFieldLooseBase(this, _animatedScroll)[_animatedScroll], this.limit);
      }
    }, {
      key: "progress",
      get: function get() {
        return this.scroll / this.limit;
      }
    }, {
      key: "velocity",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _velocity)[_velocity];
      }
    }, {
      key: "direction",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _direction)[_direction];
      }
    }, {
      key: "isSmooth",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _isSmooth)[_isSmooth];
      }
    }, {
      key: "isScrolling",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _isScrolling)[_isScrolling];
      }
    }, {
      key: "isStopped",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _isStopped)[_isStopped];
      }
    }]);
    return Lenis;
  }();
  function _setScroll2(scroll) {
    if (_classPrivateFieldLooseBase(this, _options)[_options].infinite) {
      scroll = this.scroll;
    }

    // apply scroll value immediately
    if (this.isHorizontal) {
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].scrollLeft = scroll;
    } else {
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].scrollTop = scroll;
    }
  }
  function _get_classElement() {
    return _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element === window ? _classPrivateFieldLooseBase(this, _content)[_content].element : _classPrivateFieldLooseBase(this, _wrapper)[_wrapper].element;
  }
  function _get_actualScroll() {
    // value browser takes into account
    return _classPrivateFieldLooseBase(this, _classElement)[_classElement].scrollTop;
  }
  function _set_isSmooth(value) {
    if (_classPrivateFieldLooseBase(this, _isSmooth)[_isSmooth] !== value) {
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].classList.toggle('lenis-smooth', value);
    }
    _classPrivateFieldLooseBase(this, _isSmooth)[_isSmooth] = value;
  }
  function _set_isScrolling(value) {
    if (_classPrivateFieldLooseBase(this, _isScrolling)[_isScrolling] !== value) {
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].classList.toggle('lenis-scrolling', value);
    }
    _classPrivateFieldLooseBase(this, _isScrolling)[_isScrolling] = value;
  }
  function _set_isStopped(value) {
    if (_classPrivateFieldLooseBase(this, _isStopped)[_isStopped] !== value) {
      _classPrivateFieldLooseBase(this, _classElement)[_classElement].classList.toggle('lenis-stopped', value);
    }
    _classPrivateFieldLooseBase(this, _isStopped)[_isStopped] = value;
  }

  return Lenis;

}));
