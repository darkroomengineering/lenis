import { lerp, truncate } from "./scripts/utils/maths"
import { offsetTop, offsetLeft, Rect } from "./scripts/utils/rect"

class Speed extends Rect {
  constructor(element) {
    super(element)

    let speed = element.getAttribute("data-scroll-speed")
    speed = element.speed = parseFloat(speed)
    speed = !isNaN(speed) ? speed : 0
    this.speed = speed / 10

    this.direction = element.getAttribute("data-scroll-direction")
    this.position = element.getAttribute("data-scroll-position")
  }
}

class Section extends Rect {
  constructor(element) {
    super(element)
  }
}

class Core {
  constructor({ wrapper, content, direction }) {
    this.wrapperElement = wrapper
    this.contentElement = content
    this.direction = direction

    this.delta = { x: window.scrollX, y: window.scrollY }
    this.scroll = { x: window.scrollX, y: window.scrollY }
    this.latestScroll = { x: window.scrollX, y: window.scrollY }

    this.update()

    this.onScroll = this.onScroll.bind(this)
    window.addEventListener("scroll", this.onScroll, false)

    this.update = this.update.bind(this)
    window.addEventListener("resize", this.update, false)

    this.anchors = [...document.querySelectorAll("a[href^='#']")]
    this.anchorsHandler = (event) => {
      event.preventDefault()

      const target = event.currentTarget.getAttribute("href")
      this.scrollTo(target)
    }
    this.anchors.forEach((element) => {
      element.addEventListener("click", this.anchorsHandler, false)
    })
  }

