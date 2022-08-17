import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { clamp, lerp } from './maths.js'

export default class Lenis extends EventEmitter {
  constructor ({ lerp = 0.1, smooth = true, direction = 'vertical', body = document.body, container = window } = {}) {
    super()

    this.lerp = lerp
    this.smooth = smooth
    this.direction = direction
    // overflowing container
    this.body = body
    // overflowed container
    this.container = container

    this.container.addEventListener('scroll', this.onScroll, false)
    this.container.addEventListener('resize', this.onContainerResize, false)

    const platform =
      navigator?.userAgentData?.platform || navigator?.platform || 'unknown'

    // listen and normalize wheel event cross-browser
    this.virtualScroll = new VirtualScroll({
      firefoxMultiplier: 50,
      mouseMultiplier: platform.includes('Win') ? 1 : 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: false
    })

    this.virtualScroll.on(this.onVirtualScroll)

    this.onContainerResize()
    this.limit =
      this.direction === 'horizontal'
        ? this.bodyBBox.width - this.containerBBox.width
        : this.bodyBBox.height - this.containerBBox.height

    // recalculate maxScroll when body height changes
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.body)

    const actualScroll = this.getContainerScroll()

    this.targetScroll = this.scroll =
      this.direction === 'horizontal' ? actualScroll.left : actualScroll.top
    this.velocity = 0
  }

  start () {
    this.stopped = false
  }

  stop () {
    this.stopped = true
  }

  destroy () {
    this.container.removeEventListener('scroll', this.onScroll, false)
    this.container.removeEventListener('resize', this.onContainerResize, false)
    this.virtualScroll.destroy()
    this.resizeObserver.disconnect()
  }

  onResize = (entries) => {
    const entry = entries[0]
    if (entry) {
      const rect = entry.contentRect
      this.limit =
        this.direction === 'horizontal'
          ? rect.width - this.containerBBox.width
          : rect.height - this.containerBBox.height
    }
  }

  onContainerResize = () => {
    if (this.container instanceof Window) {
      this.containerBBox = {
        width: this.container.innerWidth,
        height: this.container.innerHeight
      }
    } else {
      this.containerBBox = this.container.getBoundingClientRect()
    }

    this.bodyBBox = this.body.getBoundingClientRect()
  }

  onVirtualScroll = ({ deltaY, originalEvent: e }) => {
    if (this.stopped) {
      e.preventDefault()
      return
    }

    // prevent native wheel scrolling
    if (this.smooth && !e.ctrlKey) { e.preventDefault() }

    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.limit)
  }

  getContainerScroll () {
    if (this.container instanceof Window) {
      return {
        left: this.container.pageXOffset,
        top: this.container.pageYOffset
      }
    } else {
      return {
        left: this.container.scrollLeft,
        top: this.container.scrollTop
      }
    }
  }

  raf () {
    if (this.stopped || !this.smooth) { return }
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
      this.direction === 'horizontal'
        ? this.container.scrollTo(this.scroll, 0)
        : this.container.scrollTo(0, this.scroll)
      this.notify()
    }

    this.scrolling = this.scroll !== this.targetScroll
  }

  onScroll = (e) => {
    if (this.stopped) { return }

    // if scrolling is false we can estimate use isn't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to without any easing
    if (!this.scrolling || !this.smooth) {
      // where native scroll happens

      const lastScroll = this.scroll
      const actualScroll = this.getContainerScroll()
      this.targetScroll = this.scroll =
        this.direction === 'horizontal' ? actualScroll.left : actualScroll.top
      this.velocity = this.scroll - lastScroll
      this.notify()
    }
  }

  notify () {
    this.emit('scroll', {
      scroll: this.scroll,
      limit: this.limit,
      velocity: this.velocity,
      direction: this.direction
    })
  }

  scrollTo(target, { offset = 0, immediate= false } = {}) {
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

      if (!target) { return }
      const rect = node.getBoundingClientRect()
      value =
        (this.direction === 'horizontal' ? rect.left : rect.top) + this.scroll
    }

    value += offset

    this.targetScroll = value
    this.scrolling = true
    
    if (!this.smooth || immediate) {
      this.scroll = value
      if (this.direction === 'horizontal') {
        this.container.scrollTo(this.scroll, 0)
      } else {
        this.container.scrollTo(0, this.scroll)
      }
    }
  }
}
