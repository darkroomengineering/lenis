// package.json
var version = "2.0.0-dev.7";

// packages/utils/debounce.ts
function debounce(callback, delay) {
  let timer;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  function debounced(...args) {
    cancel();
    timer = setTimeout(() => {
      timer = undefined;
      callback.apply(this, args);
    }, delay);
  }
  debounced.cancel = cancel;
  return debounced;
}

// packages/utils/emitter.ts
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
var EPSILON = 0.05;

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
  onCancel;
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
    if (completed)
      this.isRunning = false;
    this.onUpdate?.(this.value, completed);
  }
  stop() {
    if (!this.isRunning)
      return;
    this.isRunning = false;
    this.onCancel?.();
  }
  fromTo(from, to, { lerp, duration, easing, onStart, onUpdate, onCancel }) {
    this.stop();
    this.onCancel = onCancel;
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

// packages/core/src/axis.ts
class Axis {
  axis;
  lenis;
  rawScroll = 0;
  rawTargetScroll = 0;
  rawLastScroll = 0;
  animate = new Animate;
  constructor(axis, lenis) {
    this.axis = axis;
    this.lenis = lenis;
  }
  destroy() {
    this.animate.stop();
  }
  reset() {
    this.rawScroll = this.rawTargetScroll = this.rawLastScroll = this.actualScroll;
    this.animate.stop();
  }
  advance(deltaTime) {
    const wasRunning = this.animate.isRunning;
    this.animate.advance(deltaTime);
    return wasRunning;
  }
  scrollTo(target, options) {
    return this.lenis.scrollTo(this.axis === "x" ? { x: target } : { y: target }, options);
  }
  setScroll(value) {
    this.lenis.options.wrapper.scrollTo(this.axis === "x" ? { left: value, behavior: "instant" } : { top: value, behavior: "instant" });
  }
  get actualScroll() {
    const wrapper = this.lenis.options.wrapper;
    return this.axis === "x" ? wrapper.scrollX ?? wrapper.scrollLeft : wrapper.scrollY ?? wrapper.scrollTop;
  }
  get scroll() {
    return this.lenis.options.infinite ? modulo(this.rawScroll, this.maxScroll) : this.rawScroll;
  }
  get targetScroll() {
    return this.lenis.options.infinite ? modulo(this.rawTargetScroll, this.maxScroll) : this.rawTargetScroll;
  }
  get velocity() {
    return this.rawScroll - this.rawLastScroll;
  }
  get direction() {
    return Math.sign(this.velocity);
  }
  get maxScroll() {
    return this.lenis.scrollingBox.maxScroll[this.axis];
  }
  get isScrollable() {
    return this.lenis.scrollingBox.isScrollable[this.axis];
  }
  get progress() {
    return this.maxScroll === 0 ? 0 : this.scroll / this.maxScroll;
  }
}

// packages/core/src/gestures-handler.ts
var LINE_HEIGHT = 100 / 6;
var listenerOptions = { passive: false };
var DRAG_THRESHOLD = 4;
function getDeltaMultiplier(deltaMode, size) {
  if (deltaMode === 1)
    return LINE_HEIGHT;
  if (deltaMode === 2)
    return size;
  return 1;
}

class GesturesHandler {
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
  pointer = { x: 0, y: 0 };
  dragOrigin = { x: 0, y: 0 };
  isPointerDown = false;
  isDragging = false;
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();
    this.element.addEventListener("wheel", this.onWheel, listenerOptions);
    this.element.addEventListener("touchstart", this.onTouchStart, listenerOptions);
    this.element.addEventListener("touchmove", this.onTouchMove, listenerOptions);
    this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
    if (this.options.drag) {
      this.element.addEventListener("pointerdown", this.onPointerDown, listenerOptions);
      this.element.addEventListener("dragstart", this.onNativeDragStart, listenerOptions);
    }
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
    if (this.options.drag) {
      this.element.removeEventListener("pointerdown", this.onPointerDown, listenerOptions);
      this.element.removeEventListener("dragstart", this.onNativeDragStart, listenerOptions);
      this.removeDragListeners();
    }
  }
  onTouchStart = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: 0,
      y: 0
    };
    this.emitter.emit("gesture", {
      deltaX: 0,
      deltaY: 0,
      type: "touch",
      event
    });
  };
  onTouchMove = (event) => {
    const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
    const deltaX = -(clientX - this.touchStart.x);
    const deltaY = -(clientY - this.touchStart.y);
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = {
      x: deltaX,
      y: deltaY
    };
    this.emitter.emit("gesture", {
      deltaX,
      deltaY,
      type: "touch",
      event
    });
  };
  onTouchEnd = (event) => {
    this.emitter.emit("gesture", {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      type: "touch",
      event
    });
  };
  onWheel = (event) => {
    let { deltaX, deltaY, deltaMode } = event;
    const multiplierX = getDeltaMultiplier(deltaMode, this.window.width);
    const multiplierY = getDeltaMultiplier(deltaMode, this.window.height);
    deltaX *= multiplierX;
    deltaY *= multiplierY;
    this.emitter.emit("gesture", {
      deltaX,
      deltaY,
      type: "wheel",
      event
    });
  };
  onPointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0)
      return;
    const target = event.composedPath()[0];
    if (target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), audio, video[controls], [draggable="true"], [data-lenis-prevent]'))
      return;
    this.isPointerDown = true;
    this.isDragging = false;
    this.dragOrigin = { x: event.clientX, y: event.clientY };
    this.pointer = { x: event.clientX, y: event.clientY };
    this.lastDelta = { x: 0, y: 0 };
    window.addEventListener("pointermove", this.onPointerMove, listenerOptions);
    window.addEventListener("pointerup", this.onPointerUp, listenerOptions);
    window.addEventListener("pointercancel", this.onPointerUp, listenerOptions);
    this.emitter.emit("gesture", {
      deltaX: 0,
      deltaY: 0,
      type: "drag",
      event
    });
  };
  onPointerMove = (event) => {
    if (!this.isPointerDown)
      return;
    if (!this.isDragging) {
      const distance = Math.hypot(event.clientX - this.dragOrigin.x, event.clientY - this.dragOrigin.y);
      if (distance < DRAG_THRESHOLD)
        return;
      this.isDragging = true;
      this.pointer = { x: event.clientX, y: event.clientY };
      this.emitter.emit("dragging", true);
      return;
    }
    const deltaX = -(event.clientX - this.pointer.x);
    const deltaY = -(event.clientY - this.pointer.y);
    this.pointer = { x: event.clientX, y: event.clientY };
    this.lastDelta = {
      x: deltaX,
      y: deltaY
    };
    this.emitter.emit("gesture", {
      deltaX,
      deltaY,
      type: "drag",
      event
    });
  };
  onPointerUp = (event) => {
    this.removeDragListeners();
    const wasDragging = this.isDragging;
    this.isPointerDown = false;
    this.isDragging = false;
    if (!wasDragging)
      return;
    this.emitter.emit("dragging", false);
    window.addEventListener("click", this.suppressClick, {
      capture: true,
      once: true
    });
    requestAnimationFrame(() => {
      window.removeEventListener("click", this.suppressClick, {
        capture: true
      });
    });
    this.emitter.emit("gesture", {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      type: "drag",
      event
    });
  };
  onNativeDragStart = (event) => {
    if (this.isPointerDown)
      event.preventDefault();
  };
  suppressClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  removeDragListeners() {
    window.removeEventListener("pointermove", this.onPointerMove, listenerOptions);
    window.removeEventListener("pointerup", this.onPointerUp, listenerOptions);
    window.removeEventListener("pointercancel", this.onPointerUp, listenerOptions);
  }
  onWindowResize = () => {
    this.window = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
}

