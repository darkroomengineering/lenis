import { lerp, truncate } from "./scripts/utils/maths"
import { offsetTop, offsetLeft, Rect } from "./scripts/utils/rect"

class Speed extends Rect {
  constructor(element, speed) {
    super(element)
    const float = parseFloat(speed)
    this.speed = !isNaN(float) ? float / 10 : 0
  }
}

class Section extends Rect {
  constructor(element) {
    super(element)
  }
}

class Core {
  constructor({ wrapper, content }) {
    this.wrapperElement = wrapper
    this.contentElement = content

    this.delta = { x: window.scrollX, y: window.scrollY }
    this.scroll = { x: window.scrollX, y: window.scrollY }
    this.latestScroll = { x: window.scrollX, y: window.scrollY }

    this.update()

    this.onScroll = this.onScroll.bind(this)
    window.addEventListener("scroll", this.onScroll, false)

    this.update = this.update.bind(this)
    window.addEventListener("resize", this.update, false)
  }

  get velocity() {
    return {
      x: this.scroll.x - this.latestScroll.x,
      y: this.scroll.y - this.latestScroll.y,
    }
  }

  get progress() {
    const x = truncate(this.scroll.x / this.limit.x, 4)
    const y = truncate(this.scroll.y / this.limit.y, 4)

    return {
      x: !isNaN(x) ? x : 0,
      y: !isNaN(y) ? y : 0,
    }
  }

  scrollTo() {
    let top
    let left
    let options

    if (typeof arguments[0] === "number") {
      left = arguments[0]
      top = arguments[1]
      options = arguments[2]
    } else {
      const target = arguments[0]
      options = arguments[1]

      if (target === "top") {
        top = 0
        left = this.delta.x
      } else if (target === "bottom") {
        top = this.limit.y
        left = this.delta.x
      } else if (target === "left") {
        top = this.delta.y
        left = 0
      } else if (target === "right") {
        top = this.delta.y
        left = this.limit.x
      } else if (!!target.nodeType) {
        top = offsetTop(target)
        left = offsetLeft(target)
      } else {
        const node = document.querySelector(target)
        top = offsetTop(node)
        left = offsetLeft(node)
      }
    }

    if (options) {
      left += options.offsetLeft || 0
      top += options.offsetTop || 0

      if (options.immediate) {
        this.delta = { x: left, y: top }
        this.scroll = { x: left, y: top }
        this.latestScroll = { x: left, y: top }
        this.isMoving = true
      }
    }

    window.scrollTo(left, top)
  }

  onScroll() {
    console.log("lenis onScroll")
    this.isMoving = true
    this.delta = { x: window.scrollX, y: window.scrollY }
  }

  raf() {
    console.log(this.progress)
  }

  update() {
    console.log("lenis update")

    this.contentHeight = this.contentElement.offsetHeight
    this.contentWidth = this.contentElement.offsetWidth

    document.body.style.setProperty("height", this.contentHeight + "px")

    this.windowWidth = Math.min(
      document.documentElement.clientWidth,
      window.innerWidth
    )
    this.windowHeight = Math.min(
      document.documentElement.clientHeight,
      window.innerWidth
    )

    this.limit = {
      x: document.body.clientWidth - this.windowWidth,
      y: document.body.clientHeight - this.windowHeight,
    }

    // console.log(this.windowHeight)
  }

  destroy() {
    window.removeEventListener("scroll", this.onScroll, false)
    window.removeEventListener("resize", this.update, false)
  }
}

class Native extends Core {
  constructor(options) {
    super(options)
  }

  onScroll() {
    super.onScroll()
    this.latestScroll = { x: this.scroll.x, y: this.scroll.y }
    this.scroll = { x: this.delta.x, y: this.delta.y }
  }
}

class Smooth extends Core {
  constructor(options) {
    super(options)

    this.lerp = options.lerp

    console.log("smooth")
  }

