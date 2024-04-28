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
      element.dataset.sticky = 'true';
      delete element.dataset.sticky;
    }

    if (element.parentNode) {
      addParentSticky(element.parentNode);
    }
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
    constructor(element, { align = 'start', type = 'mandatory' } = {}) {
      this.element = element;
      this.align = align;
      this.type = type;

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

      removeParentSticky(this.element);
      {
        const rect = this.element.getBoundingClientRect();
        top = rect.top + scrollTop(this.element);
        left = rect.left + scrollLeft(this.element);
      }
      addParentSticky(this.element);

      this.setRect({ top, left });
    }

    onResize = ([entry]) => {
      const width = entry.borderBoxSize[0].inlineSize;
      const height = entry.borderBoxSize[0].blockSize;

      this.setRect({ width, height });
    }
  }

  var Snap = /** @class */ (function () {
      function Snap(lenis) {
          var _this = this;
          this.onWindowResize = function () {
              _this.viewport.width = window.innerWidth;
              _this.viewport.height = window.innerHeight;
          };
          this.onScroll = function (e) {
              console.log(e.isNativeScroll, e.velocity);
              // console.log('scroll', e.isScrolling)
              // console.log('scroll', e.scroll, e.velocity, e.isScrolling)
              if (e.velocity === 0) {
                  // console.log('not scrolling anymore')
                  _this.elements.forEach(function (_a) {
                      var rect = _a.rect; _a.type; var align = _a.align;
                      var snap;
                      if (align === 'start') {
                          snap = rect.top;
                      }
                      else if (align === 'center') {
                          snap = rect.top + rect.height / 2 - _this.viewport.height / 2;
                      }
                      else if (align === 'end') {
                          snap = rect.top + rect.height - _this.viewport.height;
                      }
                      console.log('snap', snap);
                      // setTimeout(() => {
                      // console.log('scroll to', slide.rect.top + slide.rect.height / 2)
                      // }, 0)
                      // console.log(
                      //   e.scroll,
                      //   slide.type,
                      //   slide.align,
                      //   slide.rect.top + slide.rect.height / 2
                      // )
                  });
              }
          };
          this.lenis = lenis;
          this.elements = new Map();
          this.viewport = {
              width: window.innerWidth,
              height: window.innerHeight,
          };
          this.onWindowResize();
          window.addEventListener('resize', this.onWindowResize);
          this.lenis.on('scroll', this.onScroll);
      }
      Snap.prototype.destroy = function () {
          this.lenis.off('scroll', this.onScroll);
          window.removeEventListener('resize', this.onWindowResize);
          this.elements.forEach(function (slide) { return slide.destroy(); });
      };
      Snap.prototype.add = function (element, options) {
          if (options === void 0) { options = {}; }
          this.elements.set(element, new Slide(element, options));
      };
      Snap.prototype.remove = function (element) {
          this.elements.delete(element);
      };
      return Snap;
  }());

  return Snap;

}));
//# sourceMappingURL=lenis-snap.js.map
