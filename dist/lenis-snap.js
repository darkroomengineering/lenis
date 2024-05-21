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


    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

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
    var Snap = /** @class */ (function () {
        function Snap(lenis, _a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.type, type = _c === void 0 ? 'mandatory' : _c, _d = _b.velocityThreshold, velocityThreshold = _d === void 0 ? 1 : _d, onSnapStart = _b.onSnapStart, onSnapComplete = _b.onSnapComplete;
            var _this = this;
            this.onWindowResize = function () {
                _this.viewport.width = window.innerWidth;
                _this.viewport.height = window.innerHeight;
            };
            this.onScroll = function (_a, _b) {
                var scroll = _a.scroll, limit = _a.limit, lastVelocity = _a.lastVelocity, velocity = _a.velocity; _a.isScrolling; _a.isTouching;
                var userData = _b.userData; _b.isSmooth; var type = _b.type;
                console.log(scroll, velocity, type);
                // return
                var isDecelerating = Math.abs(lastVelocity) > Math.abs(velocity);
                var isTurningBack = Math.sign(lastVelocity) !== Math.sign(velocity) && velocity !== 0;
                // console.log({ lastVelocity, velocity, isTurningBack, isDecelerating })
                // console.log('onScroll')
                if (Math.abs(velocity) < _this.velocityThreshold &&
                    // !isTouching &&
                    isDecelerating &&
                    !isTurningBack &&
                    (userData === null || userData === void 0 ? void 0 : userData.initiator) !== 'snap') {
                    scroll = Math.ceil(scroll);
                    // console.log('not scrolling anymore')
                    var snaps_1 = __spreadArray(__spreadArray([0], _this.snaps.values(), true), [limit], false);
                    _this.elements.forEach(function (_a) {
                        var rect = _a.rect, align = _a.align;
                        var snap;
                        align.forEach(function (align) {
                            if (align === 'start') {
                                snap = rect.top;
                            }
                            else if (align === 'center') {
                                snap = rect.top + rect.height / 2 - _this.viewport.height / 2;
                            }
                            else if (align === 'end') {
                                snap = rect.top + rect.height - _this.viewport.height;
                            }
                            if (snap !== undefined) {
                                snaps_1.push(Math.ceil(snap));
                            }
                        });
                    });
                    snaps_1 = snaps_1.sort(function (a, b) { return Math.abs(a) - Math.abs(b); });
                    var prevSnap = snaps_1.findLast(function (snap) { return snap <= scroll; });
                    if (prevSnap === undefined)
                        prevSnap = snaps_1[0];
                    var distanceToPrevSnap = Math.abs(scroll - prevSnap);
                    var nextSnap = snaps_1.find(function (snap) { return snap >= scroll; });
                    if (nextSnap === undefined)
                        nextSnap = snaps_1[snaps_1.length - 1];
                    var distanceToNextSnap = Math.abs(scroll - nextSnap);
                    var snap_1 = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap;
                    var distance = Math.abs(scroll - snap_1);
                    if (_this.type === 'mandatory' ||
                        (_this.type === 'proximity' && distance <= _this.viewport.height / 2)) {
                        // this.__isScrolling = true
                        // this.onSnapStart?.(snap)
                        // console.log('scroll to')
                        _this.lenis.scrollTo(snap_1, {
                            userData: { initiator: 'snap' },
                            onStart: function () {
                                var _a;
                                (_a = _this.onSnapStart) === null || _a === void 0 ? void 0 : _a.call(_this, snap_1);
                            },
                            onComplete: function () {
                                var _a;
                                (_a = _this.onSnapComplete) === null || _a === void 0 ? void 0 : _a.call(_this, snap_1);
                            },
                        });
                    }
                    // console.timeEnd('scroll')
                }
            };
            this.lenis = lenis;
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
        Snap.prototype.destroy = function () {
            this.lenis.off('scroll', this.onScroll);
            window.removeEventListener('resize', this.onWindowResize);
            this.elements.forEach(function (slide) { return slide.destroy(); });
        };
        Snap.prototype.add = function (value) {
            var _this = this;
            var id = crypto.randomUUID();
            this.snaps.set(id, value);
            return function () { return _this.remove(id); };
        };
        Snap.prototype.remove = function (id) {
            this.elements.delete(element);
        };
        Snap.prototype.addElement = function (element, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var id = crypto.randomUUID();
            this.elements.set(id, new Slide(element, options));
            return function () { return _this.removeElement(id); };
        };
        Snap.prototype.removeElement = function (id) {
            this.elements.delete(id);
        };
        return Snap;
    }());

    return Snap;

}));
//# sourceMappingURL=lenis-snap.js.map
