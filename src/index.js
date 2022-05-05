import VirtualScroll from 'virtual-scroll'
import { clamp, lerp, truncate } from './scripts/utils/maths'

export default class Lenis {
  constructor() {
    document.addEventListener('wheel', this.onWheel, { passive: false })
    window.addEventListener('scroll', this.onScroll)
    const scroller = new VirtualScroll({ useKeyboard: false, useTouch: false })

    scroller.on(this.onVScroll)

    this.maxScroll = document.body.offsetHeight - window.innerHeight

    this.scroll = window.scrollY
    this.targetScroll = window.scrollY
  }

  onWheel = (e) => {
    e.preventDefault()
  }

  onVScroll = ({ deltaY }) => {
    this.targetScroll -= deltaY
    this.targetScroll = clamp(0, this.targetScroll, this.maxScroll)
  }

  raf() {
    this.scroll = lerp(this.scroll, this.targetScroll, 0.12)
    if (truncate(this.scroll, 0) === this.targetScroll) {
      this.scroll = this.targetScroll
    }

    this.scrolling = this.scroll !== this.targetScroll

    if (this.scrolling) {
      window.scrollTo(0, this.scroll)
    }

    console.log(this.scrolling, truncate(this.scroll, 0), this.targetScroll)
  }

  onScroll = () => {
    if (this.scrolling === false) {
      const scrollY = Math.round(window.scrollY)
      this.scroll = scrollY
      this.targetScroll = scrollY
    }
  }
}
