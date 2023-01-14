import { TinyEmitter as EventEmitter } from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { version } from '../package.json'
import { clamp, clampedModulo } from './maths'
import { getSnapLength } from './util'

class Animate {
  to(target, { duration = 1, easing = (t) => t, ...keys } = {}) {
    this.target = target
    this.fromKeys = { ...keys }
    this.toKeys = { ...keys }
    this.keys = Object.keys({ ...keys })

    // get initial values
    this.keys.forEach((key) => {
      this.fromKeys[key] = target[key]
    })

    this.duration = duration
    this.easing = easing
    this.currentTime = 0
    this.isRunning = true
  }

  stop() {
    this.isRunning = false
  }

  raf(deltaTime) {
    if (!this.isRunning) return

    this.currentTime += deltaTime

    const progress = this.currentTime >= this.duration ? 1 : this.easing(this.currentTime / this.duration)

    this.keys.forEach((key) => {
      const from = this.fromKeys[key]
      const to = this.toKeys[key]

      this.target[key] = from + (to - from) * progress
    })

    if (progress === 1) {
      this.stop()
    }
  }

}

export default class Lenis extends EventEmitter {
  /**
   * @typedef {(t: number) => number} EasingFunction
   * @typedef {'vertical' | 'horizontal'} Direction
   * @typedef {'vertical' | 'horizontal' | 'both'} GestureDirection
   * @typedef {'start' | 'end' | 'center'} SnapAlign
   *
   * @typedef LenisOptions
   * @property {number} [duration]
   * @property {EasingFunction} [easing]
   * @property {boolean} [smooth]
   * @property {number} [mouseMultiplier]
   * @property {boolean} [smoothTouch]
   * @property {number} [touchMultiplier]
   * @property {Direction} [direction]
   * @property {GestureDirection} [gestureDirection]
   * @property {boolean} [infinite]
   * @property {Window | HTMLElement} [wrapper]
   * @property {HTMLElement} [content]
   * @property {number} [snapDuration]
   * @property {number} [snapDelayOnWheel]
   * @property {number} [snapDelayOnResize]
   * @property {string|number} [snapLength]
   * @property {SnapAlign} [snapAlign]
   *
   * @param {LenisOptions}
   */
  constructor({
    duration = 1.2,
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/k2tgx2kn8t
    smooth = true,
    mouseMultiplier = 1,
    smoothTouch = false,
    touchMultiplier = 2,
    direction = 'vertical', // vertical, horizontal
    gestureDirection = 'vertical', // vertical, horizontal, both
    infinite = false,
    wrapper = window,
    content = document.body,
    snapDuration = 0.4,
    snapDelayOnWheel = 0.4,
    snapDelayOnResize = 0.1,
    snapLength = '20%',
    snapAlign = 'start', // start, end, center
  } = {}) {
    super()

    window.lenisVersion = version

    this.options = {
      duration,
      easing,
      smooth,
      mouseMultiplier,
      smoothTouch,
      touchMultiplier,
      direction,
      gestureDirection,
      infinite,
      wrapper,
      content,
    }

    this.duration = duration
    this.easing = easing
    this.smooth = smooth
    this.mouseMultiplier = mouseMultiplier
    this.smoothTouch = smoothTouch
    this.touchMultiplier = touchMultiplier
    this.direction = direction
    this.gestureDirection = gestureDirection
    this.infinite = infinite
    this.wrapperNode = wrapper
    this.contentNode = content

    this.snapAlign = snapAlign || 'start';
    this.snapLength = snapLength || 'start';
    this.snapDuration = snapDuration;
    this.snapDelayOnWheelMS = snapDelayOnWheel * 1000; // MS => MilliSeconds
    this.snapDelayOnResizeMS = snapDelayOnResize < 0.05 ? 100 : snapDelayOnResize * 1000 // Snap delay should be bigger than 50ms to avoid weird behavior
    this.isHorizontal = this.direction === 'horizontal'

    this.wrapperNode.addEventListener('scroll', this.onScroll)
    this.wrapperNode.addEventListener('mousedown', this.onMouseDown)
    this.wrapperNode.addEventListener('mouseup', this.onMouseUp)

    //observe wrapper node size
    if (this.wrapperNode === window) {
      this.wrapperNode.addEventListener('resize', this.onWindowResize)
      this.onWindowResize()
    } else {
      this.wrapperHeight = this.wrapperNode.offsetHeight
      this.wrapperWidth = this.wrapperNode.offsetWidth

      //observe wrapper node size
      this.wrapperObserver = new ResizeObserver(this.onWrapperResize)
      this.wrapperObserver.observe(this.wrapperNode)
    }

    this.contentHeight = this.contentNode.offsetHeight
    this.contentWidth = this.contentNode.offsetWidth

    //observe content node size
    this.contentObserver = new ResizeObserver(this.onContentResize)
    this.contentObserver.observe(this.contentNode)

    //set initial scroll position
    this.targetScroll =
      this.scroll =
      this.lastScroll =
        this.wrapperNode[this.scrollProperty]

    this.animate = new Animate()

    const platform =
      navigator?.userAgentData?.platform || navigator?.platform || 'unknown'

    // listen and normalize wheel event cross-browser
    this.virtualScroll = new VirtualScroll({
      el: this.wrapperNode,
      firefoxMultiplier: 50,
      mouseMultiplier:
        this.mouseMultiplier *
        (platform.includes('Win') || platform.includes('Linux') ? 0.84 : 0.4), // assuming using a mouse on windows qnd linux
      touchMultiplier: this.touchMultiplier,
      passive: false,
      useKeyboard: false,
      useTouch: true,
    })

    this.virtualScroll.on(this.onVirtualScroll)

    this.initSnapElements()
  }