// packages/core/src/scrolling-box.ts
class ScrollingBox {
  wrapper;
  content;
  width;
  height;
  scrollHeight;
  scrollWidth;
  mode;
  debounceValue;
  autoResize;
  cache = {
    x: undefined,
    y: undefined,
    timestamp: 0
  };
  emitter = new Emitter;
  isScrollContainer;
  ignoreOverflowStyle;
  debouncedResize;
  wrapperResizeObserver;
  contentResizeObserver;
  on(event, callback) {
    return this.emitter.on(event, callback);
  }
  constructor(wrapper, content, {
    autoResize = true,
    debounce: debounceValue = 500,
    mode = content ? "observe" : "read"
  } = {}) {
    this.wrapper = wrapper;
    this.content = content;
    if (!content && wrapper !== document.documentElement && mode === "observe") {
      console.warn('dimensions.mode "observe" is ignored if "content" is undefined, automatically fallback to "read" mode');
      mode = "read";
    }
    this.autoResize = autoResize ?? true;
    this.debounceValue = debounceValue ?? 500;
    this.mode = mode;
    this.wrapper = wrapper;
    this.content = content;
    this.wrapper.addEventListener("transitionend", this.onTransitionEnd);
    this.wrapper.addEventListener("transitioncancel", this.onTransitionEnd);
    if (this.mode === "observe") {
      if (this.autoResize) {
        this.debouncedResize = debounce(this.resize, this.debounceValue);
        this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
        this.wrapperResizeObserver.observe(this.wrapper);
        if (this.content && this.content !== this.wrapper) {
          this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
          this.contentResizeObserver.observe(this.content);
        }
      }
    }
    this.resize();
  }
  destroy() {
    this.wrapperResizeObserver?.disconnect();
    this.contentResizeObserver?.disconnect();
    this.wrapper.removeEventListener("transitionend", this.onTransitionEnd);
    this.wrapper.removeEventListener("transitioncancel", this.onTransitionEnd);
    this.debouncedResize?.cancel();
    this.emitter.destroy();
  }
  resize = () => {
    this.onWrapperResize();
    this.onContentResize();
    this.onOverflowStyleChange();
    this.emitter.emit("resize");
  };
  onWrapperResize = () => {
    this.width = this.wrapper.clientWidth;
    this.height = this.wrapper.clientHeight;
  };
  onContentResize = () => {
    this.scrollHeight = this.wrapper.scrollHeight;
    this.scrollWidth = this.wrapper.scrollWidth;
  };
  get maxScroll() {
    if (this.mode === "observe") {
      return {
        x: this.scrollWidth - this.width,
        y: this.scrollHeight - this.height
      };
    }
    if (Date.now() > this.cache.timestamp + this.debounceValue) {
      this.onWrapperResize();
      this.onContentResize();
      this.cache.x = this.scrollWidth - this.width;
      this.cache.y = this.scrollHeight - this.height;
      this.cache.timestamp = Date.now();
    }
    return {
      x: this.cache.x,
      y: this.cache.y
    };
  }
  get isRootElement() {
    return this.wrapper === document.documentElement;
  }
  onOverflowStyleChange() {
    if (this.ignoreOverflowStyle?.())
      return;
    const check = (axis) => {
      let value = getComputedStyle(this.wrapper).getPropertyValue(axis);
      if (this.isRootElement) {
        if (value === "visible")
          value = getComputedStyle(document.body).getPropertyValue(axis);
        return !["hidden", "clip"].includes(value);
      }
      return ["scroll", "auto"].includes(value);
    };
    const previous = this.isScrollContainer;
    this.isScrollContainer = {
      x: check("overflow-x"),
      y: check("overflow-y")
    };
    const changed = {
      x: previous?.x !== this.isScrollContainer.x,
      y: previous?.y !== this.isScrollContainer.y
    };
    if (changed.x || changed.y) {
      this.emitter.emit("overflow style changed", changed);
    }
  }
  get isOverflowing() {
    const { x, y } = this.maxScroll;
    return {
      x: x > 0,
      y: y > 0
    };
  }
  onTransitionEnd = (event) => {
    if (event.propertyName?.includes("overflow") && (event.target === this.wrapper || this.isRootElement && event.target === document.body)) {
      this.onOverflowStyleChange();
    }
  };
  get isScrollable() {
    const isScrollContainer = this.isScrollContainer;
    const isOverflowing = this.isOverflowing;
    return {
      x: isScrollContainer.x && isOverflowing.x,
      y: isScrollContainer.y && isOverflowing.y
    };
  }
}

