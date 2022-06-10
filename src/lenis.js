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
    // detect potential nested scrollable elements
    // const path = e.path || (e.composedPath && e.composedPath())
    // const isNestedScroll = path
    //   .filter((element) => element.tagName) // filter node elements
    //   .find((element, i) => {
    //     return (
    //       ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) &&
    //       element.scrollHeight > element.clientHeight
    //     )
    //   }) // filter scrollable elements

    // if (isNestedScroll) return

    if (this.stopped) {
      e.preventDefault()
      return
    }

    if (this.smooth && !e.ctrlKey) e.preventDefault()

    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.limit)
  }

  raf() {
    if (!this.smooth || this.stopped) return

    // lerp scroll value
    this.scroll = lerp(this.scroll, this.targetScroll, this.lerp)
    if (Math.round(this.scroll) === Math.round(this.targetScroll)) {
      this.scroll = this.targetScroll
    }

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
    // if scrolling is false we can estimate you aren't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to without any easing
    if (!this.scrolling || !this.smooth) {
      this.targetScroll = this.scroll =
        this.direction === 'horizontal' ? window.scrollX : window.scrollY
      this.notify()
    }
  }

  notify() {
    this.emit('scroll', { scroll: this.scroll, limit: this.limit })
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
        window.scrollTo(this.scroll, value)
      }
    }
  }
}