  get scrollProperty() {
    let property
    if (this.wrapperNode === window) {
      property = this.direction === 'horizontal' ? 'scrollX' : 'scrollY'
    } else {
      property = this.direction === 'horizontal' ? 'scrollLeft' : 'scrollTop'
    }
    return property
  }

  start() {
    let element = this.wrapperNode
    if (this.wrapperNode === window) element = document.documentElement
    element.classList.remove('lenis-stopped')

    this.stopped = false
  }

  stop() {
    let element = this.wrapperNode
    if (this.wrapperNode === window) element = document.documentElement
    element.classList.add('lenis-stopped')

    this.stopped = true
    this.animate.stop()
  }

  destroy() {
    if (this.wrapperNode === window) {
      this.wrapperNode.removeEventListener('resize', this.onWindowResize)
    }
    this.wrapperNode.removeEventListener('scroll', this.onScroll)

    this.virtualScroll.destroy()
    this.wrapperObserver?.disconnect()
    this.contentObserver.disconnect()
  }

  onWindowResize = () => {
    this.wrapperWidth = window.innerWidth
    this.wrapperHeight = window.innerHeight
    this.scheduleSnap(this.snapDelayOnResizeMS)
  }

  onWrapperResize = ([entry]) => {
    if (entry) {
      const rect = entry.contentRect
      this.wrapperWidth = rect.width
      this.wrapperHeight = rect.height
      this.scheduleSnap(this.snapDelayOnResizeMS)
    }
  }

  onContentResize = ([entry]) => {
    if (entry) {
      const rect = entry.contentRect
      this.contentWidth = rect.width
      this.contentHeight = rect.height
      this.scheduleSnap(this.snapDelayOnResizeMS)
    }
  }

  get limit() {
    return this.direction === 'horizontal'
      ? this.contentWidth - this.wrapperWidth
      : this.contentHeight - this.wrapperHeight
  }

  onVirtualScroll = ({ deltaY, deltaX, originalEvent: e }) => {
    // keep previous/next page gesture on trackpads
    if (
      (this.gestureDirection === 'vertical' && deltaY === 0) ||
      (this.gestureDirection === 'horizontal' && deltaX === 0)
    ) {
      return
    }

    const preventScroll = !!e
      .composedPath()
      .find(
        (node) => node.hasAttribute && node.hasAttribute('data-lenis-prevent')
      )

    if (e.ctrlKey || preventScroll) return

    // switch to smooth if event is touch and if smoothTouch=true
    this.smooth = !!e.changedTouches ? this.smoothTouch : this.options.smooth

    if (this.stopped) {
      e.preventDefault()
      return
    }

    if (!this.smooth) return

    // fix wheel holding scroll https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    if (e.buttons === 4) return

    // prevent native wheel scrolling
    if (this.smooth) e.preventDefault()

    let delta = 0
    if (this.gestureDirection === 'both') {
      delta = deltaX + deltaY
    } else if (this.gestureDirection === 'horizontal') {
      delta = deltaX
    } else {
      // vertical
      delta = deltaY
    }

    this.targetScroll -= delta
    // this.targetScroll = clamp(0, this.targetScroll, this.limit)

    this.scrollTo(this.targetScroll)
    this.scheduleSnap(this.snapDelayOnWheelMS)

  }

  raf(now) {
    const deltaTime = now - (this.now || 0)
    this.now = now

    if (this.stopped || !this.smooth) return

    this.lastScroll = this.scroll

    // where this.scroll is updated
    if (!this.pause) {
      this.animate.raf(deltaTime * 0.001)
    }

    if (this.scroll === this.targetScroll) {
      // if target reached velocity should be 0
      this.lastScroll = this.scroll
      this.animate.stop()
    }

    if (this.isScrolling) {
      this.setScroll(this.scroll)
      this.notify()
    }

    this.isScrolling = this.scroll !== this.lastScroll
  }

