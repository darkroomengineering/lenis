import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { clamp, lerp } from './maths.js'

export default class Lenis extends EventEmitter {
  constructor({ lerp = 0.1, smooth = true, direction = 'vertical' } = {}) {
    super()

    this.lerp = lerp
    this.smooth = smooth
    this.direction = direction

    window.addEventListener('scroll', this.onScroll, false)
    window.addEventListener('resize', this.onWindowResize, false)

    const platform =
      navigator?.userAgentData?.platform || navigator?.platform || 'unknown'

    // listen and normalize wheel event cross-browser
    this.virtualScroll = new VirtualScroll({
      firefoxMultiplier: 50,
      mouseMultiplier: platform.indexOf('Win') > -1 ? 1 : 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: false,
    })

    this.virtualScroll.on(this.onVirtualScroll)

    this.onWindowResize()
    this.limit =
      this.direction === 'horizontal'
        ? document.body.offsetWidth - this.windowWidth
        : document.body.offsetHeight - this.windowHeight

    // recalculate maxScroll when body height changes
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(document.body)

    this.targetScroll = this.scroll =
      this.direction === 'horizontal' ? window.scrollX : window.scrollY
    this.velocity = 0
  }

  start() {
    this.stopped = false
  }

  stop() {
    this.stopped = true
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll, false)
    window.removeEventListener('resize', this.onWindowResize, false)
    this.virtualScroll.destroy()
    this.resizeObserver.disconnect()
  }

  onResize = (entries) => {
    const entry = entries[0]
    if (entry) {
      const rect = entry.contentRect
      this.limit =
        this.direction === 'horizontal'
          ? rect.width - this.windowWidth
          : rect.height - this.windowHeight
    }
  }

  onWindowResize = () => {
    this.windowHeight = window.innerHeight
    this.windowWidth = window.innerWidth
  }

  onVirtualScroll = ({ deltaY, originalEvent: e }) => {
    if (this.stopped) {
      e.preventDefault()
      return
    }

    // prevent native wheel scrolling
    if (this.smooth && !e.ctrlKey) e.preventDefault()

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
      this.direction === 'horizontal'
        ? window.scrollTo(this.scroll, 0)
        : window.scrollTo(0, this.scroll)
      this.notify()
    }

    this.scrolling = this.scroll !== this.targetScroll
  }

  onScroll = (e) => {
    if (this.stopped) return

    // if scrolling is false we can estimate use isn't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to without any easing
    if (!this.scrolling || !this.smooth) {
      // where native scroll happens

      const lastScroll = this.scroll
      this.targetScroll = this.scroll =
        this.direction === 'horizontal' ? window.scrollX : window.scrollY
      this.velocity = this.scroll - lastScroll
      this.notify()
    }
  }

  notify() {
    this.emit('scroll', {
      scroll: this.scroll,
      limit: this.limit,
      velocity: this.velocity,
    })
  }

  scrollTo(target, { offset = 0 } = {}) {
    let value

    if (typeof target === 'number') {
      // Number
      value = target
    } else if (target === '#top') {
      value = 0
    } else if (target === '#bottom') {
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
      const rect = node.getBoundingClientRect()
      value =
        (this.direction === 'horizontal' ? rect.left : rect.top) + this.scroll
    }

    value += offset

    this.targetScroll = value
    this.scrolling = true
    if (!this.smooth) {
      this.scroll = value
      if (this.direction === 'horizontal') {
        window.scrollTo(this.scroll, 0)
      } else {
        window.scrollTo(0, this.scroll)
      }
    }
  }
}
