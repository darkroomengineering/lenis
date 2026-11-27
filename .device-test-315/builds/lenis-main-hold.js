// package.json
var version = "1.3.29";

// packages/core/src/maths.ts
function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max));
}
function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}
function damp(x, y, lambda, deltaTime) {
  return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
}
function modulo(n, d) {
  return (n % d + d) % d;
}

// packages/core/src/animate.ts
var EPSILON = 0.5;

class Animate {
  isRunning = false;
  value = 0;
  from = 0;
  to = 0;
  currentTime = 0;
  lerp;
  duration;
  easing;
  onUpdate;
  advance(deltaTime) {
    if (!this.isRunning)
      return;
    let completed = false;
    if (this.duration && this.easing) {
      this.currentTime += deltaTime;
      const linearProgress = clamp(0, this.currentTime / this.duration, 1);
      completed = linearProgress >= 1;
      const easedProgress = completed ? 1 : this.easing(linearProgress);
      this.value = this.from + (this.to - this.from) * easedProgress;
    } else if (this.lerp) {
      this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
      if (Math.abs(this.to - this.value) < EPSILON) {
        this.value = this.to;
        completed = true;
      }
    } else {
      this.value = this.to;
      completed = true;
    }
    if (completed) {
      this.stop();
    }
    this.onUpdate?.(this.value, completed);
  }
  stop() {
    this.isRunning = false;
  }
  fromTo(from, to, { lerp, duration, easing, onStart, onUpdate }) {
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

// packages/core/src/debounce.ts
function debounce(callback, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      callback.apply(this, args);
    }, delay);
  };
}

// packages/core/src/dimensions.ts
class Dimensions {
  wrapper;
  content;
  width = 0;
  height = 0;
  scrollHeight = 0;
  scrollWidth = 0;
  debouncedResize;
  wrapperResizeObserver;
  contentResizeObserver;
  constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
    this.wrapper = wrapper;
    this.content = content;
    if (autoResize) {
      this.debouncedResize = debounce(this.resize, debounceValue);
      if (this.wrapper instanceof Window) {
        window.addEventListener("resize", this.debouncedResize);
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
    if (this.wrapper === window && this.debouncedResize) {
      window.removeEventListener("resize", this.debouncedResize);
    }
  }
  resize = () => {
    this.onWrapperResize();
    this.onContentResize();
  };
  onWrapperResize = () => {
    if (this.wrapper instanceof Window) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else {
      this.width = this.wrapper.clientWidth;
      this.height = this.wrapper.clientHeight;
    }
  };
  onContentResize = () => {
    if (this.wrapper instanceof Window) {
      this.scrollHeight = this.content.scrollHeight;
      this.scrollWidth = this.content.scrollWidth;
    } else {
      this.scrollHeight = this.wrapper.scrollHeight;
      this.scrollWidth = this.wrapper.scrollWidth;
    }
  };
  get limit() {
    return {
      x: this.scrollWidth - this.width,
      y: this.scrollHeight - this.height
    };
  }
}

// packages/core/src/emitter.ts
class Emitter {
  events = {};
  emit(event, ...args) {
    const callbacks = this.events[event] || [];
    for (let i = 0, length = callbacks.length;i < length; i++) {
      callbacks[i]?.(...args);
    }
  }
  on(event, cb) {
    if (this.events[event]) {
      this.events[event].push(cb);
    } else {
      this.events[event] = [cb];
    }
    return () => {
      this.events[event] = this.events[event]?.filter((i) => cb !== i);
    };
  }
  off(event, callback) {
    this.events[event] = this.events[event]?.filter((i) => callback !== i);
  }
  destroy() {
    this.events = {};
  }
}

// packages/core/src/virtual-scroll.ts
var LINE_HEIGHT = 100 / 6;
var listenerOptions = { passive: false };
function getDeltaMultiplier(deltaMode, size) {
  if (deltaMode === 1)
    return LINE_HEIGHT;
  if (deltaMode === 2)
    return size;
  return 1;
}

class VirtualScroll {
  element;
  options;
  touchStart = {
    x: 0,
    y: 0
  };
  lastDelta = {
    x: 0,
    y: 0
  };
  window = {
    width: 0,
    height: 0
  };
  emitter = new Emitter;
  constructor(element, options = { wheelMultiplier: 1, touchMultiplier: 1 }) {
    this.element = element;
    this.options = options;
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();
    this.element.addEventListener("wheel", this.onWheel, listenerOptions);
    this.element.addEventListener("touchstart", this.onTouchStart, listenerOptions);
    this.element.addEventListener("touchmove", this.onTouchMove, listenerOptions);
    this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
  }
  on(event, callback) {
    return this.emitter.on(event, callback);
  }
  destroy() {
    this.emitter.destroy();
    window.removeEventListener("resize", this.onWindowResize);
    this.element.removeEventListener("wheel", this.onWheel, listenerOptions);
    this.element.removeEventListener("touchstart", this.onTouchStart, listenerOptions);
    this.element.removeEventListener("touchmove", this.onTouchMove, listenerOptions);
    this.element.removeEventListener("touchend", this.onTouchEnd, listenerOptions);
  }
  onTouchStart = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: 0,
      y: 0
    };
    this.emitter.emit("scroll", {
      deltaX: 0,
      deltaY: 0,
      event
    });
  };
  onTouchMove = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
    const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: deltaX,
      y: deltaY
    };
    this.emitter.emit("scroll", {
      deltaX,
      deltaY,
      event
    });
  };
  onTouchEnd = (event) => {
    this.emitter.emit("scroll", {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      event
    });
  };
  onWheel = (event) => {
    let { deltaX, deltaY, deltaMode } = event;
    const multiplierX = getDeltaMultiplier(deltaMode, this.window.width);
    const multiplierY = getDeltaMultiplier(deltaMode, this.window.height);
    deltaX *= multiplierX;
    deltaY *= multiplierY;
    deltaX *= this.options.wheelMultiplier;
    deltaY *= this.options.wheelMultiplier;
    this.emitter.emit("scroll", { deltaX, deltaY, event });
  };
  onWindowResize = () => {
    this.window = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
}

