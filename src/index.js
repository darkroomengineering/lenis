import VirtualScroll from 'virtual-scroll'
import { clamp, lerp, truncate } from './scripts/utils/maths'

export default class Lenis {
  constructor() {
    document.addEventListener('wheel', this.onWheel, { passive: false })
    window.addEventListener('scroll', this.onScroll, false)
    window.addEventListener('resize', this.onWindowResize, false)

    this.virtualScroll = new VirtualScroll({
      firefoxMultiplier: 50,
      mouseMultiplier: 0.4,
      useKeyboard: false,
      useTouch: false,
      passive: true,
    })

    this.virtualScroll.on(this.onVirtualScroll)

    this.onWindowResize()
    this.maxScroll = document.body.offsetHeight - this.windowHeight

    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(document.body)

    this.scroll = window.scrollY
    this.targetScroll = window.scrollY
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
    e.preventDefault()
  }

  onVirtualScroll = ({ deltaY }) => {
    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.maxScroll)
  }

  raf() {
    this.scroll = lerp(this.scroll, this.targetScroll, 0.1)
    if (truncate(this.scroll, 0) === truncate(this.targetScroll, 0)) {
      this.scroll = this.targetScroll
    }

    this.scrolling = this.scroll !== this.targetScroll

    if (this.scrolling) {
      window.scrollTo(0, this.scroll)
    }

    // console.log(
    //   this.scrolling,
    //   truncate(this.scroll, 0),
    //   truncate(this.targetScroll, 0)
    // )

    // console.log(window.scrollY, this.scroll)
  }

  onScroll = () => {
    if (this.scrolling === false) {
      const scrollY = Math.round(window.scrollY)
      this.scroll = scrollY
      this.targetScroll = scrollY
    }
  }
}
