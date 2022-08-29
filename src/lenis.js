import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { clamp, lerp } from './maths.js'

export default class Lenis extends EventEmitter {
  constructor({
    lerp = 0.1,
    smooth = true,
    direction = 'vertical',
    wrapper = window,
    content = document.body,
  } = {}) {
    super()

    this.wrapperNode = wrapper
    this.contentNode = content

    this.lerp = lerp
    this.smooth = smooth
    this.direction = direction

    this.wrapperNode.addEventListener('scroll', this.onScroll, false)

    const platform =
      navigator?.userAgentData?.platform || navigator?.platform || 'unknown'

    // listen and normalize wheel event cross-browser
    this.virtualScroll = new VirtualScroll({
      el: this.wrapperNode,
      firefoxMultiplier: 50,
      mouseMultiplier: platform.indexOf('Win') > -1 ? 1 : 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: false,
    })

    this.virtualScroll.on(this.onVirtualScroll)

    //observe wrapper node size
    if (this.wrapperNode === window) {
      this.wrapperNode.addEventListener('resize', this.onWindowResize, false)
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
    this.targetScroll = this.scroll = this.wrapperNode[this.scrollProperty]

    this.velocity = 0
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
      this.wrapperNode.removeEventListener('resize', this.onWindowResize, false)
    }
    this.wrapperNode.removeEventListener('scroll', this.onScroll, false)

    this.virtualScroll.destroy()
    this.wrapperObserver?.disconnect()
    this.contentObserver.disconnect()
  }

  onWindowResize = () => {
    this.wrapperWidth = window.innerWidth
    this.wrapperHeight = window.innerHeight
  }

  onWrapperResize = (entries) => {
    const entry = entries[0]
    if (entry) {
      const rect = entry.contentRect
      this.wrapperWidth = rect.width
      this.wrapperHeight = rect.height
    }
  }

  onContentResize = (entries) => {
    const entry = entries[0]
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

    // prevent native wheel scrolling
    if (this.smooth) e.preventDefault()

    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.limit)
  }

  raf() {
    if (this.stopped || !this.smooth) return
    // where smooth scroll happens

    let lastScroll = this.scroll

    // lerp scroll value
    this.scroll = lerp(this.scroll, this.targetScroll, this.lerp)
    if (Math.round(this.scroll) === Math.round(this.targetScroll)) {
      this.scroll = lastScroll = this.targetScroll
    }

    this.velocity = this.scroll - lastScroll

    if (this.scrolling) {
      // scroll to lerped scroll value
      this._scrollTo(this.scroll)
      this.notify()
    }

    this.scrolling = this.scroll !== this.targetScroll
  }

  _scrollTo(value) {
    this.direction === 'horizontal'
      ? this.wrapperNode.scrollTo(value, 0)
      : this.wrapperNode.scrollTo(0, value)
  }

  onScroll = (e) => {
    if (this.stopped) return

    // if scrolling is false we can estimate use isn't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to without any easing
    if (!this.scrolling || !this.smooth) {
      // where native scroll happens

      const lastScroll = this.scroll
      this.targetScroll = this.scroll = this.wrapperNode[this.scrollProperty]
      this.velocity = this.scroll - lastScroll
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

  scrollTo(target, { offset = 0, immediate = false } = {}) {
    let value

    if (typeof target === 'number') {
      // Number
      value = target
    } else if (target === 'top') {
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
    this.scrolling = true

    if (!this.smooth || immediate) {
      this.scroll = value
      this._scrollTo(this.scroll)
    }
  }
}