  get velocity() {
    return this.scroll - this.lastScroll
  }

  setScroll(value) {
    let scroll = this.infinite ? clampedModulo(value, this.limit) : value

    this.direction === 'horizontal'
      ? this.wrapperNode.scrollTo(scroll, 0)
      : this.wrapperNode.scrollTo(0, scroll)
  }

  onScroll = (e) => {
    // if isScrolling false we can consider user isn't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to value immediately
    if (!this.isScrolling || !this.smooth) {
      // where native scroll happens
      this.targetScroll =
        this.scroll =
        this.lastScroll =
          this.wrapperNode[this.scrollProperty]

      this.scheduleSnap(this.snapDelayOnResizeMS)

      this.notify()
    }
  }

  notify() {
    let scroll = this.infinite
      ? clampedModulo(this.scroll, this.limit)
      : this.scroll
    let direction = this.velocity === 0 ? 0 : this.velocity > 0 ? 1 : -1

    this.emit('scroll', {
      scroll,
      limit: this.limit,
      velocity: this.velocity,
      direction,
      progress: scroll / this.limit,
    })
  }

  scrollTo(
    target,
    {
      offset = 0,
      immediate = false,
      duration = this.duration,
      easing = this.easing,
    } = {}
  ) {
    if (target === undefined || target === null || this.stopped) return
    let value

    if (typeof target === 'number') {
      value = target
    } else if (target === 'top' || target === '#top') {
      value = 0
    } else if (target === 'bottom') {
      value = this.limit
    } else {
      let node

      if (typeof target === 'string') {
        // CSS selector
        node = document.querySelector(target)
      } else if (target?.nodeType) {
        // Node element
        node = target
      } else {
        return
      }

      if (!node) return
      let wrapperOffset = 0

      if (this.wrapperNode !== window) {
        const wrapperRect = this.wrapperNode.getBoundingClientRect()
        wrapperOffset =
          this.direction === 'horizontal' ? wrapperRect.left : wrapperRect.top
      }

      const rect = node.getBoundingClientRect()

      value =
        (this.direction === 'horizontal' ? rect.left : rect.top) +
        this.scroll -
        wrapperOffset
    }

    value += offset

    if (this.infinite) {
      this.targetScroll = value
    } else {
      this.targetScroll = clamp(0, value, this.limit)
    }

    if (!this.smooth || immediate) {
      this.animate.stop()
      this.scroll = this.lastScroll = this.targetScroll
      this.setScroll(this.targetScroll)
    } else {
      this.animate.to(this, {
        duration,
        easing,
        scroll: this.targetScroll,
      })
    }
  }

  initSnapElements() {
    let allSnapElements = this.contentNode.querySelectorAll('[snap]');
    allSnapElements.forEach(snapElement => {
      snapElement.snapAlign = snapElement.getAttribute('snap') || this.snapAlign; // start, end, center
      snapElement.snapLength = getSnapLength(snapElement, snapElement.getAttribute('snap-length') || this.snapLength);
    })

    this.snapElements = allSnapElements;
  }

  snap() {
    if (!this.snapElements?.length) {
      return
    }

    let wrapperRect;
    if (this.wrapperNode === window) {
      wrapperRect = {
        left: 0,
        top: 0,
        right: this.wrapperWidth,
        bottom: this.wrapperHeight,
      }
    } else {
      wrapperRect = this.wrapperNode.getBoundingClientRect();
    }

    this.snapElements.forEach(snapElement => {
      const snapAlign = snapElement.snapAlign; // start, end, center
      const snapLength = snapElement.snapLength;
      const elRect = snapElement.getBoundingClientRect();

      let delta;
      if ('end' === snapAlign) {
        delta = this.isHorizontal ? elRect.right - wrapperRect.right : elRect.bottom - wrapperRect.bottom
      } else if ('center' === snapAlign) {
        delta = this.isHorizontal ? (elRect.left - wrapperRect.left + (elRect.width - this.wrapperWidth) / 2) : (elRect.top - wrapperRect.top + (elRect.height - this.wrapperHeight) / 2)
      } else {
        // default type 'start'
        delta = this.isHorizontal ? elRect.left - wrapperRect.left : elRect.top - wrapperRect.top;
      }

      if (Math.abs(delta) <= snapLength) {
        this.scrollTo(this.scroll + delta, { duration: this.snapDuration });
        return;
      }
    })
  }

  scheduleSnap(delay) {
    if (this.snapTimer) {
      clearTimeout(this.snapTimer)
    }

    this.snapTimer = setTimeout(() => {
      this.snap();
    }, delay);
  }

  onMouseUp = () => {
    this.pause = false;
  }

  onMouseDown = () => {
    this.pause = true;
  }
}
