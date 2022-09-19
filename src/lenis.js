import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { version } from '../package.json'
import { clamp } from './maths.js'

// simple animation tool
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

  raf(deltaTime) {
    if (!this.isRunning) return

    this.currentTime = Math.min(
      this.currentTime + deltaTime * 0.001,
      this.duration
    )

    const progress = this.easing(this.progress)

    this.keys.forEach((key) => {
      const from = this.fromKeys[key]
      const to = this.toKeys[key]

      const value = from + (to - from) * progress

      //hot fix https://github.com/studio-freight/lenis/issues/21
      // if (!isNaN(value)) {
      this.target[key] = value
      // }
    })

    if (progress === 1) {
      this.isRunning = false
    }
  }

  get progress() {
    return this.currentTime / this.duration
  }
}

export default class Lenis extends EventEmitter {
  constructor({
    duration = 1.2,
    easing = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), //expo.out
    smooth = true,
    direction = 'vertical',
    wrapper = window,
    content = document.body,
  } = {}) {
    super()

    if (arguments[0].lerp !== undefined) {
      console.warn(
        'Lenis: lerp option is deprecated, you must use duration and easing options instead. See documentation https://github.com/studio-freight/lenis'
      )
    }

    window.lenisVersion = version

    this.wrapperNode = wrapper
    this.contentNode = content

    this.duration = duration
    this.easing = easing
    this.smooth = smooth
    this.direction = direction

    this.wrapperNode.addEventListener('scroll', this.onScroll)

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
      mouseMultiplier: platform.includes('Win') ? 1 : 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: false,
    })

    this.virtualScroll.on(this.onVirtualScroll)
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
    this.stopped = false
  }

  stop() {
    this.stopped = true
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
  }

  onWrapperResize = ([entry]) => {
    if (entry) {
      const rect = entry.contentRect
      this.wrapperWidth = rect.width
      this.wrapperHeight = rect.height
    }
  }

  onContentResize = ([entry]) => {
    if (entry) {
      const rect = entry.contentRect
      this.contentWidth = rect.width
      this.contentHeight = rect.height
    }
  }

  get limit() {
    return this.direction === 'horizontal'
      ? this.contentWidth - this.wrapperWidth
      : this.contentHeight - this.wrapperHeight
  }

  onVirtualScroll = ({ deltaY, originalEvent: e }) => {
    if (e.ctrlKey) return

    if (this.stopped) {
      e.preventDefault()
      return
    }

    if (!this.smooth) return

    // fix wheel holding scroll https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    if (e.buttons === 4) return

    // prevent native wheel scrolling
    if (this.smooth) e.preventDefault()

    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.limit)

    this.scrollTo(this.targetScroll)
  }

  raf(now) {
    const deltaTime = now - (this.now || 0)
    this.now = now

    if (this.stopped || !this.smooth) return

    // where smooth scroll happens
    this.lastScroll = this.scroll

    this.animate.raf(deltaTime)

    // fixes velocity when sometimes final native event is not notified
    if (Math.round(this.scroll) === Math.round(this.targetScroll)) {
      this.lastScroll = this.targetScroll
    }

    if (this.isScrolling) {
      this.setScroll(this.scroll)
      this.notify()
    }

    this.isScrolling = this.scroll !== this.targetScroll
  }

  get velocity() {
    return this.scroll - this.lastScroll
  }

  setScroll(value) {
    this.direction === 'horizontal'
      ? this.wrapperNode.scrollTo(value, 0)
      : this.wrapperNode.scrollTo(0, value)
  }

  onScroll = (e) => {
    // if isScrolling false we can consider user isn't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to value immediately
    if (!this.isScrolling || !this.smooth) {
      // where native scroll happens
      this.targetScroll =
        this.scroll =
        this.lastScroll =
          this.wrapperNode[this.scrollProperty]

      this.notify()
    }
  }

  notify() {
    this.emit('scroll', {
      scroll: this.scroll,
      limit: this.limit,
      velocity: this.velocity,
      direction: this.direction,
      progress: this.scroll / this.limit,
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

      if (!target) return
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

    this.targetScroll = value

    if (!this.smooth || immediate) {
      this.setScroll(this.targetScroll)
    } else {
      this.animate.to(this, {
        duration,
        easing,
        scroll: this.targetScroll,
      })
    }
  }
}
