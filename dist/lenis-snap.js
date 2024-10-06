// packages/snap/src/debounce.ts
function debounce(callback, delay) {
  let timer;
  return function(...args) {
    let context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = void 0;
      callback.apply(context, args);
    }, delay);
  };
}

// packages/snap/src/element.ts
function removeParentSticky(element) {
  const position = getComputedStyle(element).position;
  const isSticky = position === "sticky";
  if (isSticky) {
    element.style.setProperty("position", "static");
    element.dataset.sticky = "true";
  }
  if (element.offsetParent) {
    removeParentSticky(element.offsetParent);
  }
}
function addParentSticky(element) {
  if (element?.dataset?.sticky === "true") {
    element.style.removeProperty("position");
    delete element.dataset.sticky;
  }
  if (element.offsetParent) {
    addParentSticky(element.offsetParent);
  }
}
function offsetTop(element, accumulator = 0) {
  const top = accumulator + element.offsetTop;
  if (element.offsetParent) {
    return offsetTop(element.offsetParent, top);
  }
  return top;
}
function offsetLeft(element, accumulator = 0) {
  const left = accumulator + element.offsetLeft;
  if (element.offsetParent) {
    return offsetLeft(element.offsetParent, left);
  }
  return left;
}
function scrollTop(element, accumulator = 0) {
  const top = accumulator + element.scrollTop;
  if (element.offsetParent) {
    return scrollTop(element.offsetParent, top);
  }
  return top + window.scrollY;
}
function scrollLeft(element, accumulator = 0) {
  const left = accumulator + element.scrollLeft;
  if (element.offsetParent) {
    return scrollLeft(element.offsetParent, left);
  }
  return left + window.scrollX;
}
var SnapElement = class {
  element;
  options;
  align;
  // @ts-ignore
  rect = {};
  wrapperResizeObserver;
  resizeObserver;
  constructor(element, {
    align = ["start"],
    ignoreSticky = true,
    ignoreTransform = false
  } = {}) {
    this.element = element;
    this.options = { align, ignoreSticky, ignoreTransform };
    this.align = [align].flat();
    this.wrapperResizeObserver = new ResizeObserver(this.onWrapperResize);
    this.wrapperResizeObserver.observe(document.body);
    this.onWrapperResize();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.element);
    this.setRect({
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    });
  }
  destroy() {
    this.wrapperResizeObserver.disconnect();
    this.resizeObserver.disconnect();
  }
  setRect({
    top,
    left,
    width,
    height,
    element
  } = {}) {
    top = top ?? this.rect.top;
    left = left ?? this.rect.left;
    width = width ?? this.rect.width;
    height = height ?? this.rect.height;
    element = element ?? this.rect.element;
    if (top === this.rect.top && left === this.rect.left && width === this.rect.width && height === this.rect.height && element === this.rect.element)
      return;
    this.rect.top = top;
    this.rect.y = top;
    this.rect.width = width;
    this.rect.height = height;
    this.rect.left = left;
    this.rect.x = left;
    this.rect.bottom = top + height;
    this.rect.right = left + width;
  }
  onWrapperResize = () => {
    let top, left;
    if (this.options.ignoreSticky) removeParentSticky(this.element);
    if (this.options.ignoreTransform) {
      top = offsetTop(this.element);
      left = offsetLeft(this.element);
    } else {
      const rect = this.element.getBoundingClientRect();
      top = rect.top + scrollTop(this.element);
      left = rect.left + scrollLeft(this.element);
    }
    if (this.options.ignoreSticky) addParentSticky(this.element);
    this.setRect({ top, left });
  };
  onResize = ([entry]) => {
    if (!entry?.borderBoxSize[0]) return;
    const width = entry.borderBoxSize[0].inlineSize;
    const height = entry.borderBoxSize[0].blockSize;
    this.setRect({ width, height });
  };
};

// packages/snap/src/uid.ts
var index = 0;
function uid() {
  return index++;
}