// packages/core/src/utils.ts
function isScrollableElement(node, { deltaX, deltaY }) {
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
    scroll = node.scrollLeft;
    maxScroll = scrollWidth - clientWidth;
    delta = deltaX;
    hasOverflow = hasOverflowX;
    isScrollable = isScrollableX;
    hasOverscrollBehavior = hasOverscrollBehaviorX;
  } else if (orientation === "vertical") {
    scroll = node.scrollTop;
    maxScroll = scrollHeight - clientHeight;
    delta = deltaY;
    hasOverflow = hasOverflowY;
    isScrollable = isScrollableY;
    hasOverscrollBehavior = hasOverscrollBehaviorY;
  } else {
    return false;
  }
  if (!hasOverscrollBehavior && (maxScroll - scroll <= 1 || scroll <= 0)) {
    return true;
  }
  const willScroll = delta > 0 ? maxScroll - scroll > 1 : scroll > 0;
  return Boolean(willScroll && hasOverflow && isScrollable);
}
function defined(options) {
  if (!options)
    return {};
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
}

// packages/core/src/lenis.ts
var defaultEasing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
var instancesRegistry = new WeakMap;
var nestedVetoed = new WeakSet;

class Lenis {
  _isScrolling = false;
  _isLocked = false;
  _scrollToLocked = false;
  _preventNextNativeScrollEvent = false;
  _hasNativeScrolled = false;
  _scrollendRafId = null;
  _rafId = null;
  _isDragging = false;
  _isDraggingSelection = false;
  _isTouchDown = false;
  _isNativeTouchBlocked = false;
  _overflowBeforeBlock = "";
  supportsScrollend = "onscrollend" in window;
  reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  abortController = new AbortController;
  isTouch;
  isWheel;
  isDrag;
  time = 0;
  userData = {};
  options;
  emitter = new Emitter;
  scrollingBox;
  x;
  y;
  gesturesHandler;
  isIOS;
  nestedInstances = new Set;
  _nestedSweepFrame = 0;
  static get(element) {
    return instancesRegistry.get(element);
  }
  constructor({
    wrapper = window,
    content,
    eventsTarget,
    wheel,
    touch,
    drag,
    programmatic,
    infinite = false,
    orientation = "vertical",
    gestureOrientation = orientation === "vertical" ? "vertical" : "both",
    onGesture,
    overscroll = true,
    autoRaf = true,
    anchors = true,
    nested,
    dimensions,
    stopInertiaOnNavigate = true,
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
    if (touch?.smooth === true) {
      window.lenis.touch = true;
    }
    if (!wrapper || wrapper === document.documentElement) {
      wrapper = window;
    }
    if (wrapper === window) {
      content = document.documentElement;
    }
    eventsTarget ??= wrapper;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1;
    this.options = {
      wrapper,
      content,
      eventsTarget,
      wheel: {
        smooth: true,
        lerp: 0.1,
        multiplier: 1,
        ...defined(wheel)
      },
      touch: {
        smooth: false,
        lerp: 0.1,
        multiplier: 1,
        inertia: 2,
        ...defined(touch),
        ...this.isIOS && defined(touch?.ios ?? {
          inertia: 1.7,
          lerp: 0.05
        })
      },
      drag: {
        enabled: false,
        multiplier: 1,
        inertia: 1.7,
        lerp: 0.1,
        ...defined(drag)
      },
      programmatic: {
        lerp: 0.1,
        ...defined(programmatic)
      },
      infinite,
      gestureOrientation,
      orientation,
      onGesture,
      overscroll,
      autoRaf,
      anchors,
      nested: {
        mode: "native",
        ...defined(nested)
      },
      dimensions,
      stopInertiaOnNavigate,
      respectReducedMotion
    };
    if (this.options.wheel?.duration !== undefined || this.options.wheel?.easing !== undefined) {
      this.options.wheel.duration ??= 1;
      this.options.wheel.easing ??= defaultEasing;
    }
    if (this.options.touch?.duration !== undefined || this.options.touch?.easing !== undefined) {
      this.options.touch.duration ??= 1;
      this.options.touch.easing ??= defaultEasing;
    }
    if (this.options.drag?.duration !== undefined || this.options.drag?.easing !== undefined) {
      this.options.drag.duration ??= 1;
      this.options.drag.easing ??= defaultEasing;
    }
    this.scrollingBox = new ScrollingBox(this.rootElement, this.options.content, this.options.dimensions);
    this.x = new Axis("x", this);
    this.y = new Axis("y", this);
    this.scrollingBox.on("overflow style changed", this.onOverflowStyleChange);
    this.scrollingBox.ignoreOverflowStyle = () => this.isBlockingOverflow;
    instancesRegistry.set(this.rootElement, this);
    this.updateClassName();
    this.x.reset();
    this.y.reset();
    const signal = this.abortController.signal;
    this.options.wrapper.addEventListener("scroll", this.onNativeScroll, {
      signal
    });
    this.options.wrapper.addEventListener("scroll", this.debouncedNativeScrollReset, { signal });
    window.addEventListener("scrollend", this.onScrollEnd, {
      capture: true,
      signal
    });
    if (this.options.anchors || this.options.stopInertiaOnNavigate) {
      this.options.wrapper.addEventListener("click", this.onClick, { signal });
    }
    this.options.wrapper.addEventListener("pointerdown", this.onPointerDown, { signal });
    this.gesturesHandler = new GesturesHandler(eventsTarget, {
      drag: this.options.drag.enabled
    });
    this.gesturesHandler.on("gesture", this.onGesture);
    this.gesturesHandler.on("dragging", this.onDraggingChange);
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
    this.abortController.abort();
    this.unblockNativeTouch();
    this.debouncedNativeScrollReset.cancel();
    if (this._scrollendRafId !== null) {
      cancelAnimationFrame(this._scrollendRafId);
      this._scrollendRafId = null;
    }
    this.gesturesHandler.destroy();
    this.scrollingBox.destroy();
    this.x.destroy();
    this.y.destroy();
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
  emit() {
    this.emitter.emit("scroll", this);
  }
  scrollTo(_target, options = {}) {
    return this.dispatchScrollTo(this.resolveScrollTargets(_target, options), options);
  }
  lock() {
    this.isLocked = true;
  }
  unlock() {
    this.isLocked = false;
  }
  reset() {
    this.internalReset();
    this.emit();
  }
  raf = (time) => {
    const deltaTime = time - (this.time || time);
    this.time = time;
    const xActive = this.x.advance(deltaTime * 0.001);
    const yActive = this.y.advance(deltaTime * 0.001);
    if (xActive || yActive) {
      this.flushScroll();
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
  resize() {
    this.scrollingBox.resize();
    this.sweepNestedInstances();
    this.internalReset();
    this.emit();
  }
  get rootElement() {
    return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
  }
  get isHorizontal() {
    return this.options.orientation === "horizontal";
  }
  get activeAxis() {
    return this.isHorizontal ? this.x : this.y;
  }
  get scroll() {
    return this.activeAxis.scroll;
  }
  get targetScroll() {
    return this.activeAxis.targetScroll;
  }
  set targetScroll(value) {
    this.activeAxis.rawTargetScroll = value;
  }
  get rawScroll() {
    return this.activeAxis.rawScroll;
  }
  set rawScroll(value) {
    this.activeAxis.rawScroll = value;
  }
  get rawTargetScroll() {
    return this.activeAxis.rawTargetScroll;
  }
  set rawTargetScroll(value) {
    this.activeAxis.rawTargetScroll = value;
  }
  get actualScroll() {
    return this.activeAxis.actualScroll;
  }
  get velocity() {
    return this.activeAxis.velocity;
  }
  get direction() {
    return this.activeAxis.direction;
  }
  get maxScroll() {
    return this.activeAxis.maxScroll;
  }
  get progress() {
    return this.activeAxis.progress;
  }
  get isScrolling() {
    return this._isScrolling;
  }
  set isScrolling(value) {
    if (this._isScrolling !== value) {
      this._isScrolling = value;
      if (value !== "native")
        this._hasNativeScrolled = false;
      this.updateClassName();
    }
  }
  get isSmooth() {
    return this.isScrolling === "smooth";
  }
  get isDragging() {
    return this._isDragging;
  }
  set isDragging(value) {
    if (this._isDragging !== value) {
      this._isDragging = value;
      this.updateClassName();
    }
  }
  get isScrollable() {
    const orientation = this.options.orientation;
    if (orientation === "horizontal")
      return this.x.isScrollable;
    if (orientation === "both")
      return this.x.isScrollable || this.y.isScrollable;
    return this.y.isScrollable;
  }
  get isLocked() {
    return this._isLocked;
  }
  set isLocked(value) {
    if (value === this._isLocked)
      return;
    this._isLocked = value;
    if (value) {
      if (this._isTouchDown && !this.options.touch.smooth) {
        this.blockNativeTouch();
      }
    } else {
      this.unblockNativeTouch();
    }
    this.updateClassName();
  }
  get isBlockingOverflow() {
    const { style } = this.rootElement;
    return this._isNativeTouchBlocked && style.getPropertyValue("overflow") === "hidden" && style.getPropertyPriority("overflow") === "important";
  }
  blockNativeTouch() {
    if (this._isNativeTouchBlocked)
      return;
    const { style } = this.rootElement;
    this._isNativeTouchBlocked = true;
    this._overflowBeforeBlock = style.getPropertyValue("overflow");
    style.setProperty("overflow", "hidden", "important");
  }
  unblockNativeTouch() {
    if (!this._isNativeTouchBlocked)
      return;
    const isOurs = this.isBlockingOverflow;
    this._isNativeTouchBlocked = false;
    if (!isOurs)
      return;
    const { style } = this.rootElement;
    if (this._overflowBeforeBlock) {
      style.setProperty("overflow", this._overflowBeforeBlock);
    } else {
      style.removeProperty("overflow");
    }
  }
  get prefersReducedMotion() {
    return this.options.respectReducedMotion && this.reducedMotionMediaQuery.matches;
  }
  get className() {
    let className = "lenis";
    if (this.isLocked)
      className += " lenis-locked";
    if (this.isScrolling)
      className += " lenis-scrolling";
    if (this.isScrolling === "smooth")
      className += " lenis-smooth";
    if (this.options.drag.enabled)
      className += " lenis-draggable";
    if (this.isDragging)
      className += " lenis-dragging";
    return className;
  }
  get isAnyAxisAnimating() {
    return this.x.animate.isRunning || this.y.animate.isRunning;
  }
  onGesture = (_data) => {
    const data = this.options.onGesture?.(_data, this) ?? _data;
    if (data === false)
      return;
    const emitGesture = (ignored = false) => {
      this.emitter.emit("gesture", { ...data, ignored });
    };
    let { deltaX, deltaY, event, type } = data;
    this.isTouch = type === "touch";
    this.isWheel = type === "wheel";
    this.isDrag = type === "drag";
    if (this.isTouch) {
      this._isTouchDown = event.type === "touchstart" || event.type === "touchmove";
    }
    if (event.ctrlKey)
      return emitGesture(true);
    if (event.lenisStopPropagation)
      return emitGesture(true);
    if (this.isTouch && this.isIOS) {
      if (event.type === "touchstart") {
        this._isDraggingSelection = this.isTouchOnSelectionHandle(event);
      }
      if (this._isDraggingSelection) {
        if (event.type === "touchend")
          this._isDraggingSelection = false;
        return emitGesture(true);
      }
    }
    if (this.isTouch) {
      deltaX *= this.options.touch.multiplier;
      deltaY *= this.options.touch.multiplier;
    } else if (this.isWheel) {
      deltaX *= this.options.wheel.multiplier;
      deltaY *= this.options.wheel.multiplier;
    } else if (this.isDrag) {
      deltaX *= this.options.drag.multiplier;
      deltaY *= this.options.drag.multiplier;
    }
    const isClickOrTap = deltaX === 0 && deltaY === 0;
    const isTapToStop = (this.options.touch.smooth && this.isTouch && event.type === "touchstart" || this.isDrag && event.type === "pointerdown") && isClickOrTap && this.isScrollable && !this.isLocked;
    if (isTapToStop) {
      emitGesture();
      this.internalReset();
      return;
    }
    if (isClickOrTap)
      return emitGesture();
    let composedPath = event.composedPath();
    composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
    const gestureOrientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
    for (const node of composedPath) {
      if (!(node instanceof HTMLElement))
        continue;
      if (node.hasAttribute?.("data-lenis-prevent") || gestureOrientation === "vertical" && node.hasAttribute?.("data-lenis-prevent-vertical") || gestureOrientation === "horizontal" && node.hasAttribute?.("data-lenis-prevent-horizontal") || this.isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || this.isWheel && node.hasAttribute?.("data-lenis-prevent-wheel"))
        return emitGesture(true);
      if (this.options.nested.mode !== "none" && isScrollableElement(node, { deltaX, deltaY })) {
        if (this.options.nested.mode === "smooth" && !this.isDrag && this.isNestedAdoptable(node)) {
          this.adoptNestedScroller(node, data);
        }
        return emitGesture(true);
      }
    }
    const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
    if (isUnknownGesture)
      return emitGesture(true);
    emitGesture(!this.isScrollable || this.isLocked);
    if (!this.isScrollable || this.isLocked) {
      if (event.cancelable) {
        event.preventDefault();
      } else if (this.isTouch && this.isLocked) {
        this.blockNativeTouch();
      }
      return;
    }
    const isSmooth = this.options.touch.smooth && this.isTouch || this.options.wheel.smooth && this.isWheel || this.isDrag;
    if (!isSmooth) {
      this.isScrolling = "native";
      this.x.animate.stop();
      this.y.animate.stop();
      this.debouncedNativeScrollReset();
      event.lenisStopPropagation = true;
      return;
    }
    let axes;
    if (this.options.orientation === "both") {
      axes = [
        { axis: this.x, delta: deltaX },
        { axis: this.y, delta: deltaY }
      ];
    } else {
      let delta = deltaY;
      if (this.options.gestureOrientation === "both") {
        delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
      } else if (this.options.gestureOrientation === "horizontal") {
        delta = deltaX;
      }
      axes = [{ axis: this.activeAxis, delta }];
    }
    const isRelease = event.type === "touchend" || event.type === "pointerup" || event.type === "pointercancel";
    const pointerOptions = this.isDrag ? this.options.drag : this.options.touch;
    if (isRelease) {
      const inertia = pointerOptions.inertia;
      for (const entry of axes) {
        entry.delta = Math.sign(entry.delta) * Math.abs(entry.axis.velocity) ** inertia;
      }
    }
    const consuming = ({ axis, delta }) => {
      if (!axis.isScrollable)
        return false;
      const atStart = axis.rawScroll <= 0;
      const atEnd = axis.maxScroll - axis.rawScroll <= 1;
      if (delta > 0)
        return !atEnd;
      if (delta < 0)
        return !atStart;
      return !(atStart || atEnd);
    };
    if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && axes.some(consuming)) {
      event.lenisStopPropagation = true;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    const pointerConfig = isRelease ? {
      lerp: pointerOptions.lerp,
      duration: pointerOptions.duration,
      easing: pointerOptions.easing
    } : { lerp: 1 };
    const wheelConfig = {
      lerp: this.options.wheel.lerp,
      duration: this.options.wheel.duration,
      easing: this.options.wheel.easing
    };
    const config = this.isWheel ? wheelConfig : pointerConfig;
    for (const { axis, delta } of axes) {
      if (delta !== 0 && axis.isScrollable) {
        this.scrollAxisTo(axis, axis.rawTargetScroll + delta, {
          programmatic: false,
          ...config
        });
      }
    }
  };
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
    if (nestedVetoed.has(element))
      return false;
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement || element.isContentEditable)
      return false;
    const filter = this.options.nested.filter;
    if (filter && filter(element) === false) {
      nestedVetoed.add(element);
      return false;
    }
    return true;
  }
  adoptNestedScroller(element, data) {
    const style = getComputedStyle(element);
    const scrollableX = ["auto", "overlay", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth;
    const scrollableY = ["auto", "overlay", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight;
    let orientation = "vertical";
    if (scrollableX && scrollableY)
      orientation = "both";
    else if (scrollableX)
      orientation = "horizontal";
    const child = new Lenis({
      wrapper: element,
      eventsTarget: element,
      orientation,
      gestureOrientation: orientation,
      wheel: this.options.wheel,
      touch: this.options.touch,
      drag: this.options.drag,
      programmatic: this.options.programmatic,
      overscroll: this.options.overscroll,
      nested: this.options.nested,
      onGesture: this.options.onGesture,
      respectReducedMotion: this.options.respectReducedMotion,
      infinite: false,
      anchors: false,
      stopInertiaOnNavigate: false,
      autoRaf: false
    });
    this.nestedInstances.add(child);
    if (data.type === "touch") {
      child.gesturesHandler.touchStart.x = this.gesturesHandler.touchStart.x;
      child.gesturesHandler.touchStart.y = this.gesturesHandler.touchStart.y;
    }
    child.onGesture(data);
  }
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
  onDraggingChange = (dragging) => {
    this.isDragging = dragging;
  };
  onNativeScroll = () => {
    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false;
      return;
    }
    if (this.isScrolling !== "smooth") {
      for (const axis of [this.x, this.y]) {
        axis.rawLastScroll = axis.rawScroll;
        axis.rawScroll = axis.rawTargetScroll = axis.actualScroll;
      }
      if (this.isScrollable) {
        this.isScrolling = "native";
        this._hasNativeScrolled = true;
      }
      this.emit();
    }
  };
  debouncedNativeScrollReset = debounce(() => {
    if (this.isScrolling !== "smooth") {
      const hasNativeScrolled = this._hasNativeScrolled;
      this.internalReset();
      this.emit();
      if (hasNativeScrolled && !this.supportsScrollend) {
        this.scheduleScrollendEvent();
      }
    }
  }, 400);
  onScrollEnd = (e) => {
    if (e instanceof CustomEvent)
      return;
    const wrapper = this.options.wrapper;
    if (e.target !== (wrapper === window ? document : wrapper))
      return;
    if (this.isScrolling === "smooth" || this.isScrolling === false) {
      e.stopPropagation();
    }
  };
  onOverflowStyleChange = (changed) => {
    if (changed.x)
      this.x.reset();
    if (changed.y)
      this.y.reset();
    if (!this.isAnyAxisAnimating)
      this.internalReset();
  };
  internalReset() {
    this.debouncedNativeScrollReset.cancel();
    if (this._scrollToLocked) {
      this._scrollToLocked = false;
      this.isLocked = false;
    }
    this.isScrolling = false;
    this.x.reset();
    this.y.reset();
  }
  resolveScrollTargets(_target, options) {
    const offsetFor = (axis) => this.resolveOffset(options.offset, axis);
    const active = this.activeAxis;
    if (typeof _target === "object" && _target !== null && !(_target instanceof HTMLElement)) {
      const { x, y } = _target;
      const targets = [];
      if (x !== undefined)
        targets.push({ axis: this.x, target: x + offsetFor(this.x) });
      if (y !== undefined)
        targets.push({ axis: this.y, target: y + offsetFor(this.y) });
      return targets;
    }
    if (typeof _target === "string") {
      if (["top", "left", "start", "#"].includes(_target)) {
        return [{ axis: active, target: offsetFor(active) }];
      }
      if (["bottom", "right", "end"].includes(_target)) {
        return [{ axis: active, target: active.maxScroll + offsetFor(active) }];
      }
    }
    let node = null;
    if (typeof _target === "string") {
      node = _target.startsWith("#") ? document.getElementById(_target.slice(1)) : document.querySelector(_target);
      if (!node) {
        if (_target === "#top") {
          return [{ axis: active, target: offsetFor(active) }];
        }
        console.warn("Lenis: Target not found", _target);
        return [];
      }
    } else if (_target instanceof HTMLElement && _target.nodeType) {
      node = _target;
    }
    if (node) {
      if (this.options.orientation === "both") {
        return [
          {
            axis: this.x,
            target: this.resolveElementTarget(node, this.x, offsetFor(this.x))
          },
          {
            axis: this.y,
            target: this.resolveElementTarget(node, this.y, offsetFor(this.y))
          }
        ];
      }
      return [
        {
          axis: active,
          target: this.resolveElementTarget(node, active, offsetFor(active))
        }
      ];
    }
    if (typeof _target === "number") {
      return [{ axis: active, target: _target + offsetFor(active) }];
    }
    return [];
  }
  resolveOffset(offset, axis) {
    if (typeof offset === "number")
      return offset;
    if (!offset)
      return 0;
    return (axis.axis === "x" ? offset.x : offset.y) ?? 0;
  }
  resolveElementTarget(node, axis, offset) {
    let adjustedOffset = offset;
    if (this.options.wrapper !== window) {
      const wrapperRect = this.rootElement.getBoundingClientRect();
      adjustedOffset -= axis.axis === "x" ? wrapperRect.left : wrapperRect.top;
    }
    const rect = node.getBoundingClientRect();
    const targetStyle = getComputedStyle(node);
    const scrollMargin = axis.axis === "x" ? Number.parseFloat(targetStyle.scrollMarginLeft) : Number.parseFloat(targetStyle.scrollMarginTop);
    const containerStyle = getComputedStyle(this.rootElement);
    const scrollPaddingRaw = axis.axis === "x" ? containerStyle.scrollPaddingLeft : containerStyle.scrollPaddingTop;
    const scrollPadding = scrollPaddingRaw.endsWith("%") ? Number.parseFloat(scrollPaddingRaw) / 100 * ((axis.axis === "x" ? this.scrollingBox.width : this.scrollingBox.height) ?? 0) : Number.parseFloat(scrollPaddingRaw);
    return (axis.axis === "x" ? rect.left : rect.top) + axis.rawScroll - (Number.isNaN(scrollMargin) ? 0 : scrollMargin) - (Number.isNaN(scrollPadding) ? 0 : scrollPadding) + adjustedOffset;
  }
  dispatchScrollTo(targets, {
    onStart,
    onComplete,
    userData,
    lock = false,
    ...options
  } = {}) {
    if (targets.length === 0)
      return Promise.resolve(false);
    this.userData = userData ?? {};
    if (lock) {
      this.isLocked = true;
      this._scrollToLocked = true;
    }
    let started = false;
    let pending = targets.length;
    const handleStart = () => {
      if (started)
        return;
      started = true;
      onStart?.(this);
    };
    return new Promise((resolve) => {
      const handleComplete = () => {
        if (--pending > 0)
          return;
        this.userData = {};
        if (lock) {
          this.isLocked = false;
          this._scrollToLocked = false;
        }
        onComplete?.(this);
        resolve(true);
      };
      for (const { axis, target } of targets) {
        this.scrollAxisTo(axis, target, {
          ...options,
          onStart: handleStart,
          onComplete: handleComplete,
          onCancel: () => resolve(false)
        });
      }
    });
  }
  scrollAxisTo(axis, _target, {
    immediate = false,
    programmatic = true,
    lerp = programmatic ? this.options.programmatic.lerp : undefined,
    duration = programmatic ? this.options.programmatic.duration : undefined,
    easing = programmatic ? this.options.programmatic.easing : undefined,
    onStart,
    onComplete,
    onCancel
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
    let target = _target;
    if (this.options.infinite) {
      if (programmatic) {
        axis.rawTargetScroll = axis.rawScroll = axis.rawLastScroll = axis.scroll;
        const distance = target - axis.rawScroll;
        if (distance > axis.maxScroll / 2) {
          target -= axis.maxScroll;
        } else if (distance < -axis.maxScroll / 2) {
          target += axis.maxScroll;
        }
      }
    } else {
      target = clamp(0, target, axis.maxScroll);
    }
    if (target === axis.rawTargetScroll) {
      onStart?.(this);
      onComplete?.(this);
      this.scheduleScrollendEvent();
      return;
    }
    if (immediate) {
      axis.rawScroll = axis.rawTargetScroll = target;
      axis.setScroll(axis.scroll);
      axis.reset();
      if (!this.isAnyAxisAnimating)
        this.isScrolling = false;
      this.preventNextNativeScrollEvent();
      this.emit();
      onStart?.(this);
      onComplete?.(this);
      this.scheduleScrollendEvent();
      return;
    }
    if (!programmatic) {
      axis.rawTargetScroll = target;
    }
    if (typeof duration === "number" && typeof easing !== "function") {
      easing = defaultEasing;
    } else if (typeof easing === "function" && typeof duration !== "number") {
      duration = 1;
    }
    axis.animate.fromTo(axis.rawScroll, target, {
      duration,
      easing,
      lerp,
      onCancel,
      onStart: () => {
        this.isScrolling = "smooth";
        onStart?.(this);
      },
      onUpdate: (value, completed) => {
        this.isScrolling = "smooth";
        axis.rawLastScroll = axis.rawScroll;
        axis.rawScroll = value;
        if (programmatic) {
          axis.rawTargetScroll = value;
        }
        if (!completed)
          this.emit();
        if (completed) {
          axis.setScroll(axis.scroll);
          axis.reset();
          if (!this.isAnyAxisAnimating)
            this.isScrolling = false;
          this.emit();
          onComplete?.(this);
          this.scheduleScrollendEvent();
          this.preventNextNativeScrollEvent();
        }
      }
    });
  }
  flushScroll() {
    const opts = {
      behavior: "instant"
    };
    if (this.options.orientation !== "vertical")
      opts.left = this.x.scroll;
    if (this.options.orientation !== "horizontal")
      opts.top = this.y.scroll;
    this.options.wrapper.scrollTo(opts);
  }
  scheduleScrollendEvent() {
    if (this._scrollendRafId !== null)
      return;
    this._scrollendRafId = requestAnimationFrame(() => {
      this._scrollendRafId = null;
      if (this.isScrolling)
        return;
      this.dispatchScrollendEvent();
    });
  }
  dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(new CustomEvent("scrollend", {
      bubbles: this.options.wrapper === window,
      detail: {
        lenis: this
      }
    }));
  };
  preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true;
    requestAnimationFrame(() => {
      this._preventNextNativeScrollEvent = false;
    });
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
