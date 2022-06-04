import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { clamp, lerp } from './maths.js'

export default class Lenis extends EventEmitter {
  constructor({ lerp = 0.1, smooth = true } = {}) {
    super()

    this.lerp = lerp
    this.smooth = smooth

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
    this.maxScroll = document.body.offsetHeight - this.windowHeight

    // recalculate maxScroll when body height changes
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(document.body)

    this.targetScroll = this.scroll = window.scrollY
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
      this.maxScroll = rect.height - this.windowHeight
    }
  }

  onWindowResize = () => {
    this.windowHeight = window.innerHeight
    this.windowWidth = window.innerWidth
  }

  onVirtualScroll = ({ deltaY, originalEvent: e }) => {
    // detect potential nested scrollable elements
    const path = e.path || (e.composedPath && e.composedPath())
    const isNestedScroll = path
      .filter((element) => element.tagName) // filter node elements
      .find((element, i) => {
        return (
          ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) &&
          element.scrollHeight > element.clientHeight
        )
      }) // filter scrollable elements

    if (isNestedScroll) return

    if (this.stopped) {
      e.preventDefault()
      return
    }

    if (this.smooth && !e.ctrlKey) e.preventDefault()

    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.maxScroll)
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
      window.scrollTo(0, this.scroll)
      this.emit('scroll', { scroll: this.scroll })
    }

    this.scrolling = this.scroll !== this.targetScroll
  }

  onScroll = (e) => {
    // if scrolling is false we can estimate you aren't scrolling with wheel (cmd+F, keyboard or whatever). So we must scroll to without any easing
    if (!this.scrolling || !this.smooth) {
      this.targetScroll = this.scroll = window.scrollY
      this.emit('scroll', { scroll: this.scroll })
    }
  }

  scrollTo(target, { offset = 0 } = {}) {
    let y

    if (typeof target === 'number') {
      // Number
      y = target
    } else if (target === '#top') {
      y = 0
    } else if (target === '#bottom') {
      y = this.maxScroll
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
      y = node.getBoundingClientRect().top + this.scroll
    }

    y += offset

    this.targetScroll = y
    this.scrolling = true
    if (!this.smooth) {
      this.scroll = y
    }
  }
}
