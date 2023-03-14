// References:
// https://blog.logrocket.com/style-scroll-snap-points-css/
// https://codepen.io/alsacreations/pen/GaebzJ
// snap/onSnapComplete https://greensock.com/docs/v3/Plugins/ScrollTrigger

export class ScrollSnap {
  constructor(lenis) {
    this.lenis = lenis
    this.init()

    lenis.on('scroll', this.onScroll)
  }

  // Initialize elements with the 'data-lenis-scroll-snap-align' attribute
  init() {
    this.elements = Array.from(
      document.querySelectorAll('[data-lenis-scroll-snap-align]')
    )
  }

  // Event handler for the 'scroll' event on the 'lenis' object
  onScroll = ({ scroll, velocity }) => {
    if (Math.abs(velocity) > 0.1) return

    // Find the closest element according to the scroll position
    const elements = this.elements
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const top = rect.top + scroll
        const distance = Math.abs(top - scroll)
        return { element, distance, rect }
      })
      .sort((a, b) => a.distance - b.distance)
      .filter(({ distance }) => distance < window.innerHeight)

    const [element] = elements

    if (!element) return

    this.lenis.scrollTo(element.element)
  }
}
