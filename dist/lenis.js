(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Lenis = factory());
})(this, (function () { 'use strict';

  var version = "1.1.9";

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

  class Animate {
      constructor() {
          this.isRunning = false;
          this.value = 0;
          this.from = 0;
          this.to = 0;
          this.duration = 0;
          this.currentTime = 0;
      }
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
              this.value = this.to;
              completed = true;
          }
          if (completed) {
              this.stop();
          }
          (_a = this.onUpdate) === null || _a === void 0 ? void 0 : _a.call(this, this.value, completed);
      }
      stop() {
          this.isRunning = false;
      }
      fromTo(from, to, { lerp, duration, easing, onStart, onUpdate, }) {
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
      constructor({ wrapper, content, autoResize = true, debounce: debounceValue = 250, } = {}) {
          this.width = 0;
          this.height = 0;
          this.scrollWidth = 0;
          this.scrollHeight = 0;
          this.resize = () => {
              this.onWrapperResize();
              this.onContentResize();
          };
          this.onWrapperResize = () => {
              if (this.wrapper === window) {
                  this.width = window.innerWidth;
                  this.height = window.innerHeight;
              }
              else if (this.wrapper instanceof HTMLElement) {
                  this.width = this.wrapper.clientWidth;
                  this.height = this.wrapper.clientHeight;
              }
          };
          this.onContentResize = () => {
              if (this.wrapper === window) {
                  this.scrollHeight = this.content.scrollHeight;
                  this.scrollWidth = this.content.scrollWidth;
              }
              else if (this.wrapper instanceof HTMLElement) {
                  this.scrollHeight = this.wrapper.scrollHeight;
                  this.scrollWidth = this.wrapper.scrollWidth;
              }
          };
          this.wrapper = wrapper;
          this.content = content;
          if (autoResize) {
              this.debouncedResize = debounce(this.resize, debounceValue);
              if (this.wrapper === window) {
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
          window.removeEventListener('resize', this.debouncedResize, false);
      }
      get limit() {
          return {
              x: this.scrollWidth - this.width,
              y: this.scrollHeight - this.height,
          };
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
      on(event, callback) {
          var _a;
          ((_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.push(callback)) || (this.events[event] = [callback]);
          return () => {
              var _a;
              this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => callback !== i);
          };
      }
      off(event, callback) {
          var _a;
          this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => callback !== i);
      }
      destroy() {
          this.events = {};
      }
  }

  const LINE_HEIGHT = 100 / 6;
  class VirtualScroll {
      constructor(element, { wheelMultiplier = 1, touchMultiplier = 1 }) {
          this.lastDelta = {
              x: 0,
              y: 0,
          };
          this.windowWidth = 0;
          this.windowHeight = 0;
          this.onTouchStart = (event) => {
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
          this.onTouchMove = (event) => {
              var _a, _b, _c, _d;
              const { clientX, clientY } = event.targetTouches
                  ? event.targetTouches[0]
                  : event;
              const deltaX = -(clientX - ((_b = (_a = this.touchStart) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0)) * this.touchMultiplier;
              const deltaY = -(clientY - ((_d = (_c = this.touchStart) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0)) * this.touchMultiplier;
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
          this.onWheel = (event) => {
              let { deltaX, deltaY, deltaMode } = event;
              const multiplierX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowWidth : 1;
              const multiplierY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.windowHeight : 1;
              deltaX *= multiplierX;
              deltaY *= multiplierY;
              deltaX *= this.wheelMultiplier;
              deltaY *= this.wheelMultiplier;
              this.emitter.emit('scroll', { deltaX, deltaY, event });
          };
          this.onWindowResize = () => {
              this.windowWidth = window.innerWidth;
              this.windowHeight = window.innerHeight;
          };
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
          this.element.addEventListener('wheel', this.onWheel, {
              passive: false,
          });
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
      on(event, callback) {
          return this.emitter.on(event, callback);
      }
      destroy() {
          this.emitter.destroy();
          window.removeEventListener('resize', this.onWindowResize, false);
          this.element.removeEventListener('wheel', this.onWheel);
          this.element.removeEventListener('touchstart', this.onTouchStart);
          this.element.removeEventListener('touchmove', this.onTouchMove);
          this.element.removeEventListener('touchend', this.onTouchEnd);
      }
  }

  class Lenis {
      constructor({ wrapper = window, content = document.documentElement, wheelEventsTarget = wrapper, eventsTarget = wheelEventsTarget, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaMultiplier = 35, duration, easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp = 0.1, infinite = false, orientation = 'vertical', gestureOrientation = 'vertical', touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, __experimental__naiveDimensions = false, } = {}) {
          this.__isScrolling = false;
          this.__isStopped = false;
          this.__isLocked = false;
          this.userData = {};
          this.lastVelocity = 0;
          this.velocity = 0;
          this.direction = 0;
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
              if (event.ctrlKey)
                  return;
              const isTouch = event.type.includes('touch');
              const isWheel = event.type.includes('wheel');
              this.isTouching = event.type === 'touchstart' || event.type === 'touchmove';
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
              const prevent = this.options.prevent;
              if (!!composedPath.find((node) => {
                  var _a, _b, _c, _d, _e;
                  return node instanceof Element &&
                      ((typeof prevent === 'function' && (prevent === null || prevent === void 0 ? void 0 : prevent(node))) ||
                          ((_a = node.hasAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'data-lenis-prevent')) ||
                          (isTouch && ((_b = node.hasAttribute) === null || _b === void 0 ? void 0 : _b.call(node, 'data-lenis-prevent-touch'))) ||
                          (isWheel && ((_c = node.hasAttribute) === null || _c === void 0 ? void 0 : _c.call(node, 'data-lenis-prevent-wheel'))) ||
                          (((_d = node.classList) === null || _d === void 0 ? void 0 : _d.contains('lenis')) &&
                              !((_e = node.classList) === null || _e === void 0 ? void 0 : _e.contains('lenis-stopped'))));
              }))
                  return;
              if (this.isStopped || this.isLocked) {
                  event.preventDefault();
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
              clearTimeout(this.__resetVelocityTimeout);
              delete this.__resetVelocityTimeout;
              if (this.__preventNextNativeScrollEvent) {
                  delete this.__preventNextNativeScrollEvent;
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
                      this.__resetVelocityTimeout = setTimeout(() => {
                          this.lastVelocity = this.velocity;
                          this.velocity = 0;
                          this.isScrolling = false;
                          this.emit();
                      }, 400);
                  }
              }
          };
          window.lenisVersion = version;
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
              prevent,
              virtualScroll,
              __experimental__naiveDimensions,
          };
          this.animate = new Animate();
          this.emitter = new Emitter();
          this.dimensions = new Dimensions({ wrapper, content, autoResize });
          this.updateClassName();
          this.userData = {};
          this.time = 0;
          this.velocity = this.lastVelocity = 0;
          this.isLocked = false;
          this.isStopped = false;
          this.isScrolling = false;
          this.targetScroll = this.animatedScroll = this.actualScroll;
          this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
          this.options.wrapper.addEventListener('pointerdown', this.onPointerDown, false);
          this.virtualScroll = new VirtualScroll(eventsTarget, {
              touchMultiplier,
              wheelMultiplier,
          });
          this.virtualScroll.on('scroll', this.onVirtualScroll);
      }
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
          this.lastVelocity = this.velocity = 0;
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
      scrollTo(target, { offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp = this.options.lerp, onStart, onComplete, force = false, programmatic = true, userData = {}, } = {}) {
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
              else if (target instanceof HTMLElement && (target === null || target === void 0 ? void 0 : target.nodeType)) {
                  node = target;
              }
              if (node) {
                  if (this.options.wrapper !== window) {
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
          this.userData = userData;
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
                  if (lock)
                      this.isLocked = true;
                  this.isScrolling = 'smooth';
                  onStart === null || onStart === void 0 ? void 0 : onStart(this);
              },
              onUpdate: (value, completed) => {
                  this.isScrolling = 'smooth';
                  this.lastVelocity = this.velocity;
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
                      this.userData = {};
                      this.preventNextNativeScrollEvent();
                  }
              },
          });
      }
      preventNextNativeScrollEvent() {
          this.__preventNextNativeScrollEvent = true;
          requestAnimationFrame(() => {
              delete this.__preventNextNativeScrollEvent;
          });
      }
      get rootElement() {
          return (this.options.wrapper === window
              ? document.documentElement
              : this.options.wrapper);
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
              ? modulo(this.animatedScroll, this.limit)
              : this.animatedScroll;
      }
      get progress() {
          return this.limit === 0 ? 1 : this.scroll / this.limit;
      }
      get isScrolling() {
          return this.__isScrolling;
      }
      set isScrolling(value) {
          if (this.__isScrolling !== value) {
              this.__isScrolling = value;
              this.updateClassName();
          }
      }
      get isStopped() {
          return this.__isStopped;
      }
      set isStopped(value) {
          if (this.__isStopped !== value) {
              this.__isStopped = value;
              this.updateClassName();
          }
      }
      get isLocked() {
          return this.__isLocked;
      }
      set isLocked(value) {
          if (this.__isLocked !== value) {
              this.__isLocked = value;
              this.updateClassName();
          }
      }
      get isSmooth() {
          return this.isScrolling === 'smooth';
      }
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

  return Lenis;

}));
//# sourceMappingURL=lenis.js.map
