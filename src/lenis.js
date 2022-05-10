import EventEmitter from 'tiny-emitter'
import VirtualScroll from 'virtual-scroll'
import { clamp, lerp } from './maths.js'

export default class Lenis extends EventEmitter {
  constructor({ lerp = 0.1, smooth = true } = {}) {
    super()

    this.lerp = lerp
    this.smooth = smooth

    document.addEventListener('wheel', this.onWheel, { passive: false })
    window.addEventListener('scroll', this.onScroll, false)
    window.addEventListener('resize', this.onWindowResize, false)

    // listen and normalize wheel event cross-browser
    this.virtualScroll = new VirtualScroll({
      firefoxMultiplier: 50,
      mouseMultiplier: navigator.platform.indexOf('Win') > -1 ? 1 : 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: true,
    })

    this.virtualScroll.on(this.onVirtualScroll)

    this.onWindowResize()
    this.maxScroll = document.body.offsetHeight - this.windowHeight

    // recalculate maxScroll when body height changes
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(document.body)

    this.targetScroll = this.scroll = window.scrollY
  }

  destroy() {
    document.removeEventListener('wheel', this.onWheel, { passive: false })
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

  onWheel = (e) => {
    // prevent native wheel scroll
    if (this.smooth && !e.ctrlKey) e.preventDefault()
  }

  onVirtualScroll = ({ deltaY }) => {
    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.maxScroll)
  }

  raf() {
    if (!this.smooth) return

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
}
