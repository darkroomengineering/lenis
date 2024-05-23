(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Lenis = factory());
})(this, (function () { 'use strict';

  function removeParentSticky(element) {
    const position = getComputedStyle(element).position;

    const isSticky = position === 'sticky';

    if (isSticky) {
      element.style.setProperty('position', 'static');
      element.dataset.sticky = 'true';
    }

    if (element.offsetParent) {
      removeParentSticky(element.offsetParent);
    }
  }

  function addParentSticky(element) {
    if (element?.dataset?.sticky === 'true') {
      element.style.removeProperty('position');
      delete element.dataset.sticky;
    }

    if (element.offsetParent) {
      addParentSticky(element.offsetParent);
    }
  }

  function offsetTop(element, accumulator = 0) {
    const top = accumulator + element.offsetTop;
    if (element.offsetParent) {
      return offsetTop(element.offsetParent, top)
    }
    return top
  }

  function offsetLeft(element, accumulator = 0) {
    const left = accumulator + element.offsetLeft;
    if (element.offsetParent) {
      return offsetLeft(element.offsetParent, left)
    }
    return left
  }

  function scrollTop(element, accumulator = 0) {
    const top = accumulator + element.scrollTop;
    if (element.offsetParent) {
      return scrollTop(element.offsetParent, top)
    }
    return top + window.scrollY
  }

  function scrollLeft(element, accumulator = 0) {
    const left = accumulator + element.scrollLeft;
    if (element.offsetParent) {
      return scrollLeft(element.offsetParent, left)
    }
    return left + window.scrollX
  }

  class Slide {
    constructor(
      element,
      { align = ['start'], ignoreSticky = true, ignoreTransform = false } = {}
    ) {
      this.element = element;

      this.ignoreSticky = ignoreSticky;
      this.ignoreTransform = ignoreTransform;

      this.align = [align].flat();

      this.rect = {};

      this.wrapperResizeObserver = new ResizeObserver(this.onWrapperResize);
      this.wrapperResizeObserver.observe(document.body);

      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.element);
    }

    destroy() {
      this.wrapperResizeObserver.disconnect();
      this.resizeObserver.disconnect();
    }

    setRect({ top, left, width, height, element }) {
      top = top ?? this.rect.top;
      left = left ?? this.rect.left;
      width = width ?? this.rect.width;
      height = height ?? this.rect.height;
      element = element ?? this.rect.element;

      if (
        top === this.rect.top &&
        left === this.rect.left &&
        width === this.rect.width &&
        height === this.rect.height &&
        element === this.rect.element
      )
        return

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

      if (this.ignoreSticky) removeParentSticky(this.element);
      if (this.ignoreTransform) {
        top = offsetTop(this.element);
        left = offsetLeft(this.element);
      } else {
        const rect = this.element.getBoundingClientRect();
        top = rect.top + scrollTop(this.element);
        left = rect.left + scrollLeft(this.element);
      }
      if (this.ignoreSticky) addParentSticky(this.element);

      this.setRect({ top, left });
    }

    onResize = ([entry]) => {
      const width = entry.borderBoxSize[0].inlineSize;
      const height = entry.borderBoxSize[0].blockSize;

      this.setRect({ width, height });
    }
  }

  // TODO:
  // - horizontal
  // - fix trackpad snapping too soon due to velocity (fuck Apple)
  // - fix wheel scrolling after limits (see console scroll to)
  // - fix touch scroll, do not snap when not released
  class Snap {
      constructor(lenis, { type = 'mandatory', lerp, easing, duration, velocityThreshold = 1, onSnapStart, onSnapComplete, } = {}) {
          this.onWindowResize = () => {
              this.viewport.width = window.innerWidth;
              this.viewport.height = window.innerHeight;
          };
          this.onScroll = ({ scroll, limit, lastVelocity, velocity, isScrolling, isTouching }, { userData, isSmooth, type }) => {
              if (this.isStopped)
                  return;
              // console.log(scroll, velocity, type)
              // return
              const isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity);
              const isTurningBack = Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0;
              // console.log({ lastVelocity, velocity, isTurningBack, isDecelerating })
              // console.log('onScroll')
              if (Math.abs(velocity) < this.velocityThreshold &&
                  // !isTouching &&
                  isDecelerating &&
                  !isTurningBack &&
                  (userData === null || userData === void 0 ? void 0 : userData.initiator) !== 'snap') {
                  scroll = Math.ceil(scroll);
                  let snaps = [0, ...this.snaps.values(), limit];
                  this.elements.forEach(({ rect, align }) => {
                      let snap;
                      align.forEach((align) => {
                          if (align === 'start') {
                              snap = rect.top;
                          }
                          else if (align === 'center') {
                              snap = rect.top + rect.height / 2 - this.viewport.height / 2;
                          }
                          else if (align === 'end') {
                              snap = rect.top + rect.height - this.viewport.height;
                          }
                          if (snap !== undefined) {
                              snaps.push(Math.ceil(snap));
                          }
                      });
                  });
                  snaps = snaps.sort((a, b) => Math.abs(a) - Math.abs(b));
                  let prevSnap = snaps.findLast((snap) => snap <= scroll);
                  if (prevSnap === undefined)
                      prevSnap = snaps[0];
                  const distanceToPrevSnap = Math.abs(scroll - prevSnap);
                  let nextSnap = snaps.find((snap) => snap >= scroll);
                  if (nextSnap === undefined)
                      nextSnap = snaps[snaps.length - 1];
                  const distanceToNextSnap = Math.abs(scroll - nextSnap);
                  const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap;
                  const distance = Math.abs(scroll - snap);
                  if (this.type === 'mandatory' ||
                      (this.type === 'proximity' && distance <= this.viewport.height)) {
                      // this.__isScrolling = true
                      // this.onSnapStart?.(snap)
                      // console.log('scroll to')
                      this.lenis.scrollTo(snap, {
                          lerp: this.options.lerp,
                          easing: this.options.easing,
                          duration: this.options.duration,
                          userData: { initiator: 'snap' },
                          onStart: () => {
                              var _a;
                              (_a = this.onSnapStart) === null || _a === void 0 ? void 0 : _a.call(this, snap);
                          },
                          onComplete: () => {
                              var _a;
                              (_a = this.onSnapComplete) === null || _a === void 0 ? void 0 : _a.call(this, snap);
                          },
                      });
                  }
                  // console.timeEnd('scroll')
              }
          };
          this.lenis = lenis;
          this.options = {
              type,
              lerp,
              easing,
              duration,
              velocityThreshold,
          };
          this.type = type;
          this.elements = new Map();
          this.snaps = new Map();
          this.velocityThreshold = velocityThreshold;
          this.onSnapStart = onSnapStart;
          this.onSnapComplete = onSnapComplete;
          this.viewport = {
              width: window.innerWidth,
              height: window.innerHeight,
          };
          this.onWindowResize();
          window.addEventListener('resize', this.onWindowResize);
          this.lenis.on('scroll', this.onScroll);
      }
      // debug() {
      //   const element = document.createElement('div')
      //   element.style.cssText = `
      //     position: fixed;
      //     background: red;
      //     border-bottom: 1px solid red;
      //     left: 0;
      //     right: 0;
      //     top: 0;
      //     z-index: 9999;
      //   `
      //   document.body.appendChild(element)
      // }
      destroy() {
          this.lenis.off('scroll', this.onScroll);
          window.removeEventListener('resize', this.onWindowResize);
          this.elements.forEach((slide) => slide.destroy());
      }
      start() {
          this.isStopped = false;
      }
      stop() {
          this.isStopped = true;
      }
      add(value) {
          const id = crypto.randomUUID();
          this.snaps.set(id, value);
          return () => this.remove(id);
      }
      remove(id) {
          this.snaps.delete(id);
      }
      addElement(element, options = {}) {
          const id = crypto.randomUUID();
          this.elements.set(id, new Slide(element, options));
          return () => this.removeElement(id);
      }
      removeElement(id) {
          this.elements.delete(id);
      }
  }

  return Snap;

}));
//# sourceMappingURL=lenis-snap.js.map