// packages/snap/src/snap.ts
var Snap = class {
  constructor(lenis, {
    type = "mandatory",
    lerp,
    easing,
    duration,
    velocityThreshold = 1,
    debounce: debounceDelay = 0,
    onSnapStart,
    onSnapComplete
  } = {}) {
    this.lenis = lenis;
    this.options = {
      type,
      lerp,
      easing,
      duration,
      velocityThreshold,
      debounce: debounceDelay,
      onSnapStart,
      onSnapComplete
    };
    this.onWindowResize();
    window.addEventListener("resize", this.onWindowResize, false);
    this.onSnapDebounced = debounce(this.onSnap, this.options.debounce);
    this.lenis.on("scroll", this.onScroll);
  }
  options;
  elements = /* @__PURE__ */ new Map();
  snaps = /* @__PURE__ */ new Map();
  viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  isStopped = false;
  onSnapDebounced;
  /**
   * Destroy the snap instance
   */
  destroy() {
    this.lenis.off("scroll", this.onScroll);
    window.removeEventListener("resize", this.onWindowResize, false);
    this.elements.forEach((element) => element.destroy());
  }
  /**
   * Start the snap after it has been stopped
   */
  start() {
    this.isStopped = false;
  }
  /**
   * Stop the snap
   */
  stop() {
    this.isStopped = true;
  }
  /**
   * Add a snap to the snap instance
   *
   * @param value The value to snap to
   * @param userData User data that will be forwarded through the snap event
   * @returns Unsubscribe function
   */
  add(value, userData = {}) {
    const id = uid();
    this.snaps.set(id, { value, userData });
    return () => this.remove(id);
  }
  /**
   * Remove a snap from the snap instance
   *
   * @param id The snap id of the snap to remove
   */
  remove(id) {
    this.snaps.delete(id);
  }
  /**
   * Add an element to the snap instance
   *
   * @param element The element to add
   * @param options The options for the element
   * @returns Unsubscribe function
   */
  addElement(element, options = {}) {
    const id = uid();
    this.elements.set(id, new SnapElement(element, options));
    return () => this.removeElement(id);
  }
  /**
   * Remove an element from the snap instance
   *
   * @param id The snap id of the snap element to remove
   */
  removeElement(id) {
    this.elements.delete(id);
  }
  onWindowResize = () => {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
  };
  onScroll = ({
    // scroll,
    // limit,
    lastVelocity,
    velocity,
    // isScrolling,
    userData
  }) => {
    if (this.isStopped) return;
    const isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity);
    const isTurningBack = Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0;
    if (Math.abs(velocity) < this.options.velocityThreshold && // !isTouching &&
    isDecelerating && !isTurningBack && userData?.initiator !== "snap") {
      this.onSnapDebounced();
    }
  };
  onSnap = () => {
    let { scroll, isHorizontal } = this.lenis;
    scroll = Math.ceil(this.lenis.scroll);
    let snaps = [...this.snaps.values()];
    this.elements.forEach(({ rect, align }) => {
      let value;
      align.forEach((align2) => {
        if (align2 === "start") {
          value = rect.top;
        } else if (align2 === "center") {
          value = isHorizontal ? rect.left + rect.width / 2 - this.viewport.width / 2 : rect.top + rect.height / 2 - this.viewport.height / 2;
        } else if (align2 === "end") {
          value = isHorizontal ? rect.left + rect.width - this.viewport.width : rect.top + rect.height - this.viewport.height;
        }
        if (typeof value === "number") {
          snaps.push({ value: Math.ceil(value), userData: {} });
        }
      });
    });
    snaps = snaps.sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
    let prevSnap = snaps.findLast(({ value }) => value <= scroll);
    if (prevSnap === void 0) prevSnap = snaps[0];
    const distanceToPrevSnap = Math.abs(scroll - prevSnap.value);
    let nextSnap = snaps.find(({ value }) => value >= scroll);
    if (nextSnap === void 0) nextSnap = snaps[snaps.length - 1];
    const distanceToNextSnap = Math.abs(scroll - nextSnap.value);
    const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap;
    const distance = Math.abs(scroll - snap.value);
    if (this.options.type === "mandatory" || this.options.type === "proximity" && distance <= (isHorizontal ? this.lenis.dimensions.width : this.lenis.dimensions.height)) {
      this.lenis.scrollTo(snap.value, {
        lerp: this.options.lerp,
        easing: this.options.easing,
        duration: this.options.duration,
        userData: { initiator: "snap" },
        onStart: () => {
          this.options.onSnapStart?.(snap);
        },
        onComplete: () => {
          this.options.onSnapComplete?.(snap);
        }
      });
    }
  };
};

// packages/snap/browser.ts
globalThis.Snap = Snap;
//# sourceMappingURL=lenis-snap.js.map