// packages/core/src/lenis.ts
var defaultEasing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
var instancesRegistry = new WeakMap;

class Lenis {
  _isScrolling = false;
  _isStopped = false;
  _isLocked = false;
  _preventNextNativeScrollEvent = false;
  _resetVelocityTimeout = null;
  _rafId = null;
  _isDraggingSelection = false;
  _isNativePanning = false;
  _isHeldByNativePan = false;
  nestedInstances = new Set;
  _nestedSweepFrame = 0;
  _isAdopted = false;
  reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  isTouching;
  isIos;
  time = 0;
  userData = {};
  lastVelocity = 0;
  velocity = 0;
  direction = 0;
  options;
  targetScroll;
  animatedScroll;
  animate = new Animate;
  emitter = new Emitter;
  dimensions;
  virtualScroll;
  static get(element) {
    return instancesRegistry.get(element);
  }
  constructor({
    wrapper = window,
    content = document.documentElement,
    eventsTarget = wrapper,
    smoothWheel = true,
    syncTouch = false,
    syncTouchLerp = 0.075,
    touchInertiaExponent = 1.7,
    duration,
    easing,
    lerp = 0.1,
    infinite = false,
    orientation = "vertical",
    gestureOrientation = orientation === "horizontal" ? "both" : "vertical",
    touchMultiplier = 1,
    wheelMultiplier = 1,
    autoResize = true,
    prevent,
    virtualScroll,
    overscroll = true,
    autoRaf = false,
    anchors = false,
    autoToggle = false,
    allowNestedScroll = false,
    __experimental__naiveDimensions = false,
    naiveDimensions = __experimental__naiveDimensions,
    stopInertiaOnNavigate = false,
    respectReducedMotion = true
  } = {}) {
    window.lenisVersion = version;
    if (!window.lenis) {
      window.lenis = {};
    }
    window.lenis.version = version;
    if (orientation === "horizontal") {
      window.lenis.horizontal = true;
    }
    if (syncTouch === true) {
      window.lenis.touch = true;
    }
    this.isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    if (!wrapper || wrapper === document.documentElement) {
      wrapper = window;
    }
    if (typeof duration === "number" && typeof easing !== "function") {
      easing = defaultEasing;
    } else if (typeof easing === "function" && typeof duration !== "number") {
      duration = 1;
    }
    this.options = {
      wrapper,
      content,
      eventsTarget,
      smoothWheel,
      syncTouch,
      syncTouchLerp,
      touchInertiaExponent,
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
      overscroll,
      autoRaf,
      anchors,
      autoToggle,
      allowNestedScroll,
      naiveDimensions,
      stopInertiaOnNavigate,
      respectReducedMotion
    };
    this.dimensions = new Dimensions(wrapper, content, { autoResize });
    this.updateClassName();
    this.targetScroll = this.animatedScroll = this.actualScroll;
    this.options.wrapper.addEventListener("scroll", this.onNativeScroll);
    this.options.wrapper.addEventListener("scrollend", this.onScrollEnd, {
      capture: true
    });
    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener("click", this.onClick);
    }
    this.options.wrapper.addEventListener("pointerdown", this.onPointerDown);
    this.virtualScroll = new VirtualScroll(eventsTarget, {
      touchMultiplier,
      wheelMultiplier
    });
    this.virtualScroll.on("scroll", this.onVirtualScroll);
    if (this.options.autoToggle) {
      this.checkOverflow();
      this.rootElement.addEventListener("transitionend", this.onTransitionEnd);
    }
    instancesRegistry.set(this.rootElement, this);
    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf);
    }
  }
  destroy() {
    for (const child of this.nestedInstances) {
      child.destroy();
    }
    this.nestedInstances.clear();
    if (instancesRegistry.get(this.rootElement) === this) {
      instancesRegistry.delete(this.rootElement);
    }
    this.emitter.destroy();
    this.releaseNativePanHold();
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout);
      this._resetVelocityTimeout = null;
    }
    this.options.wrapper.removeEventListener("scroll", this.onNativeScroll);
    this.options.wrapper.removeEventListener("scrollend", this.onScrollEnd, {
      capture: true
    });
    this.options.wrapper.removeEventListener("pointerdown", this.onPointerDown);
    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.removeEventListener("click", this.onClick);
    }
    if (this.options.autoToggle) {
      this.rootElement.removeEventListener("transitionend", this.onTransitionEnd);
    }
    this.virtualScroll.destroy();
    this.dimensions.destroy();
    this.cleanUpClassName();
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
  }
  on(event, callback) {
    return this.emitter.on(event, callback);
  }
  off(event, callback) {
    return this.emitter.off(event, callback);
  }
  onScrollEnd = (e) => {
    if (!(e instanceof CustomEvent)) {
      if (this.isScrolling === "smooth" || this.isScrolling === false) {
        e.stopPropagation();
      }
    }
  };
  dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(new CustomEvent("scrollend", {
      bubbles: this.options.wrapper === window,
      detail: {
        lenisScrollEnd: true
      }
    }));
  };
  get overflow() {
    const property = this.isHorizontal ? "overflow-x" : "overflow-y";
    return getComputedStyle(this.rootElement)[property];
  }
  checkOverflow() {
    if (["hidden", "clip"].includes(this.overflow)) {
      this.internalStop();
    } else {
      this.internalStart();
    }
  }
  onTransitionEnd = (event) => {
    if (event.propertyName?.includes("overflow") && event.target === this.rootElement) {
      this.checkOverflow();
    }
  };
  setScroll(scroll) {
    if (this.isHorizontal) {
      this.options.wrapper.scrollTo({ left: scroll, behavior: "instant" });
    } else {
      this.options.wrapper.scrollTo({ top: scroll, behavior: "instant" });
    }
  }
  onClick = (event) => {
    const path = event.composedPath();
    const linkElements = path.filter((node) => node instanceof HTMLAnchorElement && node.href);
    const linkElementsUrls = linkElements.map((element) => new URL(element.href));
    const currentUrl = new URL(window.location.href);
    if (this.options.anchors) {
      const anchorElementUrl = linkElementsUrls.find((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname === targetUrl.pathname && targetUrl.hash);
      if (anchorElementUrl) {
        const options = typeof this.options.anchors === "object" && this.options.anchors ? this.options.anchors : undefined;
        const target = decodeURIComponent(anchorElementUrl.hash);
        this.scrollTo(target, options);
        return;
      }
    }
    if (this.options.stopInertiaOnNavigate) {
      const hasPageLinkElementUrl = linkElementsUrls.some((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname !== targetUrl.pathname);
      if (hasPageLinkElementUrl) {
        this.internalReset();
        return;
      }
    }
  };
  onPointerDown = (event) => {
    if (event.button === 1) {
      this.internalReset();
    }
  };
  isTouchOnSelectionHandle(event) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0)
      return false;
    const touch = event.targetTouches[0] ?? event.changedTouches[0];
    if (!touch)
      return false;
    const rects = selection.getRangeAt(0).getClientRects();
    if (rects.length === 0)
      return false;
    const first = rects[0];
    const last = rects[rects.length - 1];
    const HANDLE_RADIUS = 40;
    const nearStart = Math.hypot(touch.clientX - first.left, touch.clientY - first.top) <= HANDLE_RADIUS;
    const nearEnd = Math.hypot(touch.clientX - last.right, touch.clientY - last.bottom) <= HANDLE_RADIUS;
    return nearStart || nearEnd;
  }
  onVirtualScroll = (data) => {
    if (typeof this.options.virtualScroll === "function" && this.options.virtualScroll(data) === false)
      return;
    const { deltaX, deltaY, event } = data;
    this.emitter.emit("virtual-scroll", { deltaX, deltaY, event });
    if (event.ctrlKey)
      return;
    if (event.lenisStopPropagation)
      return;
    const isTouch = event.type.includes("touch");
    const isWheel = event.type.includes("wheel");
    if (isTouch && this.isIos) {
      if (event.type === "touchstart") {
        this._isDraggingSelection = this.isTouchOnSelectionHandle(event);
      }
      if (this._isDraggingSelection) {
        if (event.type === "touchend")
          this._isDraggingSelection = false;
        return;
      }
    }
    this.isTouching = event.type === "touchstart" || event.type === "touchmove";
    if (isTouch && event.type !== "touchmove") {
      this._isNativePanning = false;
    }
    const isClickOrTap = deltaX === 0 && deltaY === 0;
    const isTapToStop = this.options.syncTouch && isTouch && event.type === "touchstart" && isClickOrTap && !this.isStopped && !this.isLocked;
    if (isTapToStop) {
      this.internalReset();
      return;
    }
    const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
    const isSmoothNested = this.options.allowNestedScroll === "smooth";
    if (isClickOrTap) {
      return;
    }
    if (isUnknownGesture && !isSmoothNested) {
      return;
    }
    const gestureOrientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
    if (this._isAdopted && gestureOrientation !== (this.isHorizontal ? "horizontal" : "vertical")) {
      return;
    }
    let composedPath = event.composedPath();
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
    const prevent = this.options.prevent;
    const isPrevented = (node) => typeof prevent === "function" && prevent?.(node) || node.hasAttribute?.("data-lenis-prevent") || gestureOrientation === "vertical" && node.hasAttribute?.("data-lenis-prevent-vertical") || gestureOrientation === "horizontal" && node.hasAttribute?.("data-lenis-prevent-horizontal") || isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || isWheel && node.hasAttribute?.("data-lenis-prevent-wheel");
    const nestedNode = composedPath.find((node) => node instanceof HTMLElement && (isPrevented(node) || this.options.allowNestedScroll && this.hasNestedScroll(node, {
      deltaX,
      deltaY
    })));
    if (nestedNode) {
      if (isSmoothNested && (isWheel && this.options.smoothWheel || isTouch && this.options.syncTouch) && !composedPath.slice(composedPath.indexOf(nestedNode)).some((node) => node instanceof HTMLElement && isPrevented(node)) && this.isNestedAdoptable(nestedNode)) {
        this.adoptNestedScroller(nestedNode, data);
      }
      return;
    }
    if (isUnknownGesture) {
      return;
    }
    if (this.isStopped || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault();
      } else if (event.type === "touchmove" && this.isLocked) {
        this.holdForNativePan();
      }
      return;
    }
    const isSmooth = this.options.syncTouch && isTouch || this.options.smoothWheel && isWheel;
    if (!isSmooth) {
      this._isNativePanning = isTouch && event.type === "touchmove" && !event.cancelable;
      this.isScrolling = "native";
      this.animate.stop();
      this.settleNativeScrollLater();
      event.lenisStopPropagation = true;
      return;
    }
    let delta = deltaY;
    if (this.options.gestureOrientation === "both") {
      delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    } else if (this.options.gestureOrientation === "horizontal") {
      delta = deltaX;
    }
    if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && this.limit > 0 && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && (this._isAdopted ? delta : deltaY) > 0 || this.animatedScroll === this.limit && (this._isAdopted ? delta : deltaY) < 0)) {
      event.lenisStopPropagation = true;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    const isSyncTouch = isTouch && this.options.syncTouch;
    const isTouchEnd = isTouch && event.type === "touchend";
    const hasTouchInertia = isTouchEnd;
    if (hasTouchInertia) {
      delta = Math.sign(delta) * Math.abs(this.velocity) ** this.options.touchInertiaExponent;
    }
    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...isSyncTouch ? {
        lerp: hasTouchInertia ? this.options.syncTouchLerp : 1
      } : {
        lerp: this.options.lerp,
        duration: this.options.duration,
        easing: this.options.easing
      }
    });
  };
  resize() {
    this.sweepNestedInstances();
    this.dimensions.resize();
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.emit();
  }
  emit() {
    this.emitter.emit("scroll", this);
  }
  onNativeScroll = () => {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout);
      this._resetVelocityTimeout = null;
    }
    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false;
      return;
    }
    if (this.isScrolling === false || this.isScrolling === "native" || this._isHeldByNativePan) {
      const lastScroll = this.animatedScroll;
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.lastVelocity = this.velocity;
      this.velocity = this.animatedScroll - lastScroll;
      this.direction = Math.sign(this.animatedScroll - lastScroll);
      if (!this.isStopped && !this._isHeldByNativePan) {
        this.isScrolling = "native";
      }
      this.emit();
      this.settleNativeScrollLater();
    }
  };
  settleNativeScrollLater() {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout);
    }
    this._resetVelocityTimeout = setTimeout(() => {
      this._resetVelocityTimeout = null;
      if (this.isScrolling === "smooth")
        return;
      if (this.isScrolling === false && this.velocity === 0)
        return;
      this.lastVelocity = this.velocity;
      this.velocity = 0;
      this.isScrolling = false;
      this.emit();
    }, 400);
  }
  holdForNativePan() {
    if (this._isHeldByNativePan)
      return;
    this._isHeldByNativePan = true;
    window.addEventListener("touchend", this.onNativePanEnd, true);
    window.addEventListener("touchcancel", this.onNativePanEnd, true);
  }
  releaseNativePanHold() {
    if (!this._isHeldByNativePan)
      return;
    this._isHeldByNativePan = false;
    window.removeEventListener("touchend", this.onNativePanEnd, true);
    window.removeEventListener("touchcancel", this.onNativePanEnd, true);
  }
  onNativePanEnd = (event) => {
    if (event.touches.length > 0)
      return;
    this.releaseNativePanHold();
    if (!this.animate.isRunning)
      return;
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.animate.from = this.animate.value = this.animatedScroll;
    this.animate.currentTime = 0;
  };
  internalReset() {
    this.isLocked = false;
    this.isScrolling = false;
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.lastVelocity = this.velocity = 0;
    this.animate.stop();
  }
  reset() {
    this.internalReset();
    this.emit();
  }
  start() {
    if (!this.isStopped)
      return;
    if (this.options.autoToggle) {
      this.rootElement.style.removeProperty("overflow");
      return;
    }
    this.internalStart();
  }
  internalStart() {
    if (!this.isStopped)
      return;
    this.internalReset();
    this.isStopped = false;
    this.emit();
  }
  stop() {
    if (this.isStopped)
      return;
    if (this.options.autoToggle) {
      this.rootElement.style.setProperty("overflow", "clip");
      return;
    }
    this.internalStop();
  }
  internalStop() {
    if (this.isStopped)
      return;
    this.internalReset();
    this.isStopped = true;
    this.emit();
  }
  raf = (time) => {
    const deltaTime = time - (this.time || time);
    this.time = time;
    if (!this._isHeldByNativePan) {
      this.animate.advance(deltaTime * 0.001);
    }
    if (this.nestedInstances.size > 0) {
      for (const child of this.nestedInstances) {
        child.raf(time);
      }
      if (++this._nestedSweepFrame >= 60) {
        this._nestedSweepFrame = 0;
        this.sweepNestedInstances();
      }
    }
    if (this.options.autoRaf) {
      this._rafId = requestAnimationFrame(this.raf);
    }
  };
  scrollTo(_target, {
    offset = 0,
    immediate = false,
    lock = false,
    programmatic = true,
    lerp = programmatic ? this.options.lerp : undefined,
    duration = programmatic ? this.options.duration : undefined,
    easing = programmatic ? this.options.easing : undefined,
    onStart,
    onComplete,
    force = false,
    userData
  } = {}) {
    if (this.prefersReducedMotion) {
      if (programmatic) {
        immediate = true;
      } else {
        lerp = 1;
        duration = undefined;
        easing = undefined;
      }
    }
    if ((this.isStopped || this.isLocked) && !force)
      return;
    let target = _target;
    let adjustedOffset = offset;
    if (typeof target === "string" && ["top", "left", "start", "#"].includes(target)) {
      target = 0;
    } else if (typeof target === "string" && ["bottom", "right", "end"].includes(target)) {
      target = this.limit;
    } else {
      let node = null;
      if (typeof target === "string") {
        node = target.startsWith("#") ? document.getElementById(target.slice(1)) : document.querySelector(target);
        if (!node) {
          if (target === "#top") {
            target = 0;
          } else {
            console.warn("Lenis: Target not found", target);
          }
        }
      } else if (target instanceof Element) {
        node = target;
      }
      if (node) {
        if (this.options.wrapper !== window) {
          const wrapperRect = this.rootElement.getBoundingClientRect();
          adjustedOffset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
        }
        const rect = node.getBoundingClientRect();
        const targetStyle = getComputedStyle(node);
        const scrollMargin = this.isHorizontal ? Number.parseFloat(targetStyle.scrollMarginLeft) : Number.parseFloat(targetStyle.scrollMarginTop);
        const containerStyle = getComputedStyle(this.rootElement);
        const scrollPadding = this.isHorizontal ? Number.parseFloat(containerStyle.scrollPaddingLeft) : Number.parseFloat(containerStyle.scrollPaddingTop);
        target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll - (Number.isNaN(scrollMargin) ? 0 : scrollMargin) - (Number.isNaN(scrollPadding) ? 0 : scrollPadding);
      }
    }
    if (typeof target !== "number")
      return;
    target += adjustedOffset;
    if (this.options.infinite) {
      if (programmatic) {
        this.targetScroll = this.animatedScroll = this.scroll;
        const distance = target - this.animatedScroll;
        if (distance > this.limit / 2) {
          target -= this.limit;
        } else if (distance < -this.limit / 2) {
          target += this.limit;
        }
      }
    } else {
      target = clamp(0, target, this.limit);
    }
    if (target === this.targetScroll) {
      onStart?.(this);
      onComplete?.(this);
      return;
    }
    this.userData = userData ?? {};
    if (immediate) {
      this.animatedScroll = this.targetScroll = target;
      this.setScroll(this.scroll);
      this.internalReset();
      this.preventNextNativeScrollEvent();
      this.emit();
      onComplete?.(this);
      this.userData = {};
      requestAnimationFrame(() => {
        this.dispatchScrollendEvent();
      });
      return;
    }
    if (!programmatic) {
      this.targetScroll = target;
    }
    if (typeof duration === "number" && typeof easing !== "function") {
      easing = defaultEasing;
    } else if (typeof easing === "function" && typeof duration !== "number") {
      duration = 1;
    }
    this.animate.fromTo(this.animatedScroll, target, {
      duration,
      easing,
      lerp,
      onStart: () => {
        if (lock) {
          this.isLocked = true;
          if (this._isNativePanning)
            this.holdForNativePan();
        }
        this.isScrolling = "smooth";
        onStart?.(this);
      },
      onUpdate: (value, completed) => {
        this.isScrolling = "smooth";
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
          this.internalReset();
          this.emit();
          onComplete?.(this);
          this.userData = {};
          requestAnimationFrame(() => {
            this.dispatchScrollendEvent();
          });
          this.preventNextNativeScrollEvent();
        }
      }
    });
  }
  preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true;
    requestAnimationFrame(() => {
      this._preventNextNativeScrollEvent = false;
    });
  }
  sweepNestedInstances() {
    for (const child of this.nestedInstances) {
      if (!child.rootElement.isConnected) {
        this.nestedInstances.delete(child);
        child.destroy();
      }
    }
  }
  isNestedAdoptable(element) {
    if (instancesRegistry.has(element))
      return false;
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement || element.isContentEditable)
      return false;
    return true;
  }
  adoptNestedScroller(element, data) {
    const style = getComputedStyle(element);
    const isScrollableX = ["auto", "overlay", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth;
    const isScrollableY = ["auto", "overlay", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight;
    const orientation = isScrollableX && !isScrollableY ? "horizontal" : "vertical";
    const isPageHorizontal = window.lenis?.horizontal;
    const child = new Lenis({
      wrapper: element,
      content: element.firstElementChild ?? element,
      eventsTarget: element,
      orientation,
      gestureOrientation: orientation,
      smoothWheel: this.options.smoothWheel,
      syncTouch: this.options.syncTouch,
      syncTouchLerp: this.options.syncTouchLerp,
      touchInertiaExponent: this.options.touchInertiaExponent,
      duration: this.options.duration,
      easing: this.options.easing,
      lerp: this.options.lerp,
      touchMultiplier: this.options.touchMultiplier,
      wheelMultiplier: this.options.wheelMultiplier,
      autoResize: this.options.autoResize,
      prevent: this.options.prevent,
      overscroll: this.options.overscroll,
      allowNestedScroll: this.options.allowNestedScroll,
      naiveDimensions: this.options.naiveDimensions,
      respectReducedMotion: this.options.respectReducedMotion,
      infinite: false,
      anchors: false,
      autoToggle: false,
      stopInertiaOnNavigate: false,
      autoRaf: false
    });
    child._isAdopted = true;
    if (window.lenis)
      window.lenis.horizontal = isPageHorizontal;
    this.nestedInstances.add(child);
    if (data.event.type.includes("touch")) {
      child.virtualScroll.touchStart.x = this.virtualScroll.touchStart.x;
      child.virtualScroll.touchStart.y = this.virtualScroll.touchStart.y;
      child.virtualScroll.lastDelta.x = this.virtualScroll.lastDelta.x;
      child.virtualScroll.lastDelta.y = this.virtualScroll.lastDelta.y;
    }
    child.onVirtualScroll(data);
  }
  hasNestedScroll(node, { deltaX, deltaY }) {
    const time = Date.now();
    if (!node._lenis)
      node._lenis = {};
    const cache = node._lenis;
    let hasOverflowX;
    let hasOverflowY;
    let isScrollableX;
    let isScrollableY;
    let hasOverscrollBehaviorX;
    let hasOverscrollBehaviorY;
    let scrollWidth;
    let scrollHeight;
    let clientWidth;
    let clientHeight;
    if (time - (cache.time ?? 0) > 2000) {
      cache.time = Date.now();
      const computedStyle = window.getComputedStyle(node);
      cache.computedStyle = computedStyle;
      hasOverflowX = ["auto", "overlay", "scroll"].includes(computedStyle.overflowX);
      hasOverflowY = ["auto", "overlay", "scroll"].includes(computedStyle.overflowY);
      hasOverscrollBehaviorX = ["auto"].includes(computedStyle.overscrollBehaviorX);
      hasOverscrollBehaviorY = ["auto"].includes(computedStyle.overscrollBehaviorY);
      cache.hasOverflowX = hasOverflowX;
      cache.hasOverflowY = hasOverflowY;
      if (!(hasOverflowX || hasOverflowY))
        return false;
      scrollWidth = node.scrollWidth;
      scrollHeight = node.scrollHeight;
      clientWidth = node.clientWidth;
      clientHeight = node.clientHeight;
      isScrollableX = scrollWidth > clientWidth;
      isScrollableY = scrollHeight > clientHeight;
      cache.isScrollableX = isScrollableX;
      cache.isScrollableY = isScrollableY;
      cache.scrollWidth = scrollWidth;
      cache.scrollHeight = scrollHeight;
      cache.clientWidth = clientWidth;
      cache.clientHeight = clientHeight;
      cache.hasOverscrollBehaviorX = hasOverscrollBehaviorX;
      cache.hasOverscrollBehaviorY = hasOverscrollBehaviorY;
    } else {
      isScrollableX = cache.isScrollableX;
      isScrollableY = cache.isScrollableY;
      hasOverflowX = cache.hasOverflowX;
      hasOverflowY = cache.hasOverflowY;
      scrollWidth = cache.scrollWidth;
      scrollHeight = cache.scrollHeight;
      clientWidth = cache.clientWidth;
      clientHeight = cache.clientHeight;
      hasOverscrollBehaviorX = cache.hasOverscrollBehaviorX;
      hasOverscrollBehaviorY = cache.hasOverscrollBehaviorY;
    }
    if (!(hasOverflowX && isScrollableX || hasOverflowY && isScrollableY)) {
      return false;
    }
    const orientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
    let scroll;
    let maxScroll;
    let delta;
    let hasOverflow;
    let isScrollable;
    let hasOverscrollBehavior;
    if (orientation === "horizontal") {
      scroll = Math.round(node.scrollLeft);
      maxScroll = scrollWidth - clientWidth;
      delta = deltaX;
      hasOverflow = hasOverflowX;
      isScrollable = isScrollableX;
      hasOverscrollBehavior = hasOverscrollBehaviorX;
    } else if (orientation === "vertical") {
      scroll = Math.round(node.scrollTop);
      maxScroll = scrollHeight - clientHeight;
      delta = deltaY;
      hasOverflow = hasOverflowY;
      isScrollable = isScrollableY;
      hasOverscrollBehavior = hasOverscrollBehaviorY;
    } else {
      return false;
    }
    if (!hasOverscrollBehavior && (scroll >= maxScroll || scroll <= 0)) {
      return true;
    }
    const willScroll = delta > 0 ? scroll < maxScroll : scroll > 0;
    return willScroll && hasOverflow && isScrollable;
  }
  get rootElement() {
    return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
  }
  get limit() {
    if (this.options.naiveDimensions) {
      if (this.isHorizontal) {
        return this.rootElement.scrollWidth - this.rootElement.clientWidth;
      }
      return this.rootElement.scrollHeight - this.rootElement.clientHeight;
    }
    return this.dimensions.limit[this.isHorizontal ? "x" : "y"];
  }
  get isHorizontal() {
    return this.options.orientation === "horizontal";
  }
  get actualScroll() {
    const wrapper = this.options.wrapper;
    return this.isHorizontal ? wrapper.scrollX ?? wrapper.scrollLeft : wrapper.scrollY ?? wrapper.scrollTop;
  }
  get scroll() {
    return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
  }
  get progress() {
    return this.limit === 0 ? 1 : this.scroll / this.limit;
  }
  get isScrolling() {
    return this._isScrolling;
  }
  set isScrolling(value) {
    if (this._isScrolling !== value) {
      this._isScrolling = value;
      this.updateClassName();
    }
  }
  get isStopped() {
    return this._isStopped;
  }
  set isStopped(value) {
    if (this._isStopped !== value) {
      this._isStopped = value;
      this.updateClassName();
    }
  }
  get isLocked() {
    return this._isLocked;
  }
  set isLocked(value) {
    if (this._isLocked !== value) {
      this._isLocked = value;
      if (!value)
        this.releaseNativePanHold();
      this.updateClassName();
    }
  }
  get isSmooth() {
    return this.isScrolling === "smooth";
  }
  get prefersReducedMotion() {
    return this.options.respectReducedMotion && this.reducedMotionMediaQuery.matches;
  }
  get className() {
    let className = "lenis";
    if (this.options.autoToggle)
      className += " lenis-autoToggle";
    if (this.isStopped)
      className += " lenis-stopped";
    if (this.isLocked)
      className += " lenis-locked";
    if (this.isScrolling)
      className += " lenis-scrolling";
    if (this.isScrolling === "smooth")
      className += " lenis-smooth";
    return className;
  }
  updateClassName() {
    this.cleanUpClassName();
    this.className.split(" ").forEach((className) => {
      this.rootElement.classList.add(className);
    });
  }
  cleanUpClassName() {
    for (const className of Array.from(this.rootElement.classList)) {
      if (className === "lenis" || className.startsWith("lenis-")) {
        this.rootElement.classList.remove(className);
      }
    }
  }
}
export {
  Lenis as default
};