  raf() {
    if (this.isMoving) {
      this.latestScroll = { x: this.scroll.x, y: this.scroll.y }
      this.scroll = {
        x: truncate(lerp(this.scroll.x, this.delta.x, this.lerp), 4),
        y: truncate(lerp(this.scroll.y, this.delta.y, this.lerp), 4),
      }

      if (this.velocity.x === 0 && this.velocity.y === 0) {
        this.isMoving = false
      }

      this.applyTransforms()
    }
  }

  applyTransforms() {
    if (this.sections.length > 0) {
      this.sections.forEach((section) => {
        const { inView } = section.compute(
          this.scroll.x,
          this.scroll.y,
          this.windowHeight * 0.5
        )
        if (inView) {
          section.element.style.removeProperty("pointer-events")
          section.element.style.removeProperty("visibility")
          section.element.style.setProperty(
            "transform",
            `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
          )
        } else {
          section.element.style.setProperty("pointer-events", "none")
          section.element.style.setProperty("visibility", "hidden")
        }
      })
    } else {
      this.contentElement.style.setProperty(
        "transform",
        `translate3d(${-this.scroll.x}px, ${-this.scroll.y}px, 0)`
      )
    }

    this.speedElements.forEach((speedElement) => {
      // const { top, height } = speedElement.compute(
      //   this.scroll.x,
      //   this.scroll.y,
      //   0
      // )
      // const distanceToCenter = {
      //   x: 0,
      //   y:
      //     (top + height / 2 - this.windowHeight / 2) / (-this.windowHeight / 2),
      // }
      // const x = this.scroll.x * speedElement.speed
      // const y = speedElement.speed * distanceToCenter.y * this.windowHeight
      // speedElement.element.style.setProperty(
      //   "transform",
      //   `translate3d(${-x}px, ${-y}px, 0)`
      // )
      // speedElement.element.setAttribute("data-center", distanceToCenter.y)
    })

    this.inViewElements.forEach((inViewElement) => {
      const { inView } = inViewElement.compute(this.scroll.x, this.scroll.y, 0)

      if (inView) {
        inViewElement.element.classList.add("is-inview")
      } else {
        inViewElement.element.classList.remove("is-inview")
      }
    })
  }

  update() {
    super.update()

    // sections
    this.sections = [...document.querySelectorAll("[data-scroll-section]")].map(
      (element) => new Section(element)
    )
    this.sections.forEach((section) => {
      section.update()
    })

    //parallax
    this.speedElements = [
      ...document.querySelectorAll("[data-scroll-speed]"),
    ].map(
      (element) => new Speed(element, element.getAttribute("data-scroll-speed"))
    )
    this.speedElements.forEach((element) => {
      element.update()
    })

    // in view
    this.inViewElements = [...document.querySelectorAll("[data-scroll]")].map(
      (element) => new Rect(element)
    )
    this.inViewElements.forEach((element) => {
      element.update()
    })

    console.log(this.speedElements)

    this.applyTransforms()
  }
}

const defaultOptions = {
  smooth: false,
  autoRaf: true,
  lerp: 0.1,
}

class Lenis {
  constructor(options = {}) {
    console.log("lenis init", options)

    this.options = { ...defaultOptions, ...options }

    if (!this.options.wrapper || !this.options.content) {
      console.warn("lenis: missing wrapper or content")
      return
    }

    this.instance = this.options.smooth
      ? new Smooth(this.options)
      : new Native(this.options)

    document.documentElement.classList.add("has-scroll-init")

    if (this.options.smooth === true) {
      document.documentElement.classList.add("has-scroll-smooth")
    }

    this.raf = this.raf.bind(this)
    if (this.options.autoRaf) requestAnimationFrame(this.raf)
  }

  raf() {
    this.instance.raf()
    if (this.options.autoRaf) requestAnimationFrame(this.raf)
  }

  scrollTo() {
    this.instance.scrollTo(...arguments)
  }

  update() {
    this.instance.update()
  }

  destroy() {
    this.instance.destroy()
  }
}

export default Lenis