  get directionAxis() {
    return this.direction === "horizontal" ? "x" : "y"
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

  scrollTo(target, options = {}) {
    let offset = parseInt(options.offset) || 0
    let immediate = options.immediate || false

    if (typeof target === "string") {
      // Selector or boundaries
      if (target === "top") {
        target = 0
      } else if (target === "bottom") {
        target = this.limit.y
      } else if (target === "left") {
        target = 0
      } else if (target === "right") {
        target = this.limit.x
      } else {
        target = document.querySelector(target)
        // If the query fails, abort
        if (!target) {
          return
        }
      }
    } else if (typeof target === "number") {
      // Absolute coordinate
      target = parseInt(target)
    } else if (target && target.tagName) {
      // DOM Element
      // We good 👍
    } else {
      console.warn("`target` parameter is not valid")
      return
    }

    // We have a target that is not a coordinate yet, get it
    if (typeof target !== "number") {
      const top = offsetTop(target)
      const left = offsetLeft(target)

      if (this.direction === "horizontal") {
        target = left
      } else {
        target = top
      }
    }

    target += offset

    if (this.direction === "horizontal") {
      this.setScroll(target, this.delta.y, immediate)
    } else {
      this.setScroll(this.delta.x, target, immediate)
    }
  }

  onScroll() {
    console.log("lenis onScroll")

    this.delta = { x: window.scrollX, y: window.scrollY }
    this.isMoving = true
  }

  setScroll(x, y, immediate = false) {
    window.scrollTo(x, y)

    if (immediate) {
      this.delta = { x, y }
      this.scroll = { x, y }
      this.latestScroll = { x, y }
    }
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

    requestAnimationFrame(() => {
      this.latestScroll = { x: this.scroll.x, y: this.scroll.y }
    })
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
        const inView = section.computeIntersection(
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

    this.speedElements.forEach((current) => {
      current.element.classList.add("is-inview")

      const scrollRight = this.scroll.x + this.windowWidth
      const scrollBottom = this.scroll.y + this.windowHeight

      const scrollMiddle = {
        x: this.scroll.x + this.windowWidth / 2,
        y: this.scroll.y + this.windowHeight / 2,
      }

      let translate = 0

      const inView = current.computeIntersection(
        this.scroll.x,
        this.scroll.y,
        this.windowHeight / 2
      )
      const { top, left, height } = current.computeRect(0, 0)

      if (inView) {
        switch (current.position) {
          case "top":
            translate = this.scroll[this.directionAxis] * -current.speed
            break

          case "elementTop":
            translate = (scrollBottom - top) * -current.speed
            break

          case "bottom":
            translate =
              (this.limit[this.directionAxis] -
                scrollBottom +
                this.windowHeight) *
              current.speed
            break

          case "left":
            translate = this.scroll[this.directionAxis] * -current.speed
            break

          case "elementLeft":
            translate = (scrollRight - left) * -current.speed
            break

          case "right":
            translate =
              (this.limit[this.directionAxis] -
                scrollRight +
                this.windowHeight) *
              current.speed
            break

          default:
            translate =
              (scrollMiddle[this.directionAxis] - (top + height / 2)) *
              -current.speed
            break
        }

        if (
          current.direction === "horizontal" ||
          (this.direction === "horizontal" && current.direction !== "vertical")
        ) {
          current.element.style.setProperty(
            "transform",
            `translate3d(${translate}px, 0, 0)`
          )
        } else {
          current.element.style.setProperty(
            "transform",
            `translate3d(0, ${translate}px, 0)`
          )
        }
      }

      // if (current.position === "top") {
      //   translate = this.scroll[this.directionAxis] * -current.speed
      // }

      // const { top, height } = speedElement.computeRect(
      //   this.scroll.x,
      //   this.scroll.y,
      //   0
      // )
      // const distanceToCenter = {
      //   x: 0,
      //   y:
      //     (top + height / 2 - this.windowHeight / 2) / (-this.windowHeight / 2),
      // }
      // let x = 0,
      //   y = 0
      // if (speedElement.direction === "horizontal") {
      //   x = speedElement.speed * distanceToCenter.y * this.windowHeight
      //   y = this.scroll.y
      // } else {
      //   y = speedElement.speed * distanceToCenter.y * this.windowHeight
      // }
      // const inView = speedElement.computeIntersection(
      //   this.scroll.x,
      //   this.scroll.y + y,
      //   0
      // )
      // const shouldTransform = speedElement.computeIntersection(
      //   this.scroll.x,
      //   this.scroll.y + y,
      //   this.windowHeight * 0.5
      // )
      // if (inView) {
      //   speedElement.element.classList.add("is-inview")
      // } else {
      //   speedElement.element.classList.remove("is-inview")
      // }
      // if (shouldTransform) {
      //   speedElement.element.style.setProperty(
      //     "transform",
      //     `translate3d(${-x}px, ${-y}px, 0)`
      //   )
      // }
      // speedElement.element.setAttribute("data-center", distanceToCenter.y)
    })

    this.inViewElements.forEach((inViewElement) => {
      const inView = inViewElement.computeIntersection(
        this.scroll.x,
        this.scroll.y,
        0
      )

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

    //parallax
    this.speedElements = [
      ...document.querySelectorAll("[data-scroll-speed]"),
    ].map((element) => new Speed(element))

    // in view
    this.inViewElements = [
      ...document.querySelectorAll("[data-scroll]:not([data-scroll-speed])"),
    ].map((element) => new Rect(element))

    this.applyTransforms()
  }
}

const defaultOptions = {
  smooth: false,
  autoRaf: true,
  lerp: 0.1,
  direction: "vertical",
  effects: true,
}

class Lenis {
  constructor(options = {}) {
    console.log("lenis init", options)

    this.options = { ...defaultOptions, ...options }
    this.options.lerp = !isNaN(parseFloat(this.options.lerp))
      ? parseFloat(this.options.lerp)
      : defaultOptions.lerp

    if (this.options.lerp <= 0 || this.options.lerp > 1) {
      this.options.lerp = defaultOptions.lerp
    }

    console.log(this.options)

    if (!this.options.wrapper || !this.options.content) {
      console.warn("lenis: missing wrapper or content")
      return
    }

    document.documentElement.classList.add("has-scroll-init")

    this.scroll = this.options.smooth
      ? new Smooth(this.options)
      : new Native(this.options)

    if (this.options.smooth === true) {
      document.documentElement.classList.add("has-scroll-smooth")
    }

    this.raf = this.raf.bind(this)
    if (this.options.autoRaf) requestAnimationFrame(this.raf)
  }

  raf() {
    this.scroll.raf()
    if (this.options.autoRaf) requestAnimationFrame(this.raf)
  }

  scrollTo(target, options) {
    this.scroll.scrollTo(target, options)
  }

  setScroll(x, y) {
    this.scroll.setScroll(x, y)
  }

  update() {
    this.scroll.update()
  }

  destroy() {
    this.scroll.destroy()
  }
}

export default Lenis